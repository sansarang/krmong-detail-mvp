import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SAMPLE_DATA } from '@/lib/sampleData'

interface Props { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const data = SAMPLE_DATA[decodeURIComponent(category)]
  if (!data) return {}
  return {
    title: `${data.pageTitle} | PageAI`,
    description: data.metaDesc,
    alternates: { canonical: `https://pagebeer.beer/samples/${category}` },
    openGraph: { title: data.pageTitle, description: data.metaDesc },
  }
}

export function generateStaticParams() {
  return Object.keys(SAMPLE_DATA).map(cat => ({ category: cat }))
}

export default async function CategorySamplePage({ params }: Props) {
  const { category } = await params
  const cat = decodeURIComponent(category)
  const data = SAMPLE_DATA[cat]
  if (!data) notFound()

  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <div className="border-b border-white/5 px-5 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg" />
            <span className="font-black text-white text-sm">PageAI</span>
          </Link>
          <Link href="/samples" className="text-xs text-gray-500 hover:text-white transition-colors">← 전체 카테고리</Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-16">
        <div className="mb-10">
          <span className="text-xs font-black bg-blue-500/15 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full mb-4 inline-block">
            샘플 — {cat}
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">{data.pageTitle}</h1>
          <p className="text-gray-400 text-sm max-w-xl leading-relaxed">{data.metaDesc}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {data.cards.map((card, i) => (
            <div key={i} className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all">
              <div className="p-6">
                <span className="text-xs font-black bg-blue-500/15 text-blue-400 px-2.5 py-1 rounded-full mb-3 inline-block">{card.badge}</span>
                <h2 className="text-base font-black text-white mb-3 leading-snug">{card.title}</h2>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {card.preview.map((sec, j) => (
                    <span key={j} className="text-[10px] bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full">{sec}</span>
                  ))}
                </div>
                <p className="text-sm text-gray-400 leading-relaxed line-clamp-4">{card.body}</p>
              </div>
              <div className="border-t border-white/5 px-6 py-4 bg-white/3 flex items-center justify-between">
                <p className="text-xs text-gray-600">AI 자동 생성 샘플</p>
                <Link href="/login" className="flex items-center gap-1.5 text-xs font-black text-blue-400 hover:text-blue-300 transition-colors">
                  이런 글을 AI로 5분 만에 생성하기 →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-3xl p-10">
          <h2 className="text-xl font-black text-white mb-3">내 {cat} 제품 상세페이지 자동 생성</h2>
          <p className="text-gray-400 text-sm mb-6">제품 정보 or URL만 입력하면 AI가 판매에 최적화된 상세페이지를 5분 안에 완성해드립니다.</p>
          <Link href="/login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3.5 rounded-2xl text-sm transition-all hover:shadow-xl hover:shadow-blue-500/30">
            PageAI로 자동 생성하기 →
          </Link>
        </div>
      </div>
    </main>
  )
}
