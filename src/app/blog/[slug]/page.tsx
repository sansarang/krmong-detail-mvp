import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogPost, BLOG_POSTS } from '@/lib/blog'

export async function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} | 페이지AI 블로그`,
    description: post.description,
    keywords: post.tags.join(', '),
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const lines = post.content.split('\n')

  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-8 py-5 sticky top-0 bg-white/90 backdrop-blur z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-[10px] font-black">AI</span>
            </div>
            <span className="font-black text-lg tracking-tight">페이지AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="text-sm text-gray-400 hover:text-black transition-colors">← 블로그</Link>
            <Link href="/login" className="bg-black text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all">
              무료 시작
            </Link>
          </div>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-16">
        {/* 헤더 */}
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full border bg-gray-50 text-gray-500 border-gray-200">
              {post.category}
            </span>
            <span className="text-xs text-gray-300">{post.date} · {post.readTime} 읽기</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-black tracking-[-0.04em] leading-tight mb-5">
            {post.title}
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">{post.description}</p>

          <div className="flex flex-wrap gap-2 mt-5">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs font-medium px-3 py-1 rounded-full bg-gray-50 text-gray-400 border border-gray-100">
                #{tag}
              </span>
            ))}
          </div>
        </header>

        {/* 콘텐츠 */}
        <div className="prose prose-gray max-w-none">
          {lines.map((line, i) => {
            if (line.startsWith('## '))
              return <h2 key={i} className="text-2xl font-black text-black mt-12 mb-4 tracking-tight">{line.slice(3)}</h2>
            if (line.startsWith('### '))
              return <h3 key={i} className="text-lg font-black text-black mt-8 mb-3 tracking-tight">{line.slice(4)}</h3>
            if (line.startsWith('**') && line.endsWith('**') && line.length > 4)
              return <p key={i} className="font-black text-black my-2">{line.slice(2, -2)}</p>
            if (line.startsWith('- '))
              return <li key={i} className="text-gray-600 ml-4 my-1 text-base leading-relaxed list-disc">{line.slice(2)}</li>
            if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. '))
              return <li key={i} className="text-gray-600 ml-4 my-1 text-base leading-relaxed list-decimal">{line.slice(3)}</li>
            if (line.startsWith('---'))
              return <hr key={i} className="border-gray-100 my-10" />
            if (line.startsWith('*') && line.endsWith('*'))
              return <p key={i} className="text-sm text-gray-400 italic my-2">{line.slice(1, -1)}</p>
            if (line.startsWith('| ') && line.includes('|')) {
              if (line.startsWith('| ---') || line.startsWith('|---|')) return null
              const cells = line.split('|').filter(c => c.trim())
              const isHeader = lines[i + 1]?.includes('---')
              return (
                <tr key={i} className={isHeader ? 'bg-gray-50' : 'border-b border-gray-50'}>
                  {cells.map((cell, j) => isHeader
                    ? <th key={j} className="text-left text-xs font-black text-gray-500 uppercase tracking-wider px-4 py-3">{cell.trim()}</th>
                    : <td key={j} className="px-4 py-3 text-sm text-gray-600">{cell.trim()}</td>
                  )}
                </tr>
              )
            }
            if (line.trim() === '') return <div key={i} className="my-3" />
            return <p key={i} className="text-gray-600 leading-relaxed my-3 text-base">{line}</p>
          })}
        </div>

        {/* 하단 CTA */}
        <div className="mt-16 bg-black rounded-3xl p-10 text-center">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">바로 적용해보세요</p>
          <h2 className="text-3xl font-black text-white tracking-tight mb-3 leading-tight">
            읽었으면 만들어보세요.<br />
            <span className="text-gray-500">5분이면 충분합니다.</span>
          </h2>
          <p className="text-gray-500 text-sm mb-6">무료로 시작 · 즉시 PDF 다운로드</p>
          <Link href="/login" className="inline-block bg-white text-black px-10 py-4 rounded-2xl font-black hover:bg-gray-100 transition-all hover:scale-105">
            무료로 시작하기 →
          </Link>
        </div>

        {/* 다른 글 */}
        <div className="mt-12">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-5">다른 글도 읽어보세요</p>
          <div className="space-y-3">
            {BLOG_POSTS.filter(p => p.slug !== post.slug).map(p => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="flex items-start justify-between gap-4 p-4 border border-gray-100 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all group"
              >
                <div>
                  <p className="text-sm font-black text-gray-900 group-hover:text-black mb-1">{p.title}</p>
                  <p className="text-xs text-gray-400">{p.category} · {p.readTime} 읽기</p>
                </div>
                <span className="text-gray-300 group-hover:text-black transition-colors shrink-0 mt-1">→</span>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </main>
  )
}
