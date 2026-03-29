import { NextRequest, NextResponse } from 'next/server'

// 구글 트렌드 RSS 파싱 (한국 실시간 급상승)
export async function GET(req: NextRequest) {
  const geo = req.nextUrl.searchParams.get('geo') ?? 'KR'

  try {
    const url = `https://trends.google.com/trending/rss?geo=${geo}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PageAI/1.0)' },
      next: { revalidate: 300 }, // 5분 캐시
    })

    if (!res.ok) throw new Error('Google Trends fetch failed')

    const xml = await res.text()

    // XML 파싱 (간단 정규식 방식)
    const items: { title: string; traffic: string; related: string[] }[] = []
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)

    for (const match of itemMatches) {
      const block = match[1]
      const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        ?? block.match(/<title>(.*?)<\/title>/)?.[1]
        ?? ''
      const traffic = block.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/)?.[1] ?? ''
      const relatedMatches = [...block.matchAll(/<ht:news_item_title><!\[CDATA\[(.*?)\]\]>/g)]
      const related = relatedMatches.map(m => m[1]).slice(0, 2)

      if (title) items.push({ title, traffic, related })
      if (items.length >= 10) break
    }

    return NextResponse.json({ trends: items, updatedAt: new Date().toISOString(), geo })
  } catch (err) {
    console.error('Trends fetch error:', err)
    // 오류 시 fallback 더미 데이터
    return NextResponse.json({
      trends: [],
      error: 'Google Trends 데이터를 불러올 수 없습니다',
      updatedAt: new Date().toISOString(),
      geo,
    })
  }
}
