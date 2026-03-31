'use client'
import { useState } from 'react'
import Link from 'next/link'
import { loginPathForLang } from '@/lib/uiLocale'

type Lang = 'ko' | 'en' | 'ja' | 'zh'

const CURRENCY: Record<Lang, { symbol: string; pro: number; proY: number; biz: number; bizY: number }> = {
  ko: { symbol: '₩', pro: 39000,  proY: 31200, biz: 99000,  bizY: 79200 },
  en: { symbol: '$', pro: 29,     proY: 23,    biz: 79,     bizY: 63 },
  ja: { symbol: '¥', pro: 4480,   proY: 3580,  biz: 11900,  bizY: 9520 },
  zh: { symbol: '¥', pro: 210,    proY: 168,   biz: 570,    bizY: 456 },
}

const LABELS: Record<Lang, {
  title: string; subtitle: string; monthly: string; yearly: string; free2mo: string;
  free: string; perMonth: string; yearlyNote: string; guarantee: string; noCard: string; cancel: string;
  plans: { name: string; desc: string; cta: string; badge?: string; features: string[] }[]
}> = {
  ko: {
    title: '합리적인 가격으로', subtitle: '외주 비용을 없애세요.',
    monthly: '월간', yearly: '연간', free2mo: '2개월 무료',
    free: '무료', perMonth: '/월', yearlyNote: '연간 결제 시',
    guarantee: '30일 환불 보장', noCard: 'Visa · Mastercard · Apple Pay · Samsung Pay 지원', cancel: '언제든지 해지 가능',
    plans: [
      { name: '무료', desc: '시작해보고 싶은 분', cta: '무료로 시작',
        features: ['월 5회 생성', 'PDF 다운로드', '인라인 편집', 'SEO 분석 ✗', '블로그 발행 ✗', 'A/B 자동 생성 ✗'] },
      { name: '프로', desc: '글로벌 셀러 · 크로스보더', cta: '프로 시작하기', badge: '가장 인기',
        features: ['무제한 생성', '🌏 4개 언어 동시 생성', '6개 플랫폼 자동 최적화', 'SEO 분석 리포트', '전환율 예측 리포트', 'A/B 버전 자동 생성'] },
      { name: '비즈니스', desc: '에이전시·팀·브랜드', cta: '비즈니스 시작',
        features: ['무제한 생성', '🌏 4개 언어 동시 생성', '6개 플랫폼 자동 최적화', 'SEO 분석 리포트', '전환율 예측 리포트', '팀 3인 + API 액세스'] },
    ],
  },
  en: {
    title: 'Replace your agency bills', subtitle: 'with one affordable plan.',
    monthly: 'Monthly', yearly: 'Yearly', free2mo: '2 months free',
    free: 'Free', perMonth: '/mo', yearlyNote: 'billed annually',
    guarantee: '30-day refund', noCard: 'Visa · Mastercard · Apple Pay · Samsung Pay', cancel: 'Cancel anytime',
    plans: [
      { name: 'Free', desc: 'Try it out', cta: 'Start Free',
        features: ['5 generations/month', 'PDF download', 'Inline editing', 'SEO analysis ✗', 'Blog publishing ✗', 'A/B auto-generate ✗'] },
      { name: 'Pro', desc: 'For cross-border sellers', cta: 'Start Pro', badge: 'Most Popular',
        features: ['Unlimited generations', '🌏 4-language simultaneous output', '6-platform auto-optimization', 'SEO analysis report', 'Conversion rate predictor', 'A/B version auto-generate'] },
      { name: 'Business', desc: 'For agencies & brands', cta: 'Start Business',
        features: ['Unlimited generations', '🌏 4-language simultaneous output', '6-platform auto-optimization', 'SEO analysis report', 'Conversion rate predictor', 'Team 3 seats + API access'] },
    ],
  },
  ja: {
    title: '外注コストをなくす', subtitle: '手頃な料金プラン。',
    monthly: '月払い', yearly: '年払い', free2mo: '2ヶ月無料',
    free: '無料', perMonth: '/月', yearlyNote: '年払いの場合',
    guarantee: '30日間返金保証', noCard: 'Visa · Mastercard · Apple Pay · Samsung Pay対応', cancel: 'いつでもキャンセル可',
    plans: [
      { name: '無料', desc: 'まずお試しに', cta: '無料で始める',
        features: ['月5回生成', 'PDFダウンロード', 'インライン編集', 'SEO分析 ✗', 'ブログ投稿 ✗', 'A/B自動生成 ✗'] },
      { name: 'プロ', desc: '越境セラー・グローバル展開', cta: 'プロを始める', badge: '最人気',
        features: ['無制限生成', '🌏 4言語同時生成', '6プラットフォーム自動最適化', 'SEO分析レポート', '転換率予測レポート', 'A/Bバージョン自動生成'] },
      { name: 'ビジネス', desc: 'エージェンシー・チーム向け', cta: 'ビジネスを始める',
        features: ['無制限生成', '🌏 4言語同時生成', '6プラットフォーム自動最適化', 'SEO分析レポート', '転換率予測レポート', 'チーム3名 + APIアクセス'] },
    ],
  },
  zh: {
    title: '合理价格', subtitle: '告别昂贵的外包费用。',
    monthly: '按月付', yearly: '按年付', free2mo: '赠2个月',
    free: '免费', perMonth: '/月', yearlyNote: '按年计费',
    guarantee: '30天退款保证', noCard: 'Visa · Mastercard · Apple Pay · Samsung Pay', cancel: '随时取消',
    plans: [
      { name: '免费版', desc: '先体验一下', cta: '免费开始',
        features: ['每月5次生成', 'PDF下载', '在线编辑', 'SEO分析 ✗', '博客发布 ✗', 'A/B自动生成 ✗'] },
      { name: '专业版', desc: '跨境卖家·全球展开', cta: '开始专业版', badge: '最受欢迎',
        features: ['无限次生成', '🌏 4语言同时生成', '6平台自动优化', 'SEO分析报告', '转化率预测报告', 'A/B版本自动生成'] },
      { name: '商业版', desc: '代理机构·品牌·团队', cta: '开始商业版',
        features: ['无限次生成', '🌏 4语言同时生成', '6平台自动优化', 'SEO分析报告', '转化率预测报告', '3人团队 + API访问'] },
    ],
  },
}

export default function PricingSection({ lang = 'ko' }: { lang?: Lang }) {
  const [yearly, setYearly] = useState(false)
  const C = CURRENCY[lang]
  const L = LABELS[lang]
  const loginHref = loginPathForLang(lang)
  const prices = [0, yearly ? C.proY : C.pro, yearly ? C.bizY : C.biz]

  function fmt(v: number) {
    if (v === 0) return L.free
    if (lang === 'en') return `${C.symbol}${v}`
    return `${C.symbol}${v.toLocaleString()}`
  }

  return (
    <section id="pricing" className="max-w-5xl mx-auto px-5 md:px-6 py-14 md:py-20">
      <div className="text-center mb-10 md:mb-14">
        <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">
          {lang === 'ko' ? '가격 플랜' : lang === 'ja' ? '料金プラン' : lang === 'zh' ? '价格方案' : 'Pricing'}
        </p>
        <h2 className="text-3xl md:text-5xl font-black text-black tracking-[-0.04em] leading-tight mb-4">
          {L.title}<br />
          <span className="text-gray-200">{L.subtitle}</span>
        </h2>
        <div className="inline-flex items-center gap-3 bg-gray-100 rounded-2xl p-1.5 mt-4">
          <button onClick={() => setYearly(false)} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${!yearly ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}>
            {L.monthly}
          </button>
          <button onClick={() => setYearly(true)} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${yearly ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}>
            {L.yearly}
            <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{L.free2mo}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {L.plans.map((plan, i) => {
          const featured = i === 1
          return (
            <div key={i} className={`relative rounded-3xl p-8 flex flex-col transition-all ${featured ? 'bg-black text-white shadow-2xl shadow-black/20 scale-[1.03]' : 'bg-white border border-gray-100 hover:border-gray-300 hover:shadow-lg'}`}>
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
                  <span className={`text-4xl md:text-5xl font-black tracking-[-0.04em] ${featured ? 'text-white' : 'text-black'}`}>
                    {fmt(prices[i])}
                  </span>
                  {prices[i] > 0 && (
                    <span className="text-sm font-medium mb-2 text-gray-400">{L.perMonth}</span>
                  )}
                </div>
                {yearly && prices[i] > 0 && (
                  <p className="text-xs font-medium text-gray-400">
                    <span className="line-through">{fmt(i === 1 ? C.pro : C.biz)}</span>
                    <span className="ml-1.5 text-green-500 font-bold">{L.yearlyNote}</span>
                  </p>
                )}
                <p className={`text-sm mt-3 leading-relaxed ${featured ? 'text-gray-400' : 'text-gray-500'}`}>{plan.desc}</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f, j) => {
                  const crossed = f.endsWith('✗')
                  const txt = f.replace(' ✗', '')
                  return (
                    <li key={j} className={`flex items-center gap-2.5 text-sm ${crossed ? 'text-gray-300 line-through' : featured ? 'text-gray-200' : 'text-gray-700'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${crossed ? 'bg-gray-100 text-gray-300' : featured ? 'bg-white/10 text-white' : 'bg-black text-white'}`}>
                        {crossed ? '×' : '✓'}
                      </span>
                      {txt}
                    </li>
                  )
                })}
              </ul>
              <Link href={loginHref} className={`w-full py-4 rounded-2xl text-sm font-black text-center transition-all hover:scale-[1.02] block ${featured ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-800'}`}>
                {plan.cta}
              </Link>
            </div>
          )
        })}
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-400">
        {[L.guarantee, L.noCard, L.cancel].map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border ${i === 0 ? 'bg-green-50 border-green-100 text-green-500' : i === 1 ? 'bg-blue-50 border-blue-100 text-blue-500' : 'bg-purple-50 border-purple-100 text-purple-500'}`}>
              ✓
            </span>
            <span className="font-medium">{t}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
