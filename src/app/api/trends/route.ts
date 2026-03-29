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

    if (items.length > 0) {
      return NextResponse.json({ trends: items, updatedAt: new Date().toISOString(), geo })
    }
    // items 비어있으면 폴백으로 fall-through
  } catch (err) {
    console.error('Trends fetch error:', err)
  }

  // Google Trends fetch 실패 시 정적 폴백
  const FALLBACK: Record<string, { title: string; traffic: string; related: string[] }[]> = {
    KR: [
      { title: '스마트스토어 상세페이지', traffic: '50,000+', related: ['네이버 쇼핑 최적화', '상품 상세 글쓰기'] },
      { title: 'AI 글쓰기 도구', traffic: '30,000+', related: ['ChatGPT 활용법', 'Claude 사용법'] },
      { title: '쿠팡 상품 등록', traffic: '40,000+', related: ['쿠팡 로켓배송', '판매자 센터'] },
      { title: '보도자료 작성법', traffic: '10,000+', related: ['언론 홍보', 'PR 전략'] },
      { title: '사업계획서 양식', traffic: '20,000+', related: ['창업 지원금', '정부과제 신청'] },
      { title: '블로그 글쓰기 SEO', traffic: '60,000+', related: ['네이버 블로그 최적화', '티스토리 애드센스'] },
      { title: '인스타그램 마케팅', traffic: '35,000+', related: ['릴스 만들기', '팔로워 늘리기'] },
      { title: '온라인 쇼핑몰 창업', traffic: '15,000+', related: ['스마트스토어 창업', '셀러 가이드'] },
    ],
    US: [
      { title: 'AI content writing tools', traffic: '100K+', related: ['ChatGPT for blogs', 'AI copywriting'] },
      { title: 'Amazon product listing', traffic: '80K+', related: ['FBA guide', 'Product description tips'] },
      { title: 'Shopify store setup', traffic: '60K+', related: ['Dropshipping 2026', 'ecommerce SEO'] },
      { title: 'press release template', traffic: '40K+', related: ['PR writing tips', 'media outreach'] },
      { title: 'blog post ideas 2026', traffic: '50K+', related: ['content calendar', 'SEO writing'] },
      { title: 'WordPress SEO tips', traffic: '45K+', related: ['Yoast SEO', 'page speed'] },
    ],
    JP: [
      { title: 'AI文章生成ツール', traffic: '30,000+', related: ['Claude使い方', 'ChatGPT活用'] },
      { title: 'ネットショップ集客', traffic: '20,000+', related: ['楽天SEO', 'Amazon出品コツ'] },
      { title: 'ブログ収益化2026', traffic: '25,000+', related: ['アドセンス審査', 'アフィリエイト'] },
      { title: 'プレスリリース書き方', traffic: '8,000+', related: ['PR会社比較', '広報戦略'] },
      { title: '商品ページCV率改善', traffic: '15,000+', related: ['LPO施策', 'ランディングページ'] },
    ],
    CN: [
      { title: 'AI写作工具', traffic: '200,000+', related: ['ChatGPT中文', 'AI内容生成'] },
      { title: '电商商品描述', traffic: '150,000+', related: ['淘宝优化', '京东详情页'] },
      { title: '内容营销策略', traffic: '80,000+', related: ['小红书运营', '微信公众号'] },
      { title: '商业计划书模板', traffic: '60,000+', related: ['融资PPT', '项目申报书'] },
      { title: 'SEO关键词优化', traffic: '90,000+', related: ['百度SEO', '谷歌排名'] },
    ],
  }

  const fallbackData = FALLBACK[geo] ?? FALLBACK['KR']
  return NextResponse.json({
    trends: fallbackData,
    updatedAt: new Date().toISOString(),
    geo,
    source: 'fallback',
  })
}
