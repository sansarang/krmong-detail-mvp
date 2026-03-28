'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const OLD = [
  { icon: '💸', label: '외주 제작비', value: '30~100만원' },
  { icon: '⏳', label: '납품 대기',   value: '평균 2주' },
  { icon: '🔁', label: '수정 요청',   value: '이메일 왕복' },
  { icon: '😤', label: '소통 피로',   value: '담당자 눈치' },
]

const NEW = [
  { icon: '✦', label: '시작 비용',   value: '무료' },
  { icon: '✦', label: '완성 시간',   value: '5분' },
  { icon: '✦', label: '수정 방식',   value: '클릭 한 번' },
  { icon: '✦', label: '소통 대상',   value: 'AI (24시간)' },
]

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

export default function CompareSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const savedCost = useCountUp(500000, 1400, visible)
  const savedDays = useCountUp(14, 900, visible)

  return (
    <section ref={ref} className="max-w-5xl mx-auto px-6 py-24">

      {/* 타이틀 */}
      <div
        className="text-center mb-16 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}
      >
        <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">왜 페이지AI인가</p>
        <h2 className="text-5xl md:text-6xl font-black text-black tracking-[-0.04em] leading-tight">
          이제 외주는<br />
          <span className="text-gray-200">필요 없습니다.</span>
        </h2>
      </div>

      {/* 절약 카운터 */}
      <div
        className="grid grid-cols-2 gap-4 mb-12 transition-all duration-700 delay-200"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}
      >
        <div className="bg-black rounded-3xl p-8 text-center">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">절약 비용</p>
          <p className="text-4xl md:text-5xl font-black text-white tracking-[-0.04em]">
            ₩{savedCost.toLocaleString()}
          </p>
          <p className="text-gray-500 text-sm mt-2 font-medium">외주 대비 평균 절감액</p>
        </div>
        <div className="bg-black rounded-3xl p-8 text-center">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">절약 시간</p>
          <p className="text-4xl md:text-5xl font-black text-white tracking-[-0.04em]">
            {savedDays}일
          </p>
          <p className="text-gray-500 text-sm mt-2 font-medium">납품 대기 시간 제로</p>
        </div>
      </div>

      {/* 비교 테이블 */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-700 delay-300"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}
      >
        {/* 기존 방식 */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-red-400 rounded-full" />
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">기존 외주 방식</p>
          </div>
          <div className="space-y-4">
            {OLD.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 transition-all duration-500"
                style={{
                  opacity:   visible ? 1 : 0,
                  transitionDelay: `${400 + i * 80}ms`,
                }}
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

        {/* 페이지AI */}
        <div className="bg-black border border-black rounded-3xl p-8 relative overflow-hidden">
          {/* 배경 글로우 */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">페이지AI</p>
            </div>
            <div className="space-y-4">
              {NEW.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 transition-all duration-500"
                  style={{
                    opacity:   visible ? 1 : 0,
                    transitionDelay: `${500 + i * 80}ms`,
                  }}
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
              지금 무료로 시작하기 →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
