'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const refCode = searchParams.get('ref')

  useEffect(() => {
    if (refCode) setIsSignUp(true)
  }, [refCode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        // 래퍼럴 처리
        if (refCode && data.user) {
          await fetch('/api/referral', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refCode, newUserId: data.user.id }),
          })
          toast.success('🎁 초대 코드 적용! 3회 무료 보너스가 추가됐어요.')
        } else {
          toast.success('가입 완료! 첫 문서를 만들어보세요.')
        }
        router.push('/order/new')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('로그인 성공!')
        router.push('/order/new')
        router.refresh()
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <nav className="px-8 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-7 h-7 bg-black rounded-lg" />
          <span className="font-bold text-lg tracking-tight">페이지AI</span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-black mb-3 tracking-tight">
              {isSignUp ? '시작하기' : '로그인'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isSignUp ? '계정을 만들고 AI 문서 생성을 경험하세요' : '계정에 로그인하세요'}
            </p>
            {refCode && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                <p className="text-green-700 text-sm font-bold">🎁 초대 코드 적용됨</p>
                <p className="text-green-600 text-xs mt-0.5">가입 완료 시 3회 무료 보너스 제공</p>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">이메일</label>
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">비밀번호</label>
              <input
                type="password"
                placeholder="6자 이상"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 disabled:opacity-40 transition-all mt-2"
            >
              {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-gray-400 text-sm hover:text-black transition-colors">
              {isSignUp ? '이미 계정이 있어요 → 로그인' : '계정이 없어요 → 회원가입'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
