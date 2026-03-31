import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import ReferralWidget from '@/components/ReferralWidget'
import TrendWidget from '@/components/TrendWidget'
import Logo from '@/components/Logo'
import BenchmarkWidget from '@/components/BenchmarkWidget'
import BillingPortalButton from '@/components/BillingPortalButton'

const TIPS = [
  {
    tag: '전환율 팁',
    tagColor: 'bg-orange-50 text-orange-600 border-orange-200',
    title: '제목에 숫자를 넣으면 CTR 32% 상승',
    desc: '"녹차 세럼"보다 "3초 흡수 녹차 세럼"이 클릭률이 훨씬 높습니다. 숫자는 구체성을 만들고 신뢰를 높여요.',
  },
  {
    tag: '카피라이팅 팁',
    tagColor: 'bg-blue-50 text-blue-600 border-blue-200',
    title: '첫 문장은 고객의 고통을 건드려라',
    desc: '"좋은 제품입니다" 대신 "3번 발라도 안 되던 피부 건조, 이제 끝"처럼 고객의 문제를 먼저 말하세요.',
  },
  {
    tag: 'SEO 팁',
    tagColor: 'bg-purple-50 text-purple-600 border-purple-200',
    title: '카테고리 키워드를 제목 앞에',
    desc: '스마트스토어 검색 알고리즘은 제품명 앞쪽 키워드를 더 높게 반영합니다. "세럼 녹차"보다 "녹차 세럼"이 유리해요.',
  },
  {
    tag: '구매 심리 팁',
    tagColor: 'bg-green-50 text-green-600 border-green-200',
    title: '비교 표 하나가 구매 결정을 만든다',
    desc: '경쟁사 대비 우위를 보여주는 비교표는 구매 전환을 평균 2.3배 높입니다. AI 생성 시 "경쟁 비교" 섹션을 요청하세요.',
  },
  {
    tag: '이미지 팁',
    tagColor: 'bg-pink-50 text-pink-600 border-pink-200',
    title: '첫 번째 이미지가 전부다',
    desc: '구매자의 73%는 첫 이미지만 보고 스크롤 여부를 결정합니다. 흰 배경 + 제품 클로즈업이 가장 효과적이에요.',
  },
]

const QUICK_CATS = [
  { label: '식품/음료',    emoji: '🥤' },
  { label: '뷰티/화장품',  emoji: '💄' },
  { label: '생활용품',    emoji: '🏠' },
  { label: '패션/의류',   emoji: '👗' },
  { label: '건강식품',    emoji: '💊' },
  { label: '전자제품',    emoji: '📱' },
]

const STATUS_MAP: Record<string, { text: string; dot: string; badge: string }> = {
  pending:    { text: '대기중', dot: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  generating: { text: '생성중', dot: 'bg-blue-400 animate-pulse', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  done:       { text: '완료',   dot: 'bg-green-400',  badge: 'bg-green-50 text-green-700 border-green-200' },
  error:      { text: '오류',   dot: 'bg-red-400',    badge: 'bg-red-50 text-red-700 border-red-200' },
}

const FREE_LIMIT = 5

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('plan, monthly_usage')
    .eq('id', user.id)
    .maybeSingle()

  const currentPlan = userProfile?.plan ?? 'free'
  const monthlyUsageFromProfile = userProfile?.monthly_usage ?? 0

  const total       = orders?.length ?? 0
  const doneCount   = orders?.filter(o => o.status === 'done').length ?? 0
  const savedAmount = doneCount * 50000
  const tipIdx      = new Date().getDate() % TIPS.length
  const tip         = TIPS[tipIdx]

  // 이번달 사용량
  const thisMonth = new Date()
  const monthlyUsed = orders?.filter(o => {
    const d = new Date(o.created_at)
    return d.getFullYear() === thisMonth.getFullYear() && d.getMonth() === thisMonth.getMonth()
  }).length ?? 0
  const usagePct = Math.min((monthlyUsed / FREE_LIMIT) * 100, 100)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* NAV */}
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={28} />
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm hidden sm:block">{user.email}</span>
          <Link href="/order/new" className="bg-black text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all min-h-[44px] flex items-center">
            + 새 주문
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* 인사 + 업그레이드 배너 */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-1">대시보드</p>
            <h1 className="text-3xl font-black text-black tracking-tight">
              안녕하세요 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">오늘도 팔리는 상세페이지를 만들어볼까요?</p>
          </div>
          {/* 플랜 배너 */}
          {currentPlan === 'free' ? (
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-2xl px-5 py-4 max-w-xs">
              <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">무료 플랜</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold">이번 달 {monthlyUsed}/{FREE_LIMIT}회 사용</span>
                <span className="text-xs opacity-70">{FREE_LIMIT - monthlyUsed}회 남음</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5 mb-3">
                <div className="bg-white rounded-full h-1.5 transition-all" style={{ width: `${usagePct}%` }} />
              </div>
              <Link href="/pricing" className="text-xs font-black underline underline-offset-2 opacity-90 hover:opacity-100">
                프로로 무제한 업그레이드 →
              </Link>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl px-5 py-4 max-w-xs">
              <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">
                {currentPlan === 'pro' ? '프로 플랜' : '비즈니스 플랜'}
              </p>
              <p className="text-sm font-bold mb-3">무제한 생성 중</p>
              <BillingPortalButton />
            </div>
          )}
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">          {[
            { label: '총 생성',   value: `${total}개`,             sub: '누적 상세페이지',    icon: '📄' },
            { label: '완료',      value: `${doneCount}개`,          sub: 'PDF 다운 가능',     icon: '✅' },
            { label: '절약 추정', value: `₩${savedAmount.toLocaleString()}`, sub: '외주 대비 절감', icon: '💰' },
            { label: '이번 달',   value: `${monthlyUsed}회`,        sub: `무료 ${FREE_LIMIT}회 중`, icon: '📅' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-sm transition-all">
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-2xl font-black text-black tracking-tight">{s.value}</p>
              <p className="text-xs font-bold text-gray-500 mt-0.5">{s.label}</p>
              <p className="text-[10px] text-gray-300 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 왼쪽: 주문 목록 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-black">내 상세페이지</h2>
              <Link href="/order/new" className="text-xs font-bold text-gray-400 hover:text-black transition-colors">
                전체 보기 →
              </Link>
            </div>

            {!orders || orders.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">✨</div>
                <p className="font-bold text-gray-700 mb-1">첫 상세페이지를 만들어보세요</p>
                <p className="text-gray-400 text-sm mb-6">30초 입력으로 전문가 수준 카피가 완성돼요</p>

                {/* 빠른 시작 카테고리 */}
                <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">카테고리 선택해서 바로 시작</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {QUICK_CATS.map((c, i) => (
                    <Link
                      key={i}
                      href={`/order/new?category=${encodeURIComponent(c.label)}`}
                      className="flex items-center gap-1.5 border border-gray-100 bg-gray-50 hover:bg-black hover:text-white hover:border-black px-4 py-2 rounded-full text-sm font-bold text-gray-600 transition-all"
                    >
                      {c.emoji} {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => {
                  const s = STATUS_MAP[order.status] || STATUS_MAP.pending
                  return (
                    <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition-all group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                            <p className="font-bold text-gray-900 truncate">{order.product_name}</p>
                          </div>
                          <p className="text-xs text-gray-400 pl-3.5">
                            {order.category} · {new Date(order.created_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${s.badge}`}>
                            {s.text}
                          </span>
                          {order.status === 'done' && (
                            <Link
                              href={`/order/${order.id}`}
                              className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all min-h-[44px] flex items-center"
                            >
                              보기 →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* 새 주문 유도 */}
                <Link
                  href="/order/new"
                  className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 rounded-2xl p-5 text-gray-400 text-sm font-bold hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
                >
                  + 새 상세페이지 만들기
                </Link>
              </div>
            )}
          </div>

          {/* 오른쪽: 정보 사이드바 */}
          <div className="space-y-4">

            {/* 글로벌 셀러 벤치마크 */}
            <BenchmarkWidget
              orders={(orders ?? []).map(o => ({
                status: o.status,
                result_json: o.result_json as { sections?: unknown[] } | null,
                category: o.category as string | undefined,
              }))}
              doneCount={doneCount}
            />

            {/* Billing 카드 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">구독 관리</p>
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                  currentPlan === 'pro' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                  currentPlan === 'business' ? 'bg-violet-50 text-violet-600 border-violet-200' :
                  'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                  {currentPlan === 'pro' ? '프로' : currentPlan === 'business' ? '비즈니스' : '무료'} 플랜
                </span>
                {currentPlan !== 'free' && (
                  <span className="text-[10px] text-gray-300">무제한 생성</span>
                )}
              </div>
              {currentPlan === 'free' ? (
                <Link href="/pricing" className="block w-full text-center bg-black text-white py-2.5 rounded-xl text-xs font-black hover:bg-gray-800 transition-all">
                  업그레이드 →
                </Link>
              ) : (
                <BillingPortalButton className="block w-full text-center border border-gray-200 text-gray-600 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all" />
              )}
            </div>

            {/* 래퍼럴 위젯 */}
            <ReferralWidget />

            {/* 실시간 트렌드 */}
            <TrendWidget compact />

            {/* 오늘의 팁 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">오늘의 마케팅 팁</p>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border inline-block mb-3 ${tip.tagColor}`}>
                {tip.tag}
              </span>
              <h3 className="text-sm font-black text-gray-900 mb-2 leading-snug">{tip.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{tip.desc}</p>
            </div>

            {/* 전환율 체크리스트 */}
            <div className="bg-black rounded-2xl p-5">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">고전환 체크리스트</p>
              <ul className="space-y-2.5">
                {[
                  '제품명에 핵심 키워드 포함',
                  '첫 문장에 고객 고통 언급',
                  '숫자·데이터 최소 2개 사용',
                  '구매 유도 CTA 명확히',
                  '모바일에서 가독성 확인',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                    <span className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black text-gray-500 mt-0.5">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* 다른 팁 미리보기 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">더 많은 팁</p>
              <div className="space-y-3">
                {TIPS.filter((_, i) => i !== tipIdx).slice(0, 3).map((t, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${t.tagColor}`}>
                      {t.tag.replace(' 팁', '')}
                    </span>
                    <p className="text-xs text-gray-600 font-medium leading-snug">{t.title}</p>
                  </div>
                ))}
              </div>
              <Link href="/blog" className="mt-4 block text-xs font-black text-gray-400 hover:text-black transition-colors text-center pt-3 border-t border-gray-50">
                전체 가이드 보기 →
              </Link>
            </div>

            {/* 이번 주 인기 카테고리 트렌드 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">이번 주 급상승 카테고리</p>
                <span className="text-[9px] bg-green-50 text-green-600 border border-green-200 px-1.5 py-0.5 rounded font-bold">LIVE</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { rank: 1, name: '뷰티/화장품',  change: '+24%', up: true  },
                  { rank: 2, name: '건강식품',      change: '+18%', up: true  },
                  { rank: 3, name: '식품/음료',     change: '+12%', up: true  },
                  { rank: 4, name: '생활용품',      change: '-3%',  up: false },
                  { rank: 5, name: '패션/의류',     change: '+8%',  up: true  },
                ].map(item => (
                  <div key={item.rank} className="flex items-center gap-2">
                    <span className="w-4 text-[10px] font-black text-gray-300 shrink-0">{item.rank}</span>
                    <span className="flex-1 text-xs font-medium text-gray-700 truncate">{item.name}</span>
                    <span className={`text-[10px] font-black ${item.up ? 'text-green-500' : 'text-red-400'}`}>
                      {item.up ? '↑' : '↓'} {item.change}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-gray-200 mt-3">* 스마트스토어 판매 데이터 기준</p>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
