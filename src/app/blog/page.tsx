import Link from 'next/link'
import { BLOG_POSTS } from '@/lib/blog'

export const metadata = {
  title: '블로그 — 스마트스토어·쿠팡 상세페이지 전략 | 페이지AI',
  description: '전환율을 높이는 상세페이지 작성법, 쿠팡 상위노출 전략, AI 마케팅 자동화 가이드를 무료로 제공합니다.',
}

const CATEGORY_COLORS: Record<string, string> = {
  '전환율 최적화': 'bg-orange-50 text-orange-600 border-orange-200',
  '쿠팡 최적화':   'bg-blue-50 text-blue-600 border-blue-200',
  'AI 트렌드':     'bg-purple-50 text-purple-600 border-purple-200',
}

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-8 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-[10px] font-black">AI</span>
            </div>
            <span className="font-black text-lg tracking-tight">페이지AI</span>
          </Link>
          <Link href="/login" className="bg-black text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all">
            무료 시작
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-14 text-center">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">블로그</p>
          <h1 className="text-5xl font-black text-black tracking-[-0.04em] leading-tight mb-4">
            팔리는 상세페이지의<br />
            <span className="text-gray-200">모든 전략.</span>
          </h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">
            스마트스토어·쿠팡 셀러를 위한 실전 마케팅 가이드.<br />
            전환율을 높이는 방법을 무료로 공개합니다.
          </p>
        </div>

        <div className="grid gap-6">
          {BLOG_POSTS.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={`group block border rounded-3xl p-8 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-100 transition-all hover:-translate-y-0.5 ${
                i === 0 ? 'border-black bg-black text-white' : 'border-gray-100 bg-white'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                  i === 0
                    ? 'bg-white/10 text-gray-200 border-white/20'
                    : CATEGORY_COLORS[post.category] || 'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                  {post.category}
                </span>
                <span className={`text-xs ${i === 0 ? 'text-gray-400' : 'text-gray-300'}`}>
                  {post.date} · {post.readTime} 읽기
                </span>
              </div>

              <h2 className={`text-2xl font-black tracking-tight mb-3 leading-snug group-hover:opacity-80 transition-opacity ${
                i === 0 ? 'text-white' : 'text-black'
              }`}>
                {post.title}
              </h2>
              <p className={`text-sm leading-relaxed mb-5 ${i === 0 ? 'text-gray-400' : 'text-gray-500'}`}>
                {post.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                    i === 0 ? 'bg-white/10 text-gray-400' : 'bg-gray-50 text-gray-400 border border-gray-100'
                  }`}>
                    #{tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gray-50 border border-gray-100 rounded-3xl p-10 text-center">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">직접 써보세요</p>
          <h2 className="text-3xl font-black text-black tracking-tight mb-3">
            읽는 것보다 직접 만들어보세요
          </h2>
          <p className="text-gray-400 text-sm mb-6">제품 정보 30초 입력 → AI가 5분 만에 상세페이지 완성</p>
          <Link href="/login" className="inline-block bg-black text-white px-10 py-4 rounded-2xl font-black hover:bg-gray-800 transition-all hover:scale-105">
            무료로 시작하기 →
          </Link>
        </div>
      </div>
    </main>
  )
}
