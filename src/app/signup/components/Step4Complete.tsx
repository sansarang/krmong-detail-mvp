'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Step4Complete() {
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => router.push('/dashboard'), 3000)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="animate-fadeIn text-center">
      <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
        🎉
      </div>
      <h2 className="text-2xl font-black text-black mb-3">회원가입이 완료되었습니다!</h2>
      <p className="text-gray-400 text-sm mb-8">PageAI를 시작해보세요.</p>

      <Link
        href="/dashboard"
        className="block w-full bg-black text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all text-center"
      >
        대시보드로 이동
      </Link>
      <p className="text-xs text-gray-300 mt-4">3초 후 자동으로 이동합니다...</p>
    </div>
  )
}
