'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Section {
  id: number
  name: string
  title: string
  body: string
  bg_color: string
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

export default function OrderResultPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

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

  function handlePrint() {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-500">불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!order?.result_json) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-gray-500 mb-4">생성된 결과가 없습니다</p>
          <Button onClick={() => router.push('/dashboard')}>대시보드로</Button>
        </div>
      </div>
    )
  }

  const sections = order.result_json.sections

  return (
    <main className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
            ← 대시보드
          </Button>
          <h1 className="font-semibold">{order.product_name}</h1>
          <Badge variant="outline" className="text-green-600 border-green-600">완료</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            🖨️ PDF 저장
          </Button>
          <Button onClick={() => router.push('/order/new')}>
            + 새 주문
          </Button>
        </div>
      </header>

      {/* 상세페이지 미리보기 */}
      <div className="max-w-[390px] mx-auto my-8 bg-white shadow-xl print:shadow-none print:my-0" id="detail-page">
        {/* 제품 이미지 */}
        {order.image_urls && order.image_urls.length > 0 && (
          <div className="w-full">
            {order.image_urls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`제품 이미지 ${i + 1}`}
                className="w-full object-cover"
              />
            ))}
          </div>
        )}

        {/* 6섹션 렌더링 */}
        {sections.map((section) => (
          <div
            key={section.id}
            className="px-5 py-10"
            style={{ backgroundColor: section.bg_color || '#FFFFFF' }}
          >
            <div className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              {section.name}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
              {section.title}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {section.body}
            </p>
          </div>
        ))}

        {/* 하단 여백 */}
        <div className="h-16 bg-gray-50 flex items-center justify-center">
          <p className="text-xs text-gray-300">AI 자동 생성 상세페이지</p>
        </div>
      </div>

      {/* PDF 안내 */}
      <div className="text-center pb-8 print:hidden">
        <p className="text-sm text-gray-400 mb-2">
          "PDF 저장" 버튼 클릭 → 인쇄 대화상자 → "PDF로 저장" 선택
        </p>
      </div>

      {/* 인쇄 스타일 */}
      <style jsx global>{`
        @media print {
          header, footer { display: none; }
          body { margin: 0; padding: 0; }
          #detail-page { max-width: 100%; box-shadow: none; }
        }
      `}</style>
    </main>
  )
}
