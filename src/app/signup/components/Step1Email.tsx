'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface Step1T {
  title: string
  sub: string
  emailLabel: string
  submit: string
  submitting: string
  toastSent: string
  toastDuplicate: string
  toastErr: string
}

interface Props {
  t: Step1T
  onNext: (email: string) => void
}

export default function Step1Email({ t, onNext }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      })
      if (error) {
        if (error.message.toLowerCase().includes('already') || error.status === 422) {
          toast.error(t.toastDuplicate)
          return
        }
        throw error
      }
      toast.success(t.toastSent)
      onNext(email)
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
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.emailLabel}</label>
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
          {loading ? t.submitting : t.submit}
        </button>
      </form>
    </div>
  )
}
