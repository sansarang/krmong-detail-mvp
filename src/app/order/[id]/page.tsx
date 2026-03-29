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
import { type ChannelPublishKitContent, getChannelPublishKit } from '@/lib/channelPublishKit'
import { buildConversionAbCopy, type AbRecommendation, type AbRunnerUp } from '@/lib/conversionAbCopy'
import { buildMetaOgPackage, metaOgPackageToHtmlMeta, metaOgPackageToJson } from '@/lib/metaOgPackage'
import { buildListingPasteBundle, listingBundleUsesPlainText } from '@/lib/listingPasteBundles'
import { buildListingEvidencePack } from '@/lib/listingEvidenceLayer'
import { buildListingAssetKit } from '@/lib/listingAssetKit'
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
  result_json: { sections: Section[]; output_lang?: string } | null
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
  open,
  onToggle,
  ui,
  industryBadge,
  className = '',
}: {
  findings: ComplianceFinding[]
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
        <div className="px-3 pb-3 space-y-2 border-t border-amber-200/60 pt-2">
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
  copyBlock,
  ui,
  open,
  onToggle,
  onCopy,
  className = '',
}: {
  copyBlock: string
  ui: OrderResultUi
  open: boolean
  onToggle: () => void
  onCopy: () => void
  className?: string
}) {
  return (
    <div className={`border border-cyan-200 bg-cyan-50/90 rounded-2xl overflow-hidden ${className}`}>
      <button type="button" onClick={onToggle} className="w-full text-left p-3 hover:bg-cyan-100/50 transition-colors">
        <p className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">{ui.evidenceSub}</p>
        <p className="text-sm font-black text-cyan-950 mt-0.5">{ui.evidenceTitle}</p>
        <span className="text-[10px] font-bold text-cyan-900 mt-1 inline-block">{open ? ui.metaOgHide : ui.metaOgShow}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-cyan-200/80 pt-2 space-y-2">
          <button
            type="button"
            onClick={onCopy}
            className="w-full text-left text-xs font-bold bg-white border border-cyan-200 rounded-xl px-3 py-2 hover:bg-cyan-50"
          >
            {ui.evidenceCopyAll}
          </button>
          <pre className="text-[9px] text-gray-700 bg-white/90 border border-cyan-100 rounded-lg p-2 max-h-36 overflow-auto whitespace-pre-wrap break-words">
            {copyBlock.slice(0, 900)}
            {copyBlock.length > 900 ? '…' : ''}
          </pre>
        </div>
      )}
    </div>
  )
}

function AssetKitPanel({
  copyBlock,
  ui,
  open,
  onToggle,
  onCopy,
  className = '',
}: {
  copyBlock: string
  ui: OrderResultUi
  open: boolean
  onToggle: () => void
  onCopy: () => void
  className?: string
}) {
  return (
    <div className={`border border-fuchsia-200 bg-fuchsia-50/90 rounded-2xl overflow-hidden ${className}`}>
      <button type="button" onClick={onToggle} className="w-full text-left p-3 hover:bg-fuchsia-100/50 transition-colors">
        <p className="text-[10px] font-black text-fuchsia-700 uppercase tracking-widest">{ui.assetSub}</p>
        <p className="text-sm font-black text-fuchsia-950 mt-0.5">{ui.assetTitle}</p>
        <span className="text-[10px] font-bold text-fuchsia-900 mt-1 inline-block">{open ? ui.metaOgHide : ui.metaOgShow}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-fuchsia-200/80 pt-2 space-y-2">
          <button
            type="button"
            onClick={onCopy}
            className="w-full text-left text-xs font-bold bg-white border border-fuchsia-200 rounded-xl px-3 py-2 hover:bg-fuchsia-50"
          >
            {ui.assetCopyAll}
          </button>
          <pre className="text-[9px] text-gray-700 bg-white/90 border border-fuchsia-100 rounded-lg p-2 max-h-36 overflow-auto whitespace-pre-wrap break-words">
            {copyBlock.slice(0, 900)}
            {copyBlock.length > 900 ? '…' : ''}
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
  onCopy,
  className = '',
}: {
  pack: ReturnType<typeof buildMarketIntelHeuristics>
  ui: OrderResultUi
  open: boolean
  onToggle: () => void
  onCopy: () => void
  className?: string
}) {
  return (
    <div className={`border border-amber-200/90 bg-amber-50/80 rounded-2xl overflow-hidden ${className}`}>
      <button type="button" onClick={onToggle} className="w-full text-left p-3 hover:bg-amber-100/40 transition-colors">
        <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">{ui.intelSub}</p>
        <p className="text-sm font-black text-amber-950 mt-0.5">{ui.intelTitle}</p>
        <span className="text-[10px] font-bold text-amber-900 mt-1 inline-block">{open ? ui.metaOgHide : ui.metaOgShow}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-amber-200/70 pt-2 space-y-2 text-[11px] text-amber-950/90">
          <div>
            <p className="text-[9px] font-black text-amber-800 uppercase mb-0.5">{ui.intelCompetitor}</p>
            <ul className="list-disc pl-4 space-y-0.5">
              {pack.competitorPatterns.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[9px] font-black text-amber-800 uppercase mb-0.5">{ui.intelKeywords}</p>
            <p className="leading-snug break-words">{pack.categoryKeywords.join(' · ')}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-amber-800 uppercase mb-0.5">{ui.intelReviewThemes}</p>
            <ul className="list-disc pl-4 space-y-0.5">
              {pack.reviewThemes.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <p className="text-[10px] text-amber-900/75 leading-relaxed">{pack.gapNote}</p>
          <button
            type="button"
            onClick={onCopy}
            className="w-full text-left text-xs font-bold bg-white border border-amber-200 rounded-xl px-3 py-2 hover:bg-amber-50"
          >
            {ui.intelCopyChecklist}
          </button>
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
          <pre className="text-[9px] text-gray-600 bg-white/80 border border-emerald-100 rounded-lg p-2 max-h-28 overflow-auto whitespace-pre-wrap break-all">
            {htmlBlock.slice(0, 400)}
            {htmlBlock.length > 400 ? '…' : ''}
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
      if (data.result_json?.sections) {
        setSections(data.result_json.sections)
      }
      setLoading(false)
    }
    fetchOrder()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase stable; router stable
  }, [orderId, uiLang])

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-100 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm font-medium">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (!order?.result_json || sections.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{p.noResult}</p>
          <button type="button" onClick={() => router.push('/dashboard')} className="bg-black text-white px-6 py-3 rounded-xl text-sm font-semibold">{p.dashboard}</button>
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
    <main className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-20 print:hidden">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-black rounded-md" />
              <span className="font-bold text-sm tracking-tight">{p.brand}</span>
            </Link>
            <div className="w-px h-4 bg-gray-200" />
            <span className="text-sm font-semibold text-gray-900">{order.product_name}</span>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">{p.badgeDone}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="flex items-center gap-1 mr-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter hidden sm:inline">{p.headerUiLangTitle}</span>
              {(['ko', 'en', 'ja', 'zh'] as const).map(code => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setUiLang(code)
                    persistUiLang(code)
                  }}
                  className={`text-[10px] font-black px-2 py-1 rounded-lg border transition-all ${
                    uiLang === code ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-400 hidden lg:block">{p.headerHint}</span>
            <div className="w-px h-4 bg-gray-200 hidden lg:block" />
            <button
              onClick={handleRegenerate}
              disabled={regenLoading}
              className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              {regenLoading ? <><span className="w-3 h-3 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />{p.regenLoading}</> : p.regen}
            </button>
            <button
              type="button"
              onClick={() => setShowChat(true)}
              className="border border-indigo-200 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all flex items-center gap-1.5"
            >
              {p.chatOpen}
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="bg-black text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              {pdfLoading ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />{p.pdfLoading}</> : p.pdf}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-10 flex gap-10">
        {/* 목차 */}
        <aside className="hidden min-w-0 w-48 shrink-0 xl:block">
          <div className="sticky top-24 min-w-0 space-y-6">
            {/* 편집용 점프 목차 — 발행 미리보기 열림·인쇄 시 숨김 (본문 미리보기에 목차 불필요) */}
            <div className={`print:hidden ${showBlogPreview ? 'hidden' : ''}`}>
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">{p.toc}</p>
              <div className="space-y-0.5">
                {sections.map((s, i) => (
                  <a
                    key={s.id}
                    href={`#section-${i}`}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 py-1.5 px-3 rounded-lg hover:bg-white transition-all group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full transition-all group-hover:scale-125" style={{ backgroundColor: ACCENT_COLORS[i % ACCENT_COLORS.length] }} />
                    {s.name}
                  </a>
                ))}
              </div>
            </div>

            {/* SEO 점수 미니 카드 */}
            {seoReport && (
              <button
                onClick={() => setShowSeo(true)}
                className={`w-full text-left border rounded-2xl p-3 transition-all hover:shadow-md ${scoreBg}`}
              >
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">{p.seoScore}</p>
                <p className={`text-3xl font-black ${scoreColor}`}>{seoReport.score}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.seoSeeMore}</p>
              </button>
            )}

            <div className="print:hidden">
              <ComplianceScanPanel
                findings={complianceFindings}
                open={complianceOpen}
                onToggle={() => setComplianceOpen(o => !o)}
                ui={t}
                industryBadge={complianceIndustryBadge}
              />
            </div>

            {channelKitContent && (
              <div className="print:hidden">
                <ChannelPublishKitPanel
                  platforms={PLATFORMS}
                  platform={platform}
                  setPlatform={setPlatform}
                  kit={channelKitContent}
                  ui={t}
                  open={channelKitOpen}
                  onToggle={() => setChannelKitOpen(o => !o)}
                  onCopyHook={line => {
                    navigator.clipboard.writeText(line).then(() => {
                      toast.success(t.channelKitToastHook)
                    }).catch(() => toast.error(t.toastCopyFail))
                  }}
                  pasteBundle={listingPasteBundle}
                  onCopyPasteBundle={() => {
                    if (!listingPasteBundle.trim()) return
                    navigator.clipboard.writeText(listingPasteBundle).then(() => {
                      toast.success(t.channelKitToastPasteBundle)
                    }).catch(() => toast.error(t.toastCopyFail))
                  }}
                />
              </div>
            )}

            {abCopySet && (
              <div className="print:hidden">
                <ConversionAbPanel
                  titles={abCopySet.titles}
                  openers={abCopySet.openers}
                  ctas={abCopySet.ctas}
                  recommendation={abCopySet.recommendation}
                  runnerUp={abCopySet.runnerUp}
                  utmRecommendedQuery={abCopySet.utmRecommendedQuery}
                  ui={t}
                  open={abCopyOpen}
                  onToggle={() => setAbCopyOpen(o => !o)}
                  hasFirst={sections.length > 0}
                  lastSectionId={lastSectionId}
                  onCopyLine={line => {
                    navigator.clipboard.writeText(line).then(() => {
                      toast.success(t.abCopyToast)
                    }).catch(() => toast.error(t.toastCopyFail))
                  }}
                  onApplyTitle={idx => {
                    const s0 = sections[0]
                    if (!s0 || !abCopySet) return
                    updateSection(s0.id, 'title', abCopySet.titles[idx])
                    toast.success(t.abCopyToastApplyTitle)
                  }}
                  onApplyOpener={idx => {
                    const s0 = sections[0]
                    if (!s0 || !abCopySet) return
                    updateSection(s0.id, 'body', `${abCopySet.openers[idx]}\n\n${s0.body}`)
                    toast.success(t.abCopyToastApplyOpener)
                  }}
                  onApplyCta={idx => {
                    if (!abCopySet || lastSectionId === null) return
                    const last = sections.find(s => s.id === lastSectionId)
                    if (!last) return
                    updateSection(last.id, 'body', `${last.body}\n\n${abCopySet.ctas[idx]}`)
                    toast.success(t.abCopyToastApplyCta)
                  }}
                  onApplyCombo={applyAbCombo}
                  onCopyUtm={() => {
                    navigator.clipboard.writeText(abCopySet.utmRecommendedQuery).then(() => {
                      toast.success(t.abCopyToastUtm)
                    }).catch(() => toast.error(t.toastCopyFail))
                  }}
                  onCopyExperimentSheet={() => {
                    navigator.clipboard.writeText(abCopySet.experimentSheet).then(() => {
                      toast.success(t.abCopyToastExperimentSheet)
                    }).catch(() => toast.error(t.toastCopyFail))
                  }}
                />
              </div>
            )}

            {evidencePack && (
              <div className="print:hidden">
                <EvidencePackPanel
                  copyBlock={evidencePack.copyBlock}
                  ui={t}
                  open={evidenceOpen}
                  onToggle={() => setEvidenceOpen(o => !o)}
                  onCopy={() => {
                    navigator.clipboard.writeText(evidencePack.copyBlock).then(() => {
                      toast.success(t.evidenceToast)
                    }).catch(() => toast.error(t.toastCopyFail))
                  }}
                />
              </div>
            )}

            {assetKit && (
              <div className="print:hidden">
                <AssetKitPanel
                  copyBlock={assetKit.copyBlock}
                  ui={t}
                  open={assetKitOpen}
                  onToggle={() => setAssetKitOpen(o => !o)}
                  onCopy={() => {
                    navigator.clipboard.writeText(assetKit.copyBlock).then(() => {
                      toast.success(t.abCopyToast)
                    }).catch(() => toast.error(t.toastCopyFail))
                  }}
                />
              </div>
            )}

            {intelPack && (
              <div className="print:hidden">
                <MarketIntelPanel
                  pack={intelPack}
                  ui={t}
                  open={intelOpen}
                  onToggle={() => setIntelOpen(o => !o)}
                  onCopy={() => {
                    navigator.clipboard.writeText(intelPack.checklistBlock).then(() => {
                      toast.success(t.abCopyToast)
                    }).catch(() => toast.error(t.toastCopyFail))
                  }}
                />
              </div>
            )}

            {metaExportBlocks && (
              <div className="print:hidden">
                <MetaOgExportPanel
                  htmlBlock={metaExportBlocks.html}
                  jsonBlock={metaExportBlocks.json}
                  ui={t}
                  open={metaOgOpen}
                  onToggle={() => setMetaOgOpen(o => !o)}
                  onCopyHtml={() => {
                    navigator.clipboard.writeText(metaExportBlocks.html).then(() => {
                      toast.success(t.metaOgToastHtml)
                    }).catch(() => toast.error(t.toastCopyFail))
                  }}
                  onCopyJson={() => {
                    navigator.clipboard.writeText(metaExportBlocks.json).then(() => {
                      toast.success(t.metaOgToastJson)
                    }).catch(() => toast.error(t.toastCopyFail))
                  }}
                />
              </div>
            )}

            <div className="print:hidden">
              <OrderWritingWidgets uiLang={uiLang} />
            </div>

            {/* Primary publish (locale default platform) */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setPlatform(primaryPlatform)
                  setShowBlogPreview(true)
                }}
                className={`w-full ${primStyle.bg} ${primStyle.hover} text-white rounded-2xl p-3 text-sm font-black transition-all hover:shadow-md flex items-center gap-2`}
              >
                <span className="text-lg font-black leading-none">{primaryRow?.icon}</span>
                {t.primaryPublishLabel}
              </button>
              <button
                type="button"
                onClick={handleNaverCopy}
                className={`w-full border ${primStyle.border} ${primStyle.text} hover:bg-gray-50 rounded-2xl p-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5`}
              >
                {copyDone ? t.copyDoneCheck : copyFormatIsListing ? t.copyListingBundleShort : t.copyHtmlShort}
              </button>
            </div>
          </div>
        </aside>

        {/* 미리보기 */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-gray-400 font-medium">{p.previewBar}</p>
            <div className="flex items-center gap-2">
              {/* 모바일용 네이버 버튼 */}
              <button
                type="button"
                onClick={handleNaverCopy}
                className={`xl:hidden flex items-center gap-1.5 ${primStyle.bg} ${primStyle.hover} text-white px-3 py-2 rounded-xl text-xs font-black transition-all`}
              >
                <span className="font-black">{primaryRow?.icon}</span>
                {copyDone ? t.mobileCopyDone : copyFormatIsListing ? t.mobileListingCopy : t.mobileBlogCopy}
              </button>
              {/* 모바일용 SEO 버튼 */}
              {seoReport && (
                <button
                  onClick={() => setShowSeo(true)}
                  className={`xl:hidden flex items-center gap-1.5 border px-3 py-2 rounded-xl text-xs font-black transition-all ${scoreBg} ${scoreColor}`}
                >
                  {p.seoPts(seoReport.score)}
                </button>
              )}
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500 font-medium">{p.liveEdit}</span>
              </div>
            </div>
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={onProductImageChange}
          />

          {/* 제품 이미지 교체·추가 (PDF 제외) */}
          <div className="max-w-[390px] mx-auto w-full mb-3 print:hidden">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{p.prodImages}</p>
            <div className="flex flex-wrap items-end gap-2">
              {(order.image_urls ?? []).map((url, i) => (
                <div key={`${url}-${i}`} className="relative flex flex-col items-center gap-1">
                  <img
                    src={url}
                    alt={p.imgAlt(i)}
                    className="w-16 h-16 sm:w-[72px] sm:h-[72px] object-cover rounded-xl border border-gray-200 bg-gray-50"
                  />
                  <button
                    type="button"
                    disabled={imageBusy}
                    onClick={() => pickImageSlot(i)}
                    className="text-[10px] font-bold text-gray-500 hover:text-black border border-gray-200 rounded-lg px-2 py-0.5 disabled:opacity-40"
                  >
                    {p.replace}
                  </button>
                </div>
              ))}
              {(order.image_urls ?? []).length < 3 && (
                <button
                  type="button"
                  disabled={imageBusy}
                  onClick={() => pickImageSlot((order.image_urls ?? []).length)}
                  className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-xl font-light hover:border-gray-400 hover:text-gray-600 disabled:opacity-40 flex items-center justify-center"
                  title={p.addImgTitle}
                >
                  {p.addImg}
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
              {p.imageHint}
            </p>
          </div>

          <div className="max-w-[390px] mx-auto w-full mb-4 xl:hidden print:hidden space-y-3">
            <ComplianceScanPanel
              findings={complianceFindings}
              open={complianceOpen}
              onToggle={() => setComplianceOpen(o => !o)}
              ui={t}
              industryBadge={complianceIndustryBadge}
            />
            {channelKitContent && (
              <ChannelPublishKitPanel
                platforms={PLATFORMS}
                platform={platform}
                setPlatform={setPlatform}
                kit={channelKitContent}
                ui={t}
                open={channelKitOpen}
                onToggle={() => setChannelKitOpen(o => !o)}
                onCopyHook={line => {
                  navigator.clipboard.writeText(line).then(() => {
                    toast.success(t.channelKitToastHook)
                  }).catch(() => toast.error(t.toastCopyFail))
                }}
                pasteBundle={listingPasteBundle}
                onCopyPasteBundle={() => {
                  if (!listingPasteBundle.trim()) return
                  navigator.clipboard.writeText(listingPasteBundle).then(() => {
                    toast.success(t.channelKitToastPasteBundle)
                  }).catch(() => toast.error(t.toastCopyFail))
                }}
              />
            )}
            {abCopySet && (
              <ConversionAbPanel
                titles={abCopySet.titles}
                openers={abCopySet.openers}
                ctas={abCopySet.ctas}
                recommendation={abCopySet.recommendation}
                runnerUp={abCopySet.runnerUp}
                utmRecommendedQuery={abCopySet.utmRecommendedQuery}
                ui={t}
                open={abCopyOpen}
                onToggle={() => setAbCopyOpen(o => !o)}
                hasFirst={sections.length > 0}
                lastSectionId={lastSectionId}
                onCopyLine={line => {
                  navigator.clipboard.writeText(line).then(() => {
                    toast.success(t.abCopyToast)
                  }).catch(() => toast.error(t.toastCopyFail))
                }}
                onApplyTitle={idx => {
                  const s0 = sections[0]
                  if (!s0 || !abCopySet) return
                  updateSection(s0.id, 'title', abCopySet.titles[idx])
                  toast.success(t.abCopyToastApplyTitle)
                }}
                onApplyOpener={idx => {
                  const s0 = sections[0]
                  if (!s0 || !abCopySet) return
                  updateSection(s0.id, 'body', `${abCopySet.openers[idx]}\n\n${s0.body}`)
                  toast.success(t.abCopyToastApplyOpener)
                }}
                onApplyCta={idx => {
                  if (!abCopySet || lastSectionId === null) return
                  const last = sections.find(s => s.id === lastSectionId)
                  if (!last) return
                  updateSection(last.id, 'body', `${last.body}\n\n${abCopySet.ctas[idx]}`)
                  toast.success(t.abCopyToastApplyCta)
                }}
                onApplyCombo={applyAbCombo}
                onCopyUtm={() => {
                  navigator.clipboard.writeText(abCopySet.utmRecommendedQuery).then(() => {
                    toast.success(t.abCopyToastUtm)
                  }).catch(() => toast.error(t.toastCopyFail))
                }}
                onCopyExperimentSheet={() => {
                  navigator.clipboard.writeText(abCopySet.experimentSheet).then(() => {
                    toast.success(t.abCopyToastExperimentSheet)
                  }).catch(() => toast.error(t.toastCopyFail))
                }}
              />
            )}
            {evidencePack && (
              <EvidencePackPanel
                copyBlock={evidencePack.copyBlock}
                ui={t}
                open={evidenceOpen}
                onToggle={() => setEvidenceOpen(o => !o)}
                onCopy={() => {
                  navigator.clipboard.writeText(evidencePack.copyBlock).then(() => {
                    toast.success(t.evidenceToast)
                  }).catch(() => toast.error(t.toastCopyFail))
                }}
              />
            )}
            {assetKit && (
              <AssetKitPanel
                copyBlock={assetKit.copyBlock}
                ui={t}
                open={assetKitOpen}
                onToggle={() => setAssetKitOpen(o => !o)}
                onCopy={() => {
                  navigator.clipboard.writeText(assetKit.copyBlock).then(() => {
                    toast.success(t.abCopyToast)
                  }).catch(() => toast.error(t.toastCopyFail))
                }}
              />
            )}
            {intelPack && (
              <MarketIntelPanel
                pack={intelPack}
                ui={t}
                open={intelOpen}
                onToggle={() => setIntelOpen(o => !o)}
                onCopy={() => {
                  navigator.clipboard.writeText(intelPack.checklistBlock).then(() => {
                    toast.success(t.abCopyToast)
                  }).catch(() => toast.error(t.toastCopyFail))
                }}
              />
            )}
            {metaExportBlocks && (
              <MetaOgExportPanel
                htmlBlock={metaExportBlocks.html}
                jsonBlock={metaExportBlocks.json}
                ui={t}
                open={metaOgOpen}
                onToggle={() => setMetaOgOpen(o => !o)}
                onCopyHtml={() => {
                  navigator.clipboard.writeText(metaExportBlocks.html).then(() => {
                    toast.success(t.metaOgToastHtml)
                  }).catch(() => toast.error(t.toastCopyFail))
                }}
                onCopyJson={() => {
                  navigator.clipboard.writeText(metaExportBlocks.json).then(() => {
                    toast.success(t.metaOgToastJson)
                  }).catch(() => toast.error(t.toastCopyFail))
                }}
              />
            )}
            <OrderWritingWidgets uiLang={uiLang} />
          </div>

          {/* PDF 타겟 */}
          <div
            ref={previewRef}
            className="mx-auto bg-white overflow-hidden"
            style={{
              maxWidth: '390px',
              borderRadius: '24px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 20px 60px -10px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)',
            }}
          >
            {order.image_urls && order.image_urls.length > 0 && (
              <div>
                {order.image_urls.map((url, i) => (
                  <img key={i} src={url} alt={p.imgAlt(i)} className="w-full object-cover" crossOrigin="anonymous" />
                ))}
              </div>
            )}

            {sections.map((section, i) => (
              <div
                key={section.id}
                id={`section-${i}`}
                className={`px-6 py-10 cursor-pointer transition-all ${editingId === section.id ? 'ring-2 ring-inset' : 'hover:brightness-95'}`}
                style={{
                  backgroundColor: BG_COLORS[i % BG_COLORS.length],
                  borderTop: i > 0 ? '1px solid #f3f4f6' : 'none',
                  ...(editingId === section.id ? { outline: `2px solid ${ACCENT_COLORS[i % ACCENT_COLORS.length]}` } : {}),
                }}
                onClick={() => setEditingId(editingId === section.id ? null : section.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full" style={{ backgroundColor: ACCENT_COLORS[i % ACCENT_COLORS.length] }} />
                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: ACCENT_COLORS[i % ACCENT_COLORS.length] }}>
                      {section.name}
                    </span>
                  </div>
                  {editingId === section.id && (
                    <span className="text-xs text-gray-400 font-medium bg-white border border-gray-200 px-2 py-0.5 rounded-full">{p.editing}</span>
                  )}
                </div>

                {editingId === section.id ? (
                  <input
                    value={section.title}
                    onChange={e => updateSection(section.id, 'title', e.target.value)}
                    onClick={e => e.stopPropagation()}
                    className="w-full text-xl font-black text-gray-900 mb-3 bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black leading-tight tracking-tight"
                  />
                ) : (
                  <h2 className="text-xl font-black text-gray-900 mb-3 leading-tight tracking-tight">{section.title}</h2>
                )}

                {editingId === section.id ? (
                  <textarea
                    value={section.body}
                    onChange={e => updateSection(section.id, 'body', e.target.value)}
                    onClick={e => e.stopPropagation()}
                    rows={5}
                    className="w-full text-sm text-gray-600 bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black resize-none leading-relaxed"
                  />
                ) : (
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{section.body}</p>
                )}
              </div>
            ))}

            <div className="px-6 py-8 bg-gray-50 text-center border-t border-gray-100">
              <p className="text-gray-300 text-xs font-medium">{p.footerAi}</p>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
            <button type="button" onClick={() => router.push('/order/new')} className="border border-gray-200 text-gray-400 px-6 py-3 rounded-xl text-sm hover:bg-white transition-all">
              {p.newOrder}
            </button>
            <button type="button" onClick={handleRegenerate} disabled={regenLoading} className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-white transition-all disabled:opacity-40">
              {p.regenBottom}
            </button>
            <button
              type="button"
              onClick={handleNaverCopy}
              className={`${primStyle.bg} ${primStyle.hover} text-white px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2`}
            >
              <span className="font-black">{primaryRow?.icon}</span>
              {copyDone ? t.mobileCopyDone : t.bottomCopyLabel}
            </button>
            <button type="button" onClick={handleDownloadPDF} disabled={pdfLoading} className="bg-black text-white px-10 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all disabled:opacity-40">
              {pdfLoading ? p.pdfGen : p.pdfBottom}
            </button>
          </div>
          <p className="text-center text-xs text-gray-300 mt-4">{p.bottomHint}</p>
        </div>
      </div>

      {/* SEO 분석 모달 */}
      {showSeo && seoReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowSeo(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* 점수 헤더 */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{p.seoModalTitle}</p>
                <div className="flex items-end gap-2">
                  <span className={`text-6xl font-black ${scoreColor}`}>{seoReport.score}</span>
                  <span className="text-gray-400 text-sm mb-2 font-medium">{p.scoreOf}</span>
                </div>
                <p className={`text-sm font-bold mt-1 ${scoreColor}`}>
                  {seoLevelMessage(uiLang, seoReport.score)}
                </p>
              </div>
              <button onClick={() => setShowSeo(false)} className="text-gray-300 hover:text-black text-2xl leading-none mt-1">×</button>
            </div>

            {/* 체크리스트 */}
            <div className="space-y-3 mb-6">
              {seoReport.items.map((item, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${item.ok ? 'bg-green-50' : 'bg-red-50'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${item.ok ? 'bg-green-500 text-white' : 'bg-red-400 text-white'}`}>
                    {item.ok ? '✓' : '!'}
                  </span>
                  <div>
                    <p className={`text-sm font-bold ${item.ok ? 'text-green-800' : 'text-red-700'}`}>{item.label}</p>
                    {!item.ok && <p className="text-xs text-red-500 mt-0.5">{item.tip}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* 추천 태그 */}
            <div className="mb-6">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">{p.recoTags}</p>
              <div className="flex flex-wrap gap-2">
                {seoReport.tags.map((tag, i) => (
                  <span key={i} className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">#{tag}</span>
                ))}
              </div>
            </div>

            {/* 메타 정보 */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider">{p.blogRec}</p>
              <div>
                <p className="text-xs font-bold text-gray-500 mb-1">{p.metaTitleLbl}</p>
                <p className="text-sm text-gray-800 font-medium">{seoReport.metaTitle}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 mb-1">{p.metaDescLbl}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{seoReport.metaDesc}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowSeo(false)
                setPlatform(primaryPlatform)
                setShowBlogPreview(true)
              }}
              className={`w-full mt-5 ${primStyle.bg} ${primStyle.hover} text-white py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2`}
            >
              <span className="font-black text-base">{primaryRow?.icon}</span>
              {t.openBlogPreview}
            </button>
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
