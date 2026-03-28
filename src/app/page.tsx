'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>
      <div className={`text-center max-w-3xl relative z-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          AI 자동 생성 서비스
        </div>
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
          상세페이지를
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            5분 만에
          </span>{' '}완성
        </h1>
        <p className="text-xl text-white/60 mb-12 leading-relaxed">
          제품 정보만 입력하면 AI가 전환율 높은<br />
          스마트스토어 상세페이지를 자동으로 만들어드립니다
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/login" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-10 py-4 rounded-2xl text-lg font-료로 시작하기
          </Link>
          <Link href="/dashboard" className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105">
            대시보드 보기
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">5분</div>
            <div className="text-white/50 text-sm">평균 생성 시간</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">6섹션</div>
            <div className="text-white/50 text-sm">전문 카피 자동 생성</div>
  op-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">PDF</div>
            <div className="text-white/50 text-sm">즉시 다운로드</div>
          </div>
        </div>
      </div>
    </main>
  )
}
