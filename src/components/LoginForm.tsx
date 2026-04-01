'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { persistUiLang, type UiLang } from '@/lib/uiLocale'

const COPY: Record<UiLang, {
  titleIn: string; titleUp: string; subIn: string; subUp: string
  email: string; pass: string; passPh: string
  submitWait: string; submitIn: string
  toggleUp: string; toggleIn: string
  toastIn: string; err: string
  google: string; orDivider: string
  // 회원가입 단계별
  sendCode: string; codeLabel: string; codePh: string
  verifyCode: string; setPass: string; completeSignup: string
  codeSent: string; codeVerified: string
  back: string; resend: string
  // 래퍼럴
  refTitle: string; refSub: string; toastRef: string; toastUp: string
}> = {
  ko: {
    titleIn: '로그인', titleUp: '시작하기',
    subIn: '계정에 로그인하세요', subUp: '이메일로 인증하고 시작하세요',
    refTitle: '🎁 초대 코드 적용됨', refSub: '가입 완료 시 3회 무료 보너스 제공',
    email: '이메일', pass: '비밀번호', passPh: '6자 이상',
    submitWait: '처리 중...', submitIn: '로그인',
    toggleUp: '이미 계정이 있어요 → 로그인', toggleIn: '계정이 없어요 → 회원가입',
    toastRef: '🎁 초대 코드 적용! 3회 무료 보너스가 추가됐어요.',
    toastUp: '가입 완료! 대시보드로 이동합니다.', toastIn: '로그인 성공!',
    err: '오류가 발생했습니다',
    google: 'Google로 계속하기', orDivider: '또는',
    sendCode: '인증코드 발송', codeLabel: '인증코드', codePh: '이메일로 받은 6자리 코드',
    verifyCode: '코드 확인', setPass: '비밀번호 설정', completeSignup: '가입 완료',
    codeSent: '인증코드를 이메일로 발송했습니다. 메일함을 확인하세요.',
    codeVerified: '이메일 인증 완료! 비밀번호를 설정해주세요.',
    back: '← 이전', resend: '코드 재발송',
  },
  en: {
    titleIn: 'Log in', titleUp: 'Get started',
    subIn: 'Sign in to your account', subUp: 'Verify your email to get started',
    refTitle: '🎁 Referral code applied', refSub: 'Complete sign-up for 3 bonus generations',
    email: 'Email', pass: 'Password', passPh: 'At least 6 characters',
    submitWait: 'Please wait...', submitIn: 'Log in',
    toggleUp: 'Already have an account? → Log in', toggleIn: 'No account? → Sign up',
    toastRef: '🎁 Referral applied! 3 bonus generations added.',
    toastUp: 'Welcome! Redirecting to dashboard.', toastIn: 'Signed in successfully!',
    err: 'Something went wrong',
    google: 'Continue with Google', orDivider: 'or',
    sendCode: 'Send code', codeLabel: 'Verification code', codePh: '6-digit code from email',
    verifyCode: 'Verify', setPass: 'Set password', completeSignup: 'Complete sign-up',
    codeSent: 'Verification code sent. Check your inbox.',
    codeVerified: 'Email verified! Now set your password.',
    back: '← Back', resend: 'Resend code',
  },
  ja: {
    titleIn: 'ログイン', titleUp: 'はじめる',
    subIn: 'アカウントにログイン', subUp: 'メールで認証して開始',
    refTitle: '🎁 招待コード適用済み', refSub: '登録完了で3回分ボーナス',
    email: 'メール', pass: 'パスワード', passPh: '6文字以上',
    submitWait: '処理中...', submitIn: 'ログイン',
    toggleUp: '既にアカウントあり → ログイン', toggleIn: 'アカウントなし → 新規登録',
    toastRef: '🎁 招待コード適用！3回分ボーナスを追加しました。',
    toastUp: '登録完了！', toastIn: 'ログインしました！',
    err: 'エラーが発生しました',
    google: 'Googleで続ける', orDivider: 'または',
    sendCode: '認証コードを送信', codeLabel: '認証コード', codePh: 'メールの6桁コード',
    verifyCode: '確認', setPass: 'パスワード設定', completeSignup: '登録完了',
    codeSent: '認証コードをメールに送信しました。',
    codeVerified: 'メール認証完了！パスワードを設定してください。',
    back: '← 戻る', resend: 'コードを再送',
  },
  zh: {
    titleIn: '登录', titleUp: '开始使用',
    subIn: '登录您的账户', subUp: '验证邮箱后开始使用',
    refTitle: '🎁 已应用邀请码', refSub: '完成注册可获得 3 次额外免费额度',
    email: '邮箱', pass: '密码', passPh: '至少 6 位',
    submitWait: '处理中...', submitIn: '登录',
    toggleUp: '已有账户？→ 登录', toggleIn: '没有账户？→ 注册',
    toastRef: '🎁 邀请码已生效！已增加 3 次免费额度。',
    toastUp: '注册成功！', toastIn: '登录成功！',
    err: '出错了',
    google: '使用 Google 继续', orDivider: '或',
    sendCode: '发送验证码', codeLabel: '验证码', codePh: '邮件中的6位验证码',
    verifyCode: '验证', setPass: '设置密码', completeSignup: '完成注册',
    codeSent: '验证码已发送至您的邮箱。',
    codeVerified: '邮箱验证成功！请设置密码。',
    back: '← 返回', resend: '重新发送',
  },
}

const LANG_META: { code: UiLang; flag: string; label: string }[] = [
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'ja', flag: '🇯🇵', label: '日本語' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
]

type SignupStep = 'email' | 'otp' | 'password'

export default function LoginForm({ lang, homeHref }: { lang: UiLang; homeHref: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [uiLang, setUiLang] = useState<UiLang>(lang)
  const t = COPY[uiLang]

  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // 로그인 상태
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // 회원가입 단계
  const [signupStep, setSignupStep] = useState<SignupStep>('email')
  const [signupEmail, setSignupEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const refCode = searchParams.get('ref')
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  function switchLang(code: UiLang) {
    setUiLang(code)
    persistUiLang(code)
  }

  useEffect(() => {
    if (refCode || searchParams.get('mode') === 'signup') setIsSignUp(true)
  }, [refCode, searchParams])

  function resetSignup() {
    setSignupStep('email')
    setSignupEmail('')
    setOtpCode('')
    setNewPassword('')
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}` },
    })
    if (error) { toast.error(error.message); setGoogleLoading(false) }
  }

  // ── 회원가입 Step 1: 인증코드 발송 ──────────────────────────
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: signupEmail,
        options: { shouldCreateUser: true },
      })
      if (error) throw error
      toast.success(t.codeSent)
      setSignupStep('otp')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.err)
    } finally {
      setLoading(false)
    }
  }

  // ── 회원가입 Step 2: OTP 코드 확인 ──────────────────────────
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: signupEmail,
        token: otpCode,
        type: 'email',
      })
      if (error) throw error
      toast.success(t.codeVerified)
      setSignupStep('password')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.err)
    } finally {
      setLoading(false)
    }
  }

  // ── 회원가입 Step 3: 비밀번호 설정 ──────────────────────────
  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      // 래퍼럴 처리
      if (refCode) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await fetch('/api/referral', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refCode, newUserId: user.id }),
          })
          toast.success(t.toastRef)
        }
      } else {
        toast.success(t.toastUp)
      }
      router.push(redirectTo)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.err)
    } finally {
      setLoading(false)
    }
  }

  // ── 로그인 ────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success(t.toastIn)
      router.push(redirectTo)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('user already')) {
        toast.error({ ko: '이미 가입된 이메일입니다.', en: 'Email already registered.', ja: 'このメールは登録済みです。', zh: '该邮箱已注册。' }[uiLang])
      } else {
        toast.error(msg || t.err)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── 상단 공통 UI ────────────────────────────────────────────
  const header = (
    <>
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
          {LANG_META.map(({ code, flag, label }) => (
            <button key={code} type="button" onClick={() => switchLang(code)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${uiLang === code ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>
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
    </>
  )

  const googleBtn = (
    <>
      <button type="button" onClick={handleGoogleLogin} disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all mb-5">
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
    </>
  )

  const toggleBtn = (
    <div className="mt-6 text-center">
      <button type="button"
        onClick={() => { setIsSignUp(!isSignUp); resetSignup() }}
        className="text-gray-400 text-sm hover:text-black transition-colors min-h-[44px] px-4 inline-flex items-center justify-center">
        {isSignUp ? t.toggleUp : t.toggleIn}
      </button>
    </div>
  )

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {header}

        {/* ── 로그인 ── */}
        {!isSignUp && (
          <>
            {googleBtn}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.email}</label>
                <input type="email" placeholder="example@email.com" value={email}
                  onChange={e => setEmail(e.target.value)} required
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.pass}</label>
                <input type="password" placeholder={t.passPh} value={password}
                  onChange={e => setPassword(e.target.value)} required
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 disabled:opacity-40 transition-all mt-2">
                {loading ? t.submitWait : t.submitIn}
              </button>
            </form>
            {toggleBtn}
          </>
        )}

        {/* ── 회원가입 Step 1: 이메일 입력 ── */}
        {isSignUp && signupStep === 'email' && (
          <>
            {googleBtn}
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.email}</label>
                <input type="email" placeholder="example@email.com" value={signupEmail}
                  onChange={e => setSignupEmail(e.target.value)} required
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 disabled:opacity-40 transition-all">
                {loading ? t.submitWait : t.sendCode}
              </button>
            </form>
            {toggleBtn}
          </>
        )}

        {/* ── 회원가입 Step 2: OTP 입력 ── */}
        {isSignUp && signupStep === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-2 text-center">
              <p className="text-blue-700 text-sm font-bold mb-1">📧 {signupEmail}</p>
              <p className="text-blue-600 text-xs">{t.codeSent}</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.codeLabel}</label>
              <input type="text" inputMode="numeric" placeholder={t.codePh} value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required maxLength={6}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm text-center tracking-[0.3em] text-lg font-bold" />
            </div>
            <button type="submit" disabled={loading || otpCode.length < 6}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 disabled:opacity-40 transition-all">
              {loading ? t.submitWait : t.verifyCode}
            </button>
            <div className="flex items-center justify-between pt-1">
              <button type="button" onClick={() => setSignupStep('email')}
                className="text-xs text-gray-400 hover:text-black transition-colors">
                {t.back}
              </button>
              <button type="button" disabled={loading}
                onClick={async () => {
                  setLoading(true)
                  await supabase.auth.signInWithOtp({ email: signupEmail, options: { shouldCreateUser: true } })
                  toast.success(t.codeSent)
                  setLoading(false)
                }}
                className="text-xs text-gray-400 hover:text-black transition-colors disabled:opacity-40">
                {t.resend}
              </button>
            </div>
          </form>
        )}

        {/* ── 회원가입 Step 3: 비밀번호 설정 ── */}
        {isSignUp && signupStep === 'password' && (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 mb-2 text-center">
              <p className="text-green-700 text-sm font-bold">✅ {t.codeVerified}</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.setPass}</label>
              <input type="password" placeholder={t.passPh} value={newPassword}
                onChange={e => setNewPassword(e.target.value)} required minLength={6}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm" />
            </div>
            <button type="submit" disabled={loading || newPassword.length < 6}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 disabled:opacity-40 transition-all">
              {loading ? t.submitWait : t.completeSignup}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
