'use client'
import { useState, useMemo } from 'react'

const FORBIDDEN: { word: string; alt: string }[] = [
  { word: '최고',   alt: '높은 만족도' },
  { word: '최저',   alt: '합리적인 가격' },
  { word: '최대',   alt: '넉넉한' },
  { word: '최소',   alt: '가볍고 슬림한' },
  { word: '1등',    alt: '많은 분들이 선택한' },
  { word: '보장',   alt: '확인된' },
  { word: '효과',   alt: '도움' },
  { word: '치료',   alt: '케어' },
  { word: '방지',   alt: '예방에 도움' },
  { word: '만족',   alt: '좋은 경험' },
  { word: '상담',   alt: '문의' },
  { word: '마감',   alt: '한정 수량' },
  { word: '가격',   alt: '금액' },
  { word: '무료',   alt: '서비스 포함' },
  { word: '특가',   alt: '특별 혜택가' },
  { word: '혜택',   alt: '플러스 구성' },
  { word: '완벽',   alt: '꼼꼼하게 설계된' },
  { word: '100%',   alt: '높은 함량' },
  { word: '전문가', alt: '숙련된 제조사' },
  { word: '검증',   alt: '확인된' },
  { word: '인증',   alt: '기준 충족' },
  { word: '의학적', alt: '연구 기반' },
  { word: '부작용', alt: '주의사항' },
  { word: '즉시',   alt: '빠르게' },
  { word: '절대',   alt: '확실히' },
]

function buildHighlight(text: string, foundWords: string[]): string {
  let out = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  foundWords.forEach(w => {
    const re = new RegExp(w, 'g')
    out = out.replace(re, m => `<mark class="bg-red-500/30 text-red-300 rounded px-0.5">${m}</mark>`)
  })
  return out
}

export default function KeywordCheckerClient() {
  const [text, setText] = useState('')

  const analysis = useMemo(() => {
    return FORBIDDEN.filter(f => text.includes(f.word))
  }, [text])

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">상세페이지 글 붙여넣기</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="상세페이지 글을 여기에 붙여넣으세요..."
            className="w-full h-72 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:border-blue-500/50 transition-all"
          />
          <p className="text-xs text-gray-600 mt-1.5">{text.length.toLocaleString()}자 입력됨</p>
        </div>
        <div>
          <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">금칙어 하이라이트</label>
          <div
            className="w-full h-72 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-gray-300 overflow-auto leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: text
                ? buildHighlight(text, analysis.map(f => f.word))
                : '<span class="text-gray-600">왼쪽에 글을 입력하면 금칙어가 빨간색으로 표시됩니다.</span>',
            }}
          />
        </div>
      </div>

      <div className={`rounded-2xl border p-5 transition-all ${
        analysis.length > 0 ? 'bg-red-500/10 border-red-500/20'
        : text ? 'bg-green-500/10 border-green-500/20'
        : 'bg-white/5 border-white/8'
      }`}>
        {!text && <p className="text-sm text-gray-500 text-center">글을 입력하면 금칙어를 자동으로 분석합니다.</p>}
        {text && analysis.length === 0 && (
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-black text-green-400">금칙어가 발견되지 않았습니다!</p>
              <p className="text-xs text-gray-500 mt-0.5">이 텍스트는 스마트스토어·쿠팡 기준으로 안전합니다.</p>
            </div>
          </div>
        )}
        {analysis.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-black text-red-400">금칙어 {analysis.length}개 발견</p>
                <p className="text-xs text-gray-500 mt-0.5">아래 단어를 대체어로 바꿔주세요.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {analysis.map(item => (
                <div key={item.word} className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-red-400 font-black text-sm line-through">{item.word}</span>
                    <span className="text-gray-500 text-xs">→</span>
                    <span className="text-green-400 font-bold text-sm">{item.alt}</span>
                  </div>
                  <p className="text-[10px] text-gray-600">대체 추천 단어</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
