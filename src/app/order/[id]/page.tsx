'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'

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

// ── SEO 분석 (클라이언트 사이드) ──────────────────────────────
function analyzeSeo(sections: Section[], productName: string, category: string): SeoReport {
  const fullText = sections.map(s => s.title + ' ' + s.body).join(' ')
  // 한국어는 글자 수 기준으로 측정
  const charCount = fullText.replace(/\s/g, '').length
  const titleLengths = sections.map(s => s.title.length)
  const avgTitleLen = titleLengths.reduce((a, b) => a + b, 0) / titleLengths.length
  const hasNumbers = sections.filter(s => /\d/.test(s.title)).length >= 3
  const hasQuestion = sections.some(s => /[?？]|인가요|나요|까요|세요/.test(s.title))
  const hasCta = /지금|바로|구매|시작|할인|무료/.test(sections[sections.length - 1]?.body ?? '')
  const ctaCount = (sections[sections.length - 1]?.body ?? '').split(/지금|바로|구매|시작|할인|무료/).length - 1
  const keywordInTitles = sections.filter(s =>
    s.title.includes(productName.slice(0, 4)) || s.title.includes(category)
  ).length
  const bodyLengths = sections.map(s => s.body.replace(/\s/g, '').length)
  const allBodySufficient = bodyLengths.every(l => l >= 100)

  const items = [
    {
      label: '키워드 제목 포함 (3개 이상)',
      ok: keywordInTitles >= 3,
      tip: `제목에 제품명·카테고리 키워드가 ${keywordInTitles}개만 있어요. 최소 3개 이상 포함해야 검색 노출에 유리합니다.`,
    },
    {
      label: '충분한 본문량 (900자 이상)',
      ok: charCount >= 900,
      tip: `현재 본문 총 ${charCount}자입니다. 900자 이상이어야 검색 엔진이 풍부한 콘텐츠로 평가합니다. "다시 생성" 버튼을 눌러보세요.`,
    },
    {
      label: '제목 길이 최적화 (15~40자)',
      ok: avgTitleLen >= 15 && avgTitleLen <= 40,
      tip: `평균 제목 길이 ${Math.round(avgTitleLen)}자입니다. 15~40자가 검색 결과에서 가장 잘 표시됩니다.`,
    },
    {
      label: '숫자 활용 제목 (3개 이상)',
      ok: hasNumbers,
      tip: `숫자가 포함된 제목이 ${sections.filter(s => /\d/.test(s.title)).length}개입니다. "3가지", "100%", "2주" 같은 수치가 클릭률을 높입니다.`,
    },
    {
      label: '의문형 제목 사용',
      ok: hasQuestion,
      tip: '"~하고 계신가요?", "~때문인가요?" 형식의 제목은 공감도를 높이고 체류 시간을 늘립니다.',
    },
    {
      label: 'CTA 문구 2개 이상 (마지막 섹션)',
      ok: hasCta && ctaCount >= 2,
      tip: `마지막 섹션에 "지금", "바로", "구매" 등 행동 유도 키워드가 ${ctaCount}개입니다. 최소 2개 이상 포함하세요.`,
    },
    {
      label: '섹션별 본문 충분 (각 100자 이상)',
      ok: allBodySufficient,
      tip: `본문이 짧은 섹션이 있습니다. 최소값: ${Math.min(...bodyLengths)}자. 각 섹션을 100자 이상으로 작성해야 블로그·SEO에 효과적입니다.`,
    },
  ]

  const score = Math.round((items.filter(i => i.ok).length / items.length) * 100)

  const tags = [
    productName.split(' ')[0],
    category,
    ...productName.split(' ').slice(1, 3),
    '스마트스토어',
    '쿠팡',
  ].filter(Boolean).slice(0, 8)

  const metaTitle = `${productName} | ${category} 전문 쇼핑몰`
  const metaDesc = sections[0]?.body.slice(0, 80).replace(/\n/g, ' ') + '...'

  return { score, items, tags, metaTitle, metaDesc }
}

// ── 플랫폼별 포맷 ──────────────────────────────────────────

type Platform = 'naver' | 'tistory' | 'brunch' | 'instagram' | 'wordpress'

const PLATFORMS: { id: Platform; label: string; icon: string; desc: string }[] = [
  { id: 'naver',     icon: 'N', label: '네이버 블로그', desc: 'HTML 편집 탭에 붙여넣기' },
  { id: 'tistory',   icon: 'T', label: '티스토리',     desc: 'HTML 모드에 붙여넣기' },
  { id: 'brunch',    icon: 'B', label: '브런치',       desc: '일반 텍스트 붙여넣기' },
  { id: 'wordpress', icon: 'W', label: '워드프레스',   desc: 'HTML 블록에 붙여넣기' },
  { id: 'instagram', icon: '📸', label: '인스타그램',  desc: '캡션에 붙여넣기' },
]

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

export default function OrderResultPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const previewRef = useRef<HTMLDivElement>(null)

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
  const [platform, setPlatform] = useState<Platform>('naver')

  useEffect(() => {
    async function fetchOrder() {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single()
      if (error || !data) { toast.error('주문을 찾을 수 없습니다'); router.push('/dashboard'); return }
      setOrder(data)
      if (data.result_json?.sections) {
        setSections(data.result_json.sections)
        setSeoReport(analyzeSeo(data.result_json.sections, data.product_name, data.category))
      }
      setLoading(false)
    }
    fetchOrder()
  }, [id])

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
      if (!res.ok) throw new Error('재생성 실패')
      const { result } = await res.json()
      setSections(result.sections)
      setSeoReport(analyzeSeo(result.sections, order.product_name, order.category))
      setOrder(prev => prev ? { ...prev, result_json: result, status: 'done' } : prev)
      toast.success('다시 생성됐습니다!')
    } catch { toast.error('재생성 중 오류') }
    finally { setRegenLoading(false) }
  }

  async function handleDownloadPDF() {
    if (!previewRef.current || !order) return
    setPdfLoading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const opt = {
        margin: 0,
        filename: `상품상세페이지_${order.product_name}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'px' as const, format: [390, 10000] as [number, number], orientation: 'portrait' as const },
      }
      await html2pdf().set(opt).from(previewRef.current).save()
      toast.success('PDF 다운로드 완료!')
    } catch { toast.error('PDF 생성 오류') }
    finally { setPdfLoading(false) }
  }

  function getFormatContent(): string {
    if (!order) return ''
    const imgs = order.image_urls ?? []
    switch (platform) {
      case 'naver':
      case 'tistory':
        return toBlogHTML(sections, order.product_name, order.category, imgs)
      case 'wordpress':
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
      toast.success(`${PLATFORMS.find(p => p.id === platform)?.label} 형식으로 복사됐습니다!`)
      setTimeout(() => setCopyDone(false), 3000)
    }).catch(() => toast.error('복사 실패. 다시 시도해주세요.'))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-100 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm font-medium">AI가 만든 상세페이지를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!order?.result_json || sections.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">생성된 결과가 없습니다</p>
          <button onClick={() => router.push('/dashboard')} className="bg-black text-white px-6 py-3 rounded-xl text-sm font-semibold">대시보드로</button>
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
              <span className="font-bold text-sm tracking-tight">페이지AI</span>
            </Link>
            <div className="w-px h-4 bg-gray-200" />
            <span className="text-sm font-semibold text-gray-900">{order.product_name}</span>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">완료</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block">섹션을 클릭해서 바로 편집하세요</span>
            <div className="w-px h-4 bg-gray-200 hidden sm:block" />
            <button
              onClick={handleRegenerate}
              disabled={regenLoading}
              className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              {regenLoading ? <><span className="w-3 h-3 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />재생성 중...</> : '↺ 다시 생성'}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="bg-black text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              {pdfLoading ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />생성 중...</> : '↓ PDF 다운로드'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-10 flex gap-10">
        {/* 목차 */}
        <aside className="hidden xl:block w-48 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">섹션 목차</p>
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
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">SEO 점수</p>
                <p className={`text-3xl font-black ${scoreColor}`}>{seoReport.score}</p>
                <p className="text-xs text-gray-400 mt-0.5">자세히 보기 →</p>
              </button>
            )}

            {/* 네이버 블로그 복사 */}
            <div className="space-y-2">
              <button
                onClick={() => setShowBlogPreview(true)}
                className="w-full bg-[#03C75A] hover:bg-[#02b050] text-white rounded-2xl p-3 text-sm font-black transition-all hover:shadow-md flex items-center gap-2"
              >
                <span className="text-lg leading-none">N</span>
                블로그 미리보기
              </button>
              <button
                onClick={handleNaverCopy}
                className="w-full border border-[#03C75A] text-[#03C75A] hover:bg-green-50 rounded-2xl p-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                {copyDone ? '✓ 복사됨' : '↗ HTML 복사'}
              </button>
            </div>
          </div>
        </aside>

        {/* 미리보기 */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-gray-400 font-medium">모바일 미리보기 (390px) · 클릭해서 직접 수정 가능</p>
            <div className="flex items-center gap-2">
              {/* 모바일용 네이버 버튼 */}
              <button
                onClick={handleNaverCopy}
                className="xl:hidden flex items-center gap-1.5 bg-[#03C75A] hover:bg-[#02b050] text-white px-3 py-2 rounded-xl text-xs font-black transition-all"
              >
                <span className="font-black">N</span>
                {copyDone ? '복사됨 ✓' : '블로그 복사'}
              </button>
              {/* 모바일용 SEO 버튼 */}
              {seoReport && (
                <button
                  onClick={() => setShowSeo(true)}
                  className={`xl:hidden flex items-center gap-1.5 border px-3 py-2 rounded-xl text-xs font-black transition-all ${scoreBg} ${scoreColor}`}
                >
                  SEO {seoReport.score}점
                </button>
              )}
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500 font-medium">실시간 편집</span>
              </div>
            </div>
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
                  <img key={i} src={url} alt={`제품 ${i+1}`} className="w-full object-cover" crossOrigin="anonymous" />
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
                    <span className="text-xs text-gray-400 font-medium bg-white border border-gray-200 px-2 py-0.5 rounded-full">편집 중</span>
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
              <p className="text-gray-300 text-xs font-medium">AI 자동 생성 상세페이지</p>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
            <button onClick={() => router.push('/order/new')} className="border border-gray-200 text-gray-400 px-6 py-3 rounded-xl text-sm hover:bg-white transition-all">
              + 새 주문
            </button>
            <button onClick={handleRegenerate} disabled={regenLoading} className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-white transition-all disabled:opacity-40">
              다시 생성
            </button>
            <button
              onClick={handleNaverCopy}
              className="bg-[#03C75A] hover:bg-[#02b050] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
            >
              <span className="font-black">N</span>
              {copyDone ? '복사됨 ✓' : '네이버 블로그 복사'}
            </button>
            <button onClick={handleDownloadPDF} disabled={pdfLoading} className="bg-black text-white px-10 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all disabled:opacity-40">
              {pdfLoading ? 'PDF 생성 중...' : 'PDF 다운로드'}
            </button>
          </div>
          <p className="text-center text-xs text-gray-300 mt-4">섹션을 클릭해서 제목과 본문을 자유롭게 수정하세요</p>
        </div>
      </div>

      {/* SEO 분석 모달 */}
      {showSeo && seoReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowSeo(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* 점수 헤더 */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">SEO 분석 리포트</p>
                <div className="flex items-end gap-2">
                  <span className={`text-6xl font-black ${scoreColor}`}>{seoReport.score}</span>
                  <span className="text-gray-400 text-sm mb-2 font-medium">/ 100</span>
                </div>
                <p className={`text-sm font-bold mt-1 ${scoreColor}`}>
                  {seoReport.score >= 80 ? '🟢 우수 — 블로그·검색 최적화 완료' : seoReport.score >= 60 ? '🟡 보통 — 일부 개선이 필요합니다' : '🔴 미흡 — 수정 후 블로그에 발행하세요'}
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
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">추천 검색 태그</p>
              <div className="flex flex-wrap gap-2">
                {seoReport.tags.map((tag, i) => (
                  <span key={i} className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">#{tag}</span>
                ))}
              </div>
            </div>

            {/* 메타 정보 */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider">블로그 포스팅 추천 설정</p>
              <div>
                <p className="text-xs font-bold text-gray-500 mb-1">제목</p>
                <p className="text-sm text-gray-800 font-medium">{seoReport.metaTitle}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 mb-1">설명 (메타 디스크립션)</p>
                <p className="text-xs text-gray-600 leading-relaxed">{seoReport.metaDesc}</p>
              </div>
            </div>

            <button
              onClick={() => { setShowSeo(false); setShowBlogPreview(true) }}
              className="w-full mt-5 bg-[#03C75A] hover:bg-[#02b050] text-white py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
            >
              <span className="font-black text-base">N</span>
              블로그 포스팅 미리보기
            </button>
          </div>
        </div>
      )}

      {/* 블로그 미리보기 모달 */}
      {showBlogPreview && order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowBlogPreview(false)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">블로그 발행 미리보기</p>
                <p className="text-xs text-gray-400 mt-0.5">플랫폼을 선택하면 실제 발행 후 모습으로 미리봅니다</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNaverCopy}
                  className="flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-black transition-all"
                >
                  {copyDone ? '복사됨 ✓' : '↗ 복사'}
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
              {(platform === 'naver' || platform === 'tistory' || platform === 'wordpress') ? (
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="w-3 h-3 rounded-full bg-yellow-400" />
                      <span className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 bg-white rounded-lg px-3 py-1 text-xs text-gray-400 ml-2">
                      {platform === 'naver' ? 'blog.naver.com' : platform === 'tistory' ? 'yourblog.tistory.com' : 'yoursite.wordpress.com'}
                    </div>
                  </div>
                  <iframe
                    key={platform}
                    srcDoc={getFormatContent()}
                    className="w-full"
                    style={{ height: '520px', border: 'none' }}
                    title="블로그 미리보기"
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
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-3xl shrink-0">
              <p className="text-xs text-gray-500">
                <span className="font-bold text-gray-700">📋 {PLATFORMS.find(p => p.id === platform)?.label} 붙여넣기:</span>
                {' '}{PLATFORMS.find(p => p.id === platform)?.desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
