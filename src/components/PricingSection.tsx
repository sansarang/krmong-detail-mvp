'use client'
import { useState } from 'react'
import Link from 'next/link'

const PLANS = [
  {
    name: '무료',
    monthly: 0,
    yearly: 0,
    desc: '시작해보고 싶은 분',
    cta: '무료로 시작',
    ctaHref: '/login',
    featured: false,
    features: [
      { text: '월 5회 상세페이지 생성',      included: true },
      { text: 'PDF 다운로드',               included: true },
      { text: '6개 섹션 기본 템플릿',         included: true },
      { text: '인라인 편집',                 included: true },
      { text: '우선순위 AI 처리',             included: false },
      { text: 'A/B 버전 자동 생성',           included: false },
      { text: '팀 멤버 초대',                 included: false },
    ],
  },
  {
    name: '프로',
    monthly: 29000,
    yearly: 23200,
    desc: '매달 신제품을 출시하는 셀러',
    cta: '프로 시작하기',
    ctaHref: '/login',
    featured: true,
    badge: '가장 인기',
    features: [
      { text: '무제한 상세페이지 생성',        included: true },
      { text: 'PDF 다운로드',               included: true },
      { text: '6개 섹션 기본 템플릿',         included: true },
      { text: '인라인 편집',                 included: true },
      { text: '우선순위 AI 처리',             included: true },
      { text: 'A/B 버전 자동 생성',           included: true },
      { text: '팀 멤버 초대',                 included: false },
    ],
  },
  {
    name: '비즈니스',
    monthly: 79000,
    yearly: 63200,
    desc: '대량 생산이 필요한 에이전시·팀',
    cta: '비즈니스 시작',
    ctaHref: '/login',
    featured: false,
    features: [
      { text: '무제한 상세페이지 생성',        included: true },
      { text: 'PDF 다운로드',               included: true },
      { text: '6개 섹션 기본 템플릿',         included: true },
      { text: '인라인 편집',                 included: true },
      { text: '우선순위 AI 처리',             included: true },
      { text: 'A/B 버전 자동 생성',           included: true },
      { text: '팀 멤버 3인 + API 액세스',     included: true },
    ],
  },
]

export default function PricingSection() {
  const [yearly, setYearly] = useState(false)

  return (
    <section id="pricing" className="max-w-5xl mx-auto px-6 py-20">
      {/* 헤더 */}
      <div className="text-center mb-14">
        <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">가격 플랜</p>
        <h2 className="text-5xl font-black text-black tracking-[-0.04em] leading-tight mb-4">
          합리적인 가격으로<br />
          <span className="text-gray-200">외주 비용을 없애세요.</span>
        </h2>

        {/* 월간/연간 토글 */}
        <div className="inline-flex items-center gap-3 bg-gray-100 rounded-2xl p-1.5 mt-4">
          <button
            onClick={() => setYearly(false)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              !yearly ? 'bg-white text-black shadow-sm' : 'text-gray-400'
            }`}
          >
            월간
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              yearly ? 'bg-white text-black shadow-sm' : 'text-gray-400'
            }`}
          >
            연간
            <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              2개월 무료
            </span>
          </button>
        </div>
      </div>

      {/* 플랜 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((plan, i) => (
          <div
            key={i}
            className={`relative rounded-3xl p-8 flex flex-col transition-all ${
              plan.featured
                ? 'bg-black text-white shadow-2xl shadow-black/20 scale-[1.03]'
                : 'bg-white border border-gray-100 hover:border-gray-300 hover:shadow-lg'
            }`}
          >
            {/* 인기 뱃지 */}
            {plan.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[11px] font-black px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg">
                  ✦ {plan.badge}
                </span>
              </div>
            )}

            {/* 플랜명 */}
            <div className="mb-6">
              <p className={`text-xs font-black uppercase tracking-widest mb-2 ${plan.featured ? 'text-gray-400' : 'text-gray-400'}`}>
                {plan.name}
              </p>
              <div className="flex items-end gap-1 mb-2">
                {plan.monthly === 0 ? (
                  <span className={`text-5xl font-black tracking-[-0.04em] ${plan.featured ? 'text-white' : 'text-black'}`}>
                    무료
                  </span>
                ) : (
                  <>
                    <span className={`text-5xl font-black tracking-[-0.04em] ${plan.featured ? 'text-white' : 'text-black'}`}>
                      ₩{(yearly ? plan.yearly : plan.monthly).toLocaleString()}
                    </span>
                    <span className={`text-sm font-medium mb-2 ${plan.featured ? 'text-gray-400' : 'text-gray-400'}`}>
                      /월
                    </span>
                  </>
                )}
              </div>
              {yearly && plan.monthly > 0 && (
                <p className={`text-xs font-medium ${plan.featured ? 'text-gray-400' : 'text-gray-400'}`}>
                  <span className="line-through">₩{plan.monthly.toLocaleString()}</span>
                  <span className="ml-1.5 text-green-500 font-bold">연간 결제 시</span>
                </p>
              )}
              <p className={`text-sm mt-3 leading-relaxed ${plan.featured ? 'text-gray-400' : 'text-gray-500'}`}>
                {plan.desc}
              </p>
            </div>

            {/* 기능 목록 */}
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((f, j) => (
                <li key={j} className={`flex items-center gap-2.5 text-sm ${
                  f.included
                    ? plan.featured ? 'text-gray-200' : 'text-gray-700'
                    : 'text-gray-300 line-through'
                }`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
                    f.included
                      ? plan.featured ? 'bg-white/10 text-white' : 'bg-black text-white'
                      : 'bg-gray-100 text-gray-300'
                  }`}>
                    {f.included ? '✓' : '×'}
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              href={plan.ctaHref}
              className={`w-full py-4 rounded-2xl text-sm font-black text-center transition-all hover:scale-[1.02] block ${
                plan.featured
                  ? 'bg-white text-black hover:bg-gray-100'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* 환불 보장 */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 bg-green-50 border border-green-100 rounded-full flex items-center justify-center text-green-500 font-black text-xs">✓</span>
          <span className="font-medium">30일 환불 보장</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-500 font-black text-xs">✓</span>
          <span className="font-medium">신용카드 없이 무료 시작</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 bg-purple-50 border border-purple-100 rounded-full flex items-center justify-center text-purple-500 font-black text-xs">✓</span>
          <span className="font-medium">언제든지 해지 가능</span>
        </div>
      </div>
    </section>
  )
}
