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

const ACCENT_COLORS = ['#FF5C35','#6366F1','#0EA5E9','#10B981','#F59E0B','#8B5CF6']
const BG_COLORS = ['#ffffff','#fafafa','#fff8f5','#f0f7ff','#f5fff8','#fdf4ff']

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

  useEffect(() => {
    async function fetchOrder() {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single()
      if (error || !data) { toast.error('주문을 찾을 수 없습니다'); router.push('/dashboard'); return }
      setOrder(data)
      if (data.result_json?.sections) setSections(data.result_json.sections)
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
          <div className="sticky top-24">
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
        </aside>

        {/* 미리보기 */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-gray-400 font-medium">모바일 미리보기 (390px) · 클릭해서 직접 수정 가능</p>
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500 font-medium">실시간 편집</span>
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
            {/* 이미지 */}
            {order.image_urls && order.image_urls.length > 0 && (
              <div>
                {order.image_urls.map((url, i) => (
                  <img key={i} src={url} alt={`제품 ${i+1}`} className="w-full object-cover" crossOrigin="anonymous" />
                ))}
              </div>
            )}

            {/* 섹션 */}
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
                {/* 섹션 라벨 */}
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

                {/* 제목 */}
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

                {/* 본문 */}
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

            {/* 하단 */}
            <div className="px-6 py-8 bg-gray-50 text-center border-t border-gray-100">
              <p className="text-gray-300 text-xs font-medium">AI 자동 생성 상세페이지</p>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="mt-8 flex justify-center gap-3 print:hidden">
            <button onClick={() => router.push('/order/new')} className="border border-gray-200 text-gray-400 px-6 py-3 rounded-xl text-sm hover:bg-white transition-all">
              + 새 주문
            </button>
            <button onClick={handleRegenerate} disabled={regenLoading} className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-white transition-all disabled:opacity-40">
              다시 생성
            </button>
            <button onClick={handleDownloadPDF} disabled={pdfLoading} className="bg-black text-white px-10 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all disabled:opacity-40">
              {pdfLoading ? 'PDF 생성 중...' : 'PDF 다운로드'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-300 mt-4">섹션을 클릭해서 제목과 본문을 자유롭게 수정하세요</p>
        </div>
      </div>
    </main>
  )
}
