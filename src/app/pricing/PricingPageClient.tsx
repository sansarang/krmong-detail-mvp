'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { readStoredUiLang } from '@/lib/uiLocale'

type Lang = 'ko' | 'en' | 'ja' | 'zh'

const COPY = {
  ko: {
    badge: '가격 플랜',
    title: '합리적인 가격으로',
    titleSub: '외주 비용을 없애세요.',
    monthly: '월간',
    yearly: '연간',
    yearlyBadge: '2개월 무료',
    yearlyDiscount: '연간 결제 시 20% 할인',
    perMonth: '/월', perYear: '/년',
    freeName: '무료', proName: '프로', bizName: '비즈니스',
    freeDesc: '시작해보고 싶은 분',
    proDesc: '글로벌 셀러 · 크로스보더',
    bizDesc: '에이전시·팀·브랜드',
    popular: '가장 인기',
    freeFeatures: ['월 5회 생성', 'PDF 다운로드', '인라인 편집', 'SEO 분석 ✗', '블로그 발행 ✗', 'A/B 자동생성 ✗'],
    proFeatures: ['무제한 생성', '🌏 4개 언어 동시 생성', '6개 플랫폼 자동 최적화', 'SEO 분석 리포트', '전환율 예측 리포트', 'A/B 버전 자동 생성'],
    bizFeatures: ['무제한 생성', '🌏 4개 언어 동시 생성', '6개 플랫폼 자동 최적화', 'SEO 분석 리포트', '전환율 예측 리포트', '팀 3인 + API 액세스'],
    freeBtn: '무료로 시작',
    proBtn: '프로 시작하기',
    bizBtn: '비즈니스 시작',
    processing: '처리 중...',
    paymentInfo: 'Visa · Mastercard · Apple Pay · Samsung Pay 지원 | 전 세계 결제 가능',
    cancelAnytime: '언제든지 해지 가능',
    contact: '결제 관련 문의:',
    notReady: '결제 준비 중입니다. 잠시 후 다시 시도해주세요.',
    refresh: '결제 준비 중입니다. 페이지를 새로고침 후 다시 시도해주세요.',
    error: '결제 처리 중 오류가 발생했습니다.',
    proMonthly: '₩29,000', proYearly: '₩290,000',
    bizMonthly: '₩79,000', bizYearly: '₩790,000',
  },
  en: {
    badge: 'Pricing',
    title: 'Simple, transparent',
    titleSub: 'pricing for everyone.',
    monthly: 'Monthly',
    yearly: 'Yearly',
    yearlyBadge: '2 months free',
    yearlyDiscount: '20% off with annual billing',
    perMonth: '/mo', perYear: '/yr',
    freeName: 'Free', proName: 'Pro', bizName: 'Business',
    freeDesc: 'Get started for free',
    proDesc: 'Global sellers · Cross-border',
    bizDesc: 'Agencies · Teams · Brands',
    popular: 'Most popular',
    freeFeatures: ['5 generations/month', 'PDF download', 'Inline editing', 'SEO analysis ✗', 'Blog publishing ✗', 'A/B auto-gen ✗'],
    proFeatures: ['Unlimited generations', '🌏 4-language simultaneous', '6-platform optimization', 'SEO analysis report', 'Conversion rate forecast', 'A/B version auto-gen'],
    bizFeatures: ['Unlimited generations', '🌏 4-language simultaneous', '6-platform optimization', 'SEO analysis report', 'Conversion rate forecast', 'Team 3 seats + API access'],
    freeBtn: 'Start for free',
    proBtn: 'Start Pro',
    bizBtn: 'Start Business',
    processing: 'Processing...',
    paymentInfo: 'Visa · Mastercard · Apple Pay · PayPal supported | Worldwide payments',
    cancelAnytime: 'Cancel anytime',
    contact: 'Billing support:',
    notReady: 'Payment is loading. Please try again shortly.',
    refresh: 'Payment is loading. Please refresh the page and try again.',
    error: 'An error occurred during checkout.',
    proMonthly: '$19', proYearly: '$190',
    bizMonthly: '$49', bizYearly: '$490',
  },
  ja: {
    badge: '料金プラン',
    title: 'シンプルな料金で',
    titleSub: '外注コストをゼロに。',
    monthly: '月払い',
    yearly: '年払い',
    yearlyBadge: '2ヶ月無料',
    yearlyDiscount: '年払いで20%オフ',
    perMonth: '/月', perYear: '/年',
    freeName: '無料', proName: 'プロ', bizName: 'ビジネス',
    freeDesc: '試してみたい方',
    proDesc: 'グローバルセラー · 越境EC',
    bizDesc: 'エージェンシー·チーム·ブランド',
    popular: '人気No.1',
    freeFeatures: ['月5回生成', 'PDFダウンロード', 'インライン編集', 'SEO分析 ✗', 'ブログ投稿 ✗', 'A/B自動生成 ✗'],
    proFeatures: ['無制限生成', '🌏 4言語同時生成', '6プラットフォーム最適化', 'SEO分析レポート', '転換率予測レポート', 'A/Bバージョン自動生成'],
    bizFeatures: ['無制限生成', '🌏 4言語同時生成', '6プラットフォーム最適化', 'SEO分析レポート', '転換率予測レポート', 'チーム3名 + APIアクセス'],
    freeBtn: '無料で始める',
    proBtn: 'プロを始める',
    bizBtn: 'ビジネスを始める',
    processing: '処理中...',
    paymentInfo: 'Visa · Mastercard · Apple Pay · PayPal 対応 | 世界中で決済可能',
    cancelAnytime: 'いつでもキャンセル可能',
    contact: 'お支払いサポート:',
    notReady: '決済の準備中です。しばらくしてからお試しください。',
    refresh: '決済の準備中です。ページを更新してからお試しください。',
    error: '決済処理中にエラーが発生しました。',
    proMonthly: '¥2,800', proYearly: '¥28,000',
    bizMonthly: '¥7,500', bizYearly: '¥75,000',
  },
  zh: {
    badge: '价格方案',
    title: '简单透明的定价',
    titleSub: '告别外包费用。',
    monthly: '按月付费',
    yearly: '按年付费',
    yearlyBadge: '免费2个月',
    yearlyDiscount: '年付享8折优惠',
    perMonth: '/月', perYear: '/年',
    freeName: '免费', proName: '专业版', bizName: '商业版',
    freeDesc: '想要尝试的用户',
    proDesc: '全球卖家 · 跨境电商',
    bizDesc: '代理商·团队·品牌',
    popular: '最受欢迎',
    freeFeatures: ['每月5次生成', 'PDF下载', '内联编辑', 'SEO分析 ✗', '博客发布 ✗', 'A/B自动生成 ✗'],
    proFeatures: ['无限次生成', '🌏 4语言同步生成', '6平台自动优化', 'SEO分析报告', '转化率预测报告', 'A/B版本自动生成'],
    bizFeatures: ['无限次生成', '🌏 4语言同步生成', '6平台自动优化', 'SEO分析报告', '转化率预测报告', '团队3人 + API访问'],
    freeBtn: '免费开始',
    proBtn: '开始专业版',
    bizBtn: '开始商业版',
    processing: '处理中...',
    paymentInfo: '支持 Visa · Mastercard · Apple Pay · 支付宝 | 全球付款',
    cancelAnytime: '随时可取消',
    contact: '付款支持:',
    notReady: '支付正在准备中，请稍后再试。',
    refresh: '支付正在准备中，请刷新页面后再试。',
    error: '结账时发生错误。',
    proMonthly: '¥138', proYearly: '¥1,380',
    bizMonthly: '¥358', bizYearly: '¥3,580',
  },
}

export default function PricingPageClient({
  isLoggedIn,
  userEmail,
  userId,
}: {
  isLoggedIn: boolean
  userEmail?: string
  userId?: string
}) {
  const router = useRouter()
  const [yearly, setYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [lang, setLang] = useState<Lang>('ko')

  useEffect(() => {
    const stored = readStoredUiLang()
    if (stored) setLang(stored as Lang)
  }, [])

  const t = COPY[lang]

  const PLANS = [
    {
      id: 'free', name: t.freeName, desc: t.freeDesc, featured: false, free: true,
      price: '$0', yearlyPrice: '$0',
      monthlyPriceId: '', yearlyPriceId: '',
      features: t.freeFeatures,
    },
    {
      id: 'pro', name: t.proName, desc: t.proDesc, badge: t.popular, featured: true, free: false,
      price: t.proMonthly, yearlyPrice: t.proYearly,
      monthlyPriceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY ?? '',
      yearlyPriceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_YEARLY ?? '',
      features: t.proFeatures,
    },
    {
      id: 'biz', name: t.bizName, desc: t.bizDesc, featured: false, free: false,
      price: t.bizMonthly, yearlyPrice: t.bizYearly,
      monthlyPriceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_BIZ_MONTHLY ?? '',
      yearlyPriceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_BIZ_YEARLY ?? '',
      features: t.bizFeatures,
    },
  ]

  async function handleUpgrade(plan: typeof PLANS[0]) {
    if (plan.free) { router.push('/signup'); return }
    if (!isLoggedIn) { router.push('/login?redirect=/pricing'); return }

    const priceId = yearly ? plan.yearlyPriceId : plan.monthlyPriceId
    if (!priceId) { toast.info(t.notReady); return }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paddle = (window as any).PaddleInstance
    if (!paddle) { toast.info(t.refresh); return }

    setLoadingPlan(plan.id)
    try {
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        ...(userEmail ? { customer: { email: userEmail } } : {}),
        customData: {
          supabase_user_id: userId ?? '',
          plan: plan.id,
          billing_cycle: yearly ? 'yearly' : 'monthly',
        },
      })
    } catch (err) {
      console.error('Paddle checkout error:', err)
      toast.error(t.error)
    } finally {
      setLoadingPlan(null)
    }
  }

  const btnLabel = (plan: typeof PLANS[0]) => {
    if (loadingPlan === plan.id) return t.processing
    if (plan.free) return t.freeBtn
    if (plan.id === 'pro') return t.proBtn
    return t.bizBtn
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-16">
      <div className="text-center mb-12">
        <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">{t.badge}</p>
        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight mb-4">
          {t.title}<br />
          <span className="text-gray-200">{t.titleSub}</span>
        </h1>

        <div className="inline-flex items-center gap-3 bg-gray-100 rounded-2xl p-1.5 mt-4">
          <button
            onClick={() => setYearly(false)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${!yearly ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
          >
            {t.monthly}
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${yearly ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
          >
            {t.yearly}
            <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{t.yearlyBadge}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={`relative rounded-3xl p-8 flex flex-col transition-all ${
              plan.featured
                ? 'bg-black text-white shadow-2xl shadow-black/20 scale-[1.03]'
                : 'bg-white border border-gray-100 hover:border-gray-300 hover:shadow-lg'
            }`}
          >
            {'badge' in plan && plan.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[11px] font-black px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg">
                  ✦ {plan.badge}
                </span>
              </div>
            )}
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-widest mb-2 text-gray-400">{plan.name}</p>
              <div className="flex items-end gap-1 mb-2">
                <span className={`text-4xl font-black tracking-tight ${plan.featured ? 'text-white' : 'text-black'}`}>
                  {yearly ? plan.yearlyPrice : plan.price}
                </span>
                {!plan.free && (
                  <span className="text-sm font-medium mb-2 text-gray-400">
                    {yearly ? t.perYear : t.perMonth}
                  </span>
                )}
              </div>
              {yearly && !plan.free && (
                <p className="text-xs font-medium text-green-500">{t.yearlyDiscount}</p>
              )}
              <p className={`text-sm mt-3 ${plan.featured ? 'text-gray-400' : 'text-gray-500'}`}>{plan.desc}</p>
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {plan.features.map((f, j) => {
                const crossed = f.endsWith('✗')
                const txt = f.replace(' ✗', '')
                return (
                  <li key={j} className={`flex items-center gap-2.5 text-sm ${crossed ? 'text-gray-300 line-through' : plan.featured ? 'text-gray-200' : 'text-gray-700'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${crossed ? 'bg-gray-100 text-gray-300' : plan.featured ? 'bg-white/10 text-white' : 'bg-black text-white'}`}>
                      {crossed ? '×' : '✓'}
                    </span>
                    {txt}
                  </li>
                )
              })}
            </ul>

            <button
              onClick={() => handleUpgrade(plan)}
              disabled={loadingPlan === plan.id}
              className={`w-full py-4 rounded-2xl text-sm font-black transition-all hover:scale-[1.02] disabled:opacity-50 ${
                plan.featured ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {btnLabel(plan)}
            </button>
          </div>
        ))}
      </div>

      {/* 결제 수단 안내 */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-400">
        {[
          { icon: '💳', text: t.paymentInfo, color: 'bg-blue-50 border-blue-100 text-blue-500' },
          { icon: '✕', text: t.cancelAnytime, color: 'bg-purple-50 border-purple-100 text-purple-500' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border ${item.color}`}>
              {item.icon}
            </span>
            <span className="font-medium">{item.text}</span>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-300 mt-6">
        {t.contact}{' '}
        <Link href="mailto:hello@pagebeer.beer" className="underline hover:text-gray-600">
          hello@pagebeer.beer
        </Link>
      </p>
    </div>
  )
}
