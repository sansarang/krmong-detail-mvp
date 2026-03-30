'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { UiLang } from '@/lib/uiLocale'

const COPY: Record<UiLang, {
  titleIn: string
  titleUp: string
  subIn: string
  subUp: string
  refTitle: string
  refSub: string
  email: string
  pass: string
  passPh: string
  submitWait: string
  submitIn: string
  submitUp: string
  toggleUp: string
  toggleIn: string
  toastRef: string
  toastUp: string
  toastIn: string
  err: string
}> = {
  ko: {
    titleIn: '로그인', titleUp: '시작하기',
    subIn: '계정에 로그인하세요', subUp: '계정을 만들고 AI 문서 생성을 경험하세요',
    refTitle: '🎁 초대 코드 적용됨', refSub: '가입 완료 시 3회 무료 보너스 제공',
    email: '이메일', pass: '비밀번호', passPh: '6자 이상',
    submitWait: '처리 중...', submitIn: '로그인', submitUp: '회원가입',
    toggleUp: '이미 계정이 있어요 → 로그인', toggleIn: '계정이 없어요 → 회원가입',
    toastRef: '🎁 초대 코드 적용! 3회 무료 보너스가 추가됐어요.',
    toastUp: '가입 완료! 첫 문서를 만들어보세요.', toastIn: '로그인 성공!',
    err: '오류가 발생했습니다',
  },
  en: {
    titleIn: 'Log in', titleUp: 'Get started',
    subIn: 'Sign in to your account', subUp: 'Create an account and try AI document generation',
    refTitle: '🎁 Referral code applied', refSub: 'Complete sign-up for 3 bonus generations',
    email: 'Email', pass: 'Password', passPh: 'At least 6 characters',
    submitWait: 'Please wait...', submitIn: 'Log in', submitUp: 'Sign up',
    toggleUp: 'Already have an account? → Log in', toggleIn: 'No account? → Sign up',
    toastRef: '🎁 Referral applied! 3 bonus generations added.',
    toastUp: 'Welcome! Create your first document.', toastIn: 'Signed in successfully!',
    err: 'Something went wrong',
  },
  ja: {
    titleIn: 'ログイン', titleUp: 'はじめる',
    subIn: 'アカウントにログイン', subUp: 'アカウントを作成してAI文書生成を試す',
    refTitle: '🎁 招待コード適用済み', refSub: '登録完了で3回分ボーナス',
    email: 'メール', pass: 'パスワード', passPh: '6文字以上',
    submitWait: '処理中...', submitIn: 'ログイン', submitUp: '新規登録',
    toggleUp: '既にアカウントあり → ログイン', toggleIn: 'アカウントなし → 新規登録',
    toastRef: '🎁 招待コード適用！3回分ボーナスを追加しました。',
    toastUp: '登録完了！最初の文書を作成しましょう。', toastIn: 'ログインしました！',
    err: 'エラーが発生しました',
  },
  zh: {
    titleIn: '登录', titleUp: '开始使用',
    subIn: '登录您的账户', subUp: '注册账户，体验 AI 文档生成',
    refTitle: '🎁 已应用邀请码', refSub: '完成注册可获得 3 次额外免费额度',
    email: '邮箱', pass: '密码', passPh: '至少 6 位',
    submitWait: '处理中...', submitIn: '登录', submitUp: '注册',
    toggleUp: '已有账户？→ 登录', toggleIn: '没有账户？→ 注册',
    toastRef: '🎁 邀请码已生效！已增加 3 次免费额度。',
    toastUp: '注册成功！去创建第一篇文档吧。', toastIn: '登录成功！',
    err: '出错了',
  },
}

export default function LoginForm({ lang, homeHref }: { lang: UiLang; homeHref: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const t = COPY[lang]
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
        router.push('/order/new')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success(t.toastIn)
        router.push('/order/new')
        router.refresh()
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t.err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-black mb-3 tracking-tight">
            {isSignUp ? t.titleUp : t.titleIn}
          </h1>
          <p className="text-gray-400 text-sm">
            {isSignUp ? t.subUp : t.subIn}
          </p>
          {refCode && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
              <p className="text-green-700 text-sm font-bold">{t.refTitle}</p>
              <p className="text-green-600 text-xs mt-0.5">{t.refSub}</p>
            </div>
          )}
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
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-gray-400 text-sm hover:text-black transition-colors min-h-[44px] px-4 inline-flex items-center justify-center">
            {isSignUp ? t.toggleUp : t.toggleIn}
          </button>
        </div>
      </div>
    </div>
  )
}
