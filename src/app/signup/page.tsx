/**
 * 회원가입 페이지 — 4단계 플로우
 *
 * Supabase 설정:
 * Authentication → Providers → Email → "Use OTP for email verification" ON
 *
 * 이메일 템플릿 (Authentication → Email Templates → Confirm signup):
 * Subject: [PageAI] 회원가입 인증번호
 * Body:
 * <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:40px 20px">
 *   <h1 style="font-size:24px;font-weight:700">PageAI</h1>
 *   <hr style="border:none;border-top:1px solid #eee;margin:16px 0 32px">
 *   <p style="font-size:14px;color:#555;margin-bottom:16px">회원가입 인증번호입니다.</p>
 *   <h2 style="font-size:40px;font-weight:700;letter-spacing:10px;color:#000">{{ .Token }}</h2>
 *   <p style="font-size:12px;color:#999;margin-top:24px">이 번호는 10분간 유효합니다.</p>
 * </div>
 */
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'
import Step1Email from './components/Step1Email'
import Step2OTP from './components/Step2OTP'
import Step3Password from './components/Step3Password'
import Step4Complete from './components/Step4Complete'
import type { Step1T } from './components/Step1Email'
import type { Step2T } from './components/Step2OTP'
import type { Step3T } from './components/Step3Password'
import type { Step4T } from './components/Step4Complete'

export type SignupLang = 'ko' | 'en' | 'ja' | 'zh'
type Step = 1 | 2 | 3 | 4

interface LangCopy {
  loginLink: string
  loginHref: string
  alreadyHave: string
  loginLabel: string
  stepOf: (current: number, total: number) => string
  steps: string[]
  s1: Step1T
  s2: Step2T
  s3: Step3T
  s4: Step4T
}

const COPY: Record<SignupLang, LangCopy> = {
  ko: {
    loginLink: '로그인 →',
    loginHref: '/login',
    alreadyHave: '이미 계정이 있으신가요?',
    loginLabel: '로그인',
    stepOf: (c, t) => `${c} / ${t}단계`,
    steps: ['이메일 인증', '비밀번호 설정', '완료'],
    s1: {
      title: '이메일 입력',
      sub: '가입할 이메일 주소를 입력하세요. 인증번호를 보내드립니다.',
      emailLabel: '이메일',
      submit: '인증번호 발송',
      submitting: '발송 중...',
      toastSent: '인증번호를 발송했습니다. 메일함을 확인해주세요.',
      toastDuplicate: '이미 사용 중인 이메일입니다. 로그인해주세요.',
      toastErr: '오류가 발생했습니다.',
    },
    s2: {
      title: '인증번호 입력',
      sub: '로 발송된 6자리 인증번호를 입력해주세요.',
      spamNote: '스팸함도 확인해보세요.',
      verify: '인증하기',
      verifying: '인증 중...',
      toastErr: '인증번호가 올바르지 않습니다.',
      resend: '인증번호 재발송',
      resendCooldown: '재발송 ({n}초)',
      toastResent: '인증번호를 재발송했습니다.',
      back: '← 이메일 다시 입력',
    },
    s3: {
      title: '비밀번호 설정',
      sub: '사용할 비밀번호를 입력해주세요.',
      pwLabel: '비밀번호',
      pwPlaceholder: '8자 이상, 영문+숫자 조합',
      confirmLabel: '비밀번호 확인',
      confirmPlaceholder: '비밀번호를 다시 입력하세요',
      pwInvalid: '8자 이상, 영문+숫자 조합이어야 합니다.',
      pwValid: '✓ 사용 가능한 비밀번호입니다.',
      confirmMismatch: '비밀번호가 일치하지 않습니다.',
      confirmMatch: '✓ 비밀번호가 일치합니다.',
      submit: '완료',
      submitting: '처리 중...',
      toastErr: '오류가 발생했습니다.',
    },
    s4: {
      title: '회원가입이 완료되었습니다!',
      sub: 'PageAI를 시작해보세요.',
      cta: '대시보드로 이동',
      autoRedirect: '3초 후 자동으로 이동합니다...',
    },
  },
  en: {
    loginLink: 'Sign In →',
    loginHref: '/en/login',
    alreadyHave: 'Already have an account?',
    loginLabel: 'Sign In',
    stepOf: (c, t) => `Step ${c} of ${t}`,
    steps: ['Email Verify', 'Set Password', 'Done'],
    s1: {
      title: 'Enter Email',
      sub: 'Enter your email address. We will send a verification code.',
      emailLabel: 'Email',
      submit: 'Send Code',
      submitting: 'Sending...',
      toastSent: 'Verification code sent. Check your inbox.',
      toastDuplicate: 'Email already in use. Please sign in.',
      toastErr: 'An error occurred.',
    },
    s2: {
      title: 'Enter Code',
      sub: 'Enter the 6-digit code sent to',
      spamNote: 'Check your spam folder if you don\'t see it.',
      verify: 'Verify',
      verifying: 'Verifying...',
      toastErr: 'Invalid verification code.',
      resend: 'Resend Code',
      resendCooldown: 'Resend ({n}s)',
      toastResent: 'Code resent.',
      back: '← Change email',
    },
    s3: {
      title: 'Set Password',
      sub: 'Choose a password for your account.',
      pwLabel: 'Password',
      pwPlaceholder: 'Min 8 chars, letters + numbers',
      confirmLabel: 'Confirm Password',
      confirmPlaceholder: 'Re-enter password',
      pwInvalid: 'Must be 8+ chars with letters and numbers.',
      pwValid: '✓ Password looks good.',
      confirmMismatch: 'Passwords do not match.',
      confirmMatch: '✓ Passwords match.',
      submit: 'Complete',
      submitting: 'Processing...',
      toastErr: 'An error occurred.',
    },
    s4: {
      title: 'Account created!',
      sub: 'Welcome to PageAI.',
      cta: 'Go to Dashboard',
      autoRedirect: 'Redirecting in 3 seconds...',
    },
  },
  ja: {
    loginLink: 'ログイン →',
    loginHref: '/ja/login',
    alreadyHave: 'すでにアカウントをお持ちの方は',
    loginLabel: 'ログイン',
    stepOf: (c, t) => `${c} / ${t}ステップ`,
    steps: ['メール認証', 'パスワード設定', '完了'],
    s1: {
      title: 'メールアドレス入力',
      sub: '登録するメールアドレスを入力してください。認証コードをお送りします。',
      emailLabel: 'メールアドレス',
      submit: '認証コードを送信',
      submitting: '送信中...',
      toastSent: '認証コードを送信しました。メールをご確認ください。',
      toastDuplicate: 'すでに使用されているメールアドレスです。ログインしてください。',
      toastErr: 'エラーが発生しました。',
    },
    s2: {
      title: '認証コード入力',
      sub: 'に送信された6桁の認証コードを入力してください。',
      spamNote: '迷惑メールフォルダもご確認ください。',
      verify: '認証する',
      verifying: '認証中...',
      toastErr: '認証コードが正しくありません。',
      resend: '認証コードを再送',
      resendCooldown: '再送 ({n}秒)',
      toastResent: '認証コードを再送しました。',
      back: '← メールアドレスを変更',
    },
    s3: {
      title: 'パスワード設定',
      sub: '使用するパスワードを入力してください。',
      pwLabel: 'パスワード',
      pwPlaceholder: '8文字以上、英字+数字の組み合わせ',
      confirmLabel: 'パスワード確認',
      confirmPlaceholder: 'パスワードを再入力してください',
      pwInvalid: '8文字以上、英字+数字の組み合わせが必要です。',
      pwValid: '✓ 使用可能なパスワードです。',
      confirmMismatch: 'パスワードが一致しません。',
      confirmMatch: '✓ パスワードが一致しました。',
      submit: '完了',
      submitting: '処理中...',
      toastErr: 'エラーが発生しました。',
    },
    s4: {
      title: '登録が完了しました！',
      sub: 'PageAIへようこそ。',
      cta: 'ダッシュボードへ',
      autoRedirect: '3秒後に自動的に移動します...',
    },
  },
  zh: {
    loginLink: '登录 →',
    loginHref: '/zh/login',
    alreadyHave: '已有账户？',
    loginLabel: '登录',
    stepOf: (c, t) => `第 ${c} / ${t} 步`,
    steps: ['邮箱验证', '设置密码', '完成'],
    s1: {
      title: '输入邮箱',
      sub: '请输入注册邮箱地址，我们将发送验证码。',
      emailLabel: '电子邮件',
      submit: '发送验证码',
      submitting: '发送中...',
      toastSent: '验证码已发送，请查收邮件。',
      toastDuplicate: '该邮箱已被注册，请直接登录。',
      toastErr: '发生错误，请重试。',
    },
    s2: {
      title: '输入验证码',
      sub: '请输入发送至该邮箱的6位验证码。',
      spamNote: '如未收到，请检查垃圾邮件文件夹。',
      verify: '验证',
      verifying: '验证中...',
      toastErr: '验证码不正确。',
      resend: '重新发送验证码',
      resendCooldown: '重新发送 ({n}秒)',
      toastResent: '验证码已重新发送。',
      back: '← 重新输入邮箱',
    },
    s3: {
      title: '设置密码',
      sub: '请设置您的账户密码。',
      pwLabel: '密码',
      pwPlaceholder: '8位以上，字母+数字组合',
      confirmLabel: '确认密码',
      confirmPlaceholder: '请再次输入密码',
      pwInvalid: '密码需8位以上，包含字母和数字。',
      pwValid: '✓ 密码符合要求。',
      confirmMismatch: '两次输入的密码不一致。',
      confirmMatch: '✓ 密码一致。',
      submit: '完成',
      submitting: '处理中...',
      toastErr: '发生错误，请重试。',
    },
    s4: {
      title: '注册成功！',
      sub: '欢迎使用 PageAI。',
      cta: '前往仪表板',
      autoRedirect: '3秒后自动跳转...',
    },
  },
}

interface Props {
  lang?: SignupLang
}

export default function SignupPage({ lang = 'ko' }: Props) {
  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState('')
  const t = COPY[lang]

  function progressIdx(s: Step) {
    if (s === 4) return 3
    return s - 1
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <nav className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={28} />
        </Link>
        <Link href={t.loginHref} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
          {t.loginLink}
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* 진행 표시 */}
          {step < 4 && (
            <div className="mb-10">
              <div className="flex items-center mb-3">
                {t.steps.map((label, i) => {
                  const done = progressIdx(step) > i
                  const active = progressIdx(step) === i
                  return (
                    <div key={i} className="flex items-center gap-2 flex-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                        done ? 'bg-black text-white' :
                        active ? 'bg-black text-white ring-4 ring-black/10' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {done ? '✓' : i + 1}
                      </div>
                      <span className={`text-xs font-bold hidden sm:block ${active ? 'text-black' : 'text-gray-300'}`}>
                        {label}
                      </span>
                      {i < t.steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${done ? 'bg-black' : 'bg-gray-100'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
              <p className="text-[10px] text-gray-300 text-right">
                {t.stepOf(progressIdx(step) + 1, t.steps.length)}
              </p>
            </div>
          )}

          {step === 1 && <Step1Email t={t.s1} onNext={e => { setEmail(e); setStep(2) }} />}
          {step === 2 && <Step2OTP t={t.s2} email={email} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <Step3Password t={t.s3} onNext={() => setStep(4)} />}
          {step === 4 && <Step4Complete t={t.s4} />}

          {step < 4 && (
            <p className="text-center text-sm text-gray-400 mt-8">
              {t.alreadyHave}{' '}
              <Link href={t.loginHref} className="text-black font-bold hover:underline">
                {t.loginLabel}
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
