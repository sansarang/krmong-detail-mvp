'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  email: string
  onNext: () => void
  onBack: () => void
}

export default function Step2OTP({ email, onNext, onBack }: Props) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const supabase = createClient()

  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  function handleChange(i: number, val: string) {
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (v && i < 5) refs.current[i + 1]?.focus()
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setDigits(text.split(''))
      refs.current[5]?.focus()
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const token = digits.join('')
    if (token.length < 6) return
    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })
      if (error) throw error
      onNext()
    } catch (err: unknown) {
      toast.error('인증번호가 올바르지 않습니다.')
      setDigits(['', '', '', '', '', ''])
      refs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0) return
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: undefined,
      },
    })
    if (error) { toast.error(error.message); return }
    toast.success('인증번호를 재발송했습니다.')
    setCooldown(60)
    setDigits(['', '', '', '', '', ''])
    refs.current[0]?.focus()
  }

  const filled = digits.join('').length === 6

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-black text-black mb-2">인증번호 입력</h2>
      <p className="text-gray-400 text-sm mb-2">
        <span className="text-black font-bold">{email}</span>로 발송된<br />
        6자리 인증번호를 입력해주세요.
      </p>
      <p className="text-xs text-gray-300 mb-8">스팸함도 확인해보세요.</p>

      <form onSubmit={handleVerify} className="space-y-6">
        {/* 6칸 OTP 입력 */}
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { refs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-12 h-14 text-center text-xl font-black border-2 rounded-2xl focus:outline-none transition-all ${
                d ? 'border-black bg-gray-50' : 'border-gray-200'
              } focus:border-black`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || !filled}
          className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 disabled:opacity-40 transition-all"
        >
          {loading ? '인증 중...' : '인증하기'}
        </button>
      </form>

      <div className="flex items-center justify-between mt-5">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-gray-400 hover:text-black transition-colors"
        >
          ← 이메일 다시 입력
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="text-xs text-gray-400 hover:text-black transition-colors disabled:opacity-40"
        >
          {cooldown > 0 ? `재발송 (${cooldown}초)` : '인증번호 재발송'}
        </button>
      </div>
    </div>
  )
}
