import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// 스크래핑 차단 도메인
const RESTRICTED_DOMAINS = [
  'coupang.com', 'amazon.co.jp', 'amazon.com', 'amazon.co.kr',
  'tmall.com', 'taobao.com', 'jd.com', 'rakuten.co.jp',
  'qoo10.jp', 'lazada.com', 'shopee.com',
]

export interface ScrapeResult {
  product_name: string
  brand: string
  category: string
  description: string
  price: string
  original_price: string
  features: string[]
  keywords: string[]
  image_urls: string[]
  colors: string[]
  sizes: string[]
  material: string
  target_customer: string
  partial?: boolean
}

function isRestrictedDomain(hostname: string): boolean {
  return RESTRICTED_DOMAINS.some(d => hostname.includes(d))
}

// ── JSON-LD Product 파서 ──────────────────────────────────────
function parseJsonLd(html: string): Partial<ScrapeResult> {
  const result: Partial<ScrapeResult> = {}
  const scriptMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  for (const match of scriptMatches) {
    try {
      const json = JSON.parse(match[1])
      const items = Array.isArray(json) ? json : [json]
      for (const item of items) {
        const type = (item['@type'] ?? '').toLowerCase()
        if (!type.includes('product')) continue

        if (item.name && !result.product_name) result.product_name = String(item.name).trim()
        if (item.description && !result.description) result.description = String(item.description).trim()
        if (item.brand?.name && !result.brand) result.brand = String(item.brand.name).trim()
        if (item.brand && typeof item.brand === 'string' && !result.brand) result.brand = item.brand

        // 이미지
        if (item.image) {
          const imgs = Array.isArray(item.image) ? item.image : [item.image]
          result.image_urls = imgs.slice(0, 5).map((img: unknown) =>
            typeof img === 'object' && img !== null && 'url' in img ? (img as { url: string }).url : String(img)
          ).filter((u: string) => u.startsWith('http'))
        }

        // 가격
        const offers = item.offers ?? item.offer
        if (offers) {
          const offerList = Array.isArray(offers) ? offers : [offers]
          const first = offerList[0]
          if (first?.price) result.price = String(first.price)
          if (first?.priceCurrency) result.price = `${first.priceCurrency} ${result.price}`
        }

        // 사이즈/색상
        if (item.size) result.sizes = [String(item.size)]
        if (item.color) result.colors = [String(item.color)]
        if (item.material) result.material = String(item.material)
      }
    } catch { /* invalid JSON */ }
  }
  return result
}

// ── OG / Meta 태그 파서 ──────────────────────────────────────
function parseMeta(html: string): Partial<ScrapeResult> {
  const result: Partial<ScrapeResult> = {}
  const get = (pattern: RegExp) => html.match(pattern)?.[1]?.trim()

  result.product_name = get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    ?? get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)
    ?? get(/<title[^>]*>([^<|–\-]+)/i)

  result.description = get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
    ?? get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)
    ?? get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    ?? get(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)

  const ogImage = get(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    ?? get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
  if (ogImage) result.image_urls = [ogImage]

  // Twitter Card
  const twTitle = get(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i)
  const twDesc = get(/<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i)
  if (twTitle && !result.product_name) result.product_name = twTitle
  if (twDesc && !result.description) result.description = twDesc

  return result
}

// ── 가격 태그 파서 ───────────────────────────────────────────
function parsePrice(html: string): { price?: string; original_price?: string } {
  const pricePatterns = [
    // 스마트스토어
    /<em[^>]+class="[^"]*num[^"]*"[^>]*>([0-9,]+)<\/em>/i,
    // 일반 가격 패턴
    /<span[^>]+class="[^"]*price[^"]*"[^>]*>\s*[₩¥$€]?\s*([0-9,]+)\s*/i,
    /<div[^>]+class="[^"]*price[^"]*"[^>]*>\s*[₩¥$€]?\s*([0-9,]+)\s*/i,
    // meta price
    /<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']product:price:amount["']/i,
  ]
  for (const p of pricePatterns) {
    const m = html.match(p)
    if (m?.[1]) return { price: m[1].replace(/,/g, '') }
  }
  return {}
}

// ── 이미지 URL 수집 ───────────────────────────────────────────
function parseImages(html: string, baseHost: string): string[] {
  const urls: string[] = []
  const patterns = [
    // 스마트스토어 대표이미지
    /<img[^>]+class="[^"]*thumb[^"]*"[^>]+src=["']([^"']+)["']/gi,
    // og:image 이미 처리됨, 여기선 product 이미지
    /<img[^>]+id="[^"]*main[^"]*"[^>]+src=["']([^"']+)["']/gi,
    /<img[^>]+class="[^"]*product[^"]*"[^>]+src=["']([^"']+)["']/gi,
    // 큰 이미지 (width 300이상)
    /<img[^>]+src=["'](https?:\/\/[^"']+\.(jpg|jpeg|png|webp))[^>]*/gi,
  ]

  for (const p of patterns) {
    let m: RegExpExecArray | null
    while ((m = p.exec(html)) !== null && urls.length < 8) {
      let src = m[1]
      if (src.startsWith('//')) src = 'https:' + src
      if (src.startsWith('/')) src = `https://${baseHost}${src}`
      if (!src.startsWith('http')) continue
      // 아이콘/로고 제외
      if (/icon|logo|banner|sprite|pixel|tracking|1x1/i.test(src)) continue
      if (!urls.includes(src)) urls.push(src)
    }
  }
  return urls.slice(0, 5)
}

// ── 본문 텍스트 정제 ──────────────────────────────────────────
function htmlToCleanText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 12000)
}

// ── 플랫폼별 힌트 ─────────────────────────────────────────────
function getPlatformHints(hostname: string): string {
  if (hostname.includes('smartstore.naver.com') || hostname.includes('brand.naver.com')) {
    return '이것은 네이버 스마트스토어 제품 페이지입니다.'
  }
  if (hostname.includes('coupang.com')) return '이것은 쿠팡 제품 페이지입니다.'
  if (hostname.includes('amazon')) return 'This is an Amazon product page.'
  if (hostname.includes('tmall') || hostname.includes('taobao')) return '这是淘宝/天猫商品页面。'
  if (hostname.includes('rakuten')) return 'これは楽天の商品ページです。'
  if (hostname.includes('nike')) return 'This is a Nike product page.'
  if (hostname.includes('shopify')) return 'This is a Shopify store product page.'
  return ''
}

// ── AI 추출 ───────────────────────────────────────────────────
async function extractWithAI(
  fetchUrl: string,
  text: string,
  prefilled: Partial<ScrapeResult>,
  partial: boolean,
): Promise<ScrapeResult> {
  const hostname = new URL(fetchUrl).hostname
  const platformHint = getPlatformHints(hostname)

  const prefilledContext = Object.entries(prefilled)
    .filter(([, v]) => v && (Array.isArray(v) ? v.length > 0 : String(v).length > 0))
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
    .join('\n')

  const prompt = partial
    ? `아래 URL과 힌트에서 제품 정보를 추출하세요.
URL: ${fetchUrl}
${platformHint}
이미 파악된 정보:
${prefilledContext || '없음'}
추가 텍스트:
${text.slice(0, 6000)}

규칙:
- 에러 메시지("Access Denied", "Forbidden" 등)는 절대 포함하지 마세요
- 모르는 필드는 빈 문자열 또는 빈 배열로 두세요
- image_urls는 이미 파악된 것 유지
- features는 제품의 핵심 특징을 3~6개 bullet로`
    : `아래 제품 페이지 정보를 분석해서 제품 정보를 최대한 풍부하게 추출하세요.
URL: ${fetchUrl}
${platformHint}
이미 파악된 정보:
${prefilledContext || '없음'}
페이지 텍스트:
${text.slice(0, 8000)}

규칙:
- product_name: 정확한 풀 네임 (브랜드 포함 가능)
- brand: 브랜드명만 (없으면 빈 문자열)
- category: 아래 코드 중 하나: food/beauty/living/fashion/electronics/health/pet/sports/saas/other
- description: 판매에 강한 300자 내외 설명 (특징, 효능, 타겟 고객 포함)
- features: 핵심 특징 3~6개 배열
- keywords: SEO 키워드 6~10개 배열
- price/original_price: 숫자+화폐 (예: "29,000원", "¥3,980")
- image_urls: 이미 파악된 이미지 유지
- colors/sizes: 있으면 배열로
- material: 재질/소재 (없으면 빈 문자열)
- target_customer: 타겟 고객 (예: "20~30대 여성, 건성 피부")
- 에러 메시지는 절대 포함하지 마세요`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 2000,
    system: 'You are a product information extraction expert. Return ONLY valid JSON matching the exact schema requested. No markdown, no explanation.',
    messages: [{
      role: 'user',
      content: `${prompt}

반드시 아래 JSON 형식으로만 반환:
{
  "product_name": "",
  "brand": "",
  "category": "",
  "description": "",
  "price": "",
  "original_price": "",
  "features": [],
  "keywords": [],
  "image_urls": [],
  "colors": [],
  "sizes": [],
  "material": "",
  "target_customer": ""
}`,
    }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('AI 응답 오류')

  const text2 = content.text.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
  const jsonMatch = text2.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('정보 추출 실패')

  const parsed = JSON.parse(jsonMatch[0]) as ScrapeResult
  // 이미지: AI가 지운 경우 prefilled 이미지 복원
  if ((!parsed.image_urls || parsed.image_urls.length === 0) && prefilled.image_urls?.length) {
    parsed.image_urls = prefilled.image_urls
  }
  return parsed
}

// ── Main Handler ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL을 입력해주세요' }, { status: 400 })
    }

    let fetchUrl = url.trim()
    if (!/^https?:\/\//i.test(fetchUrl)) fetchUrl = 'https://' + fetchUrl

    const parsed = new URL(fetchUrl)
    const hostname = parsed.hostname
    const restricted = isRestrictedDomain(hostname)

    let html = ''
    let fetchOk = false

    // ── 1차: 페이지 fetch ────────────────────────────────────
    try {
      const pageRes = await fetch(fetchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,ja;q=0.6,zh;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': `https://${hostname}/`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: AbortSignal.timeout(14000),
      })

      const rawHtml = await pageRes.text()
      const snippet = rawHtml.slice(0, 3000).toLowerCase()
      const isJunk = snippet.includes('access denied')
        || snippet.includes('403 forbidden')
        || snippet.includes('captcha')
        || snippet.includes('robot check')
        || snippet.includes('just a moment')  // Cloudflare
        || snippet.includes('ddos-guard')

      if (pageRes.ok && !isJunk) {
        html = rawHtml
        fetchOk = true
      } else if ((pageRes.status === 429 || pageRes.status === 403 || isJunk)) {
        // 차단되었더라도 OG/meta만 쓸 수 있으면 추출
        if (!isJunk) html = rawHtml
      } else if (!pageRes.ok) {
        throw new Error(`페이지 응답 오류 (${pageRes.status})`)
      }
    } catch (fetchErr: unknown) {
      if (fetchErr instanceof Error && (fetchErr.name === 'TimeoutError' || fetchErr.message.includes('timeout'))) {
        throw new Error('페이지 로딩 시간 초과. 제품명과 설명을 직접 입력해 주세요.')
      }
      if (!restricted) throw fetchErr
    }

    // ── 2차: 구조화 데이터 파싱 ─────────────────────────────
    const jsonLdData = html ? parseJsonLd(html) : {}
    const metaData = html ? parseMeta(html) : {}
    const priceData = html ? parsePrice(html) : {}
    const pageImages = html && fetchOk ? parseImages(html, hostname) : []

    // 이미지 병합 (JSON-LD > OG > 본문 이미지)
    const allImages = [
      ...(jsonLdData.image_urls ?? []),
      ...(metaData.image_urls ?? []),
      ...pageImages,
    ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5)

    // prefilled 데이터 병합
    const prefilled: Partial<ScrapeResult> = {
      product_name: jsonLdData.product_name ?? metaData.product_name ?? '',
      brand: jsonLdData.brand ?? metaData.brand ?? '',
      description: jsonLdData.description ?? metaData.description ?? '',
      price: jsonLdData.price ?? priceData.price ?? '',
      original_price: jsonLdData.original_price ?? priceData.original_price ?? '',
      image_urls: allImages,
      material: jsonLdData.material ?? '',
      sizes: jsonLdData.sizes ?? [],
      colors: jsonLdData.colors ?? [],
    }

    // ── 3차: AI 보강 ─────────────────────────────────────────
    if (fetchOk && html) {
      const cleanText = htmlToCleanText(html)
      const result = await extractWithAI(fetchUrl, cleanText, prefilled, false)
      return NextResponse.json(result)
    }

    // OG/meta 정보만 있을 때
    const metaHint = [prefilled.product_name, prefilled.description].filter(Boolean).join(' | ')
    if (metaHint || allImages.length > 0) {
      const result = await extractWithAI(fetchUrl, metaHint, prefilled, true)
      return NextResponse.json({ ...result, partial: true })
    }

    // 완전 차단
    if (restricted) {
      const result = await extractWithAI(fetchUrl, '(페이지 접근 차단)', prefilled, true)
      if (!result.product_name && !result.category) {
        return NextResponse.json({
          error: '이 사이트는 자동 수집이 제한되어 있어요. 제품명과 설명을 직접 입력해 주세요.',
          restricted: true,
        }, { status: 422 })
      }
      return NextResponse.json({ ...result, partial: true })
    }

    throw new Error('페이지 정보를 가져올 수 없습니다. 제품명과 설명을 직접 입력해 주세요.')
  } catch (err: unknown) {
    console.error('Scrape URL error:', err)
    const msg = err instanceof Error ? err.message : 'URL 스크래핑 실패'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
