'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <button onClick={() => router.back()} className="text-white/50 hover:text-white text-sm mb-6 flex items-center gap-2 transition-colors">
          ← 뒤로
        </button>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">새 상세페이지</h1>
            <p className="text-white/40">제품 정보를 입력하면 AI가 자동으로 생성합니다</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">제품명 *</label>
              <input
                placeholder="예: 제주 유기농 녹차 추출 세럼"
                value={form.product_name}
                onChange={e => setForm({ ...form, product_name: e.target.value })}
                required
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">카테고리 *</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                required
                className="w-full bg-slate-800 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="">카테고리 선택</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">제품 설명 *</label>
              <textarea
                placeholder="제품의 주요 특징, 효능, 타겟 고객 등을 자세히 입력해주세요. 더 자세할수록 AI가 더 좋은 상세페이지를 만들어줍니다."
                rows={5}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">제품 사진 (최대 3장)</label>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-purple-500/50 transition-all cursor-pointer">
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-4xl mb-2">📸</div>
                  <p className="text-white/50 text-sm">
                    {images.length > 0 ? `${images.length}장 선택됨` : '클릭해서 사진 업로드'}
                  </p>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg hover:opacity-90 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-purple-500/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI가 생성 중입니다...
                </span>
              ) : '상세페이지 생성 시작 →'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
