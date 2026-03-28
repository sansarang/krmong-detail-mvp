'use client'
import { useEffect, useState } from 'react'

const DEMO_STEPS = [
  { delay: 0,    type: 'input',    field: 'name',    value: '제주 유기농 녹차 추출 세럼' },
  { delay: 1400, type: 'input',    field: 'category', value: '뷰티/화장품' },
  { delay: 2400, type: 'input',    field: 'desc',    value: '피부 진정과 보습에 탁월한 제주산 녹차 성분...' },
  { delay: 3600, type: 'click',    field: null,       value: null },
  { delay: 4200, type: 'loading',  field: null,       value: null },
  { delay: 6000, type: 'result',   field: null,       value: null },
]

const SECTIONS = [
  { name: '후킹 헤드라인', title: '피부가 숨 쉬는 순간,\n제주의 첫 이슬', color: '#FF5C35' },
  { name: '문제 공감',     title: '자극 많은 스킨케어에\n지치셨나요?',    color: '#6366F1' },
  { name: '제품 소개',     title: '99% 자연 유래 성분,\n순한 보습 세럼',  color: '#0EA5E9' },
  { name: '핵심 특징',     title: '3가지 핵심 효능',                      color: '#10B981' },
  { name: '사용 방법',     title: '하루 2회, 세안 후\n가볍게 펌핑',       color: '#F59E0B' },
  { name: 'CTA',          title: '지금 바로 경험하세요',                  color: '#8B5CF6' },
]

export default function DemoAnimation() {
  const [step, setStep]       = useState(0)
  const [nameVal, setNameVal] = useState('')
  const [catVal, setCatVal]   = useState('')
  const [descVal, setDescVal] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [visibleSections, setVisibleSections] = useState(0)

  function reset() {
    setStep(0); setNameVal(''); setCatVal(''); setDescVal('')
    setLoading(false); setShowResult(false); setVisibleSections(0)
  }

  useEffect(() => {
    reset()
    const timers: ReturnType<typeof setTimeout>[] = []

    // 타이핑 애니메이션
    const typeText = (text: string, setter: (v: string) => void, startDelay: number) => {
      ;[...text].forEach((char, i) => {
        timers.push(setTimeout(() => setter(prev => prev + char), startDelay + i * 38))
      })
    }

    typeText('제주 유기농 녹차 추출 세럼', setNameVal, 300)
    typeText('뷰티/화장품', setCatVal, 1700)
    typeText('피부 진정과 보습에 탁월한 제주산 녹차 성분...', setDescVal, 2700)

    // 버튼 클릭 효과
    timers.push(setTimeout(() => setStep(1), 4000))
    // 로딩
    timers.push(setTimeout(() => setLoading(true), 4200))
    // 결과 표시
    timers.push(setTimeout(() => { setLoading(false); setShowResult(true) }, 5800))

    // 섹션 순차 등장
    SECTIONS.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleSections(i + 1), 6000 + i * 280))
    })

    // 루프
    timers.push(setTimeout(() => reset(), 10500))

    return () => timers.forEach(clearTimeout)
  }, [step === 0 && !showResult ? 0 : -1])

  // 루프 트리거
  const [loop, setLoop] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => {
      reset()
      setLoop(l => l + 1)
    }, 11000)
    return () => clearTimeout(t)
  }, [loop])

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

        {/* 왼쪽: 입력 폼 */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-5 h-5 bg-black rounded-md flex items-center justify-center">
              <span className="text-white text-[8px] font-black">AI</span>
            </div>
            <span className="text-sm font-black tracking-tight">페이지AI</span>
          </div>

          <div className="space-y-4">
            {/* 제품명 */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">제품명</label>
              <div className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 font-medium min-h-[40px] bg-gray-50 relative">
                {nameVal}
                <span className={`inline-block w-0.5 h-4 bg-black ml-0.5 align-middle ${nameVal.length < 16 ? 'animate-pulse' : 'opacity-0'}`} />
              </div>
            </div>

            {/* 카테고리 */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">카테고리</label>
              <div className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 font-medium min-h-[40px] bg-gray-50">
                {catVal}
                <span className={`inline-block w-0.5 h-4 bg-black ml-0.5 align-middle ${catVal.length > 0 && catVal.length < 6 ? 'animate-pulse' : 'opacity-0'}`} />
              </div>
            </div>

            {/* 제품 설명 */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">제품 설명</label>
              <div className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 min-h-[72px] bg-gray-50 leading-relaxed">
                {descVal}
                <span className={`inline-block w-0.5 h-4 bg-black ml-0.5 align-middle ${descVal.length > 0 && descVal.length < 24 ? 'animate-pulse' : 'opacity-0'}`} />
              </div>
            </div>

            {/* 생성 버튼 */}
            <div
              className={`w-full py-3.5 rounded-xl text-center text-sm font-bold transition-all duration-300 ${
                step >= 1
                  ? 'bg-gray-800 text-white scale-95'
                  : 'bg-black text-white'
              }`}
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AI가 생성 중...
                  </span>
                : '상세페이지 생성 시작 →'}
            </div>
          </div>
        </div>

        {/* 오른쪽: 결과 미리보기 */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          {/* 미리보기 헤더 */}
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-bold text-gray-500">모바일 미리보기</span>
            </div>
            {showResult && (
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                완료
              </span>
            )}
          </div>

          {/* 섹션 목록 */}
          <div className="divide-y divide-gray-50 min-h-[340px]">
            {!showResult && !loading && (
              <div className="flex items-center justify-center h-64 text-gray-200 text-sm font-medium">
                제품 정보를 입력하면<br />AI가 자동 생성합니다
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="relative">
                  <div className="w-14 h-14 border-4 border-gray-100 rounded-full" />
                  <div className="w-14 h-14 border-4 border-t-black rounded-full animate-spin absolute inset-0" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-gray-800 mb-1">Claude AI 분석 중</p>
                  <p className="text-xs text-gray-400">6개 섹션 카피라이팅 생성 중...</p>
                </div>
              </div>
            )}

            {showResult && SECTIONS.slice(0, visibleSections).map((sec, i) => (
              <div
                key={i}
                className="px-5 py-4 flex items-start gap-3 transition-all duration-300"
                style={{
                  opacity: visibleSections > i ? 1 : 0,
                  transform: visibleSections > i ? 'translateY(0)' : 'translateY(8px)',
                }}
              >
                <div
                  className="w-1 h-full min-h-[36px] rounded-full shrink-0 mt-0.5"
                  style={{ backgroundColor: sec.color, minHeight: 36 }}
                />
                <div className="flex-1 min-w-0">
                  <span
                    className="text-[9px] font-black uppercase tracking-widest block mb-0.5"
                    style={{ color: sec.color }}
                  >
                    {sec.name}
                  </span>
                  <p className="text-xs font-black text-gray-900 leading-snug whitespace-pre-line">
                    {sec.title}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                  <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${sec.color}20, ${sec.color}05)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 설명 */}
      <p className="text-center text-xs text-gray-300 mt-5 font-medium">
        실제 서비스 작동 방식을 시뮬레이션합니다 · 자동 반복
      </p>
    </div>
  )
}
