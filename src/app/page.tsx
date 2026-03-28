'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <header className="border-b border-gray-100 px-8 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-md" />
            <span className="font-bold text-sm tracking-tight">페이지AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
              로그인
            </Link>
            <Link href="/login" className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all">
              무료 시작
            </Link>
          </div>
        </div>
      </header>

      {/* 히어로 */}
      <section className="flex-1 flex items-center justify-center px-8 py-24">
        <div className={`text-center max-w-3xl transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            AI 자동 생성 · 2026
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-6 leading-[1.05] tracking-tight">
            상세페이지를<br />
            <span className="text-transparent" style={{ WebkitTextStroke: '2px #111' }}>5분 만에</span>{' '}완성
          </h1>

          <p className="text-xl text-gray-400 mb-12 leading-relaxed font-medium">
            제품 정보만 입력하면 AI가 전환율 높은<br />
            스마트스토어 상세페이지를 자동으로 만들어드립니다
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-20">
            <Link
              href="/login"
              className="bg-black text-white px-10 py-4 rounded-2xl text-lg font-bold hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-100"
            >
              무료로 시작하기 →
            </Link>
            <Link
              href="/dashboard"
              className="border border-gray-200 text-gray-700 px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-50 transition-all hover:scale-[1.02] active:scale-100"
            >
              대시보드 보기
            </Link>
          </div>

          {/* 스탯 */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { value: '5분', label: '평균 생성 시간' },
              { value: '6섹션', label: '전문 카피 자동 생성' },
              { value: 'PDF', label: '즉시 다운로드' },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-all">
                <div className="text-2xl font-black text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-400 text-xs font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-gray-100 px-8 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-black rounded" />
            <span className="text-xs font-bold text-gray-900">페이지AI</span>
          </div>
          <p className="text-xs text-gray-300">© 2026 페이지AI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
