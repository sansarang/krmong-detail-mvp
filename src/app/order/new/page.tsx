'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const CATEGORIES = [
  { value: 'food', label: '식품' },
  { value: 'beauty', label: '뷰티/화장품' },
  { value: 'living', label: '생활용품' },
  { value: 'fashion', label: '패션/의류' },
  { value: 'electronics', label: '전자제품' },
  { value: 'health', label: '건강/의료' },
  { value: 'other', label: '기타' },
]

export default function NewOrderPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [form, setForm] = useState({ product_name: '', category: '', description: '' })

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length > 3) { toast.error('이미지는 최대 3장까지 가능합니다'); return }
    setImages(files)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.product_name || !form.category || !form.description) {
      toast.error('모든 항목을 입력해주세요'); return
    }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const imageUrls: string[] = []
      for (const image of images) {
        const ext = image.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error } = await supabase.storage.from('product-images').upload(path, image)
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
        imageUrls.push(publicUrl)
      }

      const { data: order, error } = await supabase
        .from('orders')
        .insert({ user_id: user.id, ...form, image_urls: imageUrls, status: 'pending' })
        .select().single()
      if (error) throw error

      toast.success('AI가 상세페이지를 생성 중입니다...')
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      })
      if (!res.ok) throw new Error('생성 실패')
      toast.success('상세페이지가 완성됐습니다!')
      router.push(`/order/${order.id}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <header className="border-b border-gray-100 px-8 py-4 sticky top-0 z-10 bg-white">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-md" />
            <span className="font-bold text-sm tracking-tight">페이지AI</span>
          </Link>
          <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-900 transition-colors font-medium">
            ← 뒤로
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">새 상세페이지</h1>
          <p className="text-gray-400 text-sm font-medium">제품 정보를 입력하면 AI가 자동으로 상세페이지를 만들어줍니다</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* 제품명 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              제품명 <span className="text-red-400">*</span>
            </label>
            <input
              placeholder="예: 제주 유기농 녹차 추출 세럼"
              value={form.product_name}
              onChange={e => setForm({ ...form, product_name: e.target.value })}
              required
              className="w-full border border-gray-200 text-gray-900 placeholder-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all bg-gray-50 hover:bg-white"
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              카테고리 <span className="text-red-400">*</span>
            </label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              required
              className="w-full border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all bg-gray-50 hover:bg-white appearance-none cursor-pointer"
            >
              <option value="">카테고리 선택</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* 제품 설명 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              제품 설명 <span className="text-red-400">*</span>
            </label>
            <textarea
              placeholder="제품의 주요 특징, 효능, 타겟 고객 등을 자세히 입력해주세요.&#10;더 자세할수록 AI가 더 좋은 상세페이지를 만들어줍니다."
              rows={6}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              required
              className="w-full border border-gray-200 text-gray-900 placeholder-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none bg-gray-50 hover:bg-white"
            />
            <p className="text-xs text-gray-300 mt-1.5 font-medium">
              {form.description.length}자 · 100자 이상 입력하면 더 좋은 결과가 나옵니다
            </p>
          </div>

          {/* 이미지 업로드 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              제품 사진 <span className="text-gray-400 font-normal">(선택 · 최대 3장)</span>
            </label>
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all group"
            >
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" id="file-upload" />
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {images.length > 0 ? '✅' : '📷'}
              </div>
              <p className="text-sm font-semibold text-gray-500 group-hover:text-gray-900 transition-colors">
                {images.length > 0 ? `${images.length}장 선택됨` : '클릭해서 사진 업로드'}
              </p>
              <p className="text-xs text-gray-300 mt-1">JPG, PNG, WEBP 지원</p>
            </label>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-base hover:bg-gray-800 disabled:opacity-40 transition-all hover:scale-[1.01] active:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AI가 상세페이지를 만드는 중... (약 30초)
              </span>
            ) : '상세페이지 생성 시작 →'}
          </button>
        </form>
      </div>
    </main>
  )
}
