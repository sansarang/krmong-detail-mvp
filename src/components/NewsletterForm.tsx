'use client'
import { useState } from 'react'

type Lang = 'ko' | 'en' | 'ja' | 'zh'

const COPY: Record<Lang, {
  kicker: string
  h2a: string
  h2b: string
  sub: string
  placeholder: string
  btn: string
  btnLoading: string
  success: string
  errorGeneric: string
  foot: string
}> = {
  ko: {
    kicker: '무료 뉴스레터',
    h2a: '매주 전환율 높이는',
    h2b: '카피 공식 1개.',
    sub: '스마트스토어·쿠팡 셀러들이 구독 중.\n스팸 없음 · 언제든 해지 가능',
    placeholder: '이메일 주소 입력',
    btn: '무료 구독',
    btnLoading: '...',
    success: '구독 완료! 매주 전환율 팁을 보내드릴게요.',
    errorGeneric: '오류가 발생했습니다. 다시 시도해주세요.',
    foot: '최근 발송: "제목 첫 글자에 숫자 넣기만 해도 CTR 28% 상승한 이유"',
  },
  en: {
    kicker: 'Free newsletter',
    h2a: 'One high-converting copy',
    h2b: 'idea every week.',
    sub: 'E-commerce & DTC marketers on the list.\nNo spam · unsubscribe anytime',
    placeholder: 'Your email',
    btn: 'Subscribe free',
    btnLoading: '...',
    success: "You're in! Weekly tips are on the way.",
    errorGeneric: 'Something went wrong. Please try again.',
    foot: 'Last send: "Why putting a number in your headline lifted CTR 28%"',
  },
  ja: {
    kicker: '無料メルマガ',
    h2a: '毎週1つ、',
    h2b: 'CV率を上げるコピー術。',
    sub: 'EC・D2Cのマーケターが購読中。\nスパムなし · いつでも解除可能',
    placeholder: 'メールアドレス',
    btn: '無料購読',
    btnLoading: '...',
    success: '登録完了！毎週コツをお届けします。',
    errorGeneric: 'エラーが発生しました。もう一度お試しください。',
    foot: '前回: 「見出しの先頭に数字を入れるだけでCTRが28%改善した理由」',
  },
  zh: {
    kicker: '免费订阅',
    h2a: '每周一封',
    h2b: '提升转化的文案公式。',
    sub: '电商与品牌运营者都在订阅。\n无垃圾邮件 · 随时退订',
    placeholder: '输入邮箱',
    btn: '免费订阅',
    btnLoading: '...',
    success: '订阅成功！我们每周会发送实用技巧。',
    errorGeneric: '出错了，请稍后再试。',
    foot: '上期：「标题首字用数字，CTR 提升 28% 的原因」',
  },
}

export default function NewsletterForm({ lang = 'ko' }: { lang?: Lang }) {
  const t = COPY[lang] ?? COPY.ko
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setStatus('error'); setMessage(data.error ?? t.errorGeneric); return }
      setStatus('success')
      setMessage(t.success)
      setEmail('')
    } catch {
      setStatus('error')
      setMessage(t.errorGeneric)
    }
  }

  return (
    <div className="bg-black rounded-3xl p-8 md:p-10">
      <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">{t.kicker}</p>
      <h2 className="text-3xl font-black text-white tracking-tight leading-tight mb-2">
        {t.h2a}<br />
        {t.h2b}
      </h2>
      <p className="text-gray-400 text-sm mb-6 leading-relaxed whitespace-pre-line">
        {t.sub}
      </p>

      {status === 'success' ? (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-4 text-center">
          <p className="text-green-400 font-bold text-sm">✓ {message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            placeholder={t.placeholder}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="flex-1 bg-white/10 border border-white/10 text-white placeholder-gray-500 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-white/30 focus:bg-white/15 transition-all"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-white text-black px-6 py-3.5 rounded-2xl text-sm font-black hover:bg-gray-100 disabled:opacity-40 transition-all shrink-0"
          >
            {status === 'loading' ? t.btnLoading : t.btn}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p className="text-red-400 text-xs mt-2">{message}</p>
      )}

      <p className="text-gray-600 text-xs mt-4">
        {t.foot}
      </p>
    </div>
  )
}
