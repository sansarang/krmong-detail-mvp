'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export interface Step4T {
  title: string
  sub: string
  cta: string
  autoRedirect: string
}

interface Props {
  t: Step4T
}

export default function Step4Complete({ t }: Props) {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => router.push('/dashboard'), 3000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="animate-fadeIn text-center">
      <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
        🎉
      </div>
      <h2 className="text-2xl font-black text-black mb-3">{t.title}</h2>
      <p className="text-gray-400 text-sm mb-8">{t.sub}</p>

      <Link
        href="/dashboard"
        className="block w-full bg-black text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all text-center"
      >
        {t.cta}
      </Link>
      <p className="text-xs text-gray-300 mt-4">{t.autoRedirect}</p>
    </div>
  )
}
