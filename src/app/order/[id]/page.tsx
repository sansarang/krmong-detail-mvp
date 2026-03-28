'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Section {
  id: number
  name: string
  title: string
  body: string
  bg_color?: string
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

const sectionColors = [
  'from-purple-900/40 to-slate-900/40',
  'from-blue-900/40 to-slate-900/40',
  'from-pink-900/40 to-slate-900/40',
  'from-indigo-900/40 to-slate-900/40',
  'from-violet-900/40 to-slate-900/40',
  'from-fuchsia-900/40 to-slate-900/40',
]

export default function OrderResultPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const previewRef = useRef<HTMLDivElement>(null)

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)

  useEffect(() => {
    async function fetchOrder() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single()
      if (error || !data) {
        toast.error('주문을 찾을 수 없습니다')
        router.push('/dashboard')
        return
      }
      setOrder(data)
      setLoading(false)
    }
    fetchOrder()
  }, [id])

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
      setOrder(prev => prev ? { ...prev, result_json: result, status: 'done' } : prev)
      toast.success('상세페이지가 다시 생성됐습니다!')
    } catch {
      toast.error('재생성 중 오류가 발생했습니다')
    } finally {
      setRegenLoading(false)
    }
  }

  async function handleDownloadPDF() {
    if (!previewRef.current || !order) return
    setPdfLoading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const opt = {
        margin: 0,
        filename: `상품상세페이지_${order.product_name}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0f0f1a' },
        jsPDF: { unit: 'px', format: [390, 10000], orientation: 'portrait' },
      }
      await html2pdf().set(opt).from(previewRef.current).save()
      toast.success('PDF 다운로드 완료!')
    } catch {
      toast.error('PDF 생성 중 오류가 발생했습니다')
    } finally {
      setPdfLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!order?.result_json) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">생성된 결과가 없습니다</p>
          <button onClick={() => router.push('/dashboard')} className="bg-purple-500 text-white px-6 py-2 rounded-xl">
            대시보드로
          </button>
        </div>
      </div>
    )
  }

  const sections = order.result_json.sections

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4 print:hidden">
        <div className="max-w-5xl mx-auto flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-white/50 hover:text-white transition-colors text-sm flex items-center gap-1"
            >
              ← 대시보드
            </button>
            <span className="text-white/20">|</span>
            <h1 className="text-white font-semibold">{order.product_name}</h1>
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">
              완료
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRegenerate}
              disabled={regenLoading}
              className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {regenLoading ? (
                <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />재생성 중...</>
              ) : '다시 생성'}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/30"
            >
              {pdfLoading ? (
                <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />생성 중...</>
              ) : 'PDF 다운로드'}
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 flex gap-8">

        {/* 왼쪽: 섹션 목차 */}
        <aside className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-8">
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">섹션 목차</p>
            <div className="space-y-1">
              {sections.map((s, i) => (
                <a
                  key={s.id}
                  href={`#section-${i}`}
                  className="block text-white/50 hover:text-white text-sm py-1.5 px-3 rounded-lg hover:bg-white/5 transition-all"
                >
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </aside>

        {/* 오른쪽: 미리보기 */}
        <div className="flex-1">
          <p className="text-white/40 text-sm mb-4 text-center">모바일 미리보기 (390px 기준)</p>

          {/* PDF 타겟 영역 */}
          <div
            ref={previewRef}
            className="mx-auto bg-slate-900 shadow-2xl shadow-purple-500/10 overflow-hidden"
            style={{ maxWidth: '390px', borderRadius: '16px' }}
          >
            {/* 제품 이미지 */}
            {order.image_urls && order.image_urls.length > 0 && (
              <div className="w-full">
                {order.image_urls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`제품 이미지 ${i + 1}`}
                    className="w-full object-cover"
                    crossOrigin="anonymous"
                  />
                ))}
              </div>
            )}

            {/* 6섹션 렌더링 */}
            {sections.map((section, i) => (
              <div
                key={section.id}
                id={`section-${i}`}
                className={`px-6 py-10 bg-gradient-to-br ${sectionColors[i % sectionColors.length]}`}
                style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
              >
                <div className="text-xs font-semibold text-purple-400/70 uppercase tracking-widest mb-3">
                  {section.name}
                </div>
                <h2 className="text-xl font-bold text-white mb-4 leading-tight">
                  {section.title}
                </h2>
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
                  {section.body}
                </p>
              </div>
            ))}

            {/* 하단 브랜딩 */}
            <div className="px-6 py-8 bg-slate-900/80 text-center">
              <p className="text-white/20 text-xs">AI 자동 생성 상세페이지</p>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="mt-6 flex justify-center gap-3 print:hidden">
            <button
              onClick={handleRegenerate}
              disabled={regenLoading}
              className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-white/20 transition-all disabled:opacity-50"
            >
              다시 생성
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/30"
            >
              {pdfLoading ? 'PDF 생성 중...' : 'PDF 다운로드'}
            </button>
            <button
              onClick={() => router.push('/order/new')}
              className="bg-white/5 border border-white/10 text-white/60 px-6 py-3 rounded-xl text-sm hover:bg-white/10 transition-all"
            >
              새 주문
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}