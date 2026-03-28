'use client'
import { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail]     = useState('')
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
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
      if (!res.ok) { setStatus('error'); setMessage(data.error); return }
      setStatus('success')
      setMessage('구독 완료! 매주 전환율 팁을 보내드릴게요.')
      setEmail('')
    } catch {
      setStatus('error')
      setMessage('오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className="bg-black rounded-3xl p-8 md:p-10">
      <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">무료 뉴스레터</p>
      <h2 className="text-3xl font-black text-white tracking-tight leading-tight mb-2">
        매주 전환율 높이는<br />
        카피 공식 1개.
      </h2>
      <p className="text-gray-400 text-sm mb-6 leading-relaxed">
        스마트스토어·쿠팡 셀러 3,200명이 구독 중.<br />
        스팸 없음 · 언제든 해지 가능
      </p>

      {status === 'success' ? (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-4 text-center">
          <p className="text-green-400 font-bold text-sm">✓ {message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            placeholder="이메일 주소 입력"
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
            {status === 'loading' ? '...' : '무료 구독'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p className="text-red-400 text-xs mt-2">{message}</p>
      )}

      <p className="text-gray-600 text-xs mt-4">
        최근 발송: "제목 첫 글자에 숫자 넣기만 해도 CTR 28% 상승한 이유"
      </p>
    </div>
  )
}
