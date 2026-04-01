'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Lang = 'ko' | 'en' | 'ja' | 'zh'

const COPY = {
  ko: {
    title: '로그인',
    sub: '계정에 로그인하세요',
    google: 'Google로 계속하기',
    or: '또는',
    emailLabel: '이메일',
    pwLabel: '비밀번호',
    pwPlaceholder: '비밀번호 입력',
    submit: '로그인',
    submitting: '처리 중...',
    toastOk: '로그인 성공!',
    toastErr: '이메일 또는 비밀번호가 올바르지 않습니다.',
    noAccount: '계정이 없으신가요?',
    signup: '회원가입',
    signupHref: '/signup',
  },
  en: {
    title: 'Sign In',
    sub: 'Sign in to your account',
    google: 'Continue with Google',
    or: 'or',
    emailLabel: 'Email',
    pwLabel: 'Password',
    pwPlaceholder: 'Enter password',
    submit: 'Sign In',
    submitting: 'Processing...',
    toastOk: 'Signed in!',
    toastErr: 'Invalid email or password.',
    noAccount: "Don't have an account?",
    signup: 'Sign up',
    signupHref: '/en/signup',
  },
  ja: {
    title: 'ログイン',
    sub: 'アカウントにログイン',
    google: 'Googleで続ける',
    or: 'または',
    emailLabel: 'メールアドレス',
    pwLabel: 'パスワード',
    pwPlaceholder: 'パスワードを入力',
    submit: 'ログイン',
    submitting: '処理中...',
    toastOk: 'ログインしました！',
    toastErr: 'メールアドレスまたはパスワードが正しくありません。',
    noAccount: 'アカウントをお持ちでない方は',
    signup: '新規登録',
    signupHref: '/ja/signup',
  },
  zh: {
    title: '登录',
    sub: '登录您的账户',
    google: '使用 Google 继续',
    or: '或',
    emailLabel: '电子邮件',
    pwLabel: '密码',
    pwPlaceholder: '输入密码',
    submit: '登录',
    submitting: '处理中...',
    toastOk: '登录成功！',
    toastErr: '邮箱或密码不正确。',
    noAccount: '没有账户？',
    signup: '注册',
    signupHref: '/zh/signup',
  },
}

interface Props {
  lang?: Lang
}

export default function LoginForm({ lang = 'ko' }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const t = COPY[lang]
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}` },
    })
    if (error) { toast.error(error.message); setGoogleLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success(t.toastOk)
      router.push(redirectTo)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')) {
        toast.error(t.toastErr)
      } else {
        toast.error(msg || t.toastErr)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-black mb-3 tracking-tight">{t.title}</h1>
          <p className="text-gray-400 text-sm">{t.sub}</p>
        </div>

        {/* Google 로그인 */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all mb-5"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {googleLoading ? '...' : t.google}
        </button>

        <div className="relative flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-300 font-medium">{t.or}</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.emailLabel}</label>
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
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.pwLabel}</label>
            <input
              type="password"
              placeholder={t.pwPlaceholder}
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
            {loading ? t.submitting : t.submit}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          {t.noAccount}{' '}
          <Link href={t.signupHref} className="text-black font-bold hover:underline">
            {t.signup}
          </Link>
        </p>
      </div>
    </div>
  )
}
