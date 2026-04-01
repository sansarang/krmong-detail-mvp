import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import ReferralWidget from '@/components/ReferralWidget'
import TrendWidget from '@/components/TrendWidget'
import Logo from '@/components/Logo'
import BenchmarkWidget from '@/components/BenchmarkWidget'
import BillingPortalButton from '@/components/BillingPortalButton'
import LogoutButton from '@/components/LogoutButton'
import DeleteOrderButton from '@/components/DeleteOrderButton'
import type { UiLang } from '@/lib/uiLocale'

// ── 다국어 번역 ────────────────────────────────────────────────
const T = {
  ko: {
    dashboard: '대시보드', hello: '안녕하세요 👋',
    sub: '오늘도 팔리는 상세페이지를 만들어볼까요?',
    newOrder: '+ 새 주문', logout: '로그아웃',
    freePlan: '무료 플랜', usageOf: (used: number, max: number) => `이번 달 ${used}/${max}회 사용`,
    remaining: (n: number) => `${n}회 남음`,
    upgradeLink: '프로로 무제한 업그레이드 →',
    proPlan: '프로 플랜', bizPlan: '비즈니스 플랜', unlimited: '무제한 생성 중',
    statTotal: '총 생성', statDone: '완료', statSaved: '절약 추정', statMonth: '이번 달',
    statSub1: '누적 상세페이지', statSub2: 'PDF 다운 가능', statSub3: '외주 대비 절감', statSub4: (n: number) => `무료 ${n}회 중`,
    myPages: '내 상세페이지', viewAll: '전체 보기 →',
    emptyTitle: '첫 상세페이지를 만들어보세요',
    emptySub: '30초 입력으로 전문가 수준 카피가 완성돼요',
    quickStart: '카테고리 선택해서 바로 시작',
    newPage: '+ 새 상세페이지 만들기',
    view: '보기 →', del: '삭제',
    billing: '구독 관리', billingFree: '무료', billingPro: '프로', billingBiz: '비즈니스',
    billingUnlimited: '무제한 생성', upgrade: '업그레이드 →',
    nextBill: (d: string) => `다음 결제일: ${d}`,
    todayTip: '오늘의 마케팅 팁', moreTips: '더 많은 팁', allGuides: '전체 가이드 보기 →',
    trending: '이번 주 급상승 카테고리',
    checklist: '고전환 체크리스트',
    checkItems: ['제품명에 핵심 키워드 포함', '첫 문장에 고객 고통 언급', '숫자·데이터 최소 2개 사용', '구매 유도 CTA 명확히', '모바일에서 가독성 확인'],
    status: { pending: '대기중', generating: '생성중', done: '완료', error: '오류' },
    trendData: [
      { rank: 1, name: '뷰티/화장품', change: '+24%', up: true },
      { rank: 2, name: '건강식품', change: '+18%', up: true },
      { rank: 3, name: '식품/음료', change: '+12%', up: true },
      { rank: 4, name: '생활용품', change: '-3%', up: false },
      { rank: 5, name: '패션/의류', change: '+8%', up: true },
    ],
    quickCats: [
      { label: '식품/음료', emoji: '🥤' }, { label: '뷰티/화장품', emoji: '💄' },
      { label: '생활용품', emoji: '🏠' }, { label: '패션/의류', emoji: '👗' },
      { label: '건강식품', emoji: '💊' }, { label: '전자제품', emoji: '📱' },
    ],
    formSection: '📋 양식 자동 작성',
    formSectionSub: '채워야 할 양식·과제를 붙여넣으면 AI가 빈칸을 자동으로 완성해드립니다',
    formStart: '양식 작성 시작 →',
    formExamples: ['사업계획서', '과제 제출물', '제안서', '신청서', '보고서'],
    tips: [
      { tag: '전환율 팁', tagColor: 'bg-orange-50 text-orange-600 border-orange-200', title: '제목에 숫자를 넣으면 CTR 32% 상승', desc: '"녹차 세럼"보다 "3초 흡수 녹차 세럼"이 클릭률이 훨씬 높습니다. 숫자는 구체성을 만들고 신뢰를 높여요.' },
      { tag: '카피라이팅 팁', tagColor: 'bg-blue-50 text-blue-600 border-blue-200', title: '첫 문장은 고객의 고통을 건드려라', desc: '"좋은 제품입니다" 대신 "3번 발라도 안 되던 피부 건조, 이제 끝"처럼 고객의 문제를 먼저 말하세요.' },
      { tag: 'SEO 팁', tagColor: 'bg-purple-50 text-purple-600 border-purple-200', title: '카테고리 키워드를 제목 앞에', desc: '스마트스토어 검색 알고리즘은 제품명 앞쪽 키워드를 더 높게 반영합니다.' },
      { tag: '구매 심리 팁', tagColor: 'bg-green-50 text-green-600 border-green-200', title: '비교 표 하나가 구매 결정을 만든다', desc: '경쟁사 대비 우위를 보여주는 비교표는 구매 전환을 평균 2.3배 높입니다.' },
      { tag: '이미지 팁', tagColor: 'bg-pink-50 text-pink-600 border-pink-200', title: '첫 번째 이미지가 전부다', desc: '구매자의 73%는 첫 이미지만 보고 스크롤 여부를 결정합니다.' },
    ],
  },
  en: {
    dashboard: 'Dashboard', hello: 'Hello 👋',
    sub: 'Ready to create another high-converting product page?',
    newOrder: '+ New Order', logout: 'Log out',
    freePlan: 'Free Plan', usageOf: (used: number, max: number) => `${used}/${max} this month`,
    remaining: (n: number) => `${n} left`,
    upgradeLink: 'Upgrade to Pro — Unlimited →',
    proPlan: 'Pro Plan', bizPlan: 'Business Plan', unlimited: 'Unlimited generations',
    statTotal: 'Total', statDone: 'Done', statSaved: 'Saved', statMonth: 'This month',
    statSub1: 'Cumulative pages', statSub2: 'PDF ready', statSub3: 'vs outsourcing', statSub4: (n: number) => `of ${n} free`,
    myPages: 'My Pages', viewAll: 'View all →',
    emptyTitle: 'Create your first product page',
    emptySub: 'Fill in 30 seconds, get expert-level copy instantly',
    quickStart: 'Pick a category to start',
    newPage: '+ New product page',
    view: 'View →', del: 'Delete',
    billing: 'Subscription', billingFree: 'Free', billingPro: 'Pro', billingBiz: 'Business',
    billingUnlimited: 'Unlimited', upgrade: 'Upgrade →',
    nextBill: (d: string) => `Next billing: ${d}`,
    todayTip: "Today's tip", moreTips: 'More tips', allGuides: 'View all guides →',
    trending: 'Trending categories this week',
    checklist: 'High-conversion checklist',
    checkItems: ['Include keywords in title', 'Address customer pain in first sentence', 'Use at least 2 numbers/data points', 'Clear purchase CTA', 'Check mobile readability'],
    status: { pending: 'Pending', generating: 'Generating', done: 'Done', error: 'Error' },
    trendData: [
      { rank: 1, name: 'Beauty & Cosmetics', change: '+24%', up: true },
      { rank: 2, name: 'Health Supplements', change: '+18%', up: true },
      { rank: 3, name: 'Food & Beverage', change: '+12%', up: true },
      { rank: 4, name: 'Home & Living', change: '-3%', up: false },
      { rank: 5, name: 'Fashion & Apparel', change: '+8%', up: true },
    ],
    quickCats: [
      { label: 'Food & Drink', emoji: '🥤' }, { label: 'Beauty', emoji: '💄' },
      { label: 'Home & Living', emoji: '🏠' }, { label: 'Fashion', emoji: '👗' },
      { label: 'Health', emoji: '💊' }, { label: 'Electronics', emoji: '📱' },
    ],
    formSection: '📋 Auto Form Fill',
    formSectionSub: 'Paste a form or assignment and AI will complete all the blanks automatically',
    formStart: 'Start Form Fill →',
    formExamples: ['Business Plan', 'Assignment', 'Proposal', 'Application', 'Report'],
    tips: [
      { tag: 'CTR Tip', tagColor: 'bg-orange-50 text-orange-600 border-orange-200', title: 'Numbers in titles boost CTR by 32%', desc: '"3-Second Absorbing Green Tea Serum" gets more clicks than just "Green Tea Serum". Numbers create specificity and trust.' },
      { tag: 'Copywriting', tagColor: 'bg-blue-50 text-blue-600 border-blue-200', title: 'Open with the customer\'s pain', desc: 'Instead of "Great product", try "Dry skin after 3 attempts? Problem solved." Lead with their problem.' },
      { tag: 'SEO Tip', tagColor: 'bg-purple-50 text-purple-600 border-purple-200', title: 'Put category keywords first', desc: 'Search algorithms weight keywords at the start of product titles more heavily.' },
      { tag: 'Psychology', tagColor: 'bg-green-50 text-green-600 border-green-200', title: 'Comparison tables drive decisions', desc: 'Comparison tables showing competitive advantages increase conversions by 2.3x on average.' },
      { tag: 'Image Tip', tagColor: 'bg-pink-50 text-pink-600 border-pink-200', title: 'The first image is everything', desc: '73% of buyers decide whether to scroll based on the first image alone. White background + close-up works best.' },
    ],
  },
  ja: {
    dashboard: 'ダッシュボード', hello: 'こんにちは 👋',
    sub: '今日も売れる商品ページを作りましょう！',
    newOrder: '+ 新規注文', logout: 'ログアウト',
    freePlan: '無料プラン', usageOf: (used: number, max: number) => `今月 ${used}/${max}回使用`,
    remaining: (n: number) => `残り${n}回`,
    upgradeLink: 'Proプランで無制限にアップグレード →',
    proPlan: 'Proプラン', bizPlan: 'ビジネスプラン', unlimited: '無制限生成中',
    statTotal: '総生成', statDone: '完了', statSaved: '節約推定', statMonth: '今月',
    statSub1: '累計ページ', statSub2: 'PDFダウンロード可', statSub3: '外注比較節約', statSub4: (n: number) => `無料${n}回中`,
    myPages: '商品ページ一覧', viewAll: '全て見る →',
    emptyTitle: '最初の商品ページを作成しましょう',
    emptySub: '30秒の入力でプロレベルのコピーが完成',
    quickStart: 'カテゴリを選んで開始',
    newPage: '+ 新しい商品ページを作成',
    view: '見る →', del: '削除',
    billing: 'サブスクリプション', billingFree: '無料', billingPro: 'Pro', billingBiz: 'ビジネス',
    billingUnlimited: '無制限', upgrade: 'アップグレード →',
    nextBill: (d: string) => `次回請求日: ${d}`,
    todayTip: '今日のマーケティングTips', moreTips: 'もっと見る', allGuides: 'ガイドを全て見る →',
    trending: '今週の急上昇カテゴリ',
    checklist: '高転換チェックリスト',
    checkItems: ['タイトルにキーワード含む', '最初の文で顧客の悩みに触れる', '数字・データを最低2つ使用', '購入誘導CTAを明確に', 'モバイル可読性を確認'],
    status: { pending: '待機中', generating: '生成中', done: '完了', error: 'エラー' },
    trendData: [
      { rank: 1, name: 'ビューティ・コスメ', change: '+24%', up: true },
      { rank: 2, name: '健康食品', change: '+18%', up: true },
      { rank: 3, name: '食品・飲料', change: '+12%', up: true },
      { rank: 4, name: '生活用品', change: '-3%', up: false },
      { rank: 5, name: 'ファッション', change: '+8%', up: true },
    ],
    quickCats: [
      { label: '食品・飲料', emoji: '🥤' }, { label: 'ビューティ', emoji: '💄' },
      { label: '生活用品', emoji: '🏠' }, { label: 'ファッション', emoji: '👗' },
      { label: '健康食品', emoji: '💊' }, { label: '電子機器', emoji: '📱' },
    ],
    formSection: '📋 書類自動作成',
    formSectionSub: '記入が必要な書類や課題を貼り付けると、AIが空欄を自動で埋めます',
    formStart: '書類作成を開始 →',
    formExamples: ['事業計画書', '課題提出物', '提案書', '申請書', '報告書'],
    tips: [
      { tag: 'CTRのコツ', tagColor: 'bg-orange-50 text-orange-600 border-orange-200', title: 'タイトルに数字でCTR32%UP', desc: '「緑茶セラム」より「3秒吸収の緑茶セラム」の方がクリック率が大幅に高いです。' },
      { tag: 'コピーライティング', tagColor: 'bg-blue-50 text-blue-600 border-blue-200', title: '最初の文で顧客の悩みを突け', desc: '「良い商品です」ではなく「3回塗っても乾燥が続いていた肌、これで解決」のように問題から始める。' },
      { tag: 'SEOのコツ', tagColor: 'bg-purple-50 text-purple-600 border-purple-200', title: 'カテゴリキーワードを先頭に', desc: '検索アルゴリズムは商品名の前の方にあるキーワードをより高く評価します。' },
      { tag: '購買心理', tagColor: 'bg-green-50 text-green-600 border-green-200', title: '比較表が購買決定を生む', desc: '競合との優位性を示す比較表は購買転換率を平均2.3倍高めます。' },
      { tag: '画像のコツ', tagColor: 'bg-pink-50 text-pink-600 border-pink-200', title: '最初の画像が全て', desc: '購入者の73%は最初の画像だけでスクロールするかどうかを決定します。' },
    ],
  },
  zh: {
    dashboard: '控制台', hello: '你好 👋',
    sub: '今天也来创建一个高转化率的商品详情页吧！',
    newOrder: '+ 新建', logout: '退出登录',
    freePlan: '免费版', usageOf: (used: number, max: number) => `本月已用 ${used}/${max}次`,
    remaining: (n: number) => `剩余${n}次`,
    upgradeLink: '升级Pro版，无限生成 →',
    proPlan: 'Pro版', bizPlan: '企业版', unlimited: '无限生成中',
    statTotal: '总生成', statDone: '完成', statSaved: '节省估算', statMonth: '本月',
    statSub1: '累计页面', statSub2: 'PDF可下载', statSub3: '对比外包节省', statSub4: (n: number) => `免费${n}次中`,
    myPages: '我的商品页', viewAll: '查看全部 →',
    emptyTitle: '创建您的第一个商品页',
    emptySub: '30秒填写，立即获得专业文案',
    quickStart: '选择类别立即开始',
    newPage: '+ 新建商品详情页',
    view: '查看 →', del: '删除',
    billing: '订阅管理', billingFree: '免费', billingPro: 'Pro', billingBiz: '企业',
    billingUnlimited: '无限生成', upgrade: '立即升级 →',
    nextBill: (d: string) => `下次扣费: ${d}`,
    todayTip: '今日营销技巧', moreTips: '更多技巧', allGuides: '查看全部指南 →',
    trending: '本周热门类别',
    checklist: '高转化检查清单',
    checkItems: ['标题包含核心关键词', '第一句话触及客户痛点', '使用至少2个数字/数据', '明确购买引导CTA', '检查移动端可读性'],
    status: { pending: '等待中', generating: '生成中', done: '完成', error: '错误' },
    trendData: [
      { rank: 1, name: '美妆护肤', change: '+24%', up: true },
      { rank: 2, name: '健康食品', change: '+18%', up: true },
      { rank: 3, name: '食品饮料', change: '+12%', up: true },
      { rank: 4, name: '家居生活', change: '-3%', up: false },
      { rank: 5, name: '时尚服装', change: '+8%', up: true },
    ],
    quickCats: [
      { label: '食品饮料', emoji: '🥤' }, { label: '美妆', emoji: '💄' },
      { label: '家居', emoji: '🏠' }, { label: '时尚', emoji: '👗' },
      { label: '健康', emoji: '💊' }, { label: '电子', emoji: '📱' },
    ],
    formSection: '📋 自动填写表单',
    formSectionSub: '粘贴需要填写的表单或作业，AI将自动填写所有空白',
    formStart: '开始填写表单 →',
    formExamples: ['商业计划书', '作业提交', '提案书', '申请书', '报告书'],
    tips: [
      { tag: '点击率技巧', tagColor: 'bg-orange-50 text-orange-600 border-orange-200', title: '标题加数字CTR提升32%', desc: '「3秒吸收绿茶精华」比「绿茶精华」点击率高得多。数字创造具体性和信任感。' },
      { tag: '文案技巧', tagColor: 'bg-blue-50 text-blue-600 border-blue-200', title: '第一句话触及客户痛点', desc: '不要说「好产品」，而要说「涂了3次还是干燥？这次终于解决了」，先说问题。' },
      { tag: 'SEO技巧', tagColor: 'bg-purple-50 text-purple-600 border-purple-200', title: '类别关键词放在标题前面', desc: '搜索算法对商品名称前半部分的关键词给予更高权重。' },
      { tag: '消费心理', tagColor: 'bg-green-50 text-green-600 border-green-200', title: '对比表决定购买', desc: '展示竞争优势的对比表平均将购买转化率提高2.3倍。' },
      { tag: '图片技巧', tagColor: 'bg-pink-50 text-pink-600 border-pink-200', title: '第一张图决定一切', desc: '73%的买家仅凭第一张图决定是否继续浏览。白背景+产品特写效果最佳。' },
    ],
  },
} as const

const FREE_LIMIT = 5

function getLang(cookieHeader: string | undefined): UiLang {
  if (!cookieHeader) return 'ko'
  const match = cookieHeader.match(/pageai-lang=(ko|en|ja|zh)/)
  return (match?.[1] as UiLang) ?? 'ko'
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const cookieStore = await cookies()
  const lang = getLang(cookieStore.toString())
  const t = T[lang]

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('plan, monthly_usage')
    .eq('id', user.id)
    .maybeSingle()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end, billing_cycle')
    .eq('user_id', user.id)
    .maybeSingle()

  const currentPlan = userProfile?.plan ?? 'free'
  const nextBillingDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(
        lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
      )
    : null

  const total = orders?.length ?? 0
  const doneCount = orders?.filter(o => o.status === 'done').length ?? 0
  const savedAmount = doneCount * 50000
  const tipIdx = new Date().getDate() % t.tips.length
  const tip = t.tips[tipIdx]

  const thisMonth = new Date()
  const monthlyUsed = orders?.filter(o => {
    const d = new Date(o.created_at)
    return d.getFullYear() === thisMonth.getFullYear() && d.getMonth() === thisMonth.getMonth()
  }).length ?? 0
  const usagePct = Math.min((monthlyUsed / FREE_LIMIT) * 100, 100)

  const STATUS_MAP = {
    pending:    { text: t.status.pending,    dot: 'bg-yellow-400',               badge: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    generating: { text: t.status.generating, dot: 'bg-blue-400 animate-pulse',   badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    done:       { text: t.status.done,       dot: 'bg-green-400',                badge: 'bg-green-50 text-green-700 border-green-200' },
    error:      { text: t.status.error,      dot: 'bg-red-400',                  badge: 'bg-red-50 text-red-700 border-red-200' },
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* NAV */}
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={28} />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm hidden sm:block">{user.email}</span>
          <LogoutButton label={t.logout} className="text-xs text-gray-400 hover:text-black transition-colors px-3 py-2 hidden sm:block" />
          <Link href="/order/new" className="bg-black text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all min-h-[44px] flex items-center">
            {t.newOrder}
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* 인사 + 플랜 배너 */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-1">{t.dashboard}</p>
            <h1 className="text-3xl font-black text-black tracking-tight">{t.hello}</h1>
            <p className="text-gray-400 text-sm mt-1">{t.sub}</p>
          </div>
          {currentPlan === 'free' ? (
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-2xl px-5 py-4 max-w-xs">
              <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">{t.freePlan}</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold">{t.usageOf(monthlyUsed, FREE_LIMIT)}</span>
                <span className="text-xs opacity-70">{t.remaining(FREE_LIMIT - monthlyUsed)}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5 mb-3">
                <div className="bg-white rounded-full h-1.5 transition-all" style={{ width: `${usagePct}%` }} />
              </div>
              <Link href="/pricing" className="text-xs font-black underline underline-offset-2 opacity-90 hover:opacity-100">
                {t.upgradeLink}
              </Link>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl px-5 py-4 max-w-xs">
              <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">
                {currentPlan === 'pro' ? t.proPlan : t.bizPlan}
              </p>
              <p className="text-sm font-bold mb-3">{t.unlimited}</p>
              <BillingPortalButton />
            </div>
          )}
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: t.statTotal, value: `${total}`, sub: t.statSub1, icon: '📄' },
            { label: t.statDone,  value: `${doneCount}`, sub: t.statSub2, icon: '✅' },
            { label: t.statSaved, value: `₩${savedAmount.toLocaleString()}`, sub: t.statSub3, icon: '💰' },
            { label: t.statMonth, value: `${monthlyUsed}`, sub: t.statSub4(FREE_LIMIT), icon: '📅' },
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

          {/* 왼쪽: 주문 목록 + 양식 섹션 */}
          <div className="lg:col-span-2 space-y-4">

            {/* ── 자동 양식 작성 섹션 (상단 배치) ── */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-xl shrink-0">📋</div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm mb-0.5">{t.formSection}</h3>
                  <p className="text-gray-400 text-xs">{t.formSectionSub}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {t.formExamples.map((ex, i) => (
                  <span key={i} className="text-xs font-bold px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-gray-500">
                    {ex}
                  </span>
                ))}
              </div>
              <Link href="/order/new?tab=template"
                className="flex items-center justify-center gap-2 w-full bg-black text-white py-3 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all">
                {t.formStart}
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-black">{t.myPages}</h2>
              <Link href="/order/new" className="text-xs font-bold text-gray-400 hover:text-black transition-colors">
                {t.viewAll}
              </Link>
            </div>

            {!orders || orders.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">✨</div>
                <p className="font-bold text-gray-700 mb-1">{t.emptyTitle}</p>
                <p className="text-gray-400 text-sm mb-6">{t.emptySub}</p>
                <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">{t.quickStart}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {t.quickCats.map((c, i) => (
                    <Link key={i} href={`/order/new?category=${encodeURIComponent(c.label)}`}
                      className="flex items-center gap-1.5 border border-gray-100 bg-gray-50 hover:bg-black hover:text-white hover:border-black px-4 py-2 rounded-full text-sm font-bold text-gray-600 transition-all">
                      {c.emoji} {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => {
                  const s = STATUS_MAP[order.status as keyof typeof STATUS_MAP] || STATUS_MAP.pending
                  return (
                    <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition-all group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                            <p className="font-bold text-gray-900 truncate">{order.product_name}</p>
                          </div>
                          <p className="text-xs text-gray-400 pl-3.5">
                            {order.category} · {new Date(order.created_at).toLocaleDateString(
                              lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'en-US',
                              { month: 'long', day: 'numeric' }
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${s.badge}`}>
                            {s.text}
                          </span>
                          <DeleteOrderButton orderId={order.id} label={t.del} />
                          {order.status === 'done' && (
                            <Link href={`/order/${order.id}`}
                              className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all min-h-[44px] flex items-center">
                              {t.view}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <Link href="/order/new"
                  className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 rounded-2xl p-5 text-gray-400 text-sm font-bold hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
                  {t.newPage}
                </Link>
              </div>
            )}

          </div>

          {/* 오른쪽 사이드바 */}
          <div className="space-y-4">

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
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">{t.billing}</p>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                  currentPlan === 'pro' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                  currentPlan === 'business' ? 'bg-violet-50 text-violet-600 border-violet-200' :
                  'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                  {currentPlan === 'pro' ? t.billingPro : currentPlan === 'business' ? t.billingBiz : t.billingFree}
                </span>
                {currentPlan !== 'free' && <span className="text-[10px] text-gray-300">{t.billingUnlimited}</span>}
              </div>
              {nextBillingDate && currentPlan !== 'free' && (
                <p className="text-[11px] text-gray-400 mb-3">{t.nextBill(nextBillingDate)}</p>
              )}
              {currentPlan === 'free' ? (
                <Link href="/pricing" className="block w-full text-center bg-black text-white py-2.5 rounded-xl text-xs font-black hover:bg-gray-800 transition-all">
                  {t.upgrade}
                </Link>
              ) : (
                <BillingPortalButton className="block w-full text-center border border-gray-200 text-gray-600 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all" />
              )}
            </div>

            <ReferralWidget />
            <TrendWidget compact />

            {/* 오늘의 팁 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">{t.todayTip}</p>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border inline-block mb-3 ${tip.tagColor}`}>{tip.tag}</span>
              <h3 className="text-sm font-black text-gray-900 mb-2 leading-snug">{tip.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{tip.desc}</p>
            </div>

            {/* 고전환 체크리스트 */}
            <div className="bg-black rounded-2xl p-5">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">{t.checklist}</p>
              <ul className="space-y-2.5">
                {t.checkItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                    <span className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black text-gray-500 mt-0.5">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* 이번 주 급상승 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{t.trending}</p>
                <span className="text-[9px] bg-green-50 text-green-600 border border-green-200 px-1.5 py-0.5 rounded font-bold">LIVE</span>
              </div>
              <div className="space-y-2.5">
                {t.trendData.map(item => (
                  <div key={item.rank} className="flex items-center gap-2">
                    <span className="w-4 text-[10px] font-black text-gray-300 shrink-0">{item.rank}</span>
                    <span className="flex-1 text-xs font-medium text-gray-700 truncate">{item.name}</span>
                    <span className={`text-[10px] font-black ${item.up ? 'text-green-500' : 'text-red-400'}`}>
                      {item.up ? '↑' : '↓'} {item.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 더 많은 팁 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">{t.moreTips}</p>
              <div className="space-y-3">
                {t.tips.filter((_, i) => i !== tipIdx).slice(0, 3).map((tip2, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${tip2.tagColor}`}>
                      {tip2.tag.split(' ')[0]}
                    </span>
                    <p className="text-xs text-gray-600 font-medium leading-snug">{tip2.title}</p>
                  </div>
                ))}
              </div>
              <Link href="/blog" className="mt-4 block text-xs font-black text-gray-400 hover:text-black transition-colors text-center pt-3 border-t border-gray-50">
                {t.allGuides}
              </Link>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
