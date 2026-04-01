'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface Step3T {
  title: string
  sub: string
  pwLabel: string
  pwPlaceholder: string
  confirmLabel: string
  confirmPlaceholder: string
  pwInvalid: string
  pwValid: string
  confirmMismatch: string
  confirmMatch: string
  submit: string
  submitting: string
  toastErr: string
}

interface Props {
  t: Step3T
  onNext: () => void
}

function validate(pw: string) {
  return pw.length >= 8 && /[a-zA-Z]/.test(pw) && /[0-9]/.test(pw)
}

export default function Step3Password({ t, onNext }: Props) {
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
      toast.error(err instanceof Error ? err.message : t.toastErr)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-black text-black mb-2">{t.title}</h2>
      <p className="text-gray-400 text-sm mb-8">{t.sub}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.pwLabel}</label>
          <input
            type="password"
            placeholder={t.pwPlaceholder}
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
          {password.length > 0 && !isValid && <p className="text-xs text-red-400 mt-1.5 ml-1">{t.pwInvalid}</p>}
          {isValid && <p className="text-xs text-green-500 mt-1.5 ml-1">{t.pwValid}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.confirmLabel}</label>
          <input
            type="password"
            placeholder={t.confirmPlaceholder}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            className={`w-full border-2 rounded-2xl px-4 py-3.5 text-gray-900 placeholder-gray-300 focus:outline-none transition-all text-sm ${
              confirm.length > 0
                ? isMatch ? 'border-green-400 focus:border-green-500' : 'border-red-300 focus:border-red-400'
                : 'border-gray-200 focus:border-black'
            }`}
          />
          {confirm.length > 0 && !isMatch && <p className="text-xs text-red-400 mt-1.5 ml-1">{t.confirmMismatch}</p>}
          {isMatch && <p className="text-xs text-green-500 mt-1.5 ml-1">{t.confirmMatch}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 disabled:opacity-40 transition-all mt-2"
        >
          {loading ? t.submitting : t.submit}
        </button>
      </form>
    </div>
  )
}
