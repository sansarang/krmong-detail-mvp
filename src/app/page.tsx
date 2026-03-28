'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm px-4 py-2 rounded-full mb-8">
          AI 자동 생성 서비스
        </div>
        <h1 className="text-6xl font-bold text-white mb-6">
          상세페이지를
          <br />
          <span className="text-purple-400">5분 만에</span> 완성
        </h1>
        <p className="text-xl text-white/60 mb-10">
          제품 정보만 입력하면 AI가 자동으로 만들어드립니다
        </p>
        <div className="flex gap-4 justify-center mb-16">
          <Link href="/login" className="bg-purple-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-purple-600 transition-all">
            시작하기
          </Link>
          <Link href="/dashboard" className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/20 transition-all">
            대시보드
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-3xl font-bold text-purple-400 mb-1">5분</div>
            <div className="text-white/50 text-sm">평균 생성 시간</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-3xl font-bold text-purple-400 mb-1">6섹션</div>
            <div className="text-white/50 text-sm">자동 카피 생성</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-3xl font-bold text-purple-400 mb-1">PDF</div>
            <div className="text-white/50 text-sm">즉시 다운로드</div>
          </div>
        </div>
      </div>
    </main>
  )
}
