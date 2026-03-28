'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const CATEGORIES = [
  { group: '📦 제품·쇼핑몰', items: [
    { value: 'food',        label: '식품/음료' },
    { value: 'beauty',      label: '뷰티/화장품' },
    { value: 'living',      label: '생활용품' },
    { value: 'fashion',     label: '패션/의류' },
    { value: 'electronics', label: '전자제품' },
    { value: 'health',      label: '건강기능식품' },
    { value: 'pet',         label: '반려동물' },
    { value: 'sports',      label: '스포츠/레저' },
    { value: 'baby',        label: '육아/아동' },
  ]},
  { group: '🚗 자동차·모빌리티', items: [
    { value: 'used_car',    label: '중고차 판매' },
    { value: 'new_car',     label: '신차/리스' },
    { value: 'car_service', label: '자동차 시공 (썬팅/랩핑/블박)' },
    { value: 'car_repair',  label: '자동차 정비/수리' },
  ]},
  { group: '🏠 인테리어·시공', items: [
    { value: 'interior',    label: '인테리어 시공' },
    { value: 'window',      label: '창호/도어' },
    { value: 'cleaning',    label: '청소/방역' },
    { value: 'moving',      label: '이사/운반' },
    { value: 'construction',label: '건설/리모델링' },
  ]},
  { group: '🍽️ 음식·F&B', items: [
    { value: 'restaurant',  label: '음식점/식당' },
    { value: 'cafe',        label: '카페/디저트' },
    { value: 'delivery',    label: '배달 전문점' },
    { value: 'franchise',   label: '프랜차이즈' },
  ]},
  { group: '📚 교육·서비스', items: [
    { value: 'academy',     label: '학원/교습소' },
    { value: 'coaching',    label: '코칭/컨설팅' },
    { value: 'medical',     label: '병원/의원/한의원' },
    { value: 'beauty_shop', label: '미용실/네일/피부관리' },
    { value: 'fitness',     label: '헬스장/요가/필라테스' },
  ]},
  { group: '🏢 부동산·금융', items: [
    { value: 'realestate',  label: '부동산 매물' },
    { value: 'pension',     label: '펜션/숙박' },
    { value: 'travel',      label: '여행 상품' },
    { value: 'insurance',   label: '보험/금융' },
  ]},
  { group: '💻 IT·디지털', items: [
    { value: 'saas',        label: 'SaaS/앱/소프트웨어' },
    { value: 'it_service',  label: 'IT 개발·외주' },
    { value: 'design',      label: '디자인/마케팅 대행' },
  ]},
  { group: '기타', items: [
    { value: 'other',       label: '기타 (직접 설명)' },
  ]},
]

const FREE_LIMIT = 5

export default function NewOrderPage() {
  const router  = useRouter()
  const supabase = createClient()
  const [loading, setLoading]         = useState(false)
  const [images, setImages]           = useState<File[]>([])
  const [form, setForm]               = useState({ product_name: '', category: '', description: '' })
  const [monthlyUsed, setMonthlyUsed] = useState(0)
  const [showUpgrade, setShowUpgrade] = useState(false)

  // 이번 달 사용량 로드
  useEffect(() => {
    async function loadUsage() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const { count } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth)
        .neq('status', 'error')
      setMonthlyUsed(count ?? 0)
    }
    loadUsage()
  }, [])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length > 3) { toast.error('이미지는 최대 3장까지'); return }
    setImages(files)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.product_name || !form.category || !form.description) {
      toast.error('모든 항목을 입력해주세요'); return
    }

    // 클라이언트 사전 체크 (무료 제한)
    if (monthlyUsed >= FREE_LIMIT) {
      setShowUpgrade(true); return
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

      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'LIMIT_EXCEEDED') { setShowUpgrade(true); return }
        throw new Error(data.message || '생성 실패')
      }

      toast.success('완성됐습니다!')
      router.push(`/order/${order.id}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const remaining = Math.max(FREE_LIMIT - monthlyUsed, 0)
  const usagePct  = Math.min((monthlyUsed / FREE_LIMIT) * 100, 100)

  return (
    <main className="min-h-screen bg-white">
      {/* 업그레이드 모달 */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">🔒</div>
            <h2 className="text-2xl font-black text-black text-center tracking-tight mb-2">
              무료 한도에 도달했어요
            </h2>
            <p className="text-gray-400 text-sm text-center leading-relaxed mb-6">
              이번 달 무료 생성 <strong className="text-black">{FREE_LIMIT}회</strong>를 모두 사용했습니다.<br />
              프로 플랜으로 업그레이드하면 무제한으로 생성할 수 있어요.
            </p>
            <div className="bg-black rounded-2xl p-5 mb-4">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">프로 플랜</p>
              <p className="text-3xl font-black text-white mb-1">₩29,000<span className="text-gray-500 text-sm font-normal">/월</span></p>
              <ul className="space-y-1.5 mt-3">
                {['무제한 상세페이지 생성', '우선순위 AI 처리', 'A/B 버전 자동 생성'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center text-[9px] text-white font-black">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/#pricing"
              className="w-full bg-black text-white py-4 rounded-2xl font-black text-sm text-center block hover:bg-gray-800 transition-all mb-3"
            >
              프로 플랜 시작하기 →
            </Link>
            <button
              onClick={() => setShowUpgrade(false)}
              className="w-full text-gray-400 text-sm py-2 hover:text-black transition-colors"
            >
              다음 달까지 기다리기
            </button>
          </div>
        </div>
      )}

      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white text-[10px] font-black">AI</span>
          </div>
          <span className="font-bold text-lg tracking-tight">페이지AI</span>
        </Link>
        <Link href="/dashboard" className="text-gray-400 text-sm hover:text-black transition-colors">← 대시보드</Link>
      </nav>

      <div className="max-w-xl mx-auto px-8 py-16">
        <div className="mb-10">
          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-3">새 상세페이지</p>
          <h1 className="text-4xl font-black text-black tracking-tight mb-3">제품 정보 입력</h1>
          <p className="text-gray-400 text-sm leading-relaxed">정보를 입력하면 AI가 전환율 높은 상세페이지를 만들어드려요</p>
        </div>

        {/* 사용량 바 */}
        <div className={`rounded-2xl p-4 mb-8 border ${remaining === 0 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">이번 달 사용량</span>
            <span className={`text-xs font-black ${remaining === 0 ? 'text-orange-600' : 'text-gray-600'}`}>
              {monthlyUsed}/{FREE_LIMIT}회 사용
              {remaining > 0 ? ` · ${remaining}회 남음` : ' · 한도 초과'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${remaining === 0 ? 'bg-orange-500' : 'bg-black'}`}
              style={{ width: `${usagePct}%` }}
            />
          </div>
          {remaining === 0 && (
            <p className="text-xs text-orange-600 font-medium mt-2">
              무료 한도 초과 · <Link href="/#pricing" className="underline font-bold">프로 업그레이드</Link>로 무제한 사용
            </p>
          )}
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
              {CATEGORIES.map(group => (
                <optgroup key={group.group} label={group.group}>
                  {group.items.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </optgroup>
              ))}
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

            {/* 이미지 미리보기 */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {images.map((file, i) => (
                  <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`미리보기 ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-black text-white rounded-full text-xs font-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {i + 1}
                    </div>
                  </div>
                ))}
                {images.length < 3 && (
                  <label htmlFor="file-upload" className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all">
                    <span className="text-2xl text-gray-300">+</span>
                    <span className="text-xs text-gray-300 mt-1">추가</span>
                  </label>
                )}
              </div>
            )}

            {images.length === 0 && (
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-200 rounded-2xl p-10 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all">
                <div className="text-3xl mb-2">📸</div>
                <p className="text-sm font-semibold text-gray-500 mb-1">클릭해서 사진 업로드</p>
                <p className="text-xs text-gray-300">PNG, JPG, WEBP · 최대 3장</p>
              </label>
            )}

            <input id="file-upload" type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
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
