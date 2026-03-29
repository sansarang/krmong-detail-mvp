import { NextRequest, NextResponse } from 'next/server'

// 구글 트렌드 RSS 파싱 (한국 실시간 급상승)
export async function GET(req: NextRequest) {
  const geo = req.nextUrl.searchParams.get('geo') ?? 'KR'

  try {
    // 최신 URL과 구 URL 둘 다 시도
    const urls = [
      `https://trends.google.com/trending/rss?geo=${geo}`,
      `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`,
    ]

    let xml = ''
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
          },
          next: { revalidate: 300 },
        })
        if (res.ok) {
          xml = await res.text()
          if (xml.includes('<item>')) break
        }
      } catch { continue }
    }

    // XML 파싱 (간단 정규식 방식)
    const items: { title: string; traffic: string; related: string[] }[] = []

    if (!xml) throw new Error('No data from Google Trends')

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
