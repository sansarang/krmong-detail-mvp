'use client'
import { Suspense } from 'react'
import Logo from '@/components/Logo'
import Link from 'next/link'
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <nav className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <Logo size={28} />
        </Link>
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
          ← Home
        </Link>
      </nav>
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
        </div>
      }>
        <LoginForm lang="ko" homeHref="/" />
      </Suspense>
    </main>
  )
}
