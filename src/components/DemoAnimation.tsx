'use client'
import { useEffect, useState } from 'react'

const NAME_TEXT = '제주 유기농 녹차 추출 세럼'
const CAT_TEXT  = '뷰티/화장품'
const DESC_TEXT = '피부 진정과 보습에 탁월한 제주산 녹차 성분...'

const SECTIONS = [
  { name: '후킹 헤드라인', title: '피부가 보내는 SOS 신호, 무시하고 계신가요?', color: '#FF5C35' },
  { name: '제품 소개',     title: '3중 녹차 성분이 다른 이유',                 color: '#6366F1' },
  { name: '핵심 특징',     title: '비건 인증 × 피부과 테스트 완료',             color: '#10B981' },
  { name: '추천 대상',     title: '이런 분께 꼭 맞습니다',                      color: '#3B82F6' },
  { name: '고객 후기',     title: '"자극 없이 촉촉해졌어요"',                   color: '#F59E0B' },
  { name: '구매 유도',     title: '지금 바로 — 첫 구매 20% 할인',               color: '#8B5CF6' },
]

const PLATFORMS = [
  { id: 'naver',     label: '네이버 블로그', icon: 'N',  bg: '#03C75A', text: '#fff' },
  { id: 'tistory',   label: '티스토리',     icon: 'T',  bg: '#F26522', text: '#fff' },
  { id: 'instagram', label: '인스타그램',   icon: '📸', bg: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', text: '#fff' },
  { id: 'wordpress', label: '워드프레스',   icon: 'W',  bg: '#21759B', text: '#fff' },
]

// 스텝 정의
// 0: 타이핑 (제품명)
// 1: 타이핑 (카테고리)
// 2: 타이핑 (설명)
// 3: 사진 업로드
// 4: AI 생성 중
// 5: 결과 섹션 표시
// 6: SEO 점수
// 7: 발행 버튼

const TOTAL_MS = 18000

export default function DemoAnimation() {
  const [loop, setLoop]               = useState(0)
  const [nameVal, setNameVal]         = useState('')
  const [catVal, setCatVal]           = useState('')
  const [descVal, setDescVal]         = useState('')
  const [photoAdded, setPhotoAdded]   = useState(false)
  const [generating, setGenerating]   = useState(false)
  const [sections, setSections]       = useState(0)
  const [seoScore, setSeoScore]       = useState(0)
  const [seoVisible, setSeoVisible]   = useState(false)
  const [publishStep, setPublishStep] = useState(0) // 0~4 플랫폼 하나씩 등장
  const [activePlatform, setActivePlatform] = useState(-1)

  useEffect(() => {
    setNameVal(''); setCatVal(''); setDescVal('')
    setPhotoAdded(false); setGenerating(false)
    setSections(0); setSeoScore(0); setSeoVisible(false)
    setPublishStep(0); setActivePlatform(-1)

    const T: ReturnType<typeof setTimeout>[] = []
    const add = (fn: () => void, ms: number) => T.push(setTimeout(fn, ms))

    // --- 타이핑 헬퍼 ---
    let cursor = 300
    const type = (text: string, setter: React.Dispatch<React.SetStateAction<string>>, gap = 55) => {
      ;[...text].forEach((ch, i) => {
        const t = cursor + i * gap
        T.push(setTimeout(() => setter((prev: string) => prev + ch), t))
      })
      cursor += text.length * gap + 500
    }

    // 1. 제품명 타이핑
    type(NAME_TEXT, setNameVal)

    // 2. 카테고리 타이핑
    type(CAT_TEXT, setCatVal, 65)

    // 3. 설명 타이핑
    type(DESC_TEXT, setDescVal, 50)

    // 4. 사진 업로드
    add(() => setPhotoAdded(true), cursor)
    cursor += 800

    // 5. 생성 버튼 클릭 → AI 생성 중
    add(() => setGenerating(true), cursor)
    cursor += 2000

    // 6. 생성 완료 → 섹션 등장
    add(() => setGenerating(false), cursor)
    SECTIONS.forEach((_, i) => add(() => setSections(i + 1), cursor + i * 280))
    cursor += SECTIONS.length * 280 + 400

    // 7. SEO 점수 카운트업
    add(() => setSeoVisible(true), cursor)
    for (let v = 0; v <= 95; v += 5) {
      add(() => setSeoScore(v), cursor + v * 12)
    }
    cursor += 1400

    // 8. 발행 버튼 등장 (하나씩)
    PLATFORMS.forEach((_, i) => add(() => setPublishStep(i + 1), cursor + i * 300))
    cursor += PLATFORMS.length * 300 + 600

    // 9. 플랫폼 하이라이트 순환
    PLATFORMS.forEach((_, i) => add(() => setActivePlatform(i), cursor + i * 500))
    cursor += PLATFORMS.length * 500

    // 루프
    add(() => setLoop(l => l + 1), TOTAL_MS)

    return () => T.forEach(clearTimeout)
  }, [loop])

  const showResult = sections > 0 && !generating

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">

        {/* ── 왼쪽: 입력 폼 ── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 space-y-4">
          {/* 헤더 */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-[8px] font-black">AI</span>
            </div>
            <span className="text-sm font-black tracking-tight">PageAI</span>
            <span className="ml-auto text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">STEP 1 · 입력</span>
          </div>

          {/* 제품명 */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">제품명</label>
            <div className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 font-medium min-h-[40px] bg-gray-50 flex items-center">
              {nameVal}
              <span className={`inline-block w-0.5 h-4 bg-black ml-0.5 ${nameVal.length > 0 && nameVal.length < NAME_TEXT.length ? 'animate-pulse' : 'opacity-0'}`} />
            </div>
          </div>

          {/* 카테고리 */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">카테고리</label>
            <div className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 min-h-[40px] bg-gray-50 flex items-center">
              {catVal || <span className="text-gray-300 text-xs">카테고리 선택...</span>}
              <span className={`inline-block w-0.5 h-4 bg-black ml-0.5 ${catVal.length > 0 && catVal.length < CAT_TEXT.length ? 'animate-pulse' : 'opacity-0'}`} />
            </div>
          </div>

          {/* 설명 */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">제품 설명</label>
            <div className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 min-h-[64px] bg-gray-50 leading-relaxed">
              {descVal}
              <span className={`inline-block w-0.5 h-4 bg-black ml-0.5 align-middle ${descVal.length > 0 && descVal.length < DESC_TEXT.length ? 'animate-pulse' : 'opacity-0'}`} />
            </div>
          </div>

          {/* 사진 업로드 */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">제품 사진</label>
            <div className={`border-2 border-dashed rounded-xl px-3 py-3 flex items-center gap-3 transition-all duration-500 ${photoAdded ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              {photoAdded ? (
                <>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-base">🖼️</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-green-700">photo_serum.jpg</p>
                    <p className="text-[10px] text-green-500">✓ 업로드 완료</p>
                  </div>
                  <span className="ml-auto text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">1/3</span>
                </>
              ) : (
                <div className="flex items-center gap-2 text-gray-300 w-full justify-center py-1">
                  <span className="text-xl">📷</span>
                  <span className="text-xs">사진 업로드</span>
                </div>
              )}
            </div>
          </div>

          {/* 생성 버튼 */}
          <button
            className={`w-full py-3.5 rounded-xl text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 ${
              generating ? 'bg-gray-700 text-white' : photoAdded ? 'bg-black text-white shadow-lg shadow-black/20 scale-[1.02]' : 'bg-black text-white'
            }`}
          >
            {generating ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> AI가 생성 중...</>
            ) : showResult ? (
              <><span>✓</span> 생성 완료</>
            ) : (
              <><span>✦</span> AI 상세페이지 생성 →</>
            )}
          </button>
        </div>

        {/* ── 오른쪽: 결과 패널 ── */}
        <div className="space-y-3">

          {/* 결과물 카드 */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-all ${generating ? 'bg-yellow-400 animate-pulse' : showResult ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />
                <span className="text-xs font-bold text-gray-500">
                  {generating ? 'Claude AI 분석 중...' : showResult ? '생성 완료 · 45초 소요' : 'AI 미리보기'}
                </span>
              </div>
              {showResult && sections >= SECTIONS.length && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">✓ 6개 섹션</span>
              )}
            </div>

            <div className="min-h-[200px]">
              {/* 대기 상태 */}
              {!generating && !showResult && (
                <div className="flex items-center justify-center h-48 text-center">
                  <div>
                    <div className="text-3xl mb-2">✦</div>
                    <p className="text-gray-300 text-xs font-medium">제품 정보를 입력하면<br />AI가 자동 생성합니다</p>
                  </div>
                </div>
              )}

              {/* 생성 중 */}
              {generating && (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-black rounded-full animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-gray-800 mb-0.5">Claude AI 분석 중</p>
                    <p className="text-[10px] text-gray-400">6개 섹션 카피라이팅 생성 중...</p>
                  </div>
                </div>
              )}

              {/* 결과 섹션들 */}
              {showResult && (
                <div className="divide-y divide-gray-50">
                  {SECTIONS.map((sec, i) => (
                    <div
                      key={i}
                      className="px-4 py-3 flex items-center gap-3"
                      style={{
                        opacity:   sections > i ? 1 : 0,
                        transform: sections > i ? 'translateX(0)' : 'translateX(-12px)',
                        transition: 'opacity 0.3s ease, transform 0.3s ease',
                      }}
                    >
                      <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: sec.color, minHeight: 28 }} />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-widest block mb-0.5" style={{ color: sec.color }}>{sec.name}</span>
                        <p className="text-[11px] font-black text-gray-800 leading-snug truncate">{sec.title}</p>
                      </div>
                      <div className="w-7 h-7 rounded-lg shrink-0" style={{ background: `linear-gradient(135deg,${sec.color}25,${sec.color}08)` }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SEO 점수 카드 */}
          <div
            className="bg-white rounded-2xl border border-gray-100 shadow-md px-4 py-3 flex items-center gap-4 transition-all duration-500"
            style={{ opacity: seoVisible ? 1 : 0, transform: seoVisible ? 'translateY(0)' : 'translateY(16px)' }}
          >
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none" stroke="#F3F4F6" strokeWidth="5" />
                <circle
                  cx="28" cy="28" r="22" fill="none"
                  stroke="#10B981" strokeWidth="5"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - seoScore / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.15s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-black">{seoScore}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">SEO 점수</p>
              <p className="text-sm font-black text-black">{seoScore >= 90 ? '최상위 수준 🟢' : seoScore >= 70 ? '우수 🟡' : '분석 중...'}</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {['키워드', '제목', '본문', 'CTA'].map((t, i) => (
                  <span
                    key={t}
                    className="text-[9px] bg-green-50 text-green-600 border border-green-200 px-1.5 py-0.5 rounded-full font-bold transition-all duration-300"
                    style={{ opacity: seoScore > i * 25 ? 1 : 0 }}
                  >✓ {t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* 발행 버튼들 */}
          <div
            className="bg-white rounded-2xl border border-gray-100 shadow-md px-4 py-3 transition-all duration-500"
            style={{ opacity: publishStep > 0 ? 1 : 0, transform: publishStep > 0 ? 'translateY(0)' : 'translateY(16px)' }}
          >
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2.5">
              📤 1-click 발행
            </p>
            <div className="grid grid-cols-4 gap-2">
              {PLATFORMS.map((p, i) => (
                <div
                  key={p.id}
                  className="flex flex-col items-center gap-1 transition-all duration-300"
                  style={{
                    opacity:   publishStep > i ? 1 : 0,
                    transform: publishStep > i ? 'scale(1)' : 'scale(0.7)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-200 shadow-md"
                    style={{
                      background: p.bg,
                      color: p.text,
                      transform: activePlatform === i ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: activePlatform === i ? `0 4px 16px ${p.id === 'naver' ? '#03C75A' : p.id === 'tistory' ? '#F26522' : p.id === 'instagram' ? '#fd1d1d' : '#21759B'}50` : undefined,
                    }}
                  >
                    {p.icon}
                  </div>
                  <span className="text-[8px] text-gray-500 font-bold text-center leading-tight">{p.label.replace(' ', '\n')}</span>
                </div>
              ))}
            </div>
            {activePlatform >= 0 && (
              <div
                className="mt-2.5 text-[10px] font-bold text-center transition-all duration-300"
                style={{ color: activePlatform === 0 ? '#03C75A' : activePlatform === 1 ? '#F26522' : activePlatform === 2 ? '#fd1d1d' : '#21759B' }}
              >
                {PLATFORMS[activePlatform]?.label}에 발행 준비 완료 ✓
              </div>
            )}
          </div>

        </div>
      </div>

      <p className="text-center text-xs text-gray-300 mt-5 font-medium">
        실제 서비스 작동 방식 시뮬레이션 · 자동 반복
      </p>
    </div>
  )
}
