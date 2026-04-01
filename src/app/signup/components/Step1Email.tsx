'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  onNext: (email: string) => void
}

export default function Step1Email({ onNext }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      // OTP 발송 (shouldCreateUser: true — 신규 유저 허용)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      if (error) {
        // 이미 비밀번호로 가입된 유저는 로그인 유도
        if (error.message.toLowerCase().includes('already') || error.status === 422) {
          toast.error('이미 사용 중인 이메일입니다. 로그인해주세요.')
          return
        }
        throw error
      }
      toast.success('인증번호를 발송했습니다. 메일함을 확인해주세요.')
      onNext(email)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-black text-black mb-2">이메일 입력</h2>
      <p className="text-gray-400 text-sm mb-8">가입할 이메일 주소를 입력하세요. 인증번호를 보내드립니다.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">이메일</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 disabled:opacity-40 transition-all"
        >
          {loading ? '발송 중...' : '인증번호 발송'}
        </button>
      </form>
    </div>
  )
}
