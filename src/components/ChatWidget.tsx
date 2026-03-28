'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_QUESTIONS = [
  '무료로 써볼 수 있나요?',
  '어떤 업종에 쓸 수 있어요?',
  '결과물 퀄리티가 어때요?',
  '네이버 블로그에 올릴 수 있어요?',
  '수정도 가능한가요?',
]

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // 10초 후 말풍선 표시
  useEffect(() => {
    const t = setTimeout(() => setShowBubble(true), 10000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text: string) {
    if (!text.trim() || loading) return
    setInput('')
    setShowBubble(false)

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '잠시 후 다시 시도해주세요 🙏' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* 말풍선 */}
      {showBubble && !open && (
        <div
          className="fixed bottom-24 right-6 z-40 bg-white border border-gray-200 rounded-2xl rounded-br-sm px-4 py-3 shadow-xl max-w-[220px] cursor-pointer animate-fade-up"
          onClick={() => { setOpen(true); setShowBubble(false) }}
        >
          <p className="text-sm font-bold text-gray-800">궁금한 점 있으세요? 👋</p>
          <p className="text-xs text-gray-400 mt-0.5">무엇이든 물어보세요</p>
          <button
            className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-500 text-xs flex items-center justify-center"
            onClick={e => { e.stopPropagation(); setShowBubble(false) }}
          >×</button>
        </div>
      )}

      {/* 채팅 버튼 */}
      <button
        onClick={() => { setOpen(o => !o); setShowBubble(false) }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-black hover:bg-gray-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        aria-label="채팅 상담"
      >
        {open ? (
          <span className="text-xl font-light">×</span>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* 채팅 창 */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] max-h-[520px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-fade-up">
          {/* 헤더 */}
          <div className="bg-black px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0">
              <span className="text-black text-xs font-black">AI</span>
            </div>
            <div>
              <p className="text-white font-black text-sm">페이지AI 상담봇</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span className="text-gray-400 text-xs">24시간 응답</span>
              </div>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0" style={{ maxHeight: '320px' }}>
            {/* 인트로 */}
            {messages.length === 0 && (
              <>
                <div className="flex gap-2 items-start">
                  <div className="w-7 h-7 bg-black rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-[9px] font-black">AI</span>
                  </div>
                  <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-700 leading-relaxed max-w-[240px]">
                    안녕하세요! 페이지AI 상담봇이에요 👋<br />
                    <span className="text-gray-500">서비스나 가격에 대해 무엇이든 물어보세요.</span>
                  </div>
                </div>

                {/* 빠른 질문 */}
                <div className="pl-9 flex flex-col gap-1.5">
                  {QUICK_QUESTIONS.map(q => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-left text-xs bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-black hover:text-white hover:border-black transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* 메시지들 */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-black rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-[9px] font-black">AI</span>
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[240px] whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-black text-white rounded-tr-sm'
                    : 'bg-gray-50 text-gray-700 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-start">
                <div className="w-7 h-7 bg-black rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-white text-[9px] font-black">AI</span>
                </div>
                <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 150, 300].map(delay => (
                      <span key={delay} className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* 입력창 */}
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send(input)}
                placeholder="메시지를 입력하세요..."
                disabled={loading}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50"
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-black hover:bg-gray-800 text-white rounded-xl flex items-center justify-center disabled:opacity-30 transition-all shrink-0"
              >
                <span className="text-base">↑</span>
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-300 mt-2">Claude AI 기반 · 24시간 응답</p>
          </div>
        </div>
      )}
    </>
  )
}
