'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { persistUiLang, type UiLang } from '@/lib/uiLocale'

const COPY: Record<UiLang, {
  titleIn: string; titleUp: string; subIn: string; subUp: string
  refTitle: string; refSub: string; email: string; pass: string; passPh: string
  submitWait: string; submitIn: string; submitUp: string
  toggleUp: string; toggleIn: string
  toastRef: string; toastUp: string; toastIn: string; err: string
  google: string; orDivider: string
  verifyTitle: string; verifySub: string; resend: string; resendOk: string
}> = {
  ko: {
    titleIn: '로그인', titleUp: '시작하기',
    subIn: '계정에 로그인하세요', subUp: '계정을 만들고 AI 문서 생성을 경험하세요',
    refTitle: '🎁 초대 코드 적용됨', refSub: '가입 완료 시 3회 무료 보너스 제공',
    email: '이메일', pass: '비밀번호', passPh: '6자 이상',
    submitWait: '처리 중...', submitIn: '로그인', submitUp: '회원가입',
    toggleUp: '이미 계정이 있어요 → 로그인', toggleIn: '계정이 없어요 → 회원가입',
    toastRef: '🎁 초대 코드 적용! 3회 무료 보너스가 추가됐어요.',
    toastUp: '가입 완료! 인증 메일을 확인해주세요.', toastIn: '로그인 성공!',
    err: '오류가 발생했습니다',
    google: 'Google로 계속하기', orDivider: '또는',
    verifyTitle: '인증 메일을 확인해주세요',
    verifySub: '가입한 이메일로 인증 링크를 보냈습니다. 메일을 확인하고 링크를 클릭하면 자동으로 로그인됩니다.',
    resend: '인증 메일 재발송', resendOk: '재발송 완료!',
  },
  en: {
    titleIn: 'Log in', titleUp: 'Get started',
    subIn: 'Sign in to your account', subUp: 'Create an account and try AI document generation',
    refTitle: '🎁 Referral code applied', refSub: 'Complete sign-up for 3 bonus generations',
    email: 'Email', pass: 'Password', passPh: 'At least 6 characters',
    submitWait: 'Please wait...', submitIn: 'Log in', submitUp: 'Sign up',
    toggleUp: 'Already have an account? → Log in', toggleIn: 'No account? → Sign up',
    toastRef: '🎁 Referral applied! 3 bonus generations added.',
    toastUp: 'Check your email to verify your account.', toastIn: 'Signed in successfully!',
    err: 'Something went wrong',
    google: 'Continue with Google', orDivider: 'or',
    verifyTitle: 'Check your email',
    verifySub: 'We sent a verification link to your email address. Click the link to complete sign-up.',
    resend: 'Resend verification email', resendOk: 'Sent!',
  },
  ja: {
    titleIn: 'ログイン', titleUp: 'はじめる',
    subIn: 'アカウントにログイン', subUp: 'アカウントを作成してAI文書生成を試す',
    refTitle: '🎁 招待コード適用済み', refSub: '登録完了で3回分ボーナス',
    email: 'メール', pass: 'パスワード', passPh: '6文字以上',
    submitWait: '処理中...', submitIn: 'ログイン', submitUp: '新規登録',
    toggleUp: '既にアカウントあり → ログイン', toggleIn: 'アカウントなし → 新規登録',
    toastRef: '🎁 招待コード適用！3回分ボーナスを追加しました。',
    toastUp: 'メールをご確認ください。', toastIn: 'ログインしました！',
    err: 'エラーが発生しました',
    google: 'Googleで続ける', orDivider: 'または',
    verifyTitle: 'メールをご確認ください',
    verifySub: 'ご登録のメールアドレスに認証リンクをお送りしました。',
    resend: '認証メールを再送', resendOk: '送信しました！',
  },
  zh: {
    titleIn: '登录', titleUp: '开始使用',
    subIn: '登录您的账户', subUp: '注册账户，体验 AI 文档生成',
    refTitle: '🎁 已应用邀请码', refSub: '完成注册可获得 3 次额外免费额度',
    email: '邮箱', pass: '密码', passPh: '至少 6 位',
    submitWait: '处理中...', submitIn: '登录', submitUp: '注册',
    toggleUp: '已有账户？→ 登录', toggleIn: '没有账户？→ 注册',
    toastRef: '🎁 邀请码已生效！已增加 3 次免费额度。',
    toastUp: '请查收验证邮件。', toastIn: '登录成功！',
    err: '出错了',
    google: '使用 Google 继续', orDivider: '或',
    verifyTitle: '请查收验证邮件',
    verifySub: '我们已向您的邮箱发送了验证链接，点击链接完成注册。',
    resend: '重新发送验证邮件', resendOk: '已发送！',
  },
}

const LANG_META: { code: UiLang; flag: string; label: string }[] = [
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'ja', flag: '🇯🇵', label: '日本語' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
]

export default function LoginForm({ lang, homeHref }: { lang: UiLang; homeHref: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [uiLang, setUiLang] = useState<UiLang>(lang)
  const t = COPY[uiLang]
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [verifyPending, setVerifyPending] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const refCode = searchParams.get('ref')
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  function switchLang(code: UiLang) {
    setUiLang(code)
    persistUiLang(code)
  }

  useEffect(() => {
    if (refCode) setIsSignUp(true)
  }, [refCode])

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`,
      },
    })
    if (error) {
      toast.error(error.message)
      setGoogleLoading(false)
    }
  }

  async function handleResend() {
    setResendLoading(true)
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) toast.error(error.message)
    else toast.success(t.resendOk)
    setResendLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}` },
        })
        if (error) throw error

        if (refCode && data.user) {
          await fetch('/api/referral', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refCode, newUserId: data.user.id }),
          })
          toast.success(t.toastRef)
        } else {
          toast.success(t.toastUp)
        }
        // 이메일 인증 대기 상태
        setVerifyPending(true)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success(t.toastIn)
        router.push(redirectTo)
        router.refresh()
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : ''
      // 이미 가입된 이메일 → 자동으로 로그인 탭으로 전환
      if (isSignUp && (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already been registered') || msg.toLowerCase().includes('user already'))) {
        setIsSignUp(false)
        toast.error({
          ko: '이미 가입된 이메일입니다. 로그인해주세요.',
          en: 'Email already registered. Please log in.',
          ja: 'このメールは登録済みです。ログインしてください。',
          zh: '该邮箱已注册，请登录。',
        }[uiLang] ?? '이미 가입된 이메일입니다. 로그인해주세요.')
      } else {
        toast.error(msg || t.err)
      }
    } finally {
      setLoading(false)
    }
  }

  // 이메일 인증 대기 화면
  if (verifyPending) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">📧</div>
          <h2 className="text-2xl font-black text-black mb-3">{t.verifyTitle}</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">{t.verifySub}</p>
          <p className="text-xs text-gray-300 mb-3 font-medium">{email}</p>
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="w-full border border-gray-200 py-3.5 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all"
          >
            {resendLoading ? '...' : t.resend}
          </button>
          <button
            onClick={() => { setVerifyPending(false); setIsSignUp(false) }}
            className="mt-4 text-xs text-gray-300 hover:text-gray-600 transition-colors"
          >
            ← {t.submitIn}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* 언어 선택 탭 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
            {LANG_META.map(({ code, flag, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => switchLang(code)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  uiLang === code ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                <span>{flag}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-black mb-3 tracking-tight">
            {isSignUp ? t.titleUp : t.titleIn}
          </h1>
          <p className="text-gray-400 text-sm">{isSignUp ? t.subUp : t.subIn}</p>
          {refCode && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
              <p className="text-green-700 text-sm font-bold">{t.refTitle}</p>
              <p className="text-green-600 text-xs mt-0.5">{t.refSub}</p>
            </div>
          )}
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
          <span className="text-xs text-gray-300 font-medium">{t.orDivider}</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.email}</label>
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
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.pass}</label>
            <input
              type="password"
              placeholder={t.passPh}
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
            {loading ? t.submitWait : isSignUp ? t.submitUp : t.submitIn}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-gray-400 text-sm hover:text-black transition-colors min-h-[44px] px-4 inline-flex items-center justify-center"
          >
            {isSignUp ? t.toggleUp : t.toggleIn}
          </button>
        </div>
      </div>
    </div>
  )
}
