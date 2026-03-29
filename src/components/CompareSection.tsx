'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Lang = 'ko' | 'en' | 'ja' | 'zh'

const DATA: Record<Lang, {
  kicker: string
  h2a: string
  h2b: string
  costLabel: string
  costSub: string
  timeLabel: string
  timeSub: string
  timeSuffix: string
  oldTitle: string
  newBrand: string
  cta: string
  costTarget: number
  costPrefix: string
  old: { icon: string; label: string; value: string }[]
  new: { icon: string; label: string; value: string }[]
}> = {
  ko: {
    kicker: '왜 페이지AI인가',
    h2a: '이제 외주는',
    h2b: '필요 없습니다.',
    costLabel: '절약 비용',
    costSub: '외주 대비 평균 절감액',
    timeLabel: '절약 시간',
    timeSub: '납품 대기 시간 제로',
    timeSuffix: '일',
    oldTitle: '기존 외주 방식',
    newBrand: '페이지AI',
    cta: '지금 무료로 시작하기 →',
    costTarget: 500_000,
    costPrefix: '₩',
    old: [
      { icon: '💸', label: '외주 제작비', value: '30~100만원' },
      { icon: '⏳', label: '납품 대기', value: '평균 2주' },
      { icon: '🔁', label: '수정 요청', value: '이메일 왕복' },
      { icon: '😤', label: '소통 피로', value: '담당자 눈치' },
    ],
    new: [
      { icon: '✦', label: '시작 비용', value: '무료' },
      { icon: '✦', label: '완성 시간', value: '5분' },
      { icon: '✦', label: '수정 방식', value: '클릭 한 번' },
      { icon: '✦', label: '소통 대상', value: 'AI (24시간)' },
    ],
  },
  en: {
    kicker: 'Why PageAI',
    h2a: 'Say goodbye to',
    h2b: 'agency back-and-forth.',
    costLabel: 'Avg. savings',
    costSub: 'vs. typical agency quotes',
    timeLabel: 'Time saved',
    timeSub: 'Zero waiting on delivery',
    timeSuffix: ' days',
    oldTitle: 'Traditional outsourcing',
    newBrand: 'PageAI',
    cta: 'Start free →',
    costTarget: 400,
    costPrefix: '$',
    old: [
      { icon: '💸', label: 'Agency fee', value: '$300–800+' },
      { icon: '⏳', label: 'Turnaround', value: '~2 weeks' },
      { icon: '🔁', label: 'Revisions', value: 'Email ping-pong' },
      { icon: '😤', label: 'Coordination', value: 'Account-manager fatigue' },
    ],
    new: [
      { icon: '✦', label: 'Start cost', value: 'Free' },
      { icon: '✦', label: 'Done in', value: '5 min' },
      { icon: '✦', label: 'Edits', value: 'One click' },
      { icon: '✦', label: 'You talk to', value: 'AI (24/7)' },
    ],
  },
  ja: {
    kicker: 'PageAIを選ぶ理由',
    h2a: '外注との',
    h2b: '往復はもう不要。',
    costLabel: 'コスト削減',
    costSub: '外注比較の平均イメージ',
    timeLabel: '時間短縮',
    timeSub: '納品待ちほぼゼロ',
    timeSuffix: '日',
    oldTitle: '従来の外注',
    newBrand: 'PageAI',
    cta: '無料で始める →',
    costTarget: 50000,
    costPrefix: '¥',
    old: [
      { icon: '💸', label: '外注費用', value: '30~100万円相当' },
      { icon: '⏳', label: '納期', value: '平均2週間' },
      { icon: '🔁', label: '修正', value: 'メール往復' },
      { icon: '😤', label: 'コミュニケーション', value: '担当者の空気' },
    ],
    new: [
      { icon: '✦', label: '開始費用', value: '無料' },
      { icon: '✦', label: '完成時間', value: '5分' },
      { icon: '✦', label: '修正', value: 'ワンクリック' },
      { icon: '✦', label: '相手', value: 'AI（24時間）' },
    ],
  },
  zh: {
    kicker: '为什么选择 PageAI',
    h2a: '告别',
    h2b: '外包来回扯皮。',
    costLabel: '节省费用',
    costSub: '相对外包均价（示意）',
    timeLabel: '节省时间',
    timeSub: '几乎零等待交付',
    timeSuffix: '天',
    oldTitle: '传统外包',
    newBrand: 'PageAI',
    cta: '免费开始 →',
    costTarget: 2800,
    costPrefix: '¥',
    old: [
      { icon: '💸', label: '外包制作费', value: '约 ¥2,000–7,000+' },
      { icon: '⏳', label: '交付周期', value: '约2周' },
      { icon: '🔁', label: '修改沟通', value: '邮件来回' },
      { icon: '😤', label: '协调成本', value: '看人脸色' },
    ],
    new: [
      { icon: '✦', label: '起步费用', value: '免费' },
      { icon: '✦', label: '完成时间', value: '5分钟' },
      { icon: '✦', label: '修改方式', value: '一键编辑' },
      { icon: '✦', label: '沟通对象', value: 'AI（24小时）' },
    ],
  },
}

function useCountUp(target: number, duration = 1200, active = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(timer) }
      else setVal(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [active, target, duration])
  return val
}

export default function CompareSection({ lang = 'ko' }: { lang?: Lang }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const D = DATA[lang] ?? DATA.ko

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const savedCost = useCountUp(D.costTarget, 1400, visible)
  const savedDays = useCountUp(14, 900, visible)

  const costDisplay =
    lang === 'en'
      ? `${D.costPrefix}${savedCost.toLocaleString()}`
      : `${D.costPrefix}${savedCost.toLocaleString()}`

  return (
    <section ref={ref} className="max-w-5xl mx-auto px-6 py-24">
      <div
        className="text-center mb-16 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}
      >
        <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">{D.kicker}</p>
        <h2 className="text-5xl md:text-6xl font-black text-black tracking-[-0.04em] leading-tight">
          {D.h2a}<br />
          <span className="text-gray-200">{D.h2b}</span>
        </h2>
      </div>

      <div
        className="grid grid-cols-2 gap-4 mb-12 transition-all duration-700 delay-200"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}
      >
        <div className="bg-black rounded-3xl p-8 text-center">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{D.costLabel}</p>
          <p className="text-4xl md:text-5xl font-black text-white tracking-[-0.04em]">{costDisplay}</p>
          <p className="text-gray-500 text-sm mt-2 font-medium">{D.costSub}</p>
        </div>
        <div className="bg-black rounded-3xl p-8 text-center">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{D.timeLabel}</p>
          <p className="text-4xl md:text-5xl font-black text-white tracking-[-0.04em]">
            {savedDays}{D.timeSuffix}
          </p>
          <p className="text-gray-500 text-sm mt-2 font-medium">{D.timeSub}</p>
        </div>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-700 delay-300"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}
      >
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-red-400 rounded-full" />
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{D.oldTitle}</p>
          </div>
          <div className="space-y-4">
            {D.old.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 transition-all duration-500"
                style={{ opacity: visible ? 1 : 0, transitionDelay: `${400 + i * 80}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium text-gray-500">{item.label}</span>
                </div>
                <span className="text-sm font-black text-gray-400 line-through">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black border border-black rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{D.newBrand}</p>
            </div>
            <div className="space-y-4">
              {D.new.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 transition-all duration-500"
                  style={{ opacity: visible ? 1 : 0, transitionDelay: `${500 + i * 80}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-green-400 font-black text-sm">{item.icon}</span>
                    <span className="text-sm font-medium text-gray-400">{item.label}</span>
                  </div>
                  <span className="text-sm font-black text-white">{item.value}</span>
                </div>
              ))}
            </div>
            <Link
              href="/login"
              className="mt-8 w-full bg-white text-black py-4 rounded-2xl text-sm font-black hover:bg-gray-100 transition-all text-center block hover:scale-[1.02]"
            >
              {D.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
