'use client'
import { useState, useEffect } from 'react'
import Logo from '@/components/Logo'

const DEMO_SECTIONS = [
  {
    id: 1,
    name: '후킹 헤드라인',
    title: '지금 피부가 보내는 SOS 신호, 무시하고 계신가요?',
    body: '매일 아침 거울을 볼 때마다 피부가 당기고 칙칙한 느낌이 드신가요? 수분크림을 아무리 발라도 2시간 후면 다시 건조해지는 분들을 위해 만들었습니다.',
    bg: '#FFFFFF',
    accent: '#000',
  },
  {
    id: 2,
    name: '제품 소개',
    title: '3중 히알루론산이 다른 이유 — 크기가 다르면 작용이 다릅니다',
    body: '고분자: 피부 표면 수분 필름 형성 · 중분자: 표피층 침투, 수분 저장 · 저분자: 진피층까지 침투, 속 건조 개선. 3가지 크기가 동시에 작용합니다.',
    bg: '#F8F9FA',
    accent: '#6366F1',
  },
  {
    id: 3,
    name: '핵심 특징',
    title: '비건 인증 × 피부과 테스트 완료 × 무향',
    body: '✓ 동물성 원료 0%  ✓ 알레르기 유발 향료 0%  ✓ 파라벤 미사용  ✓ 피부과 테스트 완료  ✓ 비건 소사이어티 공식 인증',
    bg: '#FFFFFF',
    accent: '#10B981',
  },
  {
    id: 4,
    name: '추천 대상',
    title: '이런 분께 꼭 맞습니다',
    body: '✓ 보습크림을 발라도 금방 건조해지는 분 ✓ 화장이 들뜨는 분 ✓ 민감성 피부로 새 제품이 걱정되는 분 ✓ 자극 없는 수분 앰플을 찾는 분',
    bg: '#F0F7FF',
    accent: '#3B82F6',
  },
  {
    id: 5,
    name: '고객 후기',
    title: '"민감한 피부인데 자극 없이 촉촉해졌어요"',
    body: '사용 2주 후: "민감한 피부라 새 제품 쓸 때마다 걱정했는데, 바르고 나서 당기거나 붉어지는 느낌이 전혀 없었어요. 피부 결이 확실히 달라졌습니다." — 이지윤, 32세',
    bg: '#FFFFFF',
    accent: '#F59E0B',
  },
  {
    id: 6,
    name: '구매 유도',
    title: '지금 바로 시작하세요 — 첫 구매 20% 할인',
    body: '지금 구매 시: 첫 구매 20% 할인 자동 적용 · 미니 사이즈 무료 증정 · 무료 배송 · 당일 출고. 오늘만 특가 — 재고 한정.',
    bg: '#FFF8E7',
    accent: '#F97316',
  },
]

const SEO_SCORE = 95
const SEO_ITEMS = [
  { label: '키워드 밀도',  score: 97, ok: true, color: '#10B981' },
  { label: '제목 최적화',  score: 93, ok: true, color: '#6366F1' },
  { label: '본문 길이',    score: 95, ok: true, color: '#3B82F6' },
  { label: 'CTA 강도',    score: 98, ok: true, color: '#F59E0B' },
  { label: '숫자 포함',   score: 92, ok: true, color: '#8B5CF6' },
  { label: '의문형 제목', score: 100, ok: true, color: '#EC4899' },
  { label: '섹션별 분량',  score: 96, ok: true, color: '#06B6D4' },
]

export default function ProductShowcase() {
  const [activeSection, setActiveSection] = useState(0)
  const [tab, setTab] = useState<'result' | 'seo' | 'blog'>('result')
  const [seoVisible, setSeoVisible] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSection(i => (i + 1) % DEMO_SECTIONS.length)
    }, 2500)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (tab === 'seo') {
      setTimeout(() => setSeoVisible(true), 200)
    } else {
      setSeoVisible(false)
    }
  }, [tab])

  return (
    <section className="max-w-6xl mx-auto px-5 md:px-6 py-12 md:py-20">
      {/* 섹션 헤더 */}
      <div className="text-center mb-10 md:mb-14">
        <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">실제 결과물</p>
        <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight leading-tight mb-3">
          30초 입력하면<br />
          <span className="text-gray-300">이렇게 나옵니다.</span>
        </h2>
        <p className="text-gray-400 text-sm">실제 서비스 화면 · 직접 편집 가능</p>
      </div>

      {/* 브라우저 목업 */}
      <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-2xl shadow-gray-200/60">

        {/* 브라우저 크롬 */}
        <div className="bg-gray-100 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded-lg px-4 py-1.5 flex items-center gap-2 max-w-md mx-auto">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs text-gray-400 font-mono">pageai.kr/order/abc123</span>
          </div>
        </div>

        {/* 앱 헤더 */}
        <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Logo size={26} />
            <div className="min-w-0">
              <p className="text-xs font-black text-black truncate">비건 히알루론산 앰플 50ml</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-medium">뷰티/화장품</span>
                <span className="flex items-center gap-1 text-[9px] text-green-600 font-bold">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />생성 완료
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {(['result', 'seo', 'blog'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                  tab === t ? 'bg-black text-white' : 'text-gray-400 hover:text-black'
                }`}
              >
                {t === 'result' ? '📄 결과물' : t === 'seo' ? '📊 SEO' : '📝 블로그'}
              </button>
            ))}
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="bg-gray-50" style={{ height: '480px', overflow: 'hidden' }}>

          {/* 결과물 탭 */}
          {tab === 'result' && (
            <div className="flex h-full">
              {/* 섹션 목록 사이드바 */}
              <div className="w-36 md:w-44 bg-white border-r border-gray-100 py-3 shrink-0 overflow-y-auto">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest px-3 mb-2">섹션 목록</p>
                {DEMO_SECTIONS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(i)}
                    className={`w-full text-left px-3 py-2.5 text-xs transition-all border-l-2 ${
                      activeSection === i
                        ? 'border-black bg-gray-50 font-black text-black'
                        : 'border-transparent text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    <span className="block text-[9px] text-gray-300 mb-0.5">섹션 {s.id}</span>
                    {s.name}
                  </button>
                ))}
              </div>

              {/* 섹션 프리뷰 */}
              <div className="flex-1 overflow-hidden relative">
                {DEMO_SECTIONS.map((s, i) => (
                  <div
                    key={s.id}
                    className="absolute inset-0 p-6 md:p-8 transition-all duration-500 flex flex-col justify-between"
                    style={{
                      backgroundColor: s.bg,
                      opacity: activeSection === i ? 1 : 0,
                      transform: activeSection === i ? 'translateY(0)' : 'translateY(20px)',
                      pointerEvents: activeSection === i ? 'auto' : 'none',
                    }}
                  >
                    <div>
                      {/* 섹션 배지 */}
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className="text-[10px] font-black px-2.5 py-1 rounded-full text-white"
                          style={{ backgroundColor: s.accent }}
                        >
                          {s.name}
                        </span>
                        <span className="text-[10px] text-gray-300 font-medium">클릭해서 편집 가능</span>
                      </div>

                      {/* 제목 */}
                      <h3 className="text-lg md:text-2xl font-black text-black leading-tight mb-4 tracking-tight">
                        {s.title}
                      </h3>

                      {/* 본문 */}
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {s.body}
                      </p>
                    </div>

                    {/* 하단 툴바 */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100 mt-4">
                      <button className="text-[10px] bg-black text-white px-3 py-1.5 rounded-lg font-bold">편집</button>
                      <button className="text-[10px] text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg">AI 재생성</button>
                      <div className="ml-auto flex items-center gap-1">
                        {DEMO_SECTIONS.map((_, j) => (
                          <div
                            key={j}
                            className="w-1.5 h-1.5 rounded-full transition-all"
                            style={{ backgroundColor: j === activeSection ? '#000' : '#E5E7EB' }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO 분석 탭 */}
          {tab === 'seo' && (
            <div className="p-5 h-full overflow-y-auto bg-white">
              <div className="flex items-center gap-5 mb-5">
                {/* 점수 원 */}
                <div className="shrink-0 relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#F3F4F6" strokeWidth="7" />
                    <circle
                      cx="40" cy="40" r="32" fill="none"
                      stroke="#10B981" strokeWidth="7"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={seoVisible ? `${2 * Math.PI * 32 * (1 - SEO_SCORE / 100)}` : `${2 * Math.PI * 32}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1.4s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-black">{seoVisible ? SEO_SCORE : 0}</span>
                    <span className="text-[8px] text-gray-400 font-bold">/ 100</span>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">SEO 종합 점수</p>
                  <p className="text-xl font-black text-black">최상위 수준</p>
                  <p className="text-[10px] text-gray-400 leading-relaxed mt-0.5">
                    검색 상위 노출 최적화 완료<br />
                    7개 항목 모두 통과 ✅
                  </p>
                </div>
                <div className="ml-auto shrink-0 flex flex-col items-center bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                  <span className="text-[9px] text-green-600 font-black">7/7 통과</span>
                  <span className="text-lg font-black text-green-600">100%</span>
                </div>
              </div>

              {/* 항목별 점수 */}
              <div className="space-y-2">
                {SEO_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-green-500 text-[10px] shrink-0">✓</span>
                    <span className="text-[10px] font-bold text-gray-700 w-20 shrink-0">{item.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-1000"
                        style={{
                          width: seoVisible ? `${item.score}%` : '0%',
                          backgroundColor: item.color,
                          transitionDelay: `${i * 100}ms`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-black w-7 text-right shrink-0" style={{ color: item.color }}>{item.score}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-[9px] font-black text-green-700 mb-1.5">✓ AI가 자동으로 최적화한 항목</p>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    '숫자 포함 제목 4개',
                    '"히알루론산" 키워드 6회',
                    'CTA 문구 3개 삽입',
                    '의문형 헤드라인 포함',
                    '섹션당 평균 160자',
                    '제목 평균 22자 최적',
                  ].map((t, i) => (
                    <p key={i} className="text-[9px] text-green-600 flex items-center gap-1">
                      <span>·</span> {t}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 블로그 탭 */}
          {tab === 'blog' && (
            <div className="flex h-full">
              {/* 플랫폼 선택 */}
              <div className="w-28 md:w-36 bg-white border-r border-gray-100 py-3 shrink-0">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest px-3 mb-2">플랫폼</p>
                {[
                  { name: '네이버 블로그', icon: '🟢', active: true,  url: 'blog.naver.com' },
                  { name: '티스토리',     icon: '🟠', active: false, url: 'tistory.com' },
                  { name: '워드프레스',   icon: '🔵', active: false, url: 'wordpress.com' },
                  { name: '브런치',       icon: '⚫', active: false, url: 'brunch.co.kr' },
                  { name: '인스타캡션',   icon: '🟣', active: false, url: 'instagram.com' },
                  { name: 'PDF',          icon: '🔴', active: false, url: 'export.pdf' },
                ].map((p, i) => (
                  <button key={i} className={`w-full text-left px-3 py-2 text-[10px] transition-all border-l-2 ${
                    p.active ? 'border-black bg-gray-50 font-black text-black' : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}>
                    <span className="mr-1">{p.icon}</span>{p.name}
                  </button>
                ))}
              </div>
              {/* 미리보기 */}
              <div className="flex-1 overflow-y-auto bg-white p-4">
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  {/* 네이버 블로그 헤더 */}
                  <div className="bg-[#03C75A] px-4 py-2 flex items-center gap-2">
                    <span className="text-white font-black text-xs">N</span>
                    <span className="text-white text-[10px]">blog.naver.com/mystore</span>
                  </div>
                  <div className="p-4 space-y-3 bg-white">
                    <h3 className="text-sm font-black text-black leading-snug">지금 피부가 보내는 SOS 신호, 무시하고 계신가요?</h3>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">#히알루론산앰플</span>
                      <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">#비건화장품</span>
                      <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">#수분앰플추천</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2.5 bg-gray-100 rounded w-full" />
                      <div className="h-2.5 bg-gray-100 rounded w-5/6" />
                      <div className="h-2.5 bg-gray-100 rounded w-4/5" />
                    </div>
                    <div className="bg-gray-50 rounded-xl h-20 flex items-center justify-center">
                      <span className="text-[9px] text-gray-300">📷 제품 이미지 자동 삽입</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-gray-700">3중 히알루론산이 다른 이유 — 크기가 다르면 작용이 다릅니다</p>
                      <div className="h-2 bg-gray-100 rounded w-full" />
                      <div className="h-2 bg-gray-100 rounded w-3/4" />
                    </div>
                  </div>
                </div>
                <button className="mt-3 w-full bg-[#03C75A] text-white py-2.5 rounded-xl text-xs font-black hover:opacity-90 transition-all">
                  ↗ HTML 복사해서 블로그에 붙여넣기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 하단 상태 바 */}
        <div className="bg-white border-t border-gray-100 px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-[10px] text-gray-400 font-medium">생성 완료 · 45초 소요</span>
            </div>
            <span className="text-[10px] text-gray-200">|</span>
            <span className="text-[10px] text-gray-400">6개 섹션 · 총 1,240자</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-[10px] text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg font-medium hover:border-gray-400 transition-all">PDF 다운</button>
            <button className="text-[10px] bg-black text-white px-3 py-1.5 rounded-lg font-black">✦ AI 수정 요청</button>
          </div>
        </div>
      </div>

      {/* 입력 정보 표시 */}
      <div className="mt-6 bg-gray-50 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase">입력</span>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-lg font-medium text-gray-700">비건 히알루론산 앰플 50ml</span>
              <span className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-lg font-medium text-gray-500">뷰티/화장품</span>
              <span className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-lg font-medium text-gray-500">🇰🇷 한국어</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
          <span className="text-green-500 font-bold">✓</span>
          <span>30초 입력 → 45초 생성</span>
        </div>
      </div>
    </section>
  )
}
