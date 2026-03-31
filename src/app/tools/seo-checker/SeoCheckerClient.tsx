'use client'
import { useState, useMemo } from 'react'

const CTA_WORDS = ['지금', '바로', '구매', '클릭', '신청', '확인', '주문', '장바구니']

interface Criterion {
  id: string
  label: string
  description: string
  maxScore: number
  check: (text: string) => { score: number; detail: string; tip?: string }
}

const CRITERIA: Criterion[] = [
  {
    id: 'length',
    label: '글자수',
    description: '500자 이상',
    maxScore: 20,
    check: (text) => {
      const len = text.replace(/\s/g, '').length
      if (len >= 500) return { score: 20, detail: `${len.toLocaleString()}자 — 충분한 분량` }
      if (len >= 300) return { score: 12, detail: `${len.toLocaleString()}자 — 조금 부족`, tip: '최소 500자 이상 작성하면 검색 노출이 높아집니다.' }
      return { score: 5, detail: `${len.toLocaleString()}자 — 매우 짧음`, tip: '최소 500자 이상 작성하세요. 제품 특징, 사용 방법, 주의사항 등을 추가해보세요.' }
    },
  },
  {
    id: 'numbers',
    label: '숫자·수치 포함',
    description: '3개 이상',
    maxScore: 20,
    check: (text) => {
      const matches = text.match(/\d+[%개kg㎖ml원cm mm]+|\d{2,}/g) || []
      const unique = [...new Set(matches)]
      if (unique.length >= 3) return { score: 20, detail: `${unique.length}개 수치 포함 — 신뢰도 높음` }
      if (unique.length >= 1) return { score: 10, detail: `${unique.length}개 수치 포함`, tip: '가격, 용량, 크기, 성분 함량 등 구체적인 수치를 3개 이상 넣으면 신뢰도가 높아집니다.' }
      return { score: 0, detail: '수치 없음', tip: '가격, 용량, 크기, 사용 기간 등 구체적인 숫자를 3개 이상 추가해보세요.' }
    },
  },
  {
    id: 'keywords',
    label: '핵심 키워드 반복',
    description: '주요 단어 3회 이상',
    maxScore: 20,
    check: (text) => {
      const words = text.replace(/[^\w가-힣]/g, ' ').split(/\s+/).filter(w => w.length >= 2)
      const freq: Record<string, number> = {}
      words.forEach(w => { freq[w] = (freq[w] || 0) + 1 })
      const repeated = Object.entries(freq).filter(([, cnt]) => cnt >= 3).sort((a, b) => b[1] - a[1])
      if (repeated.length >= 3) return { score: 20, detail: `"${repeated[0][0]}" 등 ${repeated.length}개 키워드 반복` }
      if (repeated.length >= 1) return { score: 10, detail: `${repeated.length}개 키워드 반복`, tip: '핵심 상품명이나 특징 단어를 자연스럽게 3회 이상 반복하면 검색 노출이 좋아집니다.' }
      return { score: 0, detail: '반복 키워드 없음', tip: '핵심 상품명·카테고리 키워드를 본문에 자연스럽게 3회 이상 넣어보세요.' }
    },
  },
  {
    id: 'cta',
    label: 'CTA 문구 포함',
    description: "'지금', '바로', '구매' 등",
    maxScore: 20,
    check: (text) => {
      const found = CTA_WORDS.filter(w => text.includes(w))
      if (found.length >= 2) return { score: 20, detail: `"${found.slice(0, 2).join('", "')}" 등 CTA 포함` }
      if (found.length === 1) return { score: 12, detail: `"${found[0]}" 포함`, tip: '"지금 구매하기", "바로 주문하기" 같은 CTA 문구를 2개 이상 추가해보세요.' }
      return { score: 0, detail: 'CTA 문구 없음', tip: '"지금 바로 주문하기", "클릭해서 확인하기" 같은 구매 유도 문구를 추가하면 전환율이 높아집니다.' }
    },
  },
  {
    id: 'paragraphs',
    label: '문단 구분',
    description: '줄바꿈 3회 이상',
    maxScore: 20,
    check: (text) => {
      const breaks = (text.match(/\n/g) || []).length
      if (breaks >= 5) return { score: 20, detail: `${breaks}회 줄바꿈 — 가독성 좋음` }
      if (breaks >= 3) return { score: 14, detail: `${breaks}회 줄바꿈`, tip: '문단을 더 나누면 모바일에서 읽기 편합니다.' }
      return { score: 0, detail: `${breaks}회 줄바꿈 — 가독성 낮음`, tip: '문단을 최소 3~5개로 나눠 모바일 가독성을 높여보세요.' }
    },
  },
]

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
  const r = 40
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }} />
    </svg>
  )
}

export default function SeoCheckerClient() {
  const [text, setText] = useState('')

  const results = useMemo(() => {
    return CRITERIA.map(c => ({ ...c, result: c.check(text) }))
  }, [text])

  const totalScore = results.reduce((sum, c) => sum + c.result.score, 0)

  const scoreLabel =
    totalScore >= 80 ? { label: '우수', color: 'text-green-400', bg: 'bg-green-500/20' }
    : totalScore >= 60 ? { label: '양호', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
    : totalScore >= 40 ? { label: '보통', color: 'text-orange-400', bg: 'bg-orange-500/20' }
    : { label: '미흡', color: 'text-red-400', bg: 'bg-red-500/20' }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">상세페이지 글 붙여넣기</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="상세페이지 글을 여기에 붙여넣으세요..."
          className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:border-blue-500/50 transition-all"
        />
        <p className="text-xs text-gray-600 mt-1.5">{text.replace(/\s/g, '').length.toLocaleString()}자 입력됨</p>
      </div>

      {text && (
        <>
          <div className="flex items-center gap-6 bg-white/5 border border-white/8 rounded-2xl p-6">
            <div className="relative shrink-0">
              <ScoreRing score={totalScore} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-black ${scoreLabel.color}`}>{totalScore}</span>
                <span className="text-[9px] text-gray-500">/ 100</span>
              </div>
            </div>
            <div>
              <span className={`text-xs font-black px-2.5 py-1 rounded-full ${scoreLabel.bg} ${scoreLabel.color} mb-2 inline-block`}>
                {scoreLabel.label}
              </span>
              <p className="text-lg font-black text-white">SEO 점수 {totalScore}점</p>
              <p className="text-sm text-gray-500 mt-1">
                {totalScore >= 80 ? '검색 노출에 유리한 상세페이지입니다.'
                  : totalScore >= 60 ? '몇 가지를 개선하면 더 좋은 노출을 기대할 수 있습니다.'
                  : '아래 개선 사항을 반영하면 검색 노출이 크게 향상됩니다.'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {results.map(item => (
              <div key={item.id} className="bg-white/5 border border-white/8 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      item.result.score === item.maxScore ? 'bg-green-500/20 text-green-400'
                      : item.result.score > 0 ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                    }`}>
                      {item.result.score === item.maxScore ? '✓' : item.result.score > 0 ? '△' : '✗'}
                    </span>
                    <span className="text-sm font-black text-white">{item.label}</span>
                    <span className="text-xs text-gray-600">{item.description}</span>
                  </div>
                  <span className={`text-sm font-black ${
                    item.result.score === item.maxScore ? 'text-green-400'
                    : item.result.score > 0 ? 'text-yellow-400'
                    : 'text-red-400'
                  }`}>
                    {item.result.score} / {item.maxScore}
                  </span>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      item.result.score === item.maxScore ? 'bg-green-500'
                      : item.result.score > 0 ? 'bg-yellow-500'
                      : 'bg-red-500'
                    }`}
                    style={{ width: `${(item.result.score / item.maxScore) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{item.result.detail}</p>
                {item.result.tip && (
                  <p className="text-xs text-blue-400 mt-1.5 bg-blue-500/10 rounded-lg px-3 py-2">
                    💡 {item.result.tip}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {!text && (
        <div className="text-center py-10 text-gray-600 text-sm">
          글을 입력하면 SEO 점수를 즉시 분석해드립니다.
        </div>
      )}
    </div>
  )
}
