'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const SECTIONS = [
  { label: '섹션 1', title: '지금 피부가 보내는 SOS 신호, 무시하고 계신가요?', preview: '매일 아침 거울을 볼 때마다 피부가 당기거나 칙칙한 느낌이 드신가요? 수분크림을 아무리 발라도 2시간 후면 다시 건조해지는...' },
  { label: '섹션 2', title: '히알루론산, 크기가 다르면 작용이 다릅니다', preview: '고분자: 피부 표면 수분 필름 형성\n중분자: 표피층 침투, 수분 저장\n저분자: 진피층까지 침투, 속 건조 개선' },
  { label: '섹션 3', title: '비건 인증 × 피부과 테스트 완료', preview: '동물성 원료 0% · 알레르기 유발 향료 0% · 파라벤 미사용 · 피부과 테스트 완료 · 비건 소사이어티 공식 인증' },
  { label: '섹션 4', title: '이런 분들께 추천드립니다', preview: '✓ 보습크림을 발라도 금방 건조해지는 분\n✓ 화장이 들뜨는 분\n✓ 민감성 피부로 새 제품 사용이 걱정되는 분' },
  { label: '섹션 5', title: '2주 후기', preview: '"민감한 피부라 새 제품 쓸 때마다 걱정했는데 바르고 나서 당기거나 붉어지는 느낌 전혀 없었어요. 2주 정도 쓰니까 피부 결이 확실히..."' },
  { label: '섹션 6', title: '지금 구매 특가', preview: '첫 구매 20% 할인 자동 적용 · 미니 사이즈 무료 증정 · 무료 배송 · 당일 출고' },
]

export default function BeforeAfterSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [revealed, setRevealed] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const timers: ReturnType<typeof setTimeout>[] = []
    SECTIONS.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealed(i + 1), 400 + i * 350))
    })
    return () => timers.forEach(clearTimeout)
  }, [visible])

  return (
    <section ref={ref} className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-white border border-gray-200 px-4 py-2 rounded-full">실제 결과물</span>
          <h2 className="text-4xl md:text-5xl font-black text-black mt-6 mb-4 tracking-tight">
            입력 30초,<br />이렇게 나옵니다.
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">제품 설명 몇 줄만 입력하면 AI가 전환율 높은 상세페이지를 즉시 완성합니다.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Before — 입력 */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs font-bold text-gray-400">INPUT — 셀러가 입력한 내용</span>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">제품명</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium">
                  비건 히알루론산 앰플 50ml
                </div>
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">카테고리</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium">
                  뷰티/스킨케어
                </div>
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">제품 설명</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 leading-relaxed">
                  3중 히알루론산, 비건 인증, 저자극 무향, 건성·민감성 피부 적합, 피부과 테스트 완료
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 font-medium">
              <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-black">✓</span>
              총 입력 시간 약 30초
            </div>
          </div>

          {/* After — 결과 */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-4 ml-2">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">OUTPUT — AI 생성 결과</span>
            </div>
            <div className="space-y-3">
              {SECTIONS.map((section, i) => (
                <div
                  key={i}
                  className={`bg-white border rounded-2xl p-4 shadow-sm transition-all duration-500 ${
                    revealed > i
                      ? 'opacity-100 translate-y-0 border-gray-200'
                      : 'opacity-0 translate-y-4 border-transparent'
                  }`}
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-lg flex items-center justify-center text-xs font-black mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-black text-black leading-snug mb-1">{section.title}</p>
                      <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line line-clamp-2">{section.preview}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {revealed >= SECTIONS.length && (
              <div className="mt-4 flex items-center justify-between bg-black rounded-2xl p-4 animate-fade-up">
                <div>
                  <p className="text-white font-black text-sm">✓ 6섹션 완성</p>
                  <p className="text-gray-400 text-xs mt-0.5">PDF 다운로드 가능</p>
                </div>
                <Link
                  href="/login"
                  className="bg-white text-black text-xs font-black px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  내 것도 만들기 →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/samples"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors border border-gray-200 bg-white px-6 py-3 rounded-xl hover:border-gray-400"
          >
            다양한 카테고리 샘플 보기 →
          </Link>
        </div>
      </div>
    </section>
  )
}
