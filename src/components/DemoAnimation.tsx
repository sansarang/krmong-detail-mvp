'use client'
import { useEffect, useState } from 'react'

const SECTIONS = [
  { name: '후킹 헤드라인', title: '피부가 숨 쉬는 순간,\n제주의 첫 이슬',        color: '#FF5C35' },
  { name: '문제 공감',     title: '자극 많은 스킨케어에\n지치셨나요?',            color: '#6366F1' },
  { name: '제품 소개',     title: '99% 자연 유래 성분,\n순한 보습 세럼',          color: '#0EA5E9' },
  { name: '핵심 특징',     title: '3가지 핵심 효능',                              color: '#10B981' },
  { name: '사용 방법',     title: '하루 2회, 세안 후\n가볍게 펌핑',               color: '#F59E0B' },
  { name: 'CTA',          title: '지금 바로 경험하세요',                          color: '#8B5CF6' },
]

const NAME_TEXT = '제주 유기농 녹차 추출 세럼'
const CAT_TEXT  = '뷰티/화장품'
const DESC_TEXT = '피부 진정과 보습에 탁월한 제주산 녹차 성분...'
const LOOP_MS   = 12000

export default function DemoAnimation() {
  const [loop, setLoop]                   = useState(0)
  const [nameVal, setNameVal]             = useState('')
  const [catVal, setCatVal]               = useState('')
  const [descVal, setDescVal]             = useState('')
  const [btnClicked, setBtnClicked]       = useState(false)
  const [loading, setLoading]             = useState(false)
  const [visibleSections, setVisibleSections] = useState(0)

  useEffect(() => {
    // 전체 초기화
    setNameVal(''); setCatVal(''); setDescVal('')
    setBtnClicked(false); setLoading(false); setVisibleSections(0)

    const timers: ReturnType<typeof setTimeout>[] = []

    const typeText = (
      text: string,
      setter: React.Dispatch<React.SetStateAction<string>>,
      start: number,
    ) => {
      ;[...text].forEach((char, i) =>
        timers.push(setTimeout(() => setter(prev => prev + char), start + i * 40))
      )
    }

    // 타이핑
    typeText(NAME_TEXT, setNameVal, 200)
    typeText(CAT_TEXT,  setCatVal,  200 + NAME_TEXT.length * 40 + 600)
    const descStart = 200 + NAME_TEXT.length * 40 + 600 + CAT_TEXT.length * 40 + 600
    typeText(DESC_TEXT, setDescVal, descStart)

    // 버튼 클릭
    const clickAt = descStart + DESC_TEXT.length * 40 + 500
    timers.push(setTimeout(() => setBtnClicked(true), clickAt))

    // 로딩 시작
    timers.push(setTimeout(() => setLoading(true), clickAt + 200))

    // 로딩 종료 → 섹션 등장
    const resultAt = clickAt + 1800
    timers.push(setTimeout(() => setLoading(false), resultAt))
    SECTIONS.forEach((_, i) =>
      timers.push(setTimeout(() => setVisibleSections(i + 1), resultAt + i * 300))
    )

    // 루프
    timers.push(setTimeout(() => setLoop(l => l + 1), LOOP_MS))

    return () => timers.forEach(clearTimeout)
  }, [loop])

  const showResult = visibleSections > 0

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

        {/* 왼쪽: 입력 폼 */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-5 h-5 bg-black rounded-md flex items-center justify-center">
              <span className="text-white text-[8px] font-black">AI</span>
            </div>
            <span className="text-sm font-black tracking-tight">페이지AI</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">제품명</label>
              <div className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 font-medium min-h-[40px] bg-gray-50">
                {nameVal}
                <span className={`inline-block w-0.5 h-4 bg-black ml-0.5 align-middle ${nameVal.length > 0 && nameVal.length < NAME_TEXT.length ? 'animate-pulse' : 'opacity-0'}`} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">카테고리</label>
              <div className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 font-medium min-h-[40px] bg-gray-50">
                {catVal}
                <span className={`inline-block w-0.5 h-4 bg-black ml-0.5 align-middle ${catVal.length > 0 && catVal.length < CAT_TEXT.length ? 'animate-pulse' : 'opacity-0'}`} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">제품 설명</label>
              <div className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 min-h-[72px] bg-gray-50 leading-relaxed">
                {descVal}
                <span className={`inline-block w-0.5 h-4 bg-black ml-0.5 align-middle ${descVal.length > 0 && descVal.length < DESC_TEXT.length ? 'animate-pulse' : 'opacity-0'}`} />
              </div>
            </div>

            <div
              className={`w-full py-3.5 rounded-xl text-center text-sm font-bold transition-all duration-150 ${
                btnClicked ? 'bg-gray-700 text-white scale-95' : 'bg-black text-white'
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
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${showResult ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-xs font-bold text-gray-500">모바일 미리보기</span>
            </div>
            {showResult && visibleSections >= SECTIONS.length && (
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold animate-pulse">
                ✓ 완료
              </span>
            )}
          </div>

          <div className="divide-y divide-gray-50 min-h-[340px]">
            {!loading && !showResult && (
              <div className="flex items-center justify-center h-64 text-center text-gray-300 text-sm font-medium leading-relaxed">
                제품 정보를 입력하면<br />AI가 자동 생성합니다
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 w-14 h-14 border-4 border-gray-100 rounded-full" />
                  <div className="absolute inset-0 w-14 h-14 border-4 border-t-black rounded-full animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-gray-800 mb-1">Claude AI 분석 중</p>
                  <p className="text-xs text-gray-400">6개 섹션 카피라이팅 생성 중...</p>
                </div>
              </div>
            )}

            {showResult && SECTIONS.map((sec, i) => (
              <div
                key={i}
                className="px-5 py-4 flex items-start gap-3"
                style={{
                  opacity:    visibleSections > i ? 1 : 0,
                  transform:  visibleSections > i ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'opacity 0.35s ease, transform 0.35s ease',
                }}
              >
                <div className="w-1 rounded-full shrink-0 mt-0.5 self-stretch" style={{ backgroundColor: sec.color, minHeight: 36 }} />
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-widest block mb-0.5" style={{ color: sec.color }}>
                    {sec.name}
                  </span>
                  <p className="text-xs font-black text-gray-900 leading-snug whitespace-pre-line">
                    {sec.title}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-lg shrink-0"
                  style={{ background: `linear-gradient(135deg, ${sec.color}30, ${sec.color}08)` }}
                />
              </div>
            ))}
          </div>

          {/* PDF 버튼 */}
          {visibleSections >= SECTIONS.length && (
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
              <div className="w-full bg-black text-white text-xs font-bold py-3 rounded-xl text-center">
                ↓ PDF 다운로드
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-300 mt-5 font-medium">
        실제 서비스 작동 방식 시뮬레이션 · 자동 반복
      </p>
    </div>
  )
}
