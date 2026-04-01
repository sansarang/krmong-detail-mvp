'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

interface Plan {
  name: string; desc: string; badge?: string
  monthlyPrice: string; yearlyPrice: string
  monthlyPriceId: string; yearlyPriceId: string
  features: string[]; featured: boolean; free: boolean
}

const PLANS: Plan[] = [
  {
    name: '무료', desc: '시작해보고 싶은 분', featured: false, free: true,
    monthlyPrice: '$0', yearlyPrice: '$0',
    monthlyPriceId: '', yearlyPriceId: '',
    features: ['월 5회 생성', 'PDF 다운로드', '인라인 편집', 'SEO 분석 ✗', '블로그 발행 ✗'],
  },
  {
    name: '프로', desc: '글로벌 셀러 · 크로스보더', badge: '가장 인기', featured: true, free: false,
    monthlyPrice: '$19', yearlyPrice: '$190',
    monthlyPriceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY ?? '',
    yearlyPriceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_YEARLY ?? '',
    features: ['무제한 생성', '🌏 4개 언어 동시 생성', '6개 플랫폼 자동 최적화', 'SEO 분석 리포트', 'A/B 버전 자동 생성'],
  },
  {
    name: '비즈니스', desc: '에이전시·팀·브랜드', featured: false, free: false,
    monthlyPrice: '$49', yearlyPrice: '$490',
    monthlyPriceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_BIZ_MONTHLY ?? '',
    yearlyPriceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_BIZ_YEARLY ?? '',
    features: ['무제한 생성', '🌏 4개 언어 동시 생성', '6개 플랫폼 자동 최적화', 'SEO 분석 리포트', '팀 3인 + API 액세스'],
  },
]

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

  async function handleUpgrade(plan: Plan) {
    if (plan.free) {
      router.push('/login')
      return
    }
    if (!isLoggedIn) {
      router.push('/login?redirect=/pricing')
      return
    }

    const priceId = yearly ? plan.yearlyPriceId : plan.monthlyPriceId
    if (!priceId) {
      toast.info('결제 준비 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paddle = (window as any).PaddleInstance
    if (!paddle) {
      toast.info('결제 준비 중입니다. 페이지를 새로고침 후 다시 시도해주세요.')
      return
    }

    setLoadingPlan(plan.name)
    try {
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        ...(userEmail ? { customer: { email: userEmail } } : {}),
        customData: {
          supabase_user_id: userId ?? '',
          plan: plan.name.toLowerCase(),
          billing_cycle: yearly ? 'yearly' : 'monthly',
        },
      })
    } catch (err) {
      console.error('Paddle checkout error:', err)
      toast.error('결제 처리 중 오류가 발생했습니다.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-16">
      <div className="text-center mb-12">
        <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">가격 플랜</p>
        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight mb-4">
          합리적인 가격으로<br />
          <span className="text-gray-200">외주 비용을 없애세요.</span>
        </h1>

        <div className="inline-flex items-center gap-3 bg-gray-100 rounded-2xl p-1.5 mt-4">
          <button
            onClick={() => setYearly(false)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${!yearly ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
          >
            월간
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${yearly ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
          >
            연간
            <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">2개월 무료</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className={`relative rounded-3xl p-8 flex flex-col transition-all ${
              plan.featured
                ? 'bg-black text-white shadow-2xl shadow-black/20 scale-[1.03]'
                : 'bg-white border border-gray-100 hover:border-gray-300 hover:shadow-lg'
            }`}
          >
            {plan.badge && (
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
                  {yearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                {!plan.free && <span className="text-sm font-medium mb-2 text-gray-400">{yearly ? '/년' : '/월'}</span>}
              </div>
              {yearly && !plan.free && (
                <p className="text-xs font-medium text-green-500">연간 결제 시 20% 할인</p>
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
              disabled={loadingPlan === plan.name}
              className={`w-full py-4 rounded-2xl text-sm font-black transition-all hover:scale-[1.02] disabled:opacity-50 ${
                plan.featured ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {loadingPlan === plan.name ? '처리 중...' : plan.free ? '무료로 시작' : `${plan.name} 시작하기`}
            </button>
          </div>
        ))}
      </div>

      {/* 결제 수단 안내 */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-400">
        {[
          { icon: '🛡️', text: '30일 환불 보장', color: 'bg-green-50 border-green-100 text-green-500' },
          { icon: '💳', text: 'Visa · Mastercard · Apple Pay · PayPal 지원 | 전 세계 결제 가능', color: 'bg-blue-50 border-blue-100 text-blue-500' },
          { icon: '✕', text: '언제든지 해지 가능', color: 'bg-purple-50 border-purple-100 text-purple-500' },
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
        결제 관련 문의: <Link href="mailto:hello@pagebeer.beer" className="underline hover:text-gray-600">hello@pagebeer.beer</Link>
      </p>
    </div>
  )
}
