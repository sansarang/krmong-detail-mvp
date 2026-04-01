'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  onNext: () => void
}

function validate(pw: string) {
  if (pw.length < 8) return false
  if (!/[a-zA-Z]/.test(pw)) return false
  if (!/[0-9]/.test(pw)) return false
  return true
}

export default function Step3Password({ onNext }: Props) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const isValid = validate(password)
  const isMatch = password === confirm && confirm.length > 0
  const canSubmit = isValid && isMatch

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      onNext()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-black text-black mb-2">비밀번호 설정</h2>
      <p className="text-gray-400 text-sm mb-8">사용할 비밀번호를 입력해주세요.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">비밀번호</label>
          <input
            type="password"
            placeholder="8자 이상, 영문+숫자 조합"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoFocus
            className={`w-full border-2 rounded-2xl px-4 py-3.5 text-gray-900 placeholder-gray-300 focus:outline-none transition-all text-sm ${
              password.length > 0
                ? isValid ? 'border-green-400 focus:border-green-500' : 'border-red-300 focus:border-red-400'
                : 'border-gray-200 focus:border-black'
            }`}
          />
          {password.length > 0 && !isValid && (
            <p className="text-xs text-red-400 mt-1.5 ml-1">8자 이상, 영문+숫자 조합이어야 합니다.</p>
          )}
          {isValid && (
            <p className="text-xs text-green-500 mt-1.5 ml-1">✓ 사용 가능한 비밀번호입니다.</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">비밀번호 확인</label>
          <input
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            className={`w-full border-2 rounded-2xl px-4 py-3.5 text-gray-900 placeholder-gray-300 focus:outline-none transition-all text-sm ${
              confirm.length > 0
                ? isMatch ? 'border-green-400 focus:border-green-500' : 'border-red-300 focus:border-red-400'
                : 'border-gray-200 focus:border-black'
            }`}
          />
          {confirm.length > 0 && !isMatch && (
            <p className="text-xs text-red-400 mt-1.5 ml-1">비밀번호가 일치하지 않습니다.</p>
          )}
          {isMatch && (
            <p className="text-xs text-green-500 mt-1.5 ml-1">✓ 비밀번호가 일치합니다.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 disabled:opacity-40 transition-all mt-2"
        >
          {loading ? '처리 중...' : '완료'}
        </button>
      </form>
    </div>
  )
}
