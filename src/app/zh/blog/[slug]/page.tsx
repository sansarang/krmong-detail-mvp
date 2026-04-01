import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMultilangPost, getMultilangPosts } from '@/lib/blogMultilang'

export async function generateStaticParams() {
  return getMultilangPosts('zh').map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getMultilangPost('zh', slug)
  if (!post) return {}
  return {
    title: `${post.title} | PageAI 博客`,
    description: post.description,
    keywords: post.tags.join(', '),
    alternates: { canonical: `https://pagebeer.beer/zh/blog/${slug}` },
    openGraph: { title: post.title, description: post.description, type: 'article', publishedTime: post.date },
  }
}

function renderContent(content: string) {
  const lines = content.split('\n')
  const elements: ReactNode[] = []
  let tableRows: ReactNode[] = []
  let inTable = false

  lines.forEach((line, i) => {
    if (line.startsWith('| ') && line.includes('|')) {
      if (line.startsWith('| ---') || line.startsWith('|---')) { inTable = true; return }
      const cells = line.split('|').filter(c => c.trim())
      const nextLine = lines[i + 1] || ''
      const isHeader = nextLine.includes('---')
      tableRows.push(
        <tr key={i} className={isHeader ? 'bg-white/5' : 'border-b border-white/5'}>
          {cells.map((cell, j) => isHeader
            ? <th key={j} className="text-left text-xs font-bold text-gray-400 px-4 py-3">{cell.trim()}</th>
            : <td key={j} className="px-4 py-3 text-sm text-gray-300">{cell.trim()}</td>
          )}
        </tr>
      )
      return
    }
    if (inTable && tableRows.length > 0 && !line.startsWith('|')) {
      elements.push(<div key={`table-${i}`} className="overflow-x-auto rounded-xl border border-white/8 my-6"><table className="w-full">{tableRows}</table></div>)
      tableRows = []; inTable = false
    }
    if (line.startsWith('## '))
      elements.push(<h2 key={i} className="text-2xl font-black text-white mt-12 mb-4">{line.slice(3)}</h2>)
    else if (line.startsWith('### '))
      elements.push(<h3 key={i} className="text-lg font-black text-white mt-8 mb-3">{line.slice(4)}</h3>)
    else if (line.startsWith('- '))
      elements.push(<li key={i} className="text-gray-400 ml-4 my-1 text-base leading-relaxed list-disc">{line.slice(2)}</li>)
    else if (line.startsWith('---'))
      elements.push(<hr key={i} className="border-white/10 my-10" />)
    else if (line.startsWith('*') && line.endsWith('*') && line.length > 2)
      elements.push(<p key={i} className="text-sm text-gray-500 italic my-2">{line.slice(1, -1)}</p>)
    else if (line.trim() === '')
      elements.push(<div key={i} className="my-3" />)
    else
      elements.push(<p key={i} className="text-gray-400 leading-relaxed my-3 text-base">{line}</p>)
  })

  if (tableRows.length > 0)
    elements.push(<div key="table-end" className="overflow-x-auto rounded-xl border border-white/8 my-6"><table className="w-full">{tableRows}</table></div>)
  return elements
}

export default async function ZhBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getMultilangPost('zh', slug)
  if (!post) notFound()

  const relatedPosts = getMultilangPosts('zh').filter(p => p.slug !== post.slug).slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: post.title, description: post.description, datePublished: post.date,
    author: { '@type': 'Organization', name: 'PageAI' },
    publisher: { '@type': 'Organization', name: 'PageAI', url: 'https://pagebeer.beer' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-[#0B1120] text-white">
        <nav className="border-b border-white/5 px-6 py-4 sticky top-0 bg-[#0B1120]/95 backdrop-blur z-10">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-[10px] font-black">AI</span>
              </div>
              <span className="font-black text-white text-sm">PageAI</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/blog" className="text-xs text-gray-400 hover:text-white transition-colors">← 博客</Link>
              <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">免费开始</Link>
            </div>
          </div>
        </nav>

        <article className="max-w-3xl mx-auto px-6 py-16">
          <header className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">{post.category}</span>
              <span className="text-xs text-gray-500">{post.date} · {post.readTime}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-5">{post.title}</h1>
            <p className="text-gray-400 leading-relaxed">{post.description}</p>
            <div className="flex flex-wrap gap-2 mt-5">
              {post.tags.map(tag => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/8">#{tag}</span>
              ))}
            </div>
          </header>

          <div>{renderContent(post.content)}</div>

          <div className="mt-16 bg-gradient-to-r from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-3xl p-10 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">立即应用所学</p>
            <h2 className="text-2xl font-black text-white mb-3">90秒生成商品详情页<br /><span className="text-gray-500">免费计划立即开始</span></h2>
            <p className="text-gray-500 text-sm mb-6">支持天猫·Amazon·Shopify·乐天</p>
            <Link href="/login" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black text-sm transition-colors">
              用PageAI自动生成商品详情页 →
            </Link>
          </div>

          <div className="mt-12">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-5">相关文章</p>
            <div className="space-y-3">
              {relatedPosts.map(p => (
                <Link key={p.slug} href={`/zh/blog/${p.slug}`}
                  className="flex items-start justify-between gap-4 p-4 border border-white/8 rounded-2xl hover:border-blue-500/30 transition-all group">
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-blue-400 mb-1">{p.title}</p>
                    <p className="text-xs text-gray-500">{p.category} · {p.readTime}</p>
                  </div>
                  <span className="text-gray-600 group-hover:text-blue-400 transition-colors shrink-0 mt-1">→</span>
                </Link>
              ))}
            </div>
          </div>
        </article>
      </main>
    </>
  )
}
