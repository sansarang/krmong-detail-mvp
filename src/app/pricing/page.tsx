import type { Metadata } from 'next'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import PricingPageClient from './PricingPageClient'

export const metadata: Metadata = {
  title: '가격 플랜 — PageAI',
  description: '스마트스토어·쿠팡·Amazon JP·Tmall 상세페이지 AI 자동 생성. 무료 플랜부터 비즈니스 플랜까지.',
  alternates: { canonical: 'https://pagebeer.beer/pricing' },
}

export default async function PricingPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4 sticky top-0 bg-white/95 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={28} />
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all">
                대시보드
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-400 hover:text-black transition-colors">로그인</Link>
                <Link href="/login" className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all">
                  무료 시작
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <PricingPageClient isLoggedIn={!!user} />
    </main>
  )
}
