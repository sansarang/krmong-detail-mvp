'use client'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_BY_LANG: Record<string, string[]> = {
  ko: ['무료로 써볼 수 있나요?', '어떤 업종에 쓸 수 있어요?', '결과물 퀄리티가 어때요?', '네이버 블로그에 올릴 수 있어요?', '수정도 가능한가요?'],
  en: ['Is there a free plan?', 'What industries does it support?', 'How good is the output quality?', 'Can I export to WordPress?', 'Can I edit the generated content?'],
  ja: ['無料で試せますか？', 'どんな業種に使えますか？', '結果の品質はどうですか？', 'ブログに投稿できますか？', '編集できますか？'],
  zh: ['有免费版吗？', '支持哪些行业？', '输出质量怎么样？', '可以发布到博客吗？', '可以编辑生成的内容吗？'],
}

const LABELS_BY_LANG: Record<string, { title: string; subtitle: string; bubble: string; bubbleSub: string; intro: string; introSub: string; placeholder: string; error: string }> = {
  ko: { title: 'PageAI 상담봇', subtitle: '24시간 응답', bubble: '궁금한 점 있으세요? 👋', bubbleSub: '무엇이든 물어보세요', intro: '안녕하세요! PageAI 상담봇이에요 👋', introSub: '서비스나 가격에 대해 무엇이든 물어보세요.', placeholder: '메시지를 입력하세요...', error: '잠시 후 다시 시도해주세요 🙏' },
  en: { title: 'PageAI Support', subtitle: 'Replies instantly', bubble: 'Have a question? 👋', bubbleSub: 'Ask us anything', intro: 'Hi! I\'m the PageAI support bot 👋', introSub: 'Ask me anything about the service or pricing.', placeholder: 'Type a message...', error: 'Something went wrong. Please try again 🙏' },
  ja: { title: 'PageAIサポート', subtitle: '24時間対応', bubble: 'ご質問はありますか？ 👋', bubbleSub: 'なんでも聞いてください', intro: 'こんにちは！PageAIサポートボットです 👋', introSub: 'サービスや料金についてなんでも聞いてください。', placeholder: 'メッセージを入力...', error: 'しばらくしてからもう一度お試しください 🙏' },
  zh: { title: 'PageAI 客服', subtitle: '24小时在线', bubble: '有问题吗？ 👋', bubbleSub: '随时问我', intro: '您好！我是PageAI客服机器人 👋', introSub: '关于服务或价格，有任何问题都可以问我。', placeholder: '输入消息...', error: '请稍后重试 🙏' },
}

function detectLang(): string {
  if (typeof navigator === 'undefined') return 'ko'
  const l = navigator.language?.slice(0, 2) ?? 'ko'
  return ['ko', 'en', 'ja', 'zh'].includes(l) ? l : 'en'
}

/** 라우트 우선(영문 페이지면 무조건 영어 UI), 그다음 브라우저 */
function langFromPath(pathname: string | null): string {
  if (!pathname) return detectLang()
  if (pathname === '/en' || pathname.startsWith('/en/')) return 'en'
  if (pathname === '/ja' || pathname.startsWith('/ja/')) return 'ja'
  if (pathname === '/zh' || pathname.startsWith('/zh/')) return 'zh'
  return detectLang()
}

export default function ChatWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [lang, setLang] = useState('ko')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLang(langFromPath(pathname))
  }, [pathname])

  useEffect(() => {
    const t = setTimeout(() => setShowBubble(true), 10000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const L = LABELS_BY_LANG[lang] ?? LABELS_BY_LANG.en
  const quickQuestions = QUICK_BY_LANG[lang] ?? QUICK_BY_LANG.en

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
        body: JSON.stringify({ messages: newMessages, lang }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: L.error }])
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
          <p className="text-sm font-bold text-gray-800">{L.bubble}</p>
          <p className="text-xs text-gray-400 mt-0.5">{L.bubbleSub}</p>
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
        aria-label="Chat"
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
              <p className="text-white font-black text-sm">{L.title}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span className="text-gray-400 text-xs">{L.subtitle}</span>
              </div>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0" style={{ maxHeight: '320px' }}>
            {messages.length === 0 && (
              <>
                <div className="flex gap-2 items-start">
                  <div className="w-7 h-7 bg-black rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-[9px] font-black">AI</span>
                  </div>
                  <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-700 leading-relaxed max-w-[240px]">
                    {L.intro}<br />
                    <span className="text-gray-500">{L.introSub}</span>
                  </div>
                </div>

                <div className="pl-9 flex flex-col gap-1.5">
                  {quickQuestions.map(q => (
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
          <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
              placeholder={L.placeholder}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-black transition-colors"
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="bg-black text-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-30 hover:bg-gray-800 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
