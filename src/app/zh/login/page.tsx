'use client'
import { Suspense } from 'react'
import Logo from '@/components/Logo'
import Link from 'next/link'
import LoginForm from '@/components/LoginForm'

export default function ZhLoginPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <nav className="px-8 py-5 border-b border-gray-100">
        <Link href="/zh" className="flex items-center gap-2 w-fit">
          <Logo size={28} />
        </Link>
      </nav>
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
        </div>
      }>
        <LoginForm lang="zh" homeHref="/zh" />
      </Suspense>
    </main>
  )
}
