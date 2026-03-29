'use client'
import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { readStoredUiLang, type UiLang } from '@/lib/uiLocale'
import {
  type PublishPlatform,
  type OrderResultUi,
  platformsForLang,
  defaultPlatformForLang,
  ORDER_RESULT_UI,
  editorOpenUrl,
  previewFakeHost,
  primaryPublishStyle,
} from '@/lib/orderResultUi'
import { buildSeoReport, ORDER_PAGE_UI, seoLevelMessage } from '@/lib/orderPageUi'
import { type ComplianceFinding, flattenContentForScan, scanPostPublishCompliance } from '@/lib/postPublishCheck'

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
  result_json: { sections: Section[] } | null
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
  className = '',
}: {
  findings: ComplianceFinding[]
  open: boolean
  onToggle: () => void
  ui: OrderResultUi
  className?: string
}) {
  return (
    <div className={`border border-amber-200/80 bg-amber-50/90 rounded-2xl overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-3 hover:bg-amber-100/50 transition-colors"
      >
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
  const [imageBusy, setImageBusy] = useState(false)
  const [complianceOpen, setComplianceOpen] = useState(false)

  const PLATFORMS = platformsForLang(uiLang)
  const t = ORDER_RESULT_UI[uiLang]
  const p = ORDER_PAGE_UI[uiLang]
  const primaryPlatform = defaultPlatformForLang(uiLang)
  const primStyle = primaryPublishStyle(primaryPlatform)
  const primaryRow = PLATFORMS.find(p => p.id === primaryPlatform) ?? PLATFORMS[0]

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
    setPlatform(defaultPlatformForLang(uiLang))
  }, [uiLang])

  useEffect(() => {
    if (!order || sections.length === 0) return
    setSeoReport(buildSeoReport(sections, order.product_name, order.category, uiLang))
  }, [order, sections, uiLang])

  const { complianceFindings, complianceHighCount } = useMemo(() => {
    if (!order || sections.length === 0) {
      return { complianceFindings: [] as ComplianceFinding[], complianceHighCount: 0 }
    }
    const text = flattenContentForScan(order.product_name, order.category, sections)
    const complianceFindings = scanPostPublishCompliance(text, uiLang)
    const complianceHighCount = complianceFindings.filter(f => f.severity === 'high').length
    return { complianceFindings, complianceHighCount }
  }, [order, sections, uiLang])

  useEffect(() => {
    if (complianceHighCount > 0) setComplianceOpen(true)
  }, [complianceHighCount])

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

  async function handleRegenerate() {
    if (!order) return
    setRegenLoading(true)
    try {
      await supabase.from('orders').update({ status: 'pending', result_json: null }).eq('id', order.id)
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block">{p.headerHint}</span>
            <div className="w-px h-4 bg-gray-200 hidden sm:block" />
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
        <aside className="hidden xl:block w-48 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
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
              />
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
                {copyDone ? t.copyDoneCheck : t.copyHtmlShort}
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
                {copyDone ? t.mobileCopyDone : t.mobileBlogCopy}
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

          <div className="max-w-[390px] mx-auto w-full mb-4 xl:hidden print:hidden">
            <ComplianceScanPanel
              findings={complianceFindings}
              open={complianceOpen}
              onToggle={() => setComplianceOpen(o => !o)}
              ui={t}
            />
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
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
