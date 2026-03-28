'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'

const CATEGORIES = [
  { value: 'food', label: '식품/음료' },
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
    if (files.length > 3) { toast.error('이미지는 최대 3장까지'); return }
    setImages(files)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.product_name || !form.category || !form.description) { toast.error('모든 항목을 입력해주세요'); return }
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
      toast.success('완성됐습니다!')
      router.push(`/order/${order.id}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg" />
          <span className="font-bold text-lg tracking-tight">페이지AI</span>
        </Link>
        <Link href="/dashboard" className="text-gray-400 text-sm hover:text-black transition-colors">← 대시보드</Link>
      </nav>

      <div className="max-w-xl mx-auto px-8 py-16">
        <div className="mb-12">
          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-3">새 상세페이지</p>
          <h1 className="text-4xl font-black text-black tracking-tight mb-3">제품 정보 입력</h1>
          <p className="text-gray-400 text-sm leading-relaxed">정보를 입력하면 AI가 전환율 높은 상세페이지를 만들어드려요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">제품명</label>
            <input
              placeholder="예: 제주 유기농 녹차 추출 세럼"
              value={form.product_name}
              onChange={e => setForm({ ...form, product_name: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">카테고리</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm bg-white"
            >
              <option value="">카테고리를 선택해주세요</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">제품 설명</label>
            <textarea
              placeholder="주요 특징, 효능, 성분, 타겟 고객을 자세히 입력해주세요. 더 자세할수록 더 좋은 상세페이지가 만들어집니다."
              rows={6}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              제품 사진 <span className="text-gray-300 normal-case font-normal">(최대 3장, 선택)</span>
            </label>
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-200 rounded-2xl p-10 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all">
              <div className="text-3xl mb-2">📸</div>
              <p className="text-sm font-semibold text-gray-500 mb-1">
                {images.length > 0 ? `${images.length}장 선택됨` : '클릭해서 사진 업로드'}
              </p>
              <p className="text-xs text-gray-300">PNG, JPG, WEBP</p>
              <input id="file-upload" type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-5 rounded-2xl font-bold text-base hover:bg-gray-800 disabled:opacity-40 transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AI가 상세페이지를 만드는 중...
              </>
            ) : '상세페이지 생성 시작 →'}
          </button>
        </form>
      </div>
    </main>
  )
}
