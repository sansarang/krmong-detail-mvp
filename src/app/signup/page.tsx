/**
 * 회원가입 페이지 — 4단계 플로우
 *
 * Supabase 이메일 템플릿 설정:
 * Authentication → Email Templates → Confirm signup
 * Subject: [PageAI] 회원가입 인증번호
 * Body:
 * <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:40px 20px">
 *   <h1 style="font-size:24px;font-weight:700">PageAI</h1>
 *   <hr style="border:none;border-top:1px solid #eee;margin:16px 0 32px">
 *   <p style="font-size:14px;color:#555;margin-bottom:16px">회원가입 인증번호입니다.</p>
 *   <h2 style="font-size:40px;font-weight:700;letter-spacing:10px;color:#000">{{ .Token }}</h2>
 *   <p style="font-size:12px;color:#999;margin-top:24px">이 번호는 10분간 유효합니다.<br>본인이 요청하지 않은 경우 이 메일을 무시해주세요.</p>
 * </div>
 *
 * Supabase 설정:
 * Authentication → Providers → Email → "Use OTP for email verification" ON
 */
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'
import Step1Email from './components/Step1Email'
import Step2OTP from './components/Step2OTP'
import Step3Password from './components/Step3Password'
import Step4Complete from './components/Step4Complete'

type Step = 1 | 2 | 3 | 4

const STEPS = [
  { label: '이메일 인증', num: 1 },
  { label: '비밀번호 설정', num: 2 },
  { label: '완료', num: 3 },
]

export default function SignupPage() {
  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState('')

  function progressStep(s: Step) {
    // Step 인덱스: 1→1/3, 2→2/3, 3→3/3, 4→완료
    if (s === 4) return 3
    return s - 1
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* NAV */}
      <nav className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={28} />
        </Link>
        <Link href="/login" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
          로그인 →
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* 진행 표시 (Step 4에서는 숨김) */}
          {step < 4 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                {STEPS.map((s, i) => {
                  const done = progressStep(step) > i
                  const active = progressStep(step) === i
                  return (
                    <div key={s.num} className="flex items-center gap-2 flex-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                        done ? 'bg-black text-white' :
                        active ? 'bg-black text-white ring-4 ring-black/10' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {done ? '✓' : s.num}
                      </div>
                      <span className={`text-xs font-bold hidden sm:block ${active ? 'text-black' : 'text-gray-300'}`}>
                        {s.label}
                      </span>
                      {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${done ? 'bg-black' : 'bg-gray-100'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
              <p className="text-[10px] text-gray-300 text-right">
                {progressStep(step) + 1} / {STEPS.length}단계
              </p>
            </div>
          )}

          {/* Step 렌더링 */}
          {step === 1 && (
            <Step1Email
              onNext={(e) => { setEmail(e); setStep(2) }}
            />
          )}
          {step === 2 && (
            <Step2OTP
              email={email}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <Step3Password
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <Step4Complete />
          )}

          {/* 로그인 링크 */}
          {step < 4 && (
            <p className="text-center text-sm text-gray-400 mt-8">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-black font-bold hover:underline">
                로그인
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
