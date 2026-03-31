'use client'
import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { readStoredUiLang, persistUiLang, type UiLang } from '@/lib/uiLocale'
import {
  type PublishPlatform,
  type OrderResultUi,
  type PlatformRow,
  platformsForLang,
  defaultPlatformForLang,
  ORDER_RESULT_UI,
  editorOpenUrl,
  previewFakeHost,
  primaryPublishStyle,
} from '@/lib/orderResultUi'
import { buildSeoReport, ORDER_PAGE_UI, seoLevelMessage } from '@/lib/orderPageUi'
import {
  type ComplianceFinding,
  type IndustryBucket,
  detectIndustryBucket,
  flattenContentForScan,
  scanPostPublishCompliance,
} from '@/lib/postPublishCheck'
import { buildComplianceDisclosureKit, type ComplianceDisclosurePack } from '@/lib/complianceDisclosureKit'
import { type ChannelPublishKitContent, getChannelPublishKit } from '@/lib/channelPublishKit'
import { buildConversionAbCopy, type AbRecommendation, type AbRunnerUp } from '@/lib/conversionAbCopy'
import { buildMetaOgPackage, metaOgPackageToHtmlMeta, metaOgPackageToJson } from '@/lib/metaOgPackage'
import { buildListingPasteBundle, listingBundleUsesPlainText } from '@/lib/listingPasteBundles'
import { buildListingEvidencePack, type ListingEvidencePack } from '@/lib/listingEvidenceLayer'
import { buildListingAssetKit, type ListingAssetKit } from '@/lib/listingAssetKit'
import { buildMarketIntelHeuristics } from '@/lib/marketIntelCopy'
import OrderWritingWidgets from '@/components/OrderWritingWidgets'

interface Section {
  id: number
  name: string
  title: string
  body: string
}

interface Order {
  id: string
  product_name: string
  category: string
  description: string
  image_urls: string[]
  status: string
  result_json: {
    sections?: Section[]
    output_lang?: string
    template_mode?: boolean
    multi_lang?: boolean
    ko?: { sections: Section[] }
    en?: { sections: Section[] }
    ja?: { sections: Section[] }
    zh?: { sections: Section[] }
  } | null
}

interface SeoReport {
  score: number
  items: { label: string; ok: boolean; tip: string }[]
  tags: string[]
  metaTitle: string
  metaDesc: string
}

const ACCENT_COLORS = ['#FF5C35','#6366F1','#0EA5E9','#10B981','#F59E0B','#8B5CF6']
const BG_COLORS = ['#ffffff','#fafafa','#fff8f5','#f0f7ff','#f5fff8','#fdf4ff']

// ── 플랫폼별 포맷 ──────────────────────────────────────────

// 이미지를 섹션 사이에 배치하는 헬퍼
function imgTag(url: string, alt: string, style = '') {
  return `<img src="${url}" alt="${alt}" style="width:100%;max-width:680px;display:block;margin:0 auto;border-radius:12px;${style}" />`
}

// 네이버 블로그 / 티스토리 HTML
function toBlogHTML(sections: Section[], productName: string, category: string, imageUrls: string[] = []): string {
  const EMOJIS = ['💡','😔','✨','🔑','📋','🛒']

  const summaryRows = sections.slice(0, 3).map(s =>
    `<tr><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555;width:90px;font-weight:600;">${s.name}</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;">${s.title}</td></tr>`
  ).join('')

  const recommendSection = sections.find(s => s.name.includes('사용') || s.name.includes('추천')) ?? sections[4]
  const recommendLines = (recommendSection?.body ?? '').split('\n')
    .filter(l => l.trim()).slice(0, 4)
    .map(l => `<li style="margin-bottom:6px;font-size:14px;color:#333;">${l.replace(/^[✓•·-]\s*/, '')}</li>`)
    .join('')

  // 이미지를 섹션 [1], [3], [5] 뒤에 삽입 (있을 경우)
  const IMAGE_AFTER = [1, 3, 5]
  const sectionBlocks = sections.map((s, i) => {
    const isEven = i % 2 === 0
    const bodyLines = s.body.split('\n').map(line =>
      line.trim() ? `<p style="margin:0 0 10px;font-size:15px;line-height:1.9;color:#333;">${line}</p>` : '<br>'
    ).join('')

    const sectionDiv = `
<div style="background:${isEven ? '#fff' : '#f9f9f9'};padding:28px 24px;">
  <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#999;letter-spacing:2px;">${EMOJIS[i] ?? '📌'} ${s.name}</p>
  <h2 style="margin:0 0 16px;font-size:20px;font-weight:900;color:#111;line-height:1.4;">${s.title}</h2>
  <div>${bodyLines}</div>
</div>`

    const imgIndex = IMAGE_AFTER.indexOf(i)
    const imageHTML = imgIndex !== -1 && imageUrls[imgIndex]
      ? `\n<div style="padding:0 0 4px;">${imgTag(imageUrls[imgIndex], `${productName} 제품 이미지 ${imgIndex + 1}`)}</div>`
      : ''

    return sectionDiv + imageHTML
  }).join('\n<hr style="border:none;border-top:1px solid #eee;margin:0;">\n')

  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="max-width:680px;margin:0 auto;padding:20px;font-family:'Apple SD Gothic Neo',Malgun Gothic,sans-serif;background:#fff;">

<!-- 히어로 이미지 (첫 번째 사진) -->
${imageUrls[0] ? `<div style="margin-bottom:24px;border-radius:16px;overflow:hidden;">${imgTag(imageUrls[0], productName, 'border-radius:0;')}</div>` : ''}

<!-- 제목 -->
<div style="text-align:center;padding:32px 20px;border-bottom:3px solid #111;margin-bottom:28px;">
  <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#999;letter-spacing:3px;">PRODUCT REVIEW</p>
  <h1 style="margin:0 0 10px;font-size:24px;font-weight:900;color:#111;line-height:1.3;">${productName}</h1>
  <p style="margin:0;font-size:13px;color:#aaa;">카테고리: ${category}</p>
</div>

<!-- 요약 박스 -->
<div style="background:#f5f5f5;border-radius:12px;padding:18px;margin-bottom:24px;">
  <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#555;">📋 핵심 요약</p>
  <table style="width:100%;border-collapse:collapse;">${summaryRows}</table>
</div>

<!-- 추천 -->
<div style="background:#fff9e6;border-left:4px solid #f59e0b;padding:18px;margin-bottom:24px;border-radius:0 12px 12px 0;">
  <p style="margin:0 0 10px;font-size:14px;font-weight:900;color:#b45309;">✅ 이런 분에게 추천합니다</p>
  <ul style="margin:0;padding-left:18px;">${recommendLines}</ul>
</div>

<!-- 본문 -->
<div style="border-radius:12px;overflow:hidden;border:1px solid #eee;margin-bottom:28px;">
${sectionBlocks}
</div>

<!-- CTA -->
<div style="background:#111;border-radius:16px;padding:28px 20px;text-align:center;margin-bottom:20px;">
  <p style="margin:0 0 16px;font-size:19px;font-weight:900;color:#fff;">지금 바로 구매하러 가기 →</p>
  <a href="#" style="display:inline-block;background:#fff;color:#111;font-weight:900;font-size:14px;padding:12px 28px;border-radius:50px;text-decoration:none;">구매 링크 바로가기</a>
</div>
<p style="text-align:center;font-size:11px;color:#ccc;">본 포스팅은 페이지AI로 자동 생성된 콘텐츠입니다.</p>
</body></html>`
}

// 브런치 — 깔끔한 에세이 스타일 텍스트
function toBrunchText(sections: Section[], productName: string): string {
  const lines = [`# ${productName}\n`]
  sections.forEach(s => {
    lines.push(`## ${s.title}\n`)
    lines.push(s.body)
    lines.push('')
  })
  lines.push('---\n*본 포스팅은 페이지AI로 자동 생성된 콘텐츠입니다.*')
  return lines.join('\n')
}

// 워드프레스 — Gutenberg 블록 HTML
function toWordPressHTML(sections: Section[], productName: string, category: string, imageUrls: string[] = []): string {
  const IMAGE_AFTER = [1, 3]
  const blocks = sections.map((s, i) => {
    const imgBlock = IMAGE_AFTER.includes(i) && imageUrls[IMAGE_AFTER.indexOf(i)]
      ? `\n<!-- wp:image --><figure class="wp-block-image"><img src="${imageUrls[IMAGE_AFTER.indexOf(i)]}" alt="${productName}" /></figure><!-- /wp:image -->\n`
      : ''
    return `<!-- wp:heading {"level":2} --><h2 class="wp-block-heading">${s.title}</h2><!-- /wp:heading -->
<!-- wp:paragraph --><p>${s.body.replace(/\n/g, '<br>')}</p><!-- /wp:paragraph -->${imgBlock}`
  }).join('\n')

  return `<!-- wp:heading {"level":1} --><h1 class="wp-block-heading">${productName} — ${category} 완벽 분석</h1><!-- /wp:heading -->
<!-- wp:separator --><hr class="wp-block-separator"/><!-- /wp:separator -->
${blocks}
<!-- wp:buttons --><div class="wp-block-buttons"><div class="wp-block-button"><a class="wp-block-button__link" href="#">지금 구매하기 →</a></div></div><!-- /wp:buttons -->`
}

// 인스타그램 캡션 — 짧고 임팩트 있게 + 해시태그
function toInstagramCaption(sections: Section[], productName: string, category: string): string {
  const hook = sections[0]?.title ?? productName
  const key1 = sections[2]?.title ?? ''
  const key2 = sections[3]?.title ?? ''
  const cta = sections[5]?.body.split('\n')[0] ?? '지금 바로 확인하세요!'
  const tags = ['#' + productName.replace(/\s/g, ''), '#' + category, '#스마트스토어추천', '#쿠팡', '#상품추천', '#리뷰', '#구매후기', '#AI리뷰'].join(' ')

  return `${hook} 🔥

✅ ${key1}
✅ ${key2}

${cta}

👇 프로필 링크에서 구매하기

${tags}`
}

function ComplianceScanPanel({
  findings,
  disclosurePack,
  open,
  onToggle,
  ui,
  industryBadge,
  className = '',
}: {
  findings: ComplianceFinding[]
  disclosurePack: ComplianceDisclosurePack
  open: boolean
  onToggle: () => void
  ui: OrderResultUi
  industryBadge?: string | null
  className?: string
}) {
  return (
    <div className={`border border-amber-200/80 bg-amber-50/90 rounded-2xl overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-3 hover:bg-amber-100/50 transition-colors"
      >
        {industryBadge && (
          <p className="text-[10px] font-bold text-amber-800/90 mb-1 leading-snug">{industryBadge}</p>
        )}
        <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest">{ui.complianceSub}</p>
        <p className="text-sm font-black text-amber-950 mt-0.5">{ui.complianceTitle}</p>
        <p className="text-xs text-amber-900/75 mt-1 font-medium">
          {findings.length === 0 ? ui.complianceAllClear : ui.complianceIssues(findings.length)}
        </p>
        <span className="text-[10px] font-bold text-amber-800 mt-1 inline-block">{open ? ui.complianceHide : ui.complianceShow}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-amber-200/60 pt-2">
          <div className="rounded-xl bg-white/90 border border-amber-200/90 p-2.5 space-y-2">
            <p className="text-[10px] font-black text-amber-900 uppercase tracking-wider">{ui.complianceDisclosureTitle}</p>
            <p className="text-[11px] font-bold text-amber-950">{disclosurePack.headline}</p>
            {disclosurePack.note ? (
              <p className="text-[10px] text-amber-900/75 leading-relaxed">{disclosurePack.note}</p>
            ) : null}
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {disclosurePack.lines.map(line => (
                <div
                  key={line.id}
                  className="flex gap-1.5 items-start rounded-lg bg-amber-50/80 border border-amber-100/80 px-2 py-1.5"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-amber-800">{line.label}</p>
                    <p className="text-[10px] text-gray-800 leading-snug break-words">{line.body}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(line.body).then(() => {
                        toast.success(ui.abCopyToast)
                      }).catch(() => toast.error(ui.toastCopyFail))
                    }}
                    className="shrink-0 text-[9px] font-bold text-amber-900 border border-amber-300 bg-white px-1.5 py-0.5 rounded-md hover:bg-amber-50"
                  >
                    {ui.abCopyCopy}
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(disclosurePack.copyAllBlock).then(() => {
                  toast.success(ui.complianceToastDisclosurePack)
                }).catch(() => toast.error(ui.toastCopyFail))
              }}
              className="w-full text-center text-[10px] font-black text-white bg-amber-800 py-2 rounded-xl hover:bg-amber-900"
            >
              {ui.complianceCopyDisclosurePack}
            </button>
          </div>

          {findings.length === 0 ? (
            <p className="text-xs text-amber-900/70 leading-relaxed">{ui.complianceDisclaimer}</p>
          ) : (
            <>
              {findings.map((f, i) => (
                <div key={i} className="rounded-xl bg-white/80 border border-amber-100 px-2.5 py-2 text-xs leading-relaxed">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${f.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
                      {f.severity === 'high' ? ui.complianceHigh : ui.complianceMedium}
                    </span>
                    <code className="text-[10px] text-gray-600 break-all">{f.matched}</code>
                  </div>
                  <p className="text-gray-700">{f.tip}</p>
                  {f.suggest && (
                    <p className="mt-1.5 text-[11px] text-emerald-900/90 bg-emerald-50/90 border border-emerald-100 rounded-lg px-2 py-1.5">
                      <span className="font-black text-emerald-800">{ui.complianceSuggestLabel}: </span>
                      {f.suggest}
                    </p>
                  )}
                </div>
              ))}
              <p className="text-[10px] text-amber-900/55 leading-relaxed">{ui.complianceDisclaimer}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ChannelPublishKitPanel({
  platforms,
  platform,
  setPlatform,
  kit,
  ui,
  open,
  onToggle,
  onCopyHook,
  pasteBundle,
  onCopyPasteBundle,
  className = '',
}: {
  platforms: PlatformRow[]
  platform: PublishPlatform
  setPlatform: (p: PublishPlatform) => void
  kit: ChannelPublishKitContent
  ui: OrderResultUi
  open: boolean
  onToggle: () => void
  onCopyHook: (line: string) => void
  pasteBundle: string
  onCopyPasteBundle: () => void
  className?: string
}) {
  return (
    <div className={`border border-slate-200 bg-slate-50/90 rounded-2xl overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-3 hover:bg-slate-100/80 transition-colors"
      >
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{ui.channelKitSub}</p>
        <p className="text-sm font-black text-slate-900 mt-0.5">{ui.channelKitTitle}</p>
        <span className="text-[10px] font-bold text-slate-600 mt-1 inline-block">{open ? ui.channelKitHide : ui.channelKitShow}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-slate-200/80 pt-2">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{ui.channelKitPlatformHint}</p>
            <div className="flex flex-wrap gap-1">
              {platforms.map(row => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setPlatform(row.id)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                    platform === row.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <span className="mr-0.5">{row.icon}</span>
                  {row.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{ui.channelKitStrategy}</p>
            <p className="text-xs text-slate-700 leading-relaxed">{kit.strategy}</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200/80 p-2.5 space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{ui.channelKitSpecTitle}</p>
            <div>
              <p className="text-[9px] font-bold text-slate-400 mb-0.5">{ui.channelKitSpecTitleLen}</p>
              <p className="text-[11px] text-slate-700 leading-snug">{kit.specSheet.titleLengthHint}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 mb-0.5">{ui.channelKitSpecBullets}</p>
              <p className="text-[11px] text-slate-700 leading-snug">{kit.specSheet.bulletRules}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 mb-0.5">{ui.channelKitSpecImages}</p>
              <p className="text-[11px] text-slate-700 leading-snug">{kit.specSheet.imageRatioGuide}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 mb-0.5">{ui.channelKitSpecFields}</p>
              <ul className="text-[11px] text-slate-700 space-y-1">
                {kit.specSheet.extraFields.map((row, i) => (
                  <li key={i}>
                    <span className="font-bold text-slate-800">{row.label}: </span>
                    {row.hint}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {pasteBundle.trim() && (
            <button
              type="button"
              onClick={onCopyPasteBundle}
              className="w-full text-left text-xs font-bold text-slate-950 bg-white border border-slate-300 rounded-xl px-3 py-2 hover:bg-slate-50"
            >
              {ui.channelKitCopyPasteBundle}
            </button>
          )}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{ui.channelKitConversion}</p>
            <ul className="text-xs text-slate-700 leading-relaxed list-disc pl-4 space-y-0.5">
              {kit.conversionBullets.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{ui.channelKitPackaging}</p>
            <ul className="text-xs text-slate-700 leading-relaxed list-disc pl-4 space-y-0.5">
              {kit.packagingBullets.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{ui.channelKitHooks}</p>
            <div className="space-y-1.5">
              {kit.hooks.map((line, i) => (
                <div key={i} className="flex gap-1.5 items-start">
                  <p className="text-xs text-slate-800 leading-snug flex-1 min-w-0 break-words">{line}</p>
                  <button
                    type="button"
                    onClick={() => onCopyHook(line)}
                    className="shrink-0 text-[10px] font-bold text-slate-700 border border-slate-200 bg-white px-2 py-1 rounded-lg hover:bg-slate-50"
                  >
                    {ui.channelKitCopyHook}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function industryBucketLabel(ui: OrderResultUi, b: IndustryBucket): string {
  switch (b) {
    case 'health':
      return ui.industryHealth
    case 'beauty':
      return ui.industryBeauty
    case 'food':
      return ui.industryFood
    case 'finance':
      return ui.industryFinance
    case 'medical':
      return ui.industryMedical
    default:
      return ui.industryGeneral
  }
}

function ConversionAbPanel({
  titles,
  openers,
  ctas,
  recommendation,
  runnerUp,
  utmRecommendedQuery,
  ui,
  open,
  onToggle,
  onCopyLine,
  onApplyTitle,
  onApplyOpener,
  onApplyCta,
  onApplyCombo,
  onCopyUtm,
  onCopyExperimentSheet,
  hasFirst,
  lastSectionId,
  className = '',
}: {
  titles: [string, string, string]
  openers: [string, string, string]
  ctas: [string, string]
  recommendation: AbRecommendation
  runnerUp: AbRunnerUp
  utmRecommendedQuery: string
  ui: OrderResultUi
  open: boolean
  onToggle: () => void
  onCopyLine: (line: string) => void
  onApplyTitle: (index: 0 | 1 | 2) => void
  onApplyOpener: (index: 0 | 1 | 2) => void
  onApplyCta: (index: 0 | 1) => void
  onApplyCombo: (rec: AbRecommendation | AbRunnerUp) => void
  onCopyUtm: () => void
  onCopyExperimentSheet: () => void
  hasFirst: boolean
  lastSectionId: number | null
  className?: string
}) {
  const labs: ('A' | 'B' | 'C')[] = ['A', 'B', 'C']
  const ctaLabs: ('A' | 'B')[] = ['A', 'B']
  return (
    <div className={`border border-violet-200 bg-violet-50/90 rounded-2xl overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-3 hover:bg-violet-100/60 transition-colors"
      >
        <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest">{ui.abCopySub}</p>
        <p className="text-sm font-black text-violet-950 mt-0.5">{ui.abCopyTitle}</p>
        <span className="text-[10px] font-bold text-violet-800 mt-1 inline-block">{open ? ui.abCopyHide : ui.abCopyShow}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-4 border-t border-violet-200/80 pt-2">
          <div>
            <p className="text-[10px] font-black text-violet-500 uppercase tracking-wider mb-1.5">{ui.abCopyTitles}</p>
            <div className="space-y-2">
              {titles.map((line, i) => (
                <div key={i} className="rounded-xl bg-white/90 border border-violet-100 px-2.5 py-2">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-black text-violet-700">{labs[i]}</span>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onCopyLine(line)}
                        className="text-[10px] font-bold text-violet-800 border border-violet-200 bg-white px-2 py-0.5 rounded-md hover:bg-violet-50"
                      >
                        {ui.abCopyCopy}
                      </button>
                      {hasFirst && (
                        <button
                          type="button"
                          onClick={() => onApplyTitle(i as 0 | 1 | 2)}
                          className="text-[10px] font-bold text-white bg-violet-700 px-2 py-0.5 rounded-md hover:bg-violet-800"
                        >
                          {ui.abCopyApplyTitle}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-800 leading-snug break-words">{line}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-violet-500 uppercase tracking-wider mb-1.5">{ui.abCopyOpeners}</p>
            <div className="space-y-2">
              {openers.map((line, i) => (
                <div key={i} className="rounded-xl bg-white/90 border border-violet-100 px-2.5 py-2">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-black text-violet-700">{labs[i]}</span>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onCopyLine(line)}
                        className="text-[10px] font-bold text-violet-800 border border-violet-200 bg-white px-2 py-0.5 rounded-md hover:bg-violet-50"
                      >
                        {ui.abCopyCopy}
                      </button>
                      {hasFirst && (
                        <button
                          type="button"
                          onClick={() => onApplyOpener(i as 0 | 1 | 2)}
                          className="text-[10px] font-bold text-white bg-violet-700 px-2 py-0.5 rounded-md hover:bg-violet-800"
                        >
                          {ui.abCopyApplyOpener}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-800 leading-snug break-words">{line}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-violet-900/5 border border-violet-200/80 px-2.5 py-2 space-y-2">
            <p className="text-[10px] font-black text-violet-700 uppercase tracking-wider">{ui.abCopyRecommend}</p>
            <p className="text-[11px] text-violet-950 leading-snug font-medium">
              {['A', 'B', 'C'][recommendation.titleIdx]} + {['A', 'B', 'C'][recommendation.openerIdx]} + CTA {ctaLabs[recommendation.ctaIdx]}
            </p>
            <p className="text-[10px] text-violet-900/80 leading-relaxed">{recommendation.reason}</p>
            <p className="text-[9px] text-violet-700/70 leading-relaxed">{ui.abCopyUtmHint}</p>
            <pre className="text-[9px] text-violet-900/90 bg-white/80 border border-violet-100 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap break-all">
              ?{utmRecommendedQuery}
            </pre>
            <div className="flex flex-col gap-1.5">
              {hasFirst && lastSectionId !== null && (
                <button
                  type="button"
                  onClick={() => onApplyCombo(recommendation)}
                  className="w-full text-center text-[10px] font-black text-white bg-violet-800 py-2 rounded-xl hover:bg-violet-900"
                >
                  {ui.abCopyApplyRecommended}
                </button>
              )}
              <button
                type="button"
                onClick={onCopyUtm}
                className="w-full text-center text-[10px] font-bold text-violet-900 border border-violet-300 bg-white py-1.5 rounded-xl hover:bg-violet-50"
              >
                {ui.abCopyCopyUtm}
              </button>
              <button
                type="button"
                onClick={onCopyExperimentSheet}
                className="w-full text-center text-[10px] font-bold text-violet-900 border border-violet-300 bg-white py-1.5 rounded-xl hover:bg-violet-50"
              >
                {ui.abCopyCopyExperimentSheet}
              </button>
            </div>
          </div>
          <div className="rounded-xl bg-white/90 border border-violet-200 px-2.5 py-2 space-y-2">
            <p className="text-[10px] font-black text-violet-600 uppercase tracking-wider">{ui.abCopyRunnerUp}</p>
            <p className="text-[11px] text-violet-950 font-medium">
              {['A', 'B', 'C'][runnerUp.titleIdx]} + {['A', 'B', 'C'][runnerUp.openerIdx]} + CTA {ctaLabs[runnerUp.ctaIdx]}
            </p>
            <p className="text-[10px] text-gray-700 leading-relaxed">{runnerUp.reason}</p>
            {hasFirst && lastSectionId !== null && (
              <button
                type="button"
                onClick={() => onApplyCombo(runnerUp)}
                className="w-full text-center text-[10px] font-bold text-violet-800 border border-violet-400 bg-violet-50 py-1.5 rounded-xl hover:bg-violet-100"
              >
                {ui.abCopyApplyRunnerUp}
              </button>
            )}
          </div>
          <div>
            <p className="text-[10px] font-black text-violet-500 uppercase tracking-wider mb-1.5">{ui.abCopyCtas}</p>
            <div className="space-y-2">
              {ctas.map((line, i) => (
                <div key={i} className="rounded-xl bg-white/90 border border-violet-100 px-2.5 py-2">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-black text-violet-700">{ctaLabs[i]}</span>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onCopyLine(line)}
                        className="text-[10px] font-bold text-violet-800 border border-violet-200 bg-white px-2 py-0.5 rounded-md hover:bg-violet-50"
                      >
                        {ui.abCopyCopy}
                      </button>
                      {lastSectionId !== null && (
                        <button
                          type="button"
                          onClick={() => onApplyCta(i as 0 | 1)}
                          className="text-[10px] font-bold text-white bg-violet-700 px-2 py-0.5 rounded-md hover:bg-violet-800"
                        >
                          {ui.abCopyApplyCta}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-800 leading-snug break-words">{line}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EvidencePackPanel({
  pack,
  ui,
  open,
  onToggle,
  className = '',
}: {
  pack: ListingEvidencePack
  ui: OrderResultUi
  open: boolean
  onToggle: () => void
  className?: string
}) {
  function copyText(text: string, toastMsg: string) {
    navigator.clipboard.writeText(text).then(() => toast.success(toastMsg)).catch(() => toast.error(ui.toastCopyFail))
  }

  const preview = `${pack.executiveSummary.slice(0, 380)}${pack.executiveSummary.length > 380 ? '…' : ''}`

  return (
    <div className={`border border-cyan-200 bg-cyan-50/90 rounded-2xl overflow-hidden ${className}`}>
      <button type="button" onClick={onToggle} className="w-full text-left p-3 hover:bg-cyan-100/50 transition-colors">
        <p className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">{ui.evidenceSub}</p>
        <p className="text-sm font-black text-cyan-950 mt-0.5">{ui.evidenceTitle}</p>
        <span className="text-[10px] font-bold text-cyan-900 mt-1 inline-block">{open ? ui.metaOgHide : ui.metaOgShow}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-cyan-200/80 pt-2 space-y-1.5">
          <button
            type="button"
            onClick={() => copyText(pack.copyFullPackage, ui.evidenceToastFullPackage)}
            className="w-full text-center text-[10px] font-black text-white bg-cyan-800 py-2 rounded-xl hover:bg-cyan-900"
          >
            {ui.evidenceCopyFullPackage}
          </button>
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => copyText(pack.executiveSummary, ui.evidenceToastExecutive)}
              className="text-[9px] font-bold text-cyan-950 bg-white border border-cyan-200 rounded-lg px-2 py-1.5 hover:bg-cyan-50 text-center leading-tight"
            >
              {ui.evidenceCopyExecutive}
            </button>
            <button
              type="button"
              onClick={() => copyText(pack.slideOutline, ui.evidenceToastSlides)}
              className="text-[9px] font-bold text-cyan-950 bg-white border border-cyan-200 rounded-lg px-2 py-1.5 hover:bg-cyan-50 text-center leading-tight"
            >
              {ui.evidenceCopySlides}
            </button>
            <button
              type="button"
              onClick={() => copyText(pack.footnoteAppendix, ui.evidenceToastAppendix)}
              className="text-[9px] font-bold text-cyan-950 bg-white border border-cyan-200 rounded-lg px-2 py-1.5 hover:bg-cyan-50 text-center leading-tight"
            >
              {ui.evidenceCopyAppendix}
            </button>
            <button
              type="button"
              onClick={() => copyText(pack.copyBlock, ui.evidenceToastSections)}
              className="text-[9px] font-bold text-cyan-950 bg-white border border-cyan-200 rounded-lg px-2 py-1.5 hover:bg-cyan-50 text-center leading-tight"
            >
              {ui.evidenceCopySections}
            </button>
          </div>
          <pre className="text-[9px] text-gray-700 bg-white/90 border border-cyan-100 rounded-lg p-2 max-h-32 overflow-auto whitespace-pre-wrap break-words">
            {preview}
          </pre>
        </div>
      )}
    </div>
  )
}

function AssetKitPanel({
  kit,
  ui,
  open,
  onToggle,
  className = '',
}: {
  kit: ListingAssetKit
  ui: OrderResultUi
  open: boolean
  onToggle: () => void
  className?: string
}) {
  function copyText(text: string, toastMsg: string) {
    navigator.clipboard.writeText(text).then(() => toast.success(toastMsg)).catch(() => toast.error(ui.toastCopyFail))
  }

  const variantLabs = ['A', 'B', 'C'] as const
  const preview = `${kit.copyFullPipeline.slice(0, 560)}${kit.copyFullPipeline.length > 560 ? '…' : ''}`

  return (
    <div className={`border border-fuchsia-200 bg-fuchsia-50/90 rounded-2xl overflow-hidden ${className}`}>
      <button type="button" onClick={onToggle} className="w-full text-left p-3 hover:bg-fuchsia-100/50 transition-colors">
        <p className="text-[10px] font-black text-fuchsia-700 uppercase tracking-widest">{ui.assetSub}</p>
        <p className="text-sm font-black text-fuchsia-950 mt-0.5">{ui.assetTitle}</p>
        <span className="text-[10px] font-bold text-fuchsia-900 mt-1 inline-block">{open ? ui.metaOgHide : ui.metaOgShow}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-fuchsia-200/80 pt-2 space-y-2 max-h-[min(70vh,520px)] overflow-y-auto">
          <button
            type="button"
            onClick={() => copyText(kit.copyFullPipeline, ui.assetToastPipeline)}
            className="w-full text-center text-[10px] font-black text-white bg-fuchsia-700 py-2 rounded-xl hover:bg-fuchsia-800"
          >
            {ui.assetCopyAll}
          </button>
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => copyText(kit.copyBlock, ui.assetToastBase)}
              className="text-[9px] font-bold text-fuchsia-950 bg-white border border-fuchsia-200 rounded-lg px-2 py-1.5 hover:bg-fuchsia-50 text-center leading-tight"
            >
              {ui.assetCopyBase}
            </button>
            <button
              type="button"
              onClick={() => copyText(kit.channelsBlob, ui.assetToastChannels)}
              className="text-[9px] font-bold text-fuchsia-950 bg-white border border-fuchsia-200 rounded-lg px-2 py-1.5 hover:bg-fuchsia-50 text-center leading-tight"
            >
              {ui.assetCopyChannels}
            </button>
            <button
              type="button"
              onClick={() => copyText(kit.slotsBlob, ui.assetToastSlots)}
              className="text-[9px] font-bold text-fuchsia-950 bg-white border border-fuchsia-200 rounded-lg px-2 py-1.5 hover:bg-fuchsia-50 text-center leading-tight"
            >
              {ui.assetCopySlots}
            </button>
            <button
              type="button"
              onClick={() => copyText(kit.safeZoneBlob, ui.assetToastSafeZone)}
              className="text-[9px] font-bold text-fuchsia-950 bg-white border border-fuchsia-200 rounded-lg px-2 py-1.5 hover:bg-fuchsia-50 text-center leading-tight"
            >
              {ui.assetCopySafeZone}
            </button>
          </div>

          <div className="space-y-1">
            <p className="text-[9px] font-black text-fuchsia-700 uppercase tracking-wider">{ui.assetThumbLabel}</p>
            {kit.thumbnailLines.map((line, i) => (
              <div key={i} className="rounded-lg bg-white/90 border border-fuchsia-100 px-2 py-1.5">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[10px] font-black text-fuchsia-800">{variantLabs[i]}</span>
                  <button
                    type="button"
                    onClick={() => copyText(line, ui.abCopyToast)}
                    className="text-[10px] font-bold text-fuchsia-800 border border-fuchsia-200 bg-white px-2 py-0.5 rounded-md hover:bg-fuchsia-50 shrink-0"
                  >
                    {ui.abCopyCopy}
                  </button>
                </div>
                <p className="text-[10px] text-gray-800 leading-snug break-words">{line}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <p className="text-[9px] font-black text-fuchsia-700 uppercase tracking-wider">{ui.assetMicroLabel}</p>
            {kit.brandMicroLines.map((line, i) => (
              <div key={i} className="rounded-lg bg-white/90 border border-fuchsia-100 px-2 py-1.5">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[10px] font-black text-fuchsia-800">{variantLabs[i]}</span>
                  <button
                    type="button"
                    onClick={() => copyText(line, ui.abCopyToast)}
                    className="text-[10px] font-bold text-fuchsia-800 border border-fuchsia-200 bg-white px-2 py-0.5 rounded-md hover:bg-fuchsia-50 shrink-0"
                  >
                    {ui.abCopyCopy}
                  </button>
                </div>
                <p className="text-[10px] text-gray-800 leading-snug break-words">{line}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[9px] font-black text-fuchsia-700 uppercase tracking-wider mb-1">{ui.assetRatioLabel}</p>
            <ul className="list-disc pl-4 text-[10px] text-gray-800 space-y-0.5">
              {kit.ratioRows.map((r, i) => (
                <li key={i}>
                  <span className="font-bold">{r.ratio}</span> — {r.use}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[9px] font-black text-fuchsia-700 uppercase tracking-wider mb-1">{ui.assetSlotsLabel}</p>
            <ul className="list-disc pl-4 text-[10px] text-gray-800 space-y-0.5">
              {kit.slotChecklist.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[9px] font-black text-fuchsia-700 uppercase tracking-wider mb-1">{ui.assetChannelLinesLabel}</p>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-0.5">
              {kit.channels.map(c => (
                <div key={c.id} className="rounded-lg border border-fuchsia-100 bg-white/85 p-2">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-[10px] font-bold text-fuchsia-950 leading-tight">{c.label}</p>
                    <button
                      type="button"
                      onClick={() => copyText(c.blob, ui.abCopyToast)}
                      className="text-[10px] font-bold text-fuchsia-800 border border-fuchsia-200 bg-white px-2 py-0.5 rounded-md hover:bg-fuchsia-50 shrink-0"
                    >
                      {ui.abCopyCopy}
                    </button>
                  </div>
                  <p className="text-[9px] text-gray-700 whitespace-pre-wrap leading-snug">{c.blob}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[9px] font-black text-fuchsia-700 uppercase tracking-wider mb-1">{ui.assetSlotPlanLabel}</p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {kit.imageSlots.map(row => (
                <div key={row.slot} className="rounded-lg border border-fuchsia-100 bg-white/85 px-2 py-1.5 text-[9px] text-gray-800">
                  <p className="font-bold text-fuchsia-950">
                    {row.slot} · {row.purpose}
                  </p>
                  <p className="text-fuchsia-900/85">{row.ratio}</p>
                  <p className="text-gray-600 leading-snug">{row.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[9px] font-black text-fuchsia-700 uppercase tracking-wider mb-1">{ui.assetSafeZoneLabel}</p>
            <ul className="list-disc pl-4 text-[10px] text-gray-800 space-y-0.5">
              {kit.overlaySafeZoneNotes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>

          <pre className="text-[9px] text-gray-700 bg-white/90 border border-fuchsia-100 rounded-lg p-2 max-h-28 overflow-auto whitespace-pre-wrap break-words">
            {preview}
          </pre>
        </div>
      )}
    </div>
  )
}

function MarketIntelPanel({
  pack,
  ui,
  open,
  onToggle,
  className = '',
}: {
  pack: ReturnType<typeof buildMarketIntelHeuristics>
  ui: OrderResultUi
  open: boolean
  onToggle: () => void
  className?: string
}) {
  function copyText(text: string, toastMsg: string) {
    navigator.clipboard.writeText(text).then(() => toast.success(toastMsg)).catch(() => toast.error(ui.toastCopyFail))
  }

  const preview = `${pack.copyFullIntel.slice(0, 520)}${pack.copyFullIntel.length > 520 ? '…' : ''}`

  return (
    <div className={`border border-amber-200/90 bg-amber-50/80 rounded-2xl overflow-hidden ${className}`}>
      <button type="button" onClick={onToggle} className="w-full text-left p-3 hover:bg-amber-100/40 transition-colors">
        <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">{ui.intelSub}</p>
        <p className="text-sm font-black text-amber-950 mt-0.5">{ui.intelTitle}</p>
        <span className="text-[10px] font-bold text-amber-900 mt-1 inline-block">{open ? ui.metaOgHide : ui.metaOgShow}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-amber-200/70 pt-2 space-y-2 text-[11px] text-amber-950/90 max-h-[min(70vh,520px)] overflow-y-auto">
          <button
            type="button"
            onClick={() => copyText(pack.copyFullIntel, ui.intelToastFull)}
            className="w-full text-center text-[10px] font-black text-white bg-amber-800 py-2 rounded-xl hover:bg-amber-900"
          >
            {ui.intelCopyChecklist}
          </button>
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => copyText(pack.competitorsBlob, ui.intelToastCompetitors)}
              className="text-[9px] font-bold text-amber-950 bg-white border border-amber-200 rounded-lg px-2 py-1.5 hover:bg-amber-50 text-center leading-tight"
            >
              {ui.intelCopyCompetitorsOnly}
            </button>
            <button
              type="button"
              onClick={() => copyText(pack.keywordsBlob, ui.intelToastKeywords)}
              className="text-[9px] font-bold text-amber-950 bg-white border border-amber-200 rounded-lg px-2 py-1.5 hover:bg-amber-50 text-center leading-tight"
            >
              {ui.intelCopyKeywordsOnly}
            </button>
            <button
              type="button"
              onClick={() => copyText(pack.reviewBlob, ui.intelToastReview)}
              className="text-[9px] font-bold text-amber-950 bg-white border border-amber-200 rounded-lg px-2 py-1.5 hover:bg-amber-50 text-center leading-tight"
            >
              {ui.intelCopyReviewOnly}
            </button>
            <button
              type="button"
              onClick={() => copyText(pack.gapBlob, ui.intelToastGap)}
              className="text-[9px] font-bold text-amber-950 bg-white border border-amber-200 rounded-lg px-2 py-1.5 hover:bg-amber-50 text-center leading-tight"
            >
              {ui.intelCopyGapOnly}
            </button>
          </div>

          <div>
            <p className="text-[9px] font-black text-amber-800 uppercase mb-1">{ui.intelCompetitor}</p>
            <ul className="space-y-1.5">
              {pack.competitorPatterns.map((s, i) => (
                <li key={i} className="list-none">
                  <div className="rounded-lg bg-white/90 border border-amber-100 px-2 py-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[10px] text-gray-800 leading-snug break-words flex-1">{s}</p>
                      <button
                        type="button"
                        onClick={() => copyText(s, ui.abCopyToast)}
                        className="text-[10px] font-bold text-amber-900 border border-amber-200 bg-white px-2 py-0.5 rounded-md hover:bg-amber-50 shrink-0"
                      >
                        {ui.abCopyCopy}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[9px] font-black text-amber-800 uppercase mb-0.5">{ui.intelKeywords}</p>
            <div className="flex items-start justify-between gap-2 rounded-lg bg-white/90 border border-amber-100 px-2 py-1.5">
              <p className="text-[10px] leading-snug break-words flex-1">{pack.categoryKeywords.join(' · ')}</p>
              <button
                type="button"
                onClick={() => copyText(pack.categoryKeywords.join(' · '), ui.abCopyToast)}
                className="text-[10px] font-bold text-amber-900 border border-amber-200 bg-white px-2 py-0.5 rounded-md hover:bg-amber-50 shrink-0"
              >
                {ui.abCopyCopy}
              </button>
            </div>
          </div>

          <div>
            <p className="text-[9px] font-black text-amber-800 uppercase mb-1">{ui.intelReviewThemes}</p>
            <ul className="space-y-1.5">
              {pack.reviewThemes.map((s, i) => (
                <li key={i} className="list-none">
                  <div className="rounded-lg bg-white/90 border border-amber-100 px-2 py-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[10px] text-gray-800 leading-snug break-words flex-1">{s}</p>
                      <button
                        type="button"
                        onClick={() => copyText(s, ui.abCopyToast)}
                        className="text-[10px] font-bold text-amber-900 border border-amber-200 bg-white px-2 py-0.5 rounded-md hover:bg-amber-50 shrink-0"
                      >
                        {ui.abCopyCopy}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[9px] font-black text-amber-800 uppercase mb-0.5">{ui.intelGap}</p>
            <p className="text-[10px] text-amber-900/80 leading-relaxed">{pack.gapNote}</p>
          </div>

          <div>
            <p className="text-[9px] font-black text-amber-800 uppercase mb-1">{ui.intelSearchQueriesLabel}</p>
            <ul className="space-y-1.5">
              {pack.searchQueries.map((q, i) => (
                <li key={i} className="list-none">
                  <div className="rounded-lg bg-white/90 border border-amber-100 px-2 py-1.5 flex items-center justify-between gap-2">
                    <p className="text-[10px] text-gray-800 leading-snug break-words flex-1">{q}</p>
                    <button
                      type="button"
                      onClick={() => copyText(q, ui.abCopyToast)}
                      className="text-[10px] font-bold text-amber-900 border border-amber-200 bg-white px-2 py-0.5 rounded-md hover:bg-amber-50 shrink-0"
                    >
                      {ui.abCopyCopy}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <pre className="text-[9px] text-gray-700 bg-white/90 border border-amber-100 rounded-lg p-2 max-h-28 overflow-auto whitespace-pre-wrap break-words">
            {preview}
          </pre>
        </div>
      )}
    </div>
  )
}

function MetaOgExportPanel({
  htmlBlock,
  jsonBlock,
  ui,
  open,
  onToggle,
  onCopyHtml,
  onCopyJson,
  className = '',
}: {
  htmlBlock: string
  jsonBlock: string
  ui: OrderResultUi
  open: boolean
  onToggle: () => void
  onCopyHtml: () => void
  onCopyJson: () => void
  className?: string
}) {
  return (
    <div className={`border border-emerald-200 bg-emerald-50/90 rounded-2xl overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-3 hover:bg-emerald-100/60 transition-colors"
      >
        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{ui.metaOgSub}</p>
        <p className="text-sm font-black text-emerald-950 mt-0.5">{ui.metaOgTitle}</p>
        <span className="text-[10px] font-bold text-emerald-800 mt-1 inline-block">{open ? ui.metaOgHide : ui.metaOgShow}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-emerald-200/80 pt-2">
          <p className="text-[10px] text-emerald-900/70 leading-relaxed">{ui.metaOgNote}</p>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={onCopyHtml}
              className="w-full text-left text-xs font-bold text-emerald-950 bg-white border border-emerald-200 rounded-xl px-3 py-2 hover:bg-emerald-50"
            >
              {ui.metaOgCopyHtml}
            </button>
            <button
              type="button"
              onClick={onCopyJson}
              className="w-full text-left text-xs font-bold text-emerald-950 bg-white border border-emerald-200 rounded-xl px-3 py-2 hover:bg-emerald-50"
            >
              {ui.metaOgCopyJson}
            </button>
          </div>
          <pre className="text-[9px] text-gray-600 bg-white/80 border border-emerald-100 rounded-lg p-2 max-h-20 overflow-auto whitespace-pre-wrap break-all">
            {htmlBlock.slice(0, 400)}
            {htmlBlock.length > 400 ? '…' : ''}
          </pre>
          <pre className="text-[9px] text-gray-600 bg-white/80 border border-emerald-100 rounded-lg p-2 max-h-20 overflow-auto whitespace-pre-wrap break-all">
            {jsonBlock.slice(0, 320)}
            {jsonBlock.length > 320 ? '…' : ''}
          </pre>
        </div>
      )}
    </div>
  )
}

export default function OrderResultPage() {
  const { id } = useParams()
  const orderId = Array.isArray(id) ? id[0] : id
  const router = useRouter()
  const supabase = createClient()
  const previewRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const pendingImageSlot = useRef<number | null>(null)

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [multiLangTab, setMultiLangTab] = useState<'ko' | 'en' | 'ja' | 'zh'>('ko')
  const [seoReport, setSeoReport] = useState<SeoReport | null>(null)
  const [showSeo, setShowSeo] = useState(false)
  const [showBlogPreview, setShowBlogPreview] = useState(false)
  const [copyDone, setCopyDone] = useState(false)
  const [platform, setPlatform] = useState<PublishPlatform>('naver')
  const [uiLang, setUiLang] = useState<UiLang>('ko')
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string; sections?: { id: number; name: string; title: string; body: string }[] }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const langSyncedFromOrderRef = useRef(false)
  const [imageBusy, setImageBusy] = useState(false)
  const [complianceOpen, setComplianceOpen] = useState(false)
  const [channelKitOpen, setChannelKitOpen] = useState(true)
  const [abCopyOpen, setAbCopyOpen] = useState(true)
  const [metaOgOpen, setMetaOgOpen] = useState(false)
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const [assetKitOpen, setAssetKitOpen] = useState(false)
  const [intelOpen, setIntelOpen] = useState(false)
  const [competitorUrl, setCompetitorUrl] = useState('')
  const [competitorLoading, setCompetitorLoading] = useState(false)
  const [competitorResult, setCompetitorResult] = useState<{
    competitor_name: string
    my_score: number
    competitor_score: number
    my_strengths: string[]
    competitor_strengths: string[]
    my_weaknesses: string[]
    recommendations: string[]
    verdict: string
  } | null>(null)
  const [competitorOpen, setCompetitorOpen] = useState(false)
  const [rightTab, setRightTab] = useState<'publish'|'copy'|'tools'>('publish')
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false)
  const [photoOptOpen, setPhotoOptOpen] = useState(true)
  const [photoPresets, setPhotoPresets] = useState<Record<string, string>>({})
  const [photoProcessing, setPhotoProcessing] = useState<string | null>(null)
  const [deployOpen, setDeployOpen] = useState(false)

  const PLATFORMS = platformsForLang(uiLang)
  const t = ORDER_RESULT_UI[uiLang]
  const p = ORDER_PAGE_UI[uiLang]
  const primaryPlatform = defaultPlatformForLang(uiLang)
  const primStyle = primaryPublishStyle(primaryPlatform)
  const primaryRow = PLATFORMS.find(p => p.id === primaryPlatform) ?? PLATFORMS[0]

  useEffect(() => {
    langSyncedFromOrderRef.current = false
  }, [orderId])

  useEffect(() => {
    const stored = readStoredUiLang()
    if (stored) {
      setUiLang(stored)
      return
    }
    const nav = navigator.language?.slice(0, 2) ?? 'ko'
    const supported: UiLang[] = ['ko', 'en', 'ja', 'zh']
    setUiLang(supported.includes(nav as UiLang) ? (nav as UiLang) : 'en')
  }, [])

  useEffect(() => {
    if (!order?.result_json || langSyncedFromOrderRef.current) return
    const ol = order.result_json.output_lang
    if (ol === 'ko' || ol === 'en' || ol === 'ja' || ol === 'zh') {
      langSyncedFromOrderRef.current = true
      setUiLang(ol)
      persistUiLang(ol)
    }
  }, [order?.result_json?.output_lang, order?.result_json])

  useEffect(() => {
    setPlatform(defaultPlatformForLang(uiLang))
  }, [uiLang])

  useEffect(() => {
    if (!order || sections.length === 0) return
    setSeoReport(buildSeoReport(sections, order.product_name, order.category, uiLang))
  }, [order, sections, uiLang])

  const industryBucket = useMemo((): IndustryBucket => {
    if (!order) return 'general'
    return detectIndustryBucket(order.category, order.product_name)
  }, [order])

  const { complianceFindings, complianceHighCount } = useMemo(() => {
    if (!order || sections.length === 0) {
      return { complianceFindings: [] as ComplianceFinding[], complianceHighCount: 0 }
    }
    const text = flattenContentForScan(order.product_name, order.category, sections)
    const complianceFindings = scanPostPublishCompliance(text, uiLang, industryBucket)
    const complianceHighCount = complianceFindings.filter(f => f.severity === 'high').length
    return { complianceFindings, complianceHighCount }
  }, [order, sections, uiLang, industryBucket])

  const complianceDisclosurePack = useMemo(
    () => buildComplianceDisclosureKit(industryBucket, uiLang),
    [industryBucket, uiLang],
  )

  useEffect(() => {
    if (complianceHighCount > 0) setComplianceOpen(true)
  }, [complianceHighCount])

  const channelKitContent = useMemo(() => {
    if (!order || sections.length === 0) return null
    const hook = sections[0]?.title ?? order.product_name
    return getChannelPublishKit(platform, uiLang, {
      productName: order.product_name,
      category: order.category,
      hook,
    })
  }, [order, sections, platform, uiLang])

  const abCopySet = useMemo(() => {
    if (!order || sections.length === 0) return null
    return buildConversionAbCopy(uiLang, order.product_name, order.category, sections)
  }, [order, sections, uiLang])

  const metaExportBlocks = useMemo(() => {
    if (!seoReport || !order) return null
    const pkg = buildMetaOgPackage({
      productName: order.product_name,
      category: order.category,
      metaTitle: seoReport.metaTitle,
      metaDescription: seoReport.metaDesc,
      ogImageUrl: order.image_urls?.[0] ?? null,
      pathOrSlug: `order/${order.id}`,
    })
    return { html: metaOgPackageToHtmlMeta(pkg), json: metaOgPackageToJson(pkg) }
  }, [seoReport, order])

  const listingPasteBundle = useMemo(() => {
    if (!order || sections.length === 0) return ''
    return buildListingPasteBundle(platform, uiLang, {
      productName: order.product_name,
      category: order.category,
      sections,
      metaTitle: seoReport?.metaTitle,
      metaDescription: seoReport?.metaDesc,
    })
  }, [order, sections, platform, uiLang, seoReport?.metaTitle, seoReport?.metaDesc])

  const evidencePack = useMemo(() => {
    if (!order || sections.length === 0) return null
    return buildListingEvidencePack(uiLang, order.product_name, order.category, sections)
  }, [order, sections, uiLang])

  const assetKit = useMemo(() => {
    if (!order || sections.length === 0) return null
    return buildListingAssetKit(uiLang, order.product_name, order.category, sections)
  }, [order, sections, uiLang])

  const intelPack = useMemo(() => {
    if (!order || sections.length === 0) return null
    return buildMarketIntelHeuristics(uiLang, order.product_name, order.category, sections)
  }, [order, sections, uiLang])

  const copyFormatIsListing = listingBundleUsesPlainText(platform)
  const lastSectionId = sections.length > 0 ? sections[sections.length - 1]!.id : null

  useEffect(() => {
    if (!orderId) return
    async function fetchOrder() {
      const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single()
      if (error || !data) { toast.error(ORDER_PAGE_UI[uiLang].errOrder); router.push('/dashboard'); return }
      setOrder(data)
      if (data.result_json?.multi_lang) {
        // 멀티랭 결과: 저장된 언어 또는 ko 기본
        const defaultLang = (data.result_json.output_lang === 'all' ? 'ko' : (data.result_json.output_lang ?? 'ko')) as 'ko' | 'en' | 'ja' | 'zh'
        setMultiLangTab(defaultLang)
        setSections(data.result_json[defaultLang]?.sections ?? [])
      } else if (data.result_json?.sections) {
        setSections(data.result_json.sections)
      }
      setLoading(false)
    }
    fetchOrder()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase stable; router stable
  }, [orderId, uiLang])

  // 멀티랭 탭 전환 시 해당 언어 섹션 로드
  useEffect(() => {
    if (order?.result_json?.multi_lang) {
      setSections(order.result_json[multiLangTab]?.sections ?? [])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiLangTab])

  function updateSection(sectionId: number, field: 'title' | 'body', value: string) {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, [field]: value } : s))
  }

  function applyAbCombo(rec: AbRecommendation | AbRunnerUp) {
    if (!abCopySet) return
    const { titles, openers, ctas } = abCopySet
    setSections(prev => {
      if (prev.length === 0) return prev
      const s0 = prev[0]!
      const last = prev[prev.length - 1]!
      return prev.map(s => {
        if (s.id === s0.id) {
          return {
            ...s,
            title: titles[rec.titleIdx],
            body: `${openers[rec.openerIdx]}\n\n${s0.body}`,
          }
        }
        if (s.id === last.id) {
          return { ...s, body: `${last.body}\n\n${ctas[rec.ctaIdx]}` }
        }
        return s
      })
    })
    toast.success(t.abCopyToastApplyRecommended)
  }

  async function handleRegenerate() {
    if (!order) return
    setRegenLoading(true)
    try {
      await supabase.from('orders').update({ status: 'pending', result_json: null }).eq('id', order.id)
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, outputLang: uiLang }),
      })
      if (!res.ok) throw new Error(p.toastRegenFail)
      const { result } = await res.json()
      setSections(result.sections)
      setOrder(prev => prev ? { ...prev, result_json: result, status: 'done' } : prev)
      toast.success(p.toastRegenOk)
    } catch { toast.error(p.toastRegenFail) }
    finally { setRegenLoading(false) }
  }

  async function handleDownloadPDF() {
    if (!previewRef.current || !order) return
    setPdfLoading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const opt = {
        margin: 0,
        filename: p.pdfFilename(order.product_name),
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'px' as const, format: [390, 10000] as [number, number], orientation: 'portrait' as const },
      }
      await html2pdf().set(opt).from(previewRef.current).save()
      toast.success(p.toastPdfOk)
    } catch { toast.error(p.toastPdfFail) }
    finally { setPdfLoading(false) }
  }

  function handleDownloadTxt() {
    if (!order || sections.length === 0) return
    const lines: string[] = [`[ ${order.product_name} ]\n`]
    sections.forEach((s, i) => {
      lines.push(`${'─'.repeat(40)}`)
      lines.push(`[${i + 1}] ${s.name}`)
      lines.push(`제목: ${s.title}`)
      lines.push('')
      lines.push(s.body)
      lines.push('')
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = p.txtFilename(order.product_name)
    a.click()
    URL.revokeObjectURL(url)
    toast.success(p.toastTxtOk)
  }

  // ── Canvas-based image resize ─────────────────────────────────────────
  async function resizeImageToDataUrl(src: string, w: number, h: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('no ctx')); return }
        // letterbox with white bg
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)
        const ratio = Math.min(w / img.width, h / img.height)
        const rw = img.width * ratio
        const rh = img.height * ratio
        ctx.drawImage(img, (w - rw) / 2, (h - rh) / 2, rw, rh)
        resolve(canvas.toDataURL('image/jpeg', 0.92))
      }
      img.onerror = reject
      img.src = src
    })
  }

  const PHOTO_MARKET_PRESETS = [
    { id: 'smartstore', label: '스마트스토어', icon: '🟢', w: 1000, h: 1000, desc: '1000×1000 정사각형' },
    { id: 'coupang',    label: '쿠팡',         icon: '🟡', w: 1200, h: 1200, desc: '1200×1200 정사각형' },
    { id: 'amazon',     label: 'Amazon JP',    icon: '🟠', w: 2000, h: 2000, desc: '2000×2000 흰배경 필수' },
    { id: 'tmall',      label: 'Tmall',        icon: '🔴', w: 800,  h: 800,  desc: '800×800 고화질' },
    { id: 'rakuten',    label: '楽天',          icon: '🔴', w: 1080, h: 1080, desc: '1080×1080' },
    { id: 'shopify',    label: 'Shopify',      icon: '🟢', w: 2048, h: 2048, desc: '2048×2048 권장' },
    { id: 'qoo10',      label: 'Qoo10',        icon: '🔵', w: 600,  h: 600,  desc: '600×600 최소' },
  ]

  async function handlePhotoResize(preset: typeof PHOTO_MARKET_PRESETS[0]) {
    const imgs = order?.image_urls ?? []
    if (!imgs.length) { toast.error('업로드된 사진이 없습니다'); return }
    setPhotoProcessing(preset.id)
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      const folder = zip.folder(preset.id)!
      for (let i = 0; i < imgs.length; i++) {
        const dataUrl = await resizeImageToDataUrl(imgs[i], preset.w, preset.h)
        const base64 = dataUrl.split(',')[1]
        folder.file(`photo_${i + 1}_${preset.w}x${preset.h}.jpg`, base64, { base64: true })
      }
      const readme = [
        `${preset.label} 최적화 사진 — ${order?.product_name ?? ''}`,
        `크기: ${preset.w}×${preset.h}px`,
        `파일 수: ${imgs.length}장`,
        ``,
        `Powered by PageAI (pagebeer.beer)`,
      ].join('\n')
      zip.file('README.txt', readme)
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `photos_${preset.id}_${preset.w}x${preset.h}.zip`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`📸 ${preset.label} 최적화 완료! ${imgs.length}장 다운로드`)
    } catch {
      toast.error('이미지 처리 중 오류가 발생했습니다')
    } finally {
      setPhotoProcessing(null)
    }
  }

  async function handleDownloadZip() {
    if (!order) return
    const rj = order.result_json
    if (!rj) return

    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    const sectionsToTxt = (secs: Section[], lang: string) => {
      const LANG_NAME: Record<string, string> = { ko: '한국어', en: 'English', ja: '日本語', zh: '中文' }
      const lines: string[] = [
        `=== ${order.product_name} (${LANG_NAME[lang] ?? lang}) ===\n`,
      ]
      secs.forEach((s, i) => {
        lines.push(`${'─'.repeat(40)}`)
        lines.push(`[${i + 1}] ${s.name}`)
        lines.push(`Title: ${s.title}`)
        lines.push('')
        lines.push(s.body)
        lines.push('')
      })
      return lines.join('\n')
    }

    if (rj.multi_lang) {
      const LANGS = ['ko', 'en', 'ja', 'zh'] as const
      const FLAG: Record<string, string> = { ko: '🇰🇷', en: '🇺🇸', ja: '🇯🇵', zh: '🇨🇳' }
      for (const lang of LANGS) {
        const secs = rj[lang]?.sections
        if (secs && secs.length > 0) {
          zip.file(`${lang}.txt`, sectionsToTxt(secs, lang))
        }
      }
      const readme = [
        `PageAI Export Pack — ${order.product_name}`,
        `Generated: ${new Date().toLocaleString()}`,
        ``,
        `Files:`,
        ...LANGS.filter(l => (rj[l]?.sections?.length ?? 0) > 0).map(l => `  ${FLAG[l]} ${l}.txt`),
        ``,
        `Powered by PageAI (pagebeer.beer)`,
      ].join('\n')
      zip.file('README.txt', readme)
    } else {
      const secs = rj.sections ?? []
      const lang = rj.output_lang ?? 'ko'
      zip.file(`${lang}.txt`, sectionsToTxt(secs, lang))
    }

    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pageai_${order.product_name.slice(0, 20).replace(/\s+/g, '_')}_export.zip`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(p.toastZipOk ?? '📦 ZIP 다운로드 완료!')
  }

  async function handleCompetitorAnalysis() {
    if (!orderId || !competitorUrl.trim()) return
    setCompetitorLoading(true)
    setCompetitorResult(null)
    try {
      const res = await fetch('/api/competitor-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, competitorUrl: competitorUrl.trim() }),
      })
      const data = await res.json() as { success?: boolean; result?: typeof competitorResult; error?: string }
      if (!res.ok || !data.success) throw new Error(data.error ?? '분석 실패')
      setCompetitorResult(data.result ?? null)
      setCompetitorOpen(true)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '경쟁사 분석 실패')
    } finally {
      setCompetitorLoading(false)
    }
  }

  async function handleCopyShareLink() {
    if (!order) return
    try {
      const res = await fetch(`/api/orders/${order.id}/share-link`, { method: 'POST' })
      const data = (await res.json()) as { url?: string }
      if (res.status === 401) {
        toast.error(p.shareLinkNeedLogin)
        return
      }
      if (res.status === 503) {
        toast.error(p.shareLinkNotConfigured)
        return
      }
      if (res.status === 400) {
        toast.error(p.shareLinkNoResult)
        return
      }
      if (!res.ok || !data.url) {
        toast.error(p.shareLinkFail)
        return
      }
      await navigator.clipboard.writeText(data.url)
      toast.success(p.shareLinkToast)
    } catch {
      toast.error(p.shareLinkFail)
    }
  }

  async function handleChatSend() {
    if (!chatInput.trim() || chatLoading || !order) return
    const userMsg = chatInput.trim()
    const imageUrlsBefore = JSON.stringify(order.image_urls ?? [])
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setChatLoading(true)
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          sections,
          productName: order.product_name,
          category: order.category,
          orderId: order.id,
          imageUrls: order.image_urls ?? [],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (Array.isArray(data.image_urls)) {
        setOrder(prev => (prev ? { ...prev, image_urls: data.image_urls } : prev))
        if (JSON.stringify(data.image_urls) !== imageUrlsBefore) {
          toast.success(p.toastImgOk)
        }
      }
      if (Array.isArray(data.image_errors) && data.image_errors.length > 0) {
        toast.warning(data.image_errors.join(' · '), { duration: 6000 })
      }

      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: data.message,
        sections: data.modified_sections?.length ? data.modified_sections : undefined,
      }])

      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: p.toastChatErr }])
    } finally {
      setChatLoading(false)
    }
  }

  function applyModifiedSections(modified: { id: number; name: string; title: string; body: string }[]) {
    setSections(prev =>
      prev.map(s => {
        const found = modified.find(m => m.id === s.id)
        return found ? { ...s, title: found.title, body: found.body, name: found.name } : s
      })
    )
    toast.success(p.toastSections(modified.length))
  }

  function pickImageSlot(slot: number) {
    pendingImageSlot.current = slot
    imageInputRef.current?.click()
  }

  async function onProductImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const slot = pendingImageSlot.current
    e.target.value = ''
    pendingImageSlot.current = null
    if (!file || slot === null || !orderId) return
    setImageBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('slot', String(slot))
      const res = await fetch(`/api/orders/${orderId}/images`, { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : p.toastUploadFail)
      setOrder(prev => (prev ? { ...prev, image_urls: data.image_urls ?? prev.image_urls } : prev))
      toast.success(p.toastImgOk)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : p.toastUploadFail)
    } finally {
      setImageBusy(false)
    }
  }

  function getFormatContent(): string {
    if (!order) return ''
    const imgs = order.image_urls ?? []
    if (platform === 'smartstore' || platform === 'coupang') {
      return buildListingPasteBundle(platform, uiLang, {
        productName: order.product_name,
        category: order.category,
        sections,
        metaTitle: seoReport?.metaTitle,
        metaDescription: seoReport?.metaDesc,
      })
    }
    switch (platform) {
      case 'naver':
      case 'tistory':
        return toBlogHTML(sections, order.product_name, order.category, imgs)
      case 'wordpress':
      case 'medium':
      case 'shopify':
      case 'linkedin':
        return toWordPressHTML(sections, order.product_name, order.category, imgs)
      case 'brunch':
        return toBrunchText(sections, order.product_name)
      case 'instagram':
        return toInstagramCaption(sections, order.product_name, order.category)
    }
  }

  function handleNaverCopy() {
    if (!order) return
    const content = getFormatContent()
    navigator.clipboard.writeText(content).then(() => {
      setCopyDone(true)
      toast.success(t.toastCopied(PLATFORMS.find(p => p.id === platform)?.label ?? ''))
      setTimeout(() => setCopyDone(false), 3000)
    }).catch(() => toast.error(t.toastCopyFail))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white/10 border-t-white/60 rounded-full animate-spin mx-auto mb-5" />
          <p className="text-gray-500 text-sm font-medium">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (!order?.result_json || sections.length === 0) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl p-12 shadow-sm border border-gray-100 max-w-sm mx-4">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">📄</div>
          <p className="text-gray-700 font-bold mb-2">{p.noResult}</p>
          <button type="button" onClick={() => router.push('/dashboard')}
            className="bg-[#0F172A] text-white px-6 py-3 rounded-xl text-sm font-bold mt-4 hover:bg-gray-800 transition-all">
            {p.dashboard}
          </button>
        </div>
      </div>
    )
  }

  const scoreColor = seoReport
    ? seoReport.score >= 80 ? 'text-green-600' : seoReport.score >= 60 ? 'text-yellow-600' : 'text-red-500'
    : ''
  const scoreBg = seoReport
    ? seoReport.score >= 80 ? 'bg-green-50 border-green-200' : seoReport.score >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
    : ''

  const complianceIndustryBadge =
    industryBucket !== 'general'
      ? t.complianceIndustryBadge(industryBucketLabel(t, industryBucket))
      : null

  return (
    <main className="min-h-screen bg-[#EEF2F7] overflow-x-hidden" style={{ fontFamily: "'Pretendard', 'Inter', -apple-system, sans-serif" }}>
      {/* ══ HEADER ══════════════════════════════════════════════════ */}
      <header className="bg-[#0F172A] sticky top-0 z-30 print:hidden shadow-xl shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          {/* Left: Logo + product */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="shrink-0 flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg" />
              <span className="font-black text-white text-sm tracking-tight hidden sm:block">{p.brand}</span>
            </Link>
            <div className="w-px h-4 bg-white/10 hidden sm:block" />
            <div className="min-w-0 hidden sm:block">
              <span className="text-white text-sm font-semibold truncate block max-w-[200px] lg:max-w-xs">{order.product_name}</span>
            </div>
            <span className="shrink-0 text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              {p.badgeDone}
            </span>
          </div>

          {/* Center: Language tabs */}
          <div className="flex items-center gap-1 bg-white/6 rounded-xl p-1 shrink-0">
            {(['ko','en','ja','zh'] as const).map(code => {
              const FLAGS: Record<string,string> = {ko:'🇰🇷',en:'🇺🇸',ja:'🇯🇵',zh:'🇨🇳'}
              return (
                <button key={code} type="button"
                  onClick={() => { setUiLang(code); persistUiLang(code) }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                    uiLang === code ? 'bg-white text-[#0F172A] shadow-sm' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <span>{FLAGS[code]}</span>
                  <span className="hidden md:inline">{code.toUpperCase()}</span>
                </button>
              )
            })}
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleRegenerate} disabled={regenLoading}
              className="hidden sm:flex items-center gap-1.5 text-gray-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40">
              {regenLoading ? <span className="w-3 h-3 border-2 border-gray-600 border-t-white rounded-full animate-spin" /> : '↺'}
              <span className="hidden md:inline">{p.regen}</span>
            </button>
            <button type="button" onClick={() => setShowChat(true)}
              className="flex items-center gap-1.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/25 px-3 py-2 rounded-xl text-xs font-bold transition-all">
              <span>✦</span>
              <span className="hidden md:inline">{p.chatOpen}</span>
            </button>
            {/* Download group */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              <button type="button" onClick={handleDownloadPDF} disabled={pdfLoading}
                className="flex items-center gap-1 text-gray-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-white/10 disabled:opacity-40">
                {pdfLoading ? <span className="w-3 h-3 border-2 border-gray-600 border-t-white rounded-full animate-spin" /> : 'PDF'}
              </button>
              {sections.length > 0 && (
                <button type="button" onClick={handleDownloadTxt}
                  className="text-gray-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-white/10">TXT</button>
              )}
              {order.result_json?.multi_lang && (
                <button type="button" onClick={handleDownloadZip}
                  className="text-emerald-400 hover:text-emerald-300 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-emerald-500/10">ZIP</button>
              )}
            </div>
            {sections.length > 0 && (
              <button type="button" onClick={handleCopyShareLink}
                className="hidden lg:flex items-center gap-1.5 text-amber-400 border border-amber-500/20 hover:bg-amber-500/10 px-3 py-2 rounded-xl text-xs font-bold transition-all">
                🔗
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ══ 3-COLUMN LAYOUT ════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto flex min-h-[calc(100vh-56px)]">

        {/* ── LEFT SIDEBAR: TOC + SEO + Publish ─────────────────── */}
        <aside className="hidden lg:flex flex-col w-52 xl:w-56 shrink-0 border-r border-[#E2E8F0]/60 bg-white/80 backdrop-blur-sm print:hidden">
          <div className="sticky top-14 overflow-y-auto max-h-[calc(100vh-56px)] p-4 space-y-5">

            {/* TOC */}
            <div className={showBlogPreview ? 'hidden' : ''}>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.14em] mb-3 px-1">{p.toc}</p>
              <div className="space-y-0.5">
                {sections.map((s, i) => (
                  <a key={s.id} href={`#section-${i}`}
                    className="flex items-center gap-2.5 py-2 px-2.5 rounded-2xl text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50/80 transition-all group">
                    <div className="w-5 h-5 rounded-lg shrink-0 flex items-center justify-center text-[9px] font-black text-white group-hover:scale-110 transition-transform"
                      style={{ background: ACCENT_COLORS[i % ACCENT_COLORS.length] }}>
                      {i + 1}
                    </div>
                    <span className="truncate text-xs font-medium leading-tight">{s.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* SEO Score card */}
            {seoReport && (
              <button onClick={() => setShowSeo(true)}
                className={`w-full text-left rounded-2xl p-4 border transition-all hover:shadow-lg hover:-translate-y-0.5 ${scoreBg}`}>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{p.seoScore}</p>
                <div className="flex items-end gap-2">
                  <span className={`text-4xl font-black leading-none ${scoreColor}`}>{seoReport.score}</span>
                  <span className="text-gray-400 text-sm mb-0.5 font-medium">/ 100</span>
                </div>
                <div className="mt-2 h-1.5 bg-black/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${seoReport.score}%`, background: seoReport.score >= 80 ? '#10b981' : seoReport.score >= 60 ? '#f59e0b' : '#ef4444' }} />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">{p.seoSeeMore}</p>
              </button>
            )}

            {/* Publish button */}
            <div className="space-y-2">
              <button type="button"
                onClick={() => { setPlatform(primaryPlatform); setShowBlogPreview(true) }}
                className={`w-full ${primStyle.bg} ${primStyle.hover} text-white rounded-2xl py-3 px-4 text-sm font-black transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2`}>
                <span className="text-base">{primaryRow?.icon}</span>
                {t.primaryPublishLabel}
              </button>
              <button type="button" onClick={handleNaverCopy}
                className={`w-full border ${primStyle.border} ${primStyle.text} hover:bg-gray-50 rounded-2xl py-2 px-4 text-xs font-bold transition-all`}>
                {copyDone ? t.copyDoneCheck : copyFormatIsListing ? t.copyListingBundleShort : t.copyHtmlShort}
              </button>
            </div>

            {/* Compliance alert */}
            {complianceHighCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
                <p className="text-xs font-black text-red-700 mb-1">⚠ {complianceHighCount} 위험 항목</p>
                <button type="button" onClick={() => setCompetitorOpen(o => !o)}
                  className="text-[10px] text-red-600 font-bold underline">자세히 보기</button>
              </div>
            )}

          </div>
        </aside>

        {/* ── MAIN CONTENT ──────────────────────────────────────── */}
        <div className="flex-1 min-w-0 px-4 md:px-6 xl:px-8 py-6 md:py-8">

          {/* ── 제품 정보 헤더 카드 (2026 premium) ──────────────────── */}
          <div className="relative overflow-hidden rounded-3xl mb-6 border border-white/5 shadow-2xl shadow-black/20 print:hidden"
            style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #162032 100%)' }}>
            {/* Background glow */}
            <div className="absolute inset-0 opacity-30"
              style={{ background: 'radial-gradient(ellipse 80% 60% at 20% 50%, #3B82F620, transparent), radial-gradient(ellipse 60% 80% at 80% 30%, #8B5CF615, transparent)' }} />
            {/* Accent top line */}
            <div className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #06B6D4)' }} />

            <div className="relative px-6 py-5 md:px-8 md:py-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {/* Status chips */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.16em]">
                      {uiLang==='ko'?'AI 생성 완료':uiLang==='ja'?'AI生成完了':uiLang==='zh'?'AI生成完成':'AI Generated'}
                    </span>
                    <span className="text-white/20 text-[10px]">·</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-[10px] text-emerald-400 font-bold">LIVE</span>
                    </div>
                    {order.result_json?.template_mode && (
                      <span className="text-[10px] font-black bg-indigo-500/25 text-indigo-200 border border-indigo-400/40 px-3 py-1 rounded-full">
                        📋 {uiLang==='ko'?'양식 자동완성 · AI 문서':uiLang==='ja'?'書類自動完成':uiLang==='zh'?'表格自动填写':'Form Auto-Fill · AI Document'}
                      </span>
                    )}
                    {order.result_json?.multi_lang && (
                      <span className="text-[10px] font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        🌏 {uiLang==='ko'?'4개국어':'4-Lang'}
                      </span>
                    )}
                  </div>

                  {/* Product name — BIG */}
                  <h1 className="text-white font-black text-xl md:text-2xl lg:text-3xl leading-tight tracking-tight mb-3"
                    style={{ fontFamily: "'Pretendard', 'Inter', sans-serif", letterSpacing: '-0.03em' }}>
                    {order.product_name}
                  </h1>

                  {/* Meta pills */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {order.category && (
                      <span className="text-xs font-bold text-white/50 bg-white/8 px-3 py-1 rounded-full border border-white/8 capitalize">
                        {order.category}
                      </span>
                    )}
                    {seoReport && (
                      <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                        seoReport.score >= 80 ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                          : seoReport.score >= 60 ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25'
                          : 'bg-red-500/15 text-red-300 border-red-500/25'
                      }`}>
                        SEO {seoReport.score} / 100
                      </span>
                    )}
                    {sections.length > 0 && (
                      <span className="text-xs font-bold text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/8">
                        {sections.length} {uiLang==='ko'?'섹션':uiLang==='ja'?'セクション':uiLang==='zh'?'章节':'sections'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right action buttons */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button type="button" onClick={handleNaverCopy}
                    className={`${primStyle.bg} ${primStyle.hover} text-white px-4 py-2.5 rounded-2xl text-sm font-black transition-all flex items-center gap-2 shadow-lg`}>
                    <span>{primaryRow?.icon}</span>
                    {copyDone ? '✓ Done' : (uiLang==='ko'?'복사·발행':uiLang==='ja'?'コピー':'Publish')}
                  </button>
                  <button type="button" onClick={handleDownloadZip}
                    className="flex items-center gap-1.5 bg-white/6 hover:bg-white/12 border border-white/10 text-gray-400 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all">
                    ⬇️ ZIP
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Top bar */}
          <div className="flex items-center justify-between mb-6 print:hidden">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[11px] text-emerald-700 font-bold">{p.liveEdit}</span>
              </div>
              {seoReport && (
                <button onClick={() => setShowSeo(true)}
                  className={`lg:hidden flex items-center gap-1 border px-2.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm ${scoreBg} ${scoreColor}`}>
                  SEO {seoReport.score}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setMobileToolsOpen(true)}
                className="xl:hidden bg-[#0F172A] text-white px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md">
                🛠 {uiLang === 'ko' ? 'AI 도구' : uiLang === 'ja' ? 'AIツール' : uiLang === 'zh' ? 'AI工具' : 'AI Tools'}
              </button>
              <button type="button" onClick={handleNaverCopy}
                className={`lg:hidden ${primStyle.bg} ${primStyle.hover} text-white px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md`}>
                <span>{primaryRow?.icon}</span>
                {copyDone ? t.mobileCopyDone : copyFormatIsListing ? t.mobileListingCopy : t.mobileBlogCopy}
              </button>
            </div>
          </div>

          <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden" onChange={onProductImageChange} />

          {/* Product images */}
          {((order.image_urls ?? []).length > 0 || true) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 shadow-sm print:hidden">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{p.prodImages}</p>
              <div className="flex flex-wrap items-end gap-3">
                {(order.image_urls ?? []).map((url, i) => (
                  <div key={`${url}-${i}`} className="flex flex-col items-center gap-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={p.imgAlt(i)} crossOrigin="anonymous"
                      className="w-20 h-20 object-cover rounded-xl border border-gray-200 bg-gray-50 shadow-sm" />
                    <button type="button" disabled={imageBusy} onClick={() => pickImageSlot(i)}
                      className="text-[10px] font-bold text-gray-500 hover:text-black border border-gray-200 rounded-lg px-2 py-0.5 disabled:opacity-40 transition-colors">
                      {p.replace}
                    </button>
                  </div>
                ))}
                {(order.image_urls ?? []).length < 3 && (
                  <button type="button" disabled={imageBusy} onClick={() => pickImageSlot((order.image_urls ?? []).length)}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-2xl hover:border-blue-400 hover:text-blue-400 disabled:opacity-40 flex items-center justify-center transition-all"
                    title={p.addImgTitle}>
                    {p.addImg}
                  </button>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">{p.imageHint}</p>
            </div>
          )}

          {/* Multi-lang tabs */}
          {order.result_json?.multi_lang && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 shadow-sm print:hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌏</span>
                  <p className="text-xs font-black text-gray-700 uppercase tracking-wider">4-Language Simultaneous Output</p>
                </div>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full">동시 생성 완료</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['ko','en','ja','zh'] as const).map(lang => {
                  const META: Record<string,{flag:string;label:string;tone:string;market:string}> = {
                    ko: { flag:'🇰🇷', label:'한국어', tone:'감성·신뢰 스토리텔링', market:'스마트스토어·쿠팡' },
                    en: { flag:'🇺🇸', label:'English', tone:'Benefit-first · Premium', market:'Amazon · Shopify' },
                    ja: { flag:'🇯🇵', label:'日本語', tone:'丁寧語 · 品質重視', market:'楽天 · Amazon JP' },
                    zh: { flag:'🇨🇳', label:'中文', tone:'爆款公式 · 社会认同', market:'天猫 · 京东' },
                  }
                  const m = META[lang]
                  const hasSections = (order.result_json?.[lang]?.sections?.length ?? 0) > 0
                  return (
                    <button key={lang} type="button" disabled={!hasSections} onClick={() => setMultiLangTab(lang)}
                      className={`flex flex-col items-start px-3 py-2.5 rounded-xl text-left border transition-all ${
                        multiLangTab === lang
                          ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-lg'
                          : hasSections
                            ? 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:shadow-sm'
                            : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                      }`}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm">{m.flag}</span>
                        <span className="text-xs font-black">{m.label}</span>
                      </div>
                      <span className={`text-[10px] font-medium ${multiLangTab === lang ? 'text-white/70' : 'text-gray-400'}`}>{m.tone}</span>
                      <span className={`text-[10px] font-bold ${multiLangTab === lang ? 'text-emerald-300' : 'text-blue-500'}`}>{m.market}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Conversion Predictor — stable calculation, no Math.random */}
          {order.result_json?.multi_lang && seoReport && (() => {
            const score = seoReport.score
            const cat = order.category ?? ''
            // Stable base CVR by category × platform (no randomness)
            const CVR_BASE: Record<string, Record<string, number>> = {
              en: { beauty:5.3, food:3.9, electronics:3.8, fashion:4.9, health:5.2, living:3.6, pet:5.1, saas:3.2, sports:4.1, default:4.5 },
              ja: { beauty:4.7, food:5.0, electronics:3.5, fashion:4.3, health:4.8, living:3.7, pet:4.9, saas:3.0, sports:3.8, default:3.8 },
              zh: { beauty:6.9, food:6.3, electronics:4.8, fashion:6.1, health:6.5, living:4.9, pet:5.8, saas:3.8, sports:5.4, default:5.2 },
              ko: { beauty:4.1, food:4.5, electronics:2.9, fashion:3.8, health:4.2, living:3.1, pet:4.6, saas:2.8, sports:3.4, default:3.2 },
            }
            const seoBoost = ((score - 60) / 100) * 0.8
            const PLATFORMS = [
              { key:'amazon',  name:'Amazon JP',  flag:'🇯🇵', lang:'en', mult:1.18, color:'#FF9900', accentBg:'#FFF7ED' },
              { key:'tmall',   name:'Tmall CN',   flag:'🇨🇳', lang:'zh', mult:1.22, color:'#E53E3E', accentBg:'#FFF5F5' },
              { key:'rakuten', name:'Rakuten',    flag:'🇯🇵', lang:'ja', mult:1.14, color:'#BF0000', accentBg:'#FFF5F5' },
              { key:'shopify', name:'Shopify',    flag:'🌐',  lang:'en', mult:1.16, color:'#5C6BC0', accentBg:'#EEF2FF' },
              { key:'lazada',  name:'Lazada',     flag:'🇸🇬', lang:'en', mult:1.10, color:'#0F146D', accentBg:'#EFF6FF' },
              { key:'qoo10',   name:'Qoo10',      flag:'🇯🇵', lang:'ja', mult:1.12, color:'#FF6B35', accentBg:'#FFF7ED' },
            ]
            const predictions = PLATFORMS.map(pl => {
              const base = CVR_BASE[pl.lang]?.[cat] ?? CVR_BASE[pl.lang]?.default ?? 3.5
              const cvr = Math.max(1.0, Math.min(9.9, base * pl.mult + seoBoost))
              const uplift = Math.round((pl.mult - 1) * 100 + seoBoost * 5)
              return { ...pl, cvr: cvr.toFixed(1), uplift: Math.max(8, uplift) }
            })
            const LABEL = {
              ko: { title: 'Conversion Predictor', sub: '플랫폼별 예상 전환율', note: 'SEO 점수 + 카테고리 벤치마크 기반 예측' },
              en: { title: 'Conversion Predictor', sub: 'Estimated CVR by Platform', note: 'Based on SEO score & category benchmarks' },
              ja: { title: '転換率予測レポート', sub: 'プラットフォーム別予測CVR', note: 'SEOスコア・カテゴリデータ基準の予測値' },
              zh: { title: '转化率预测报告', sub: '各平台预计转化率', note: '基于SEO评分和品类基准数据' },
            }[uiLang]
            const maxCvr = Math.max(...predictions.map(p => parseFloat(p.cvr)))
            return (
              <div className="bg-gradient-to-br from-[#0F172A] via-[#1e1b4b] to-[#1a1654] rounded-2xl p-5 mb-5 text-white shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">📊</span>
                      <h3 className="text-sm font-black text-white">{LABEL.title}</h3>
                    </div>
                    <p className="text-xs text-indigo-300 font-medium">{LABEL.sub}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-center">
                      <div className="text-lg font-black text-white leading-none">{score}</div>
                      <div className="text-[10px] font-bold text-indigo-300">SEO</div>
                    </div>
                    <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-3 py-1.5 text-center">
                      <div className="text-lg font-black text-emerald-300 leading-none">{maxCvr}%</div>
                      <div className="text-[10px] font-bold text-emerald-400">Best CVR</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {predictions.map((pl) => {
                    const pct = Math.min(100, parseFloat(pl.cvr) / 9.9 * 100)
                    const isBest = pl.cvr === maxCvr.toString()
                    return (
                      <div key={pl.key}
                        className={`rounded-xl p-3 border transition-all ${isBest ? 'bg-white shadow-lg shadow-white/10 border-white/40' : 'bg-white/95 border-white/20'}`}
                        style={{ background: isBest ? 'white' : pl.accentBg }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{pl.flag}</span>
                            <span className="text-xs font-bold text-gray-700">{pl.name}</span>
                          </div>
                          {isBest && <span className="text-[9px] font-black bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">BEST</span>}
                        </div>
                        <div className="flex items-end gap-1 mb-1.5">
                          <span className="text-2xl font-black leading-none" style={{ color: pl.color }}>{pl.cvr}%</span>
                          <span className="text-[10px] text-gray-400 font-medium pb-0.5">CVR</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                          <div className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${pct}%`, background: pl.color }} />
                        </div>
                        <div className="text-[10px] font-black" style={{ color: pl.color }}>+{pl.uplift}% vs industry avg</div>
                      </div>
                    )
                  })}
                </div>
                <p className="text-[10px] text-indigo-300/70 font-medium mt-3 text-right">* {LABEL.note}</p>
              </div>
            )
          })()}

          {/* ── TEMPLATE MODE: Document-style section cards ──────── */}
          {order.result_json?.template_mode && (
            <div className="mb-5 print:hidden">
              <div className="relative overflow-hidden rounded-2xl border border-indigo-200/60 px-5 py-4 flex items-center gap-4"
                style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)' }}>
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-xl shrink-0">📋</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-indigo-700 uppercase tracking-wider mb-0.5">
                    {uiLang==='ko'?'양식 자동 완성 결과':uiLang==='ja'?'書類自動完成結果':uiLang==='zh'?'表格自动填写结果':'Form Auto-Fill Result'}
                  </p>
                  <p className="text-xs text-indigo-500 leading-relaxed">
                    {uiLang==='ko'?'AI가 업로드한 양식의 구조를 분석하고 각 항목을 전문가 수준으로 작성했습니다. 항목을 클릭하면 직접 수정할 수 있습니다.':
                     uiLang==='ja'?'AIがアップロードされた書類の構造を分析し、各項目をプロレベルで作成しました。':
                     uiLang==='zh'?'AI已分析上传表格结构，并以专家水准填写了每个字段。点击字段可直接编辑。':
                     'AI analyzed your uploaded form structure and filled every field at expert level. Click any field to edit.'}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col gap-1 items-end">
                  <span className="text-[10px] font-black bg-emerald-500 text-white px-2.5 py-1 rounded-full">
                    {sections.length} {uiLang==='ko'?'항목':'fields'}
                  </span>
                  <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-full border border-indigo-200">
                    {uiLang==='ko'?'클릭해서 수정':'Click to edit'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PDF target — section cards */}
          <div ref={previewRef} className={order.result_json?.template_mode ? 'space-y-3' : 'space-y-5'}>
            {sections.map((section, i) => {
              const accent = ACCENT_COLORS[i % ACCENT_COLORS.length]
              const accentNext = ACCENT_COLORS[(i + 1) % ACCENT_COLORS.length]
              const isEditing = editingId === section.id
              const isFirst = i === 0
              const isLast = i === sections.length - 1
              const isTemplate = order.result_json?.template_mode

              // ── TEMPLATE MODE: Document field card ───────────────
              if (isTemplate) {
                return (
                  <div key={section.id} id={`section-${i}`}
                    className={`group relative bg-white overflow-hidden transition-all duration-200 cursor-pointer
                      ${isEditing
                        ? 'rounded-2xl border-2 border-indigo-400 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-400/10'
                        : 'rounded-2xl border border-indigo-100 hover:border-indigo-200 hover:shadow-md'
                      }`}
                    onClick={() => setEditingId(isEditing ? null : section.id)}
                  >
                    {/* Field label bar — looks like a form field */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-50"
                      style={{ background: 'linear-gradient(135deg, #f5f3ff, #eef2ff)' }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0"
                          style={{ background: `linear-gradient(135deg, ${accent}, ${accentNext})` }}>
                          {i + 1}
                        </div>
                        <span className="text-xs font-black text-indigo-700 uppercase tracking-wider">{section.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <span className="text-[10px] text-indigo-600 font-black bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full animate-pulse">
                            {p.editing}
                          </span>
                        ) : (
                          <span className="text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                            ✎ {uiLang==='ko'?'수정':'edit'}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                          AI ✓
                        </span>
                      </div>
                    </div>

                    {/* Field title (= form item title) */}
                    <div className="px-5 pt-4 pb-2">
                      {isEditing ? (
                        <input value={section.title}
                          onChange={e => updateSection(section.id, 'title', e.target.value)}
                          onClick={e => e.stopPropagation()}
                          className="w-full text-base font-bold text-gray-800 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-3 transition-all"
                        />
                      ) : (
                        <p className="text-[11px] font-black text-gray-400 mb-2 uppercase tracking-wider">{section.title}</p>
                      )}

                      {/* AI-filled content area */}
                      {isEditing ? (
                        <textarea value={section.body}
                          onChange={e => updateSection(section.id, 'body', e.target.value)}
                          onClick={e => e.stopPropagation()}
                          rows={5}
                          className="w-full text-sm text-gray-700 bg-indigo-50/60 border border-indigo-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none leading-relaxed transition-all"
                        />
                      ) : (
                        <div className="bg-indigo-50/40 border border-indigo-100/60 rounded-xl px-4 py-3">
                          <p className="text-sm text-gray-700 leading-[1.75] whitespace-pre-line">{section.body}</p>
                        </div>
                      )}

                      {isEditing && (
                        <div className="flex items-center justify-between mt-2 pb-2">
                          <span className="text-[10px] text-gray-400">{section.body.length.toLocaleString()} {uiLang==='ko'?'자':'chars'}</span>
                          <button type="button" onClick={e => { e.stopPropagation(); setEditingId(null) }}
                            className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition-colors">
                            ✓ {uiLang==='ko'?'완료':'Done'}
                          </button>
                        </div>
                      )}
                    </div>
                    {!isEditing && <div className="h-3" />}
                  </div>
                )
              }

              // ── PRODUCT PAGE MODE: Premium section card ───────────
              return (
                <div key={section.id} id={`section-${i}`}
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                  className={`group relative bg-white overflow-hidden transition-all duration-300 cursor-pointer
                    ${isEditing
                      ? 'rounded-3xl border-2 border-blue-400 shadow-2xl shadow-blue-500/12 ring-4 ring-blue-400/10 scale-[1.005]'
                      : 'rounded-3xl border border-gray-100/80 shadow-sm hover:shadow-xl hover:shadow-black/6 hover:border-gray-200 hover:-translate-y-0.5'
                    }`}
                  onClick={() => setEditingId(isEditing ? null : section.id)}
                >
                  {/* Top gradient bar */}
                  <div className="h-[3px] w-full"
                    style={{ background: `linear-gradient(90deg, ${accent}, ${accentNext}60)` }} />

                  <div className="px-7 py-7 md:px-9 md:py-8">
                    {/* Section meta row */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-white shrink-0"
                          style={{ background: `linear-gradient(135deg, ${accent}, ${accentNext})` }}>
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.14em]" style={{ color: accent }}>
                          {section.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isFirst && (
                          <span className="text-[10px] font-black bg-gradient-to-r from-blue-50 to-violet-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full">
                            HOOK ✦
                          </span>
                        )}
                        {isLast && (
                          <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-full">
                            CTA ↗
                          </span>
                        )}
                        {isEditing
                          ? <span className="text-[10px] text-blue-600 font-black bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full animate-pulse">{p.editing}</span>
                          : <span className="text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-200 pr-1">✎ edit</span>
                        }
                      </div>
                    </div>

                    {/* Title */}
                    {isEditing ? (
                      <input value={section.title}
                        onChange={e => updateSection(section.id, 'title', e.target.value)}
                        onClick={e => e.stopPropagation()}
                        className="w-full text-2xl md:text-3xl font-black text-gray-900 mb-5 bg-blue-50/50 border border-blue-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 leading-tight tracking-tight transition-all"
                        style={{ fontFamily: "'Pretendard', 'Inter', sans-serif" }}
                      />
                    ) : (
                      <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-5 leading-tight tracking-tight"
                        style={{ fontFamily: "'Pretendard', 'Inter', sans-serif", letterSpacing: '-0.025em' }}>
                        {section.title}
                      </h2>
                    )}

                    <div className="w-12 h-[2px] rounded-full mb-5 opacity-60"
                      style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />

                    {isEditing ? (
                      <textarea value={section.body}
                        onChange={e => updateSection(section.id, 'body', e.target.value)}
                        onClick={e => e.stopPropagation()}
                        rows={7}
                        className="w-full text-[15px] text-gray-600 bg-blue-50/50 border border-blue-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none leading-[1.8] transition-all"
                      />
                    ) : (
                      <p className="text-[15px] text-gray-600 leading-[1.85] whitespace-pre-line">{section.body}</p>
                    )}

                    {isEditing && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-100">
                        <span className="text-[10px] text-gray-400">{section.body.length.toLocaleString()}{uiLang==='ko'?'자':'chars'}</span>
                        <button type="button" onClick={e => { e.stopPropagation(); setEditingId(null) }}
                          className="text-[10px] font-black text-blue-600 hover:text-blue-800 transition-colors">
                          ✓ {uiLang==='ko'?'완료':'Done'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-3xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{ background: `linear-gradient(180deg, ${accent}, ${accentNext})` }} />
                </div>
              )
            })}

            {/* Footer card */}
            <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-3xl px-7 py-6 text-center border border-white/5 shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[11px] text-gray-400 font-medium">Powered by PageAI</span>
              </div>
              <p className="text-gray-500 text-xs">{p.footerAi}</p>
            </div>
          </div>

          {/* Bottom action bar — 2026 premium */}
          <div className="mt-10 pb-28 md:pb-10 print:hidden">
            <div className="relative overflow-hidden rounded-3xl border border-white/5 shadow-2xl shadow-black/15 p-5 md:p-6"
              style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)' }}>
              {/* Subtle glow */}
              <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 100%, #3B82F630, transparent)' }} />
              <div className="relative flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Left: secondary actions */}
                <div className="flex gap-2 flex-wrap">
                  <button type="button" onClick={() => router.push('/order/new')}
                    className="border border-white/10 text-gray-400 hover:text-white hover:border-white/20 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all hover:bg-white/5">
                    {p.newOrder}
                  </button>
                  <button type="button" onClick={handleRegenerate} disabled={regenLoading}
                    className="border border-white/10 text-gray-400 hover:text-white hover:border-white/20 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:bg-white/5 disabled:opacity-30 flex items-center gap-1.5">
                    {regenLoading ? <span className="w-3 h-3 border-2 border-gray-600 border-t-white rounded-full animate-spin" /> : '↺'}
                    {p.regenBottom}
                  </button>
                  {sections.length > 0 && (
                    <button type="button" onClick={handleCopyShareLink}
                      className="border border-amber-500/20 bg-amber-500/8 text-amber-400 hover:bg-amber-500/14 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all">
                      🔗 {p.shareLinkBtn}
                    </button>
                  )}
                </div>

                {/* Right: primary actions */}
                <div className="flex gap-2.5 flex-wrap">
                  {sections.length > 0 && (
                    <button type="button" onClick={handleDownloadTxt}
                      className="border border-white/10 text-gray-400 hover:text-white px-4 py-2.5 rounded-2xl text-sm font-semibold hover:bg-white/5 transition-all">
                      {p.txtDownload}
                    </button>
                  )}
                  <button type="button" onClick={handleDownloadPDF} disabled={pdfLoading}
                    className="bg-white/10 hover:bg-white/16 border border-white/15 text-white px-5 py-2.5 rounded-2xl text-sm font-bold transition-all disabled:opacity-30 flex items-center gap-1.5">
                    {pdfLoading ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                    {pdfLoading ? p.pdfGen : p.pdfBottom}
                  </button>
                  <button type="button"
                    onClick={() => { setPlatform(primaryPlatform); setShowBlogPreview(true) }}
                    className={`${primStyle.bg} ${primStyle.hover} text-white px-6 py-2.5 rounded-2xl text-sm font-black transition-all hover:shadow-lg hover:shadow-black/20 flex items-center gap-2`}>
                    <span>{primaryRow?.icon}</span>
                    {copyDone ? t.mobileCopyDone : t.bottomCopyLabel}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-3">{p.bottomHint}</p>
          </div>

        </div>{/* end main */}

        {/* ── RIGHT PANEL: AI Tools ──────────────────────────── */}
        <aside className="hidden xl:flex flex-col w-80 shrink-0 border-l border-[#E2E8F0] bg-white print:hidden">
          <div className="sticky top-14 overflow-y-auto max-h-[calc(100vh-56px)]">

            {/* Tab bar */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              {([['publish', uiLang==='ko'?'발행':'Publish'], ['copy', 'A/B'], ['tools', uiLang==='ko'?'분석':'Analytics']] as [typeof rightTab, string][]).map(([tab, label]) => (
                <button key={tab} type="button" onClick={() => setRightTab(tab)}
                  className={`flex-1 py-3 text-xs font-black transition-all border-b-2 ${
                    rightTab === tab ? 'border-[#0F172A] text-[#0F172A] bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="p-4 space-y-3">
              {/* PUBLISH TAB */}
              {rightTab === 'publish' && (
                <>
                  {/* ── 📸 사진 자동 편집·배치 패널 ─────────────────── */}
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <button type="button" onClick={() => setPhotoOptOpen(o => !o)}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">📸</span>
                        <div className="text-left">
                          <p className="text-sm font-black text-gray-900">
                            {uiLang==='ko'?'사진 자동 편집·배치':'Photo Auto-Optimize'}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {uiLang==='ko'?'마켓별 1클릭 리사이즈 · ZIP 다운로드':'1-click resize per market · ZIP download'}
                          </p>
                        </div>
                        {(order?.image_urls?.length ?? 0) > 0 && (
                          <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                            {order?.image_urls?.length}장
                          </span>
                        )}
                      </div>
                      <span className="text-gray-300 text-xs">{photoOptOpen ? '▲' : '▼'}</span>
                    </button>
                    {photoOptOpen && (
                      <div className="border-t border-gray-100 p-4">
                        {(order?.image_urls?.length ?? 0) === 0 ? (
                          <div className="text-center py-6">
                            <p className="text-4xl mb-2">🖼️</p>
                            <p className="text-sm font-bold text-gray-500 mb-1">
                              {uiLang==='ko'?'업로드된 사진이 없습니다':'No photos uploaded'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {uiLang==='ko'?'제품 작성 시 사진을 업로드하면 여기서 마켓별로 자동 최적화됩니다':'Upload photos when creating a product to auto-optimize them per market'}
                            </p>
                          </div>
                        ) : (
                          <>
                            {/* 이미지 미리보기 */}
                            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                              {(order?.image_urls ?? []).map((url, i) => (
                                <div key={i} className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={url} alt={`photo ${i+1}`} className="w-full h-full object-cover" />
                                </div>
                              ))}
                              <div className="shrink-0 flex items-center px-2">
                                <span className="text-xs text-gray-400 font-bold">{order?.image_urls?.length}장</span>
                              </div>
                            </div>
                            {/* 마켓별 프리셋 버튼 */}
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                              {uiLang==='ko'?'마켓별 1클릭 최적화':'1-click per market'}
                            </p>
                            <div className="space-y-2">
                              {PHOTO_MARKET_PRESETS.map(preset => (
                                <button key={preset.id} type="button"
                                  onClick={() => handlePhotoResize(preset)}
                                  disabled={photoProcessing === preset.id}
                                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group disabled:opacity-50">
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-base">{preset.icon}</span>
                                    <div className="text-left">
                                      <p className="text-xs font-black text-gray-800 group-hover:text-indigo-700 transition-colors">{preset.label}</p>
                                      <p className="text-[10px] text-gray-400">{preset.desc}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {photoProcessing === preset.id ? (
                                      <span className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-500 rounded-full animate-spin" />
                                    ) : (
                                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 group-hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg transition-colors">
                                        {uiLang==='ko'?'1클릭 변환':'1-click'}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-3 text-center">
                              {uiLang==='ko'?'선택한 마켓에 맞는 크기로 자동 변환 후 ZIP 다운로드':'Auto-resize to platform spec → ZIP download'}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── 🚀 발행 패널 (완전 재설계: 모두 즉시 사용 가능) ─── */}
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <button type="button" onClick={() => setDeployOpen(o => !o)}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🚀</span>
                        <div className="text-left">
                          <p className="text-sm font-black text-gray-900">
                            {uiLang==='ko'?'발행 · 배포 패키지':'Publish & Deploy'}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {uiLang==='ko'?'플랫폼별 최적화 패키지 즉시 다운로드':'Instant download — optimized per platform'}
                          </p>
                        </div>
                        <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full shrink-0">
                          {uiLang==='ko'?'즉시':'Ready'}
                        </span>
                      </div>
                      <span className="text-gray-300 text-xs">{deployOpen ? '▲' : '▼'}</span>
                    </button>
                    {deployOpen && (
                      <div className="border-t border-gray-100 p-4 space-y-3">

                        {/* ① ZIP 전체 패키지 — Hero 버튼 */}
                        <button type="button" onClick={handleDownloadZip}
                          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl p-4 text-left transition-all hover:shadow-lg hover:shadow-indigo-500/20 group">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black mb-1">
                                📦 {uiLang==='ko'?'전체 패키지 ZIP 다운로드':'Full Package ZIP'}
                              </p>
                              <p className="text-[11px] text-indigo-200 leading-relaxed">
                                {uiLang==='ko'
                                  ? '4개국어 콘텐츠 + 최적화 HTML + 이미지 + 발행 가이드'
                                  : '4-lang content + HTML + images + guide'}
                              </p>
                            </div>
                            <span className="text-xl group-hover:translate-y-0.5 transition-transform">⬇️</span>
                          </div>
                        </button>

                        {/* ② 플랫폼별 즉시 사용 카드들 */}
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-1">
                          {uiLang==='ko'?'플랫폼별 즉시 발행':'Per-platform · All Ready'}
                        </p>

                        {/* 네이버 블로그 — HTML 복사 */}
                        <div className="rounded-2xl border border-green-100 bg-green-50/50 overflow-hidden">
                          <div className="px-3.5 py-3 flex items-start gap-2.5">
                            <span className="text-lg mt-0.5">🟢</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-gray-800">
                                {uiLang==='ko'?'네이버 블로그':'Naver Blog'}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {uiLang==='ko'?'HTML 복사 → 블로그 편집기에 바로 붙여넣기':'Copy HTML → paste into blog editor'}
                              </p>
                            </div>
                          </div>
                          <div className="px-3.5 pb-3 flex gap-2">
                            <button type="button"
                              onClick={() => { setPlatform('naver'); setShowBlogPreview(true) }}
                              className="flex-1 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-[11px] font-black transition-all">
                              {uiLang==='ko'?'미리보기 + HTML 복사':'Preview + Copy HTML'}
                            </button>
                            <button type="button" onClick={handleNaverCopy}
                              className="flex-1 py-2 rounded-xl border border-green-200 bg-white text-green-700 text-[11px] font-black hover:bg-green-50 transition-all">
                              {uiLang==='ko'?'텍스트 바로 복사':'Copy Text'}
                            </button>
                          </div>
                        </div>

                        {/* 스마트스토어 — ZIP */}
                        <div className="rounded-2xl border border-orange-100 bg-orange-50/40 overflow-hidden">
                          <div className="px-3.5 py-3 flex items-start gap-2.5">
                            <span className="text-lg mt-0.5">🏪</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-gray-800">{uiLang==='ko'?'스마트스토어':'Smartstore'}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {uiLang==='ko'?'HTML + 이미지 + 발행 가이드 ZIP':'HTML + images + guide ZIP'}
                              </p>
                            </div>
                            <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full shrink-0">
                              {uiLang==='ko'?'즉시':'Ready'}
                            </span>
                          </div>
                          <div className="px-3.5 pb-3 flex gap-2">
                            <button type="button" onClick={handleDownloadZip}
                              className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black transition-all">
                              ⬇️ {uiLang==='ko'?'ZIP 다운로드':'ZIP Download'}
                            </button>
                            <button type="button" onClick={handleNaverCopy}
                              className="flex-1 py-2 rounded-xl border border-orange-200 bg-white text-orange-700 text-[11px] font-black hover:bg-orange-50 transition-all">
                              {uiLang==='ko'?'HTML 복사':'Copy HTML'}
                            </button>
                          </div>
                        </div>

                        {/* Shopify — Liquid 템플릿 ZIP */}
                        <div className="rounded-2xl border border-teal-100 bg-teal-50/40 overflow-hidden">
                          <div className="px-3.5 py-3 flex items-start gap-2.5">
                            <span className="text-lg mt-0.5">🛍️</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-gray-800">Shopify</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {uiLang==='ko'?'HTML 템플릿 + 발행 가이드 ZIP':'HTML template + guide ZIP'}
                              </p>
                            </div>
                            <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full shrink-0">
                              {uiLang==='ko'?'즉시':'Ready'}
                            </span>
                          </div>
                          <div className="px-3.5 pb-3">
                            <button type="button" onClick={handleDownloadZip}
                              className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-black transition-all">
                              ⬇️ {uiLang==='ko'?'Shopify 패키지 다운로드':'Download Shopify Package'}
                            </button>
                          </div>
                        </div>

                        {/* Amazon JP A+ */}
                        <div className="rounded-2xl border border-yellow-100 bg-yellow-50/40 overflow-hidden">
                          <div className="px-3.5 py-3 flex items-start gap-2.5">
                            <span className="text-lg mt-0.5">🟠</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-gray-800">Amazon JP A+</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {uiLang==='ko'?'A+ Content HTML + 이미지 ZIP':'A+ Content HTML + image ZIP'}
                              </p>
                            </div>
                            <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full shrink-0">
                              {uiLang==='ko'?'즉시':'Ready'}
                            </span>
                          </div>
                          <div className="px-3.5 pb-3">
                            <button type="button" onClick={handleDownloadZip}
                              className="w-full py-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white text-[11px] font-black transition-all">
                              ⬇️ {uiLang==='ko'?'Amazon A+ 패키지':'Amazon A+ Package'}
                            </button>
                          </div>
                        </div>

                        {/* Tmall */}
                        <div className="rounded-2xl border border-red-100 bg-red-50/40 overflow-hidden">
                          <div className="px-3.5 py-3 flex items-start gap-2.5">
                            <span className="text-lg mt-0.5">🔴</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-gray-800">Tmall 详情页</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {uiLang==='ko'?'天猫 상세페이지 HTML + 발행 가이드':'Tmall detail page HTML + guide'}
                              </p>
                            </div>
                            <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full shrink-0">
                              {uiLang==='ko'?'즉시':'Ready'}
                            </span>
                          </div>
                          <div className="px-3.5 pb-3">
                            <button type="button" onClick={handleDownloadZip}
                              className="w-full py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[11px] font-black transition-all">
                              ⬇️ {uiLang==='ko'?'Tmall 패키지':'Tmall Package'}
                            </button>
                          </div>
                        </div>

                        {/* 안내 */}
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-[10px] text-gray-500 leading-relaxed">
                            💡 {uiLang==='ko'
                              ? 'ZIP 파일에는 각 플랫폼용 최적화 HTML, 이미지, 발행 가이드가 포함됩니다.'
                              : 'ZIP includes platform-optimized HTML, images & publishing guide.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <ComplianceScanPanel findings={complianceFindings} disclosurePack={complianceDisclosurePack}
                    open={complianceOpen} onToggle={() => setComplianceOpen(o => !o)} ui={t} industryBadge={complianceIndustryBadge} />
                  {channelKitContent && (
                    <ChannelPublishKitPanel platforms={PLATFORMS} platform={platform} setPlatform={setPlatform}
                      kit={channelKitContent} ui={t} open={channelKitOpen} onToggle={() => setChannelKitOpen(o => !o)}
                      onCopyHook={line => navigator.clipboard.writeText(line).then(() => toast.success(t.channelKitToastHook)).catch(() => toast.error(t.toastCopyFail))}
                      pasteBundle={listingPasteBundle}
                      onCopyPasteBundle={() => { if (!listingPasteBundle.trim()) return; navigator.clipboard.writeText(listingPasteBundle).then(() => toast.success(t.channelKitToastPasteBundle)).catch(() => toast.error(t.toastCopyFail)) }}
                    />
                  )}
                  {metaExportBlocks && (
                    <MetaOgExportPanel htmlBlock={metaExportBlocks.html} jsonBlock={metaExportBlocks.json} ui={t}
                      open={metaOgOpen} onToggle={() => setMetaOgOpen(o => !o)}
                      onCopyHtml={() => navigator.clipboard.writeText(metaExportBlocks.html).then(() => toast.success(t.metaOgToastHtml)).catch(() => toast.error(t.toastCopyFail))}
                      onCopyJson={() => navigator.clipboard.writeText(metaExportBlocks.json).then(() => toast.success(t.metaOgToastJson)).catch(() => toast.error(t.toastCopyFail))}
                    />
                  )}
                  <OrderWritingWidgets uiLang={uiLang} />
                </>
              )}

              {/* A/B COPY TAB */}
              {rightTab === 'copy' && abCopySet && (
                <ConversionAbPanel titles={abCopySet.titles} openers={abCopySet.openers} ctas={abCopySet.ctas}
                  recommendation={abCopySet.recommendation} runnerUp={abCopySet.runnerUp}
                  utmRecommendedQuery={abCopySet.utmRecommendedQuery} ui={t}
                  open={abCopyOpen} onToggle={() => setAbCopyOpen(o => !o)}
                  hasFirst={sections.length > 0} lastSectionId={lastSectionId}
                  onCopyLine={line => navigator.clipboard.writeText(line).then(() => toast.success(t.abCopyToast)).catch(() => toast.error(t.toastCopyFail))}
                  onApplyTitle={idx => { const s0=sections[0]; if(!s0||!abCopySet) return; updateSection(s0.id,'title',abCopySet.titles[idx]); toast.success(t.abCopyToastApplyTitle) }}
                  onApplyOpener={idx => { const s0=sections[0]; if(!s0||!abCopySet) return; updateSection(s0.id,'body',`${abCopySet.openers[idx]}\n\n${s0.body}`); toast.success(t.abCopyToastApplyOpener) }}
                  onApplyCta={idx => { if(!abCopySet||lastSectionId===null) return; const last=sections.find(s=>s.id===lastSectionId); if(!last) return; updateSection(last.id,'body',`${last.body}\n\n${abCopySet.ctas[idx]}`); toast.success(t.abCopyToastApplyCta) }}
                  onApplyCombo={applyAbCombo}
                  onCopyUtm={() => navigator.clipboard.writeText(abCopySet.utmRecommendedQuery).then(() => toast.success(t.abCopyToastUtm)).catch(() => toast.error(t.toastCopyFail))}
                  onCopyExperimentSheet={() => navigator.clipboard.writeText(abCopySet.experimentSheet).then(() => toast.success(t.abCopyToastExperimentSheet)).catch(() => toast.error(t.toastCopyFail))}
                />
              )}

              {/* ANALYTICS TAB */}
              {rightTab === 'tools' && (
                <>
                  {/* Competitor */}
                  {sections.length > 0 && (
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                      <button type="button" onClick={() => setCompetitorOpen(o => !o)}
                        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span>🔍</span>
                          <div className="text-left">
                            <p className="text-sm font-black text-gray-900">
                              {uiLang==='ko'?'경쟁사 분석':uiLang==='ja'?'競合分析':uiLang==='zh'?'竞品分析':'Competitor Analysis'}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {uiLang==='ko'?'URL → AI 즉시 비교':uiLang==='ja'?'URL→即時比較':uiLang==='zh'?'URL→即时对比':'URL → AI instant comparison'}
                            </p>
                          </div>
                        </div>
                        <span className="text-gray-300 text-xs">{competitorOpen ? '▲' : '▼'}</span>
                      </button>
                      {competitorOpen && (
                        <div className="border-t border-gray-100 p-4 space-y-3">
                          <div className="flex gap-2">
                            <input type="url" value={competitorUrl} onChange={e => setCompetitorUrl(e.target.value)}
                              placeholder={uiLang==='ko'?'경쟁사 상품 URL...':uiLang==='ja'?'競合URL...':uiLang==='zh'?'竞品URL...':'Competitor URL...'}
                              className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gray-200"
                              onKeyDown={e => { if (e.key==='Enter') handleCompetitorAnalysis() }} />
                            <button type="button" onClick={handleCompetitorAnalysis}
                              disabled={competitorLoading || !competitorUrl.trim()}
                              className="shrink-0 bg-[#0F172A] text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-700 transition-all disabled:opacity-40 flex items-center gap-1">
                              {competitorLoading ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                              {uiLang==='ko'?'분석':uiLang==='ja'?'分析':uiLang==='zh'?'分析':'Go'}
                            </button>
                          </div>
                          {competitorResult && (
                            <div className="space-y-2.5">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                                  <div className="text-2xl font-black text-emerald-700">{competitorResult.my_score}</div>
                                  <div className="text-[10px] font-bold text-emerald-600 mt-0.5">{uiLang==='ko'?'내 페이지':uiLang==='ja'?'自分':uiLang==='zh'?'我的页面':'My Page'}</div>
                                  {competitorResult.my_score > competitorResult.competitor_score && <div className="text-[9px] font-black text-emerald-500 mt-0.5">🏆</div>}
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                                  <div className="text-2xl font-black text-gray-700">{competitorResult.competitor_score}</div>
                                  <div className="text-[10px] font-bold text-gray-500 mt-0.5 truncate">{competitorResult.competitor_name||'vs'}</div>
                                </div>
                              </div>
                              <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5">
                                <p className="text-xs font-bold text-indigo-700">💡 {competitorResult.verdict}</p>
                              </div>
                              {competitorResult.my_strengths.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{uiLang==='ko'?'내 강점':uiLang==='ja'?'強み':uiLang==='zh'?'优势':'Strengths'}</p>
                                  {competitorResult.my_strengths.map((s,i) => <div key={i} className="flex gap-2 text-xs text-gray-700"><span className="text-emerald-500 font-black">✓</span><span>{s}</span></div>)}
                                </div>
                              )}
                              {competitorResult.my_weaknesses.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{uiLang==='ko'?'개선 필요':uiLang==='ja'?'改善点':uiLang==='zh'?'待改进':'Improvements'}</p>
                                  {competitorResult.my_weaknesses.map((w,i) => <div key={i} className="flex gap-2 text-xs text-gray-700"><span className="text-amber-500 font-black">△</span><span>{w}</span></div>)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {evidencePack && <EvidencePackPanel pack={evidencePack} ui={t} open={evidenceOpen} onToggle={() => setEvidenceOpen(o => !o)} />}
                  {assetKit && <AssetKitPanel kit={assetKit} ui={t} open={assetKitOpen} onToggle={() => setAssetKitOpen(o => !o)} />}
                  {intelPack && <MarketIntelPanel pack={intelPack} ui={t} open={intelOpen} onToggle={() => setIntelOpen(o => !o)} />}
                </>
              )}
            </div>
          </div>
        </aside>

      </div>{/* end 3-col layout */}

      {/* ══ MOBILE TOOLS DRAWER ══════════════════════════════════ */}
      {mobileToolsOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileToolsOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="font-black text-sm text-gray-900">
                {uiLang==='ko'?'AI 도구':uiLang==='ja'?'AIツール':uiLang==='zh'?'AI工具':'AI Tools'}
              </p>
              <button onClick={() => setMobileToolsOpen(false)} className="text-gray-400 hover:text-black text-xl">×</button>
            </div>
            <div className="flex border-b border-gray-100">
              {([['publish', uiLang==='ko'?'발행':'Publish'], ['copy','A/B'], ['tools', uiLang==='ko'?'분석':'Analytics']] as [typeof rightTab, string][]).map(([tab,label]) => (
                <button key={tab} type="button" onClick={() => setRightTab(tab)}
                  className={`flex-1 py-3 text-xs font-black transition-all border-b-2 ${rightTab===tab?'border-[#0F172A] text-[#0F172A]':'border-transparent text-gray-400'}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {rightTab === 'publish' && (
                <>
                  {/* 사진 최적화 (모바일) */}
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                    <button type="button" onClick={() => setPhotoOptOpen(o => !o)}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span>📸</span>
                        <p className="text-sm font-black text-gray-900">
                          {uiLang==='ko'?'사진 자동 편집·배치':'Photo Auto-Optimize'}
                        </p>
                        {(order?.image_urls?.length ?? 0) > 0 && (
                          <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">{order?.image_urls?.length}장</span>
                        )}
                      </div>
                      <span className="text-gray-300 text-xs">{photoOptOpen ? '▲' : '▼'}</span>
                    </button>
                    {photoOptOpen && (order?.image_urls?.length ?? 0) > 0 && (
                      <div className="border-t border-gray-100 p-3 space-y-2">
                        {PHOTO_MARKET_PRESETS.map(preset => (
                          <button key={preset.id} type="button" onClick={() => handlePhotoResize(preset)}
                            disabled={photoProcessing === preset.id}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all disabled:opacity-50">
                            <div className="flex items-center gap-2">
                              <span>{preset.icon}</span>
                              <div className="text-left">
                                <p className="text-xs font-black text-gray-800">{preset.label}</p>
                                <p className="text-[10px] text-gray-400">{preset.desc}</p>
                              </div>
                            </div>
                            {photoProcessing === preset.id
                              ? <span className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-500 rounded-full animate-spin" />
                              : <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-lg">{uiLang==='ko'?'변환':'Go'}</span>
                            }
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* 자동 배포 (모바일) */}
                  <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-4">
                    <p className="text-xs font-black text-indigo-700 mb-1">🚀 {uiLang==='ko'?'패키지 다운로드':'Package Download'}</p>
                    <p className="text-[10px] text-indigo-500 mb-3">{uiLang==='ko'?'4개국어 콘텐츠 + HTML + 발행 가이드':'4-lang content + HTML + guide'}</p>
                    <button type="button" onClick={handleDownloadZip}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-all">
                      ⬇️ ZIP {uiLang==='ko'?'전체 다운로드':'Download'}
                    </button>
                  </div>
                  <ComplianceScanPanel findings={complianceFindings} disclosurePack={complianceDisclosurePack} open={complianceOpen} onToggle={() => setComplianceOpen(o=>!o)} ui={t} industryBadge={complianceIndustryBadge} />
                  {channelKitContent && <ChannelPublishKitPanel platforms={PLATFORMS} platform={platform} setPlatform={setPlatform} kit={channelKitContent} ui={t} open={channelKitOpen} onToggle={() => setChannelKitOpen(o=>!o)} onCopyHook={line => navigator.clipboard.writeText(line).then(() => toast.success(t.channelKitToastHook)).catch(() => toast.error(t.toastCopyFail))} pasteBundle={listingPasteBundle} onCopyPasteBundle={() => { if(!listingPasteBundle.trim()) return; navigator.clipboard.writeText(listingPasteBundle).then(() => toast.success(t.channelKitToastPasteBundle)).catch(() => toast.error(t.toastCopyFail)) }} />}
                  {metaExportBlocks && <MetaOgExportPanel htmlBlock={metaExportBlocks.html} jsonBlock={metaExportBlocks.json} ui={t} open={metaOgOpen} onToggle={() => setMetaOgOpen(o=>!o)} onCopyHtml={() => navigator.clipboard.writeText(metaExportBlocks.html).then(() => toast.success(t.metaOgToastHtml)).catch(() => toast.error(t.toastCopyFail))} onCopyJson={() => navigator.clipboard.writeText(metaExportBlocks.json).then(() => toast.success(t.metaOgToastJson)).catch(() => toast.error(t.toastCopyFail))} />}
                  <OrderWritingWidgets uiLang={uiLang} />
                </>
              )}
              {rightTab === 'copy' && abCopySet && (
                <ConversionAbPanel titles={abCopySet.titles} openers={abCopySet.openers} ctas={abCopySet.ctas} recommendation={abCopySet.recommendation} runnerUp={abCopySet.runnerUp} utmRecommendedQuery={abCopySet.utmRecommendedQuery} ui={t} open={abCopyOpen} onToggle={() => setAbCopyOpen(o=>!o)} hasFirst={sections.length>0} lastSectionId={lastSectionId}
                  onCopyLine={line => navigator.clipboard.writeText(line).then(() => toast.success(t.abCopyToast)).catch(() => toast.error(t.toastCopyFail))}
                  onApplyTitle={idx => { const s0=sections[0]; if(!s0||!abCopySet) return; updateSection(s0.id,'title',abCopySet.titles[idx]); toast.success(t.abCopyToastApplyTitle) }}
                  onApplyOpener={idx => { const s0=sections[0]; if(!s0||!abCopySet) return; updateSection(s0.id,'body',`${abCopySet.openers[idx]}\n\n${s0.body}`); toast.success(t.abCopyToastApplyOpener) }}
                  onApplyCta={idx => { if(!abCopySet||lastSectionId===null) return; const last=sections.find(s=>s.id===lastSectionId); if(!last) return; updateSection(last.id,'body',`${last.body}\n\n${abCopySet.ctas[idx]}`); toast.success(t.abCopyToastApplyCta) }}
                  onApplyCombo={applyAbCombo}
                  onCopyUtm={() => navigator.clipboard.writeText(abCopySet.utmRecommendedQuery).then(() => toast.success(t.abCopyToastUtm)).catch(() => toast.error(t.toastCopyFail))}
                  onCopyExperimentSheet={() => navigator.clipboard.writeText(abCopySet.experimentSheet).then(() => toast.success(t.abCopyToastExperimentSheet)).catch(() => toast.error(t.toastCopyFail))}
                />
              )}
              {rightTab === 'tools' && (
                <>
                  {evidencePack && <EvidencePackPanel pack={evidencePack} ui={t} open={evidenceOpen} onToggle={() => setEvidenceOpen(o=>!o)} />}
                  {assetKit && <AssetKitPanel kit={assetKit} ui={t} open={assetKitOpen} onToggle={() => setAssetKitOpen(o=>!o)} />}
                  {intelPack && <MarketIntelPanel pack={intelPack} ui={t} open={intelOpen} onToggle={() => setIntelOpen(o=>!o)} />}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 xl:hidden bg-white border-t border-gray-200 px-4 py-3 flex gap-2 shadow-2xl print:hidden">
        <button type="button" onClick={() => setMobileToolsOpen(true)}
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5">
          🛠 {uiLang==='ko'?'도구':uiLang==='ja'?'ツール':uiLang==='zh'?'工具':'Tools'}
        </button>
        <button type="button" onClick={() => { setPlatform(primaryPlatform); setShowBlogPreview(true) }}
          className={`flex-1 ${primStyle.bg} ${primStyle.hover} text-white py-3 rounded-xl text-sm font-black flex items-center justify-center gap-1.5`}>
          <span>{primaryRow?.icon}</span>
          {t.primaryPublishLabel}
        </button>
        <button type="button" onClick={handleDownloadPDF} disabled={pdfLoading}
          className="flex-1 bg-[#0F172A] text-white py-3 rounded-xl text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-1.5">
          {pdfLoading ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
          PDF
        </button>
      </div>

      {/* ══ SEO MODAL ════════════════════════════════════════════ */}
      {showSeo && seoReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowSeo(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Score header */}
            <div className="bg-[#0F172A] px-8 py-7 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-2">{p.seoModalTitle}</p>
                  <div className="flex items-end gap-3">
                    <span className={`text-7xl font-black leading-none ${
                      seoReport.score >= 80 ? 'text-emerald-400' : seoReport.score >= 60 ? 'text-amber-400' : 'text-red-400'
                    }`}>{seoReport.score}</span>
                    <span className="text-gray-600 text-lg mb-1 font-medium">{p.scoreOf}</span>
                  </div>
                  <p className={`text-sm font-bold mt-2 ${seoReport.score >= 80 ? 'text-emerald-400' : seoReport.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                    {seoLevelMessage(uiLang, seoReport.score)}
                  </p>
                </div>
                <button onClick={() => setShowSeo(false)} className="text-gray-600 hover:text-white text-2xl leading-none transition-colors mt-1">×</button>
              </div>
              <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${seoReport.score}%`, background: seoReport.score>=80 ? '#10b981' : seoReport.score>=60 ? '#f59e0b' : '#ef4444' }} />
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Checklist */}
              <div className="space-y-2">
                {seoReport.items.map((item, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3.5 rounded-2xl ${item.ok ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${item.ok ? 'bg-emerald-500 text-white' : 'bg-red-400 text-white'}`}>
                      {item.ok ? '✓' : '!'}
                    </span>
                    <div>
                      <p className={`text-sm font-bold ${item.ok ? 'text-emerald-800' : 'text-red-700'}`}>{item.label}</p>
                      {!item.ok && <p className="text-xs text-red-500 mt-0.5">{item.tip}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">{p.recoTags}</p>
                <div className="flex flex-wrap gap-2">
                  {seoReport.tags.map((tag, i) => (
                    <span key={i} className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors cursor-default">#{tag}</span>
                  ))}
                </div>
              </div>

              {/* Meta */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{p.blogRec}</p>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 mb-1">{p.metaTitleLbl}</p>
                  <p className="text-sm text-gray-800 font-semibold">{seoReport.metaTitle}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 mb-1">{p.metaDescLbl}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{seoReport.metaDesc}</p>
                </div>
              </div>

              <button type="button" onClick={() => { setShowSeo(false); setPlatform(primaryPlatform); setShowBlogPreview(true) }}
                className={`w-full ${primStyle.bg} ${primStyle.hover} text-white py-4 rounded-2xl font-black text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2`}>
                <span className="text-base">{primaryRow?.icon}</span>
                {t.openBlogPreview}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI 수정 채팅 패널 ──────────────────────────────── */}
      {/* 오버레이 */}
      {showChat && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setShowChat(false)} />
      )}

      {/* 패널 */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* 패널 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
          <div>
            <p className="font-black text-sm text-black flex items-center gap-1.5">
              <span className="text-indigo-500">✦</span> {p.chatAssistant}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{order?.product_name}</p>
          </div>
          <button onClick={() => setShowChat(false)} className="text-gray-300 hover:text-black text-xl leading-none">×</button>
        </div>

        {/* 빠른 명령어 */}
        {chatMessages.length === 0 && (
          <div className="px-4 py-4 border-b border-gray-50">
            <p className="text-xs font-bold text-gray-400 mb-2">{p.quickReq}</p>
            <div className="flex flex-wrap gap-1.5">
              {p.quickChips.map(q => (
                <button
                  key={q}
                  onClick={() => { setChatInput(q) }}
                  className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {chatMessages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">✦</div>
              <p className="text-sm font-bold text-gray-700 mb-1">{p.chatEmptyTitle}</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                {p.chatEmptyL1}<br />
                {p.chatEmptyL2}<br />
                {p.chatEmptyL3}
              </p>
              <p className="text-[10px] text-amber-700/90 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mt-4 text-left leading-relaxed">
                {p.chatEmptyNote}
              </p>
            </div>
          )}

          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-black text-white rounded-br-sm'
                    : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>

                {/* 수정된 섹션 적용 버튼 */}
                {msg.role === 'ai' && msg.sections && msg.sections.length > 0 && (
                  <button
                    onClick={() => applyModifiedSections(msg.sections!)}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2 rounded-xl transition-all"
                  >
                    {p.applySections(msg.sections.length)}
                  </button>
                )}
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* 입력창 */}
        <div className="px-4 py-4 border-t border-gray-100 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
              placeholder={p.chatPh}
              disabled={chatLoading}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:opacity-50"
            />
            <button
              onClick={handleChatSend}
              disabled={chatLoading || !chatInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all shrink-0"
            >
              {chatLoading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <span className="text-lg">↑</span>
              }
            </button>
          </div>
          <p className="text-xs text-gray-300 mt-2 text-center">{p.chatEnterHint}</p>
        </div>
      </div>

      {/* 블로그 미리보기 모달 */}
      {showBlogPreview && order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowBlogPreview(false)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">{t.blogModalTitle}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.blogModalSub}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNaverCopy}
                  className="flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-black transition-all"
                >
                  {copyDone ? t.copyBtnDone : t.copyBtn}
                </button>
                <button onClick={() => setShowBlogPreview(false)} className="text-gray-300 hover:text-black text-2xl leading-none">×</button>
              </div>
            </div>

            {/* 플랫폼 탭 */}
            <div className="flex gap-1.5 px-6 py-3 border-b border-gray-100 shrink-0 overflow-x-auto">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    platform === p.id
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <span>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>

            {/* 미리보기 영역 */}
            <div className="flex-1 overflow-auto p-4">
              {(platform === 'naver' || platform === 'tistory' || platform === 'wordpress' || platform === 'medium' || platform === 'shopify' || platform === 'linkedin') ? (
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="w-3 h-3 rounded-full bg-yellow-400" />
                      <span className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 bg-white rounded-lg px-3 py-1 text-xs text-gray-400 ml-2 truncate">
                      {previewFakeHost(platform)}
                    </div>
                  </div>
                  <iframe
                    key={platform}
                    srcDoc={getFormatContent()}
                    className="w-full"
                    style={{ height: '520px', border: 'none' }}
                    title={t.iframeTitle}
                  />
                </div>
              ) : (
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  {platform === 'instagram' && (
                    <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-0.5 rounded-2xl">
                      <div className="bg-white rounded-[14px] p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                          <span className="font-bold text-sm">your_store</span>
                        </div>
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-sans">{getFormatContent()}</pre>
                      </div>
                    </div>
                  )}
                  {platform === 'brunch' && (
                    <div className="bg-white p-8">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-serif">{getFormatContent()}</pre>
                    </div>
                  )}
                  {(platform === 'smartstore' || platform === 'coupang') && (
                    <div className="bg-white p-6 max-h-[520px] overflow-auto">
                      <pre className="whitespace-pre-wrap text-xs text-gray-800 leading-relaxed font-sans">{getFormatContent()}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 붙여넣기 안내 */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-3xl shrink-0">
              {platform === 'naver' && (
                <div>
                  <p className="text-xs font-black text-gray-700 mb-3">{t.naver.title}</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {t.naver.steps.map(s => (
                      <div key={s.step} className="text-center">
                        <div className="w-7 h-7 bg-[#03C75A] text-white rounded-lg flex items-center justify-center text-xs font-black mx-auto mb-1">{s.step}</div>
                        <p className="text-[10px] font-bold text-gray-700">{s.label}</p>
                        <p className="text-[9px] text-gray-400">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => { handleNaverCopy(); window.open(editorOpenUrl('naver'), '_blank') }}
                    className="w-full bg-[#03C75A] hover:bg-[#02b050] text-white py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2"
                  >
                    <span className="font-black text-base">N</span>
                    {copyDone ? t.naver.ctaDone : t.naver.cta}
                  </button>
                </div>
              )}
              {platform === 'tistory' && (
                <div>
                  <p className="text-xs font-black text-gray-700 mb-3">{t.tistory.title}</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {t.tistory.steps.map(s => (
                      <div key={s.step} className="text-center">
                        <div className="w-7 h-7 bg-orange-500 text-white rounded-lg flex items-center justify-center text-xs font-black mx-auto mb-1">{s.step}</div>
                        <p className="text-[10px] font-bold text-gray-700">{s.label}</p>
                        <p className="text-[9px] text-gray-400">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => { handleNaverCopy(); window.open(editorOpenUrl('tistory'), '_blank') }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2"
                  >
                    {copyDone ? t.tistory.ctaDone : t.tistory.cta}
                  </button>
                </div>
              )}
              {platform === 'wordpress' && (
                <div>
                  <p className="text-xs font-black text-gray-700 mb-3">{t.wordpress.title}</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {t.wordpress.steps.map(s => (
                      <div key={s.step} className="text-center">
                        <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black mx-auto mb-1">{s.step}</div>
                        <p className="text-[10px] font-bold text-gray-700">{s.label}</p>
                        <p className="text-[9px] text-gray-400">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => { handleNaverCopy(); window.open(editorOpenUrl('wordpress'), '_blank') }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2"
                  >
                    {copyDone ? t.wordpress.ctaDone : t.wordpress.cta}
                  </button>
                </div>
              )}
              {platform === 'instagram' && (
                <div>
                  <p className="text-xs font-black text-gray-700 mb-3">{t.instagram.title}</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {t.instagram.steps.map(s => (
                      <div key={s.step} className="text-center">
                        <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg flex items-center justify-center text-xs font-black mx-auto mb-1">{s.step}</div>
                        <p className="text-[10px] font-bold text-gray-700">{s.label}</p>
                        <p className="text-[9px] text-gray-400">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => { handleNaverCopy(); window.open(editorOpenUrl('instagram'), '_blank') }}
                    className="w-full text-white py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}
                  >
                    {copyDone ? t.instagram.ctaDone : t.instagram.cta}
                  </button>
                </div>
              )}
              {(platform === 'medium' || platform === 'shopify' || platform === 'linkedin') && (
                <div>
                  <p className="text-xs font-black text-gray-700 mb-3">{t.genericHtml.title}</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {t.genericHtml.steps.map(s => (
                      <div key={s.step} className="text-center">
                        <div className="w-7 h-7 bg-black text-white rounded-lg flex items-center justify-center text-xs font-black mx-auto mb-1">{s.step}</div>
                        <p className="text-[10px] font-bold text-gray-700">{s.label}</p>
                        <p className="text-[9px] text-gray-400">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => { handleNaverCopy(); window.open(editorOpenUrl(platform), '_blank') }}
                    className="w-full bg-black hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2"
                  >
                    {copyDone ? t.genericHtml.ctaDone : t.genericHtml.cta}
                  </button>
                </div>
              )}
              {platform === 'brunch' && (
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-gray-700">{t.brunch.line}</span> {t.brunch.desc}
                  <button
                    type="button"
                    onClick={() => { handleNaverCopy(); window.open(editorOpenUrl('brunch'), '_blank') }}
                    className="ml-2 underline text-black font-bold"
                  >
                    {t.brunch.open}
                  </button>
                </p>
              )}
              {platform === 'smartstore' && (
                <div>
                  <p className="text-xs font-black text-gray-700 mb-3">{t.smartstore.title}</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {t.smartstore.steps.map(s => (
                      <div key={s.step} className="text-center">
                        <div className="w-7 h-7 bg-[#03C75A] text-white rounded-lg flex items-center justify-center text-xs font-black mx-auto mb-1">{s.step}</div>
                        <p className="text-[10px] font-bold text-gray-700">{s.label}</p>
                        <p className="text-[9px] text-gray-400">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => { handleNaverCopy(); window.open(editorOpenUrl('smartstore'), '_blank') }}
                    className="w-full bg-[#03C75A] hover:bg-[#02b050] text-white py-2.5 rounded-xl text-sm font-black transition-all"
                  >
                    {copyDone ? t.smartstore.ctaDone : t.smartstore.cta}
                  </button>
                </div>
              )}
              {platform === 'coupang' && (
                <div>
                  <p className="text-xs font-black text-gray-700 mb-3">{t.coupang.title}</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {t.coupang.steps.map(s => (
                      <div key={s.step} className="text-center">
                        <div className="w-7 h-7 bg-[#E65F2E] text-white rounded-lg flex items-center justify-center text-xs font-black mx-auto mb-1">{s.step}</div>
                        <p className="text-[10px] font-bold text-gray-700">{s.label}</p>
                        <p className="text-[9px] text-gray-400">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => { handleNaverCopy(); window.open(editorOpenUrl('coupang'), '_blank') }}
                    className="w-full bg-[#E65F2E] hover:bg-[#cf5528] text-white py-2.5 rounded-xl text-sm font-black transition-all"
                  >
                    {copyDone ? t.coupang.ctaDone : t.coupang.cta}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
