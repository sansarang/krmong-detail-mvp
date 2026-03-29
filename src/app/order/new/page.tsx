'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Logo from '@/components/Logo'

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
  { group: '📋 공공기관·관공서', items: [
    { value: 'press_release',  label: '보도자료' },
    { value: 'policy_pr',      label: '정책 홍보문' },
    { value: 'public_notice',  label: '공고문/공지사항' },
    { value: 'project_intro',  label: '사업 안내문' },
  ]},
  { group: '🏛️ 정부과제·R&D', items: [
    { value: 'gov_proposal',     label: '사업계획서' },
    { value: 'research_proposal',label: '연구 제안서' },
    { value: 'performance_report',label: '성과보고서' },
    { value: 'tech_intro',       label: '기술이전 소개서' },
  ]},
  { group: '📄 논문·학술', items: [
    { value: 'paper_summary',   label: '논문 요약/소개' },
    { value: 'research_intro',  label: '연구 발표자료' },
    { value: 'patent_intro',    label: '특허 소개문' },
    { value: 'academic_report', label: '학술 보고서' },
  ]},
  { group: '📝 기획·IR·PR', items: [
    { value: 'business_proposal', label: '사업제안서' },
    { value: 'company_intro',     label: '회사 소개서' },
    { value: 'ir_pitch',          label: 'IR 피칭 문서' },
    { value: 'pr_article',        label: '보도자료/PR' },
  ]},
  { group: '기타', items: [
    { value: 'other', label: '기타 (직접 설명)' },
  ]},
]

const DOC_CATS = [
  'press_release','policy_pr','public_notice','project_intro',
  'gov_proposal','research_proposal','performance_report','tech_intro',
  'paper_summary','research_intro','patent_intro','academic_report',
  'business_proposal','company_intro','ir_pitch','pr_article',
]

const LANGUAGES = [
  { value: 'ko', label: '🇰🇷 한국어' },
  { value: 'en', label: '🇺🇸 English' },
  { value: 'ja', label: '🇯🇵 日本語' },
  { value: 'zh', label: '🇨🇳 中文' },
]

function getLabels(category: string) {
  if (DOC_CATS.includes(category)) return {
    nameLabel: '문서/프로젝트 제목',
    namePlaceholder: '예: 2025년 스마트시티 R&D 사업 제안서',
    descLabel: '핵심 내용 요약',
    descPlaceholder: '문서의 핵심 내용, 목적, 대상, 주요 성과 또는 특징을 입력하세요. 직접 문서 내용을 붙여넣기 해도 됩니다.',
    buttonText: '문서 초안 생성 →',
    title: '문서 정보 입력',
    subtitle: '내용을 입력하면 AI가 전문적인 문서 초안을 만들어드려요',
  }
  return {
    nameLabel: '제품/서비스명',
    namePlaceholder: '예: 제주 유기농 녹차 추출 세럼',
    descLabel: '제품/서비스 설명',
    descPlaceholder: '주요 특징, 효능, 성분, 타겟 고객을 자세히 입력해주세요. 더 자세할수록 더 좋은 상세페이지가 만들어집니다.',
    buttonText: '상세페이지 생성 시작 →',
    title: '제품 정보 입력',
    subtitle: '정보를 입력하면 AI가 전환율 높은 상세페이지를 만들어드려요',
  }
}

const FREE_LIMIT = 5

export default function NewOrderPage() {
  const router  = useRouter()
  const supabase = createClient()
  const [loading, setLoading]         = useState(false)
  const [images, setImages]           = useState<File[]>([])
  const [docText, setDocText]         = useState('')
  const [outputLang, setOutputLang]   = useState('ko')
  const [form, setForm]               = useState({ product_name: '', category: '', description: '' })
  const [monthlyUsed, setMonthlyUsed] = useState(0)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const docInputRef = useRef<HTMLInputElement>(null)

  const isDocCat = DOC_CATS.includes(form.category)
  const labels = getLabels(form.category)

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

  function handleDocFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader()
      reader.onload = ev => setDocText(ev.target?.result as string)
      reader.readAsText(file)
      toast.success('파일 내용을 불러왔습니다')
    } else {
      toast.info('PDF/HWP/DOCX는 파일을 열어 내용을 복사 후 아래에 붙여넣기 해주세요')
    }
    if (docInputRef.current) docInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.product_name || !form.category || !form.description) {
      toast.error('모든 항목을 입력해주세요'); return
    }

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

      // 문서 카테고리: docText를 description에 합쳐서 전달
      const combinedDesc = docText.trim()
        ? `${form.description}\n\n[첨부 문서 내용]\n${docText.trim()}`
        : form.description

      const { data: order, error } = await supabase
        .from('orders')
        .insert({ user_id: user.id, ...form, description: combinedDesc, image_urls: imageUrls, status: 'pending' })
        .select().single()
      if (error) throw error

      toast.success('AI가 문서를 생성 중입니다...')
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, outputLang }),
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
          <Logo size={28} />
        </Link>
        <Link href="/dashboard" className="text-gray-400 text-sm hover:text-black transition-colors">← 대시보드</Link>
      </nav>

      <div className="max-w-xl mx-auto px-8 py-16">
        <div className="mb-10">
          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-3">새 문서 생성</p>
          <h1 className="text-4xl font-black text-black tracking-tight mb-3">{labels.title}</h1>
          <p className="text-gray-400 text-sm leading-relaxed">{labels.subtitle}</p>
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
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{labels.nameLabel}</label>
            <input
              placeholder={labels.namePlaceholder}
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
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              출력 언어 <span className="text-gray-300 normal-case font-normal">(AI가 이 언어로 작성합니다)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => setOutputLang(lang.value)}
                  className={`py-3 rounded-2xl text-sm font-bold border transition-all ${
                    outputLang === lang.value
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{labels.descLabel}</label>
            <textarea
              placeholder={labels.descPlaceholder}
              rows={6}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm resize-none"
            />
          </div>

          {/* 문서 카테고리: 파일 업로드 + 텍스트 붙여넣기 */}
          {isDocCat && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                문서 첨부 <span className="text-gray-300 normal-case font-normal">(선택 · TXT/MD 자동 추출, PDF/HWP는 내용 붙여넣기)</span>
              </label>
              <div className="flex gap-2 mb-3">
                <label className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-100 transition-all text-sm text-gray-600 font-medium">
                  <span>📎</span> 파일 선택
                  <input ref={docInputRef} type="file" accept=".txt,.md,.csv" className="hidden" onChange={handleDocFile} />
                </label>
                {docText && (
                  <button type="button" onClick={() => setDocText('')} className="text-xs text-gray-400 hover:text-red-500 transition-colors px-3">
                    × 초기화
                  </button>
                )}
              </div>
              <textarea
                placeholder="또는 PDF/HWP/DOCX 내용을 여기에 직접 붙여넣기 하세요..."
                rows={4}
                value={docText}
                onChange={e => setDocText(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm resize-none bg-gray-50"
              />
              {docText && (
                <p className="text-xs text-green-600 font-medium mt-1.5">
                  ✓ {docText.length.toLocaleString()}자 문서 내용 추가됨 — AI가 참고하여 작성합니다
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {isDocCat ? '참고 이미지' : '제품 사진'} <span className="text-gray-300 normal-case font-normal">(최대 3장, 선택)</span>
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
                AI가 생성 중입니다...
              </>
            ) : labels.buttonText}
          </button>
        </form>
      </div>
    </main>
  )
}
