import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

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

// ── 리얼 브라우저 헤더 세트 ───────────────────────────────────
function getBrowserHeaders(hostname: string): Record<string, string> {
  const base: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.208 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,ja;q=0.6,zh-CN;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
  }

  if (hostname.includes('coupang')) {
    base['Referer'] = 'https://www.coupang.com/'
    base['Cookie'] = 'PCID=; sid='
  } else if (hostname.includes('amazon')) {
    base['Referer'] = 'https://www.google.com/'
    base['Accept-Language'] = 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7'
  } else if (hostname.includes('smartstore') || hostname.includes('naver')) {
    base['Referer'] = 'https://shopping.naver.com/'
  } else if (hostname.includes('tmall') || hostname.includes('taobao')) {
    base['Referer'] = 'https://www.tmall.com/'
    base['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8'
  } else if (hostname.includes('rakuten')) {
    base['Referer'] = 'https://www.rakuten.co.jp/'
    base['Accept-Language'] = 'ja-JP,ja;q=0.9,en-US;q=0.8'
  } else {
    base['Referer'] = `https://${hostname}/`
  }
  return base
}

// ── 모바일 User-Agent ─────────────────────────────────────────
function getMobileHeaders(hostname: string): Record<string, string> {
  const base = getBrowserHeaders(hostname)
  base['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1'
  base['Sec-Ch-Ua-Mobile'] = '?1'
  base['Sec-Ch-Ua-Platform'] = '"iOS"'
  return base
}

// ── 플랫폼별 URL 변환 ─────────────────────────────────────────
function getAlternativeUrls(url: string, hostname: string): string[] {
  const alts: string[] = []

  // 쿠팡: www → m.coupang.com/vm/
  if (hostname.includes('coupang.com')) {
    const mUrl = url.replace('www.coupang.com/vp/products', 'm.coupang.com/vm/products')
    if (mUrl !== url) alts.push(mUrl)
    // Coupang product JSON (unofficial)
    const idMatch = url.match(/\/products\/(\d+)/)
    if (idMatch) {
      alts.push(`https://www.coupang.com/vp/products/${idMatch[1]}?itemId=&vendorItemId=&src=1009&spec=10304982&addtag=400&ctag=10304982&lptag=10304982&itime=20240101000000&pageType=PRODUCT&pageValue=${idMatch[1]}&wPcid=&wRef=&wTime=&redirect=landing&isAddedCart=`)
    }
  }

  // Amazon: dp URL → 정규화
  if (hostname.includes('amazon')) {
    const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/)
    if (asinMatch) {
      alts.push(`https://${hostname}/dp/${asinMatch[1]}`)
      alts.push(`https://${hostname}/dp/${asinMatch[1]}?language=ko_KR`)
    }
  }

  // 스마트스토어: smartstore.naver.com
  if (hostname.includes('smartstore.naver.com')) {
    const pathMatch = url.match(/smartstore\.naver\.com\/([^/]+)\/products\/(\d+)/)
    if (pathMatch) {
      alts.push(`https://smartstore.naver.com/${pathMatch[1]}/products/${pathMatch[2]}`)
    }
  }

  return alts
}

// ── HTML 페치 (여러 전략 시도) ────────────────────────────────
async function fetchHtml(url: string): Promise<{ html: string; ok: boolean; strategy: string }> {
  const parsed = new URL(url)
  const hostname = parsed.hostname

  // 전략 1: 데스크톱 헤더로 직접 fetch
  try {
    const res = await fetch(url, {
      headers: getBrowserHeaders(hostname),
      signal: AbortSignal.timeout(12000),
    })
    const html = await res.text()
    const snippet = html.slice(0, 2000).toLowerCase()
    const blocked = snippet.includes('access denied') || snippet.includes('403 forbidden')
      || snippet.includes('captcha') || snippet.includes('robot check')
      || snippet.includes('just a moment') || snippet.includes('ddos-guard')
      || snippet.includes('enable javascript') || snippet.includes('checking your browser')
    if (res.ok && !blocked && html.length > 2000) {
      return { html, ok: true, strategy: 'desktop' }
    }
  } catch { /* next strategy */ }

  // 전략 2: 모바일 헤더로 재시도
  try {
    const mobileUrl = url.replace('www.coupang.com/vp', 'm.coupang.com/vm')
    const res = await fetch(mobileUrl, {
      headers: getMobileHeaders(hostname),
      signal: AbortSignal.timeout(10000),
    })
    const html = await res.text()
    const snippet = html.slice(0, 2000).toLowerCase()
    const blocked = snippet.includes('access denied') || snippet.includes('captcha')
      || snippet.includes('just a moment') || snippet.includes('robot check')
    if (res.ok && !blocked && html.length > 1000) {
      return { html, ok: true, strategy: 'mobile' }
    }
  } catch { /* next strategy */ }

  // 전략 3: 대안 URL
  const altUrls = getAlternativeUrls(url, hostname)
  for (const altUrl of altUrls) {
    try {
      const res = await fetch(altUrl, {
        headers: getBrowserHeaders(hostname),
        signal: AbortSignal.timeout(8000),
      })
      const html = await res.text()
      const snippet = html.slice(0, 1000).toLowerCase()
      const blocked = snippet.includes('access denied') || snippet.includes('captcha')
      if (res.ok && !blocked && html.length > 1000) {
        return { html, ok: true, strategy: 'alt-url' }
      }
    } catch { /* next */ }
  }

  // 전략 4: Google Cache
  try {
    const cacheUrl = `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(url)}&hl=ko`
    const res = await fetch(cacheUrl, {
      headers: { 'User-Agent': getBrowserHeaders(hostname)['User-Agent'] },
      signal: AbortSignal.timeout(8000),
    })
    const html = await res.text()
    if (res.ok && html.length > 2000 && !html.includes('did not match any documents')) {
      return { html, ok: true, strategy: 'google-cache' }
    }
  } catch { /* fallthrough */ }

  return { html: '', ok: false, strategy: 'failed' }
}

// ── JSON-LD Product 파서 ──────────────────────────────────────
function parseJsonLd(html: string): Partial<ScrapeResult> {
  const result: Partial<ScrapeResult> = {}
  const scriptMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
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
        if (typeof item.brand === 'string' && !result.brand) result.brand = item.brand
        if (item.material && !result.material) result.material = String(item.material)
        if (item.color && !result.colors?.length) result.colors = [String(item.color)]
        if (item.size && !result.sizes?.length) result.sizes = [String(item.size)]

        if (item.image) {
          const imgs = Array.isArray(item.image) ? item.image : [item.image]
          const urls = imgs.slice(0, 6).map((img: unknown) =>
            typeof img === 'object' && img !== null && 'url' in img
              ? (img as { url: string }).url : String(img)
          ).filter((u: string) => u.startsWith('http'))
          if (urls.length) result.image_urls = urls
        }

        const offers = item.offers ?? item.offer
        if (offers) {
          const offerList = Array.isArray(offers) ? offers : [offers]
          const first = offerList[0]
          if (first?.price) {
            const currency = first.priceCurrency ?? ''
            result.price = currency ? `${currency} ${first.price}` : String(first.price)
          }
        }
      }
    } catch { /* invalid JSON */ }
  }
  return result
}

// ── OG / Meta / Twitter 파서 ─────────────────────────────────
function parseMeta(html: string): Partial<ScrapeResult> {
  const result: Partial<ScrapeResult> = {}
  const get = (pattern: RegExp) => html.match(pattern)?.[1]?.trim()

  result.product_name =
    get(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']{3,}?)["']/i) ??
    get(/<meta[^>]+content=["']([^"']{3,}?)["'][^>]*property=["']og:title["']/i) ??
    get(/<meta[^>]+name=["']twitter:title["'][^>]*content=["']([^"']{3,}?)["']/i) ??
    get(/<title[^>]*>([^<|–\-]{3,})/i)

  result.description =
    get(/<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ??
    get(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:description["']/i) ??
    get(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i) ??
    get(/<meta[^>]+content=["']([^"']+)["'][^>]*name=["']description["']/i)

  const ogImage =
    get(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ??
    get(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
  if (ogImage?.startsWith('http')) result.image_urls = [ogImage]

  // product: meta 태그
  const metaPrice =
    get(/<meta[^>]+property=["']product:price:amount["'][^>]*content=["']([^"']+)["']/i) ??
    get(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']product:price:amount["']/i)
  if (metaPrice) result.price = metaPrice

  const metaBrand =
    get(/<meta[^>]+property=["']product:brand["'][^>]*content=["']([^"']+)["']/i) ??
    get(/<meta[^>]+name=["']brand["'][^>]*content=["']([^"']+)["']/i)
  if (metaBrand) result.brand = metaBrand

  return result
}

// ── 플랫폼별 전용 파서 ────────────────────────────────────────
function parsePlatformSpecific(html: string, hostname: string): Partial<ScrapeResult> {
  const result: Partial<ScrapeResult> = {}
  const get = (pattern: RegExp) => html.match(pattern)?.[1]?.trim()

  // ── 쿠팡 ──────────────────────────────────────────────────
  if (hostname.includes('coupang')) {
    // 제품명
    result.product_name =
      get(/<h2[^>]+class="[^"]*prod-buy-header__title[^"]*"[^>]*>([^<]+)/i) ??
      get(/<h1[^>]+class="[^"]*title[^"]*"[^>]*>([^<]+)/i) ??
      get(/"productTitle"\s*:\s*"([^"]+)"/i) ??
      get(/"name"\s*:\s*"([^"]+)"/i)

    // 가격 — 쿠팡 특유의 패턴
    const salePrice =
      get(/<strong[^>]+class="[^"]*sale-price[^"]*"[^>]*>\s*([0-9,]+)/i) ??
      get(/<span[^>]+class="[^"]*price-value[^"]*"[^>]*>([0-9,]+)/i) ??
      get(/"finalPrice"\s*:\s*([0-9]+)/i) ??
      get(/"salePrice"\s*:\s*([0-9]+)/i)
    if (salePrice) result.price = salePrice.replace(/,/g, '') + '원'

    const origPrice =
      get(/<del[^>]+class="[^"]*base-price[^"]*"[^>]*>\s*([0-9,]+)/i) ??
      get(/"originalPrice"\s*:\s*([0-9]+)/i)
    if (origPrice) result.original_price = origPrice.replace(/,/g, '') + '원'

    // 브랜드
    result.brand =
      get(/<span[^>]+class="[^"]*brand[^"]*"[^>]*>([^<]+)/i) ??
      get(/"brand"\s*:\s*"([^"]+)"/i) ??
      get(/<a[^>]+href="[^"]*brand[^"]*"[^>]*>([^<]+)/i)

    // 카테고리 breadcrumb
    const cats = [...html.matchAll(/<li[^>]+class="[^"]*breadcrumb[^"]*"[^>]*>([^<]+)/gi)]
      .map(m => m[1].trim()).filter(Boolean)
    if (cats.length) result.keywords = cats

    // 이미지
    const imgs = [...html.matchAll(/https:\/\/thumbnail\d*\.coupangcdn\.com\/thumbnails\/remote\/[^"'\s]+(?:jpg|jpeg|png|webp)/gi)]
      .map(m => m[0]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 5)
    if (imgs.length) result.image_urls = imgs
  }

  // ── Amazon JP ─────────────────────────────────────────────
  if (hostname.includes('amazon')) {
    result.product_name =
      get(/id=["']productTitle["'][^>]*>\s*([^<]+)/i) ??
      get(/<span[^>]+id=["']productTitle["'][^>]*>([^<]+)/i)

    result.brand =
      get(/id=["']bylineInfo["'][^>]*>([^<]+)/i) ??
      get(/<a[^>]+id=["']bylineInfo["'][^>]*>([^<]+)/i)

    const aprice =
      get(/class=["']a-price-whole["'][^>]*>([0-9,]+)/i) ??
      get(/"priceAmount"\s*:\s*"([^"]+)"/i)
    if (aprice) result.price = aprice

    // bullet points
    const bullets = [...html.matchAll(/<span[^>]+class=["'][^"']*a-list-item[^"']*["'][^>]*>([^<]{10,})<\/span>/gi)]
      .map(m => m[1].trim()).filter(s => s.length > 5 && !s.includes('<')).slice(0, 6)
    if (bullets.length) result.features = bullets

    // Amazon CDN images
    const amzImgs = [...html.matchAll(/https:\/\/[^"'\s]+\.ssl-images-amazon\.com\/images\/[^"'\s]+(?:jpg|png)/gi)]
      .map(m => m[0]).filter((v, i, a) => a.indexOf(v) === i)
      .filter(u => !u.includes('sprite') && !u.includes('icon')).slice(0, 5)
    if (amzImgs.length) result.image_urls = amzImgs
  }

  // ── 스마트스토어 ──────────────────────────────────────────
  if (hostname.includes('smartstore.naver.com') || hostname.includes('brand.naver.com')) {
    result.product_name = get(/<h3[^>]+class="[^"]*product_title[^"]*"[^>]*>([^<]+)/i)
      ?? get(/"product":{"name":"([^"]+)"/i)
      ?? get(/"displayName":"([^"]+)"/i)

    const nvPrice = get(/"salePrice":([0-9]+)/i) ?? get(/"price":([0-9]+)/i)
    if (nvPrice) result.price = parseInt(nvPrice).toLocaleString() + '원'

    const nvOrig = get(/"originalPrice":([0-9]+)/i) ?? get(/"costPrice":([0-9]+)/i)
    if (nvOrig) result.original_price = parseInt(nvOrig).toLocaleString() + '원'

    result.brand = get(/"mall":{"name":"([^"]+)"/i) ?? get(/"brandName":"([^"]+)"/i)

    const nvImgs = [...html.matchAll(/https:\/\/[^"'\s]+(?:pstatic\.net|naver\.com)[^"'\s]+(?:jpg|jpeg|png|webp)/gi)]
      .map(m => m[0]).filter((v, i, a) => a.indexOf(v) === i)
      .filter(u => !u.includes('icon') && !u.includes('logo')).slice(0, 5)
    if (nvImgs.length) result.image_urls = nvImgs
  }

  // ── Tmall / Taobao ────────────────────────────────────────
  if (hostname.includes('tmall.com') || hostname.includes('taobao.com')) {
    result.product_name =
      get(/<h1[^>]+class="[^"]*tb-main-title[^"]*"[^>]*>([^<]+)/i) ??
      get(/"title":"([^"]+)"/i)

    const tPrice = get(/"defaultItemId":(?:[^}]+)"price":"([^"]+)"/i) ?? get(/"price":"([0-9.]+)"/i)
    if (tPrice) result.price = `¥${tPrice}`

    const tImgs = [...html.matchAll(/https:\/\/[^"'\s]+\.taobaocdn\.com[^"'\s]+(?:jpg|png)/gi)]
      .map(m => m[0]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 5)
    if (tImgs.length) result.image_urls = tImgs
  }

  // ── 楽天 ─────────────────────────────────────────────────
  if (hostname.includes('rakuten.co.jp')) {
    result.product_name = get(/<h1[^>]+class="[^"]*item_name[^"]*"[^>]*>([^<]+)/i)
      ?? get(/"name":"([^"]+)","brand"/i)

    const rPrice = get(/<span[^>]+class="[^"]*price[^"]*"[^>]*>\s*([0-9,]+)\s*円/i)
    if (rPrice) result.price = rPrice.replace(/,/g, '') + '円'
  }

  // ── Shopify ────────────────────────────────────────────────
  if (hostname.includes('myshopify.com') || get(/<meta[^>]+name="shopify-checkout-api-token"/i)) {
    // Shopify JSON API
    result.product_name = get(/"title":"([^"]+)","body_html"/i)
    result.brand = get(/"vendor":"([^"]+)"/i)
    result.description = get(/"body_html":"([^"]+)"/i)?.replace(/\\n/g, '\n').replace(/<[^>]+>/g, '')
    const shPrice = get(/"price":"([^"]+)"/i) ?? get(/"compare_at_price":"([^"]+)"/i)
    if (shPrice) result.price = '$' + (parseInt(shPrice) / 100).toFixed(2)
  }

  // ── Qoo10 ─────────────────────────────────────────────────
  if (hostname.includes('qoo10')) {
    result.product_name = get(/<h1[^>]+class="[^"]*itemtitle[^"]*"[^>]*>([^<]+)/i)
    const qPrice = get(/<strong[^>]+class="[^"]*sale[^"]*"[^>]*>\s*([0-9,]+)/i)
    if (qPrice) result.price = qPrice
  }

  return result
}

// ── 가격 태그 범용 파서 ───────────────────────────────────────
function parsePrice(html: string, hostname: string): { price?: string; original_price?: string } {
  const patterns: RegExp[] = [
    /<meta[^>]+property=["']product:price:amount["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']product:price:amount["']/i,
  ]

  if (hostname.includes('coupang')) {
    patterns.unshift(
      /<strong[^>]*class="[^"]*sale-price[^"]*"[^>]*>\s*([0-9,]+)/i,
      /"finalPrice"\s*:\s*([0-9]+)/i,
    )
  } else if (hostname.includes('amazon')) {
    patterns.unshift(/<span[^>]*class="a-price-whole"[^>]*>([0-9,]+)/i)
  } else if (hostname.includes('smartstore') || hostname.includes('naver')) {
    patterns.unshift(/"salePrice"\s*:\s*([0-9]+)/i)
  } else {
    patterns.push(
      /<span[^>]+class="[^"]*price[^"]*"[^>]*>\s*[₩¥$€]?\s*([0-9,]+)/i,
      /<div[^>]+class="[^"]*price[^"]*"[^>]*>\s*[₩¥$€]?\s*([0-9,]+)/i,
      /<em[^>]+class="[^"]*num[^"]*"[^>]*>([0-9,]+)<\/em>/i,
    )
  }

  for (const p of patterns) {
    const m = html.match(p)
    if (m?.[1]) return { price: m[1].replace(/,/g, '') }
  }
  return {}
}

// ── 이미지 범용 수집 ─────────────────────────────────────────
function parseImages(html: string, baseHost: string): string[] {
  const urls: string[] = []
  const patterns = [
    /<img[^>]+src=["'](https?:\/\/[^"']+\.(jpg|jpeg|png|webp)(?:\?[^"']*)?)[^>]*/gi,
    /<img[^>]+data-src=["'](https?:\/\/[^"']+\.(jpg|jpeg|png|webp)(?:\?[^"']*)?)[^>]*/gi,
    /<source[^>]+srcset=["'](https?:\/\/[^"' ,]+)/gi,
  ]
  for (const p of patterns) {
    let m: RegExpExecArray | null
    p.lastIndex = 0
    while ((m = p.exec(html)) !== null && urls.length < 12) {
      let src = m[1]
      if (src.startsWith('//')) src = 'https:' + src
      if (src.startsWith('/')) src = `https://${baseHost}${src}`
      if (!src.startsWith('http')) continue
      if (/icon|logo|banner|sprite|pixel|tracking|1x1|svg|gif/i.test(src)) continue
      if (!urls.includes(src)) urls.push(src)
    }
  }
  return urls.slice(0, 5)
}

// ── HTML → 깨끗한 텍스트 ──────────────────────────────────────
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
    .slice(0, 14000)
}

// ── 플랫폼 힌트 ──────────────────────────────────────────────
function getPlatformHint(hostname: string): string {
  if (hostname.includes('smartstore.naver.com')) return '이것은 네이버 스마트스토어 제품 페이지입니다.'
  if (hostname.includes('coupang.com')) return '이것은 쿠팡 제품 페이지입니다. 한국 쇼핑몰.'
  if (hostname.includes('amazon.co.jp')) return 'This is an Amazon Japan product page.'
  if (hostname.includes('amazon.com')) return 'This is an Amazon US product page.'
  if (hostname.includes('amazon.co.kr')) return 'This is an Amazon Korea product page.'
  if (hostname.includes('tmall.com')) return '这是天猫商品详情页。'
  if (hostname.includes('taobao.com')) return '这是淘宝商品详情页。'
  if (hostname.includes('rakuten.co.jp')) return 'これは楽天市場の商品ページです。'
  if (hostname.includes('qoo10')) return 'This is a Qoo10 product page.'
  if (hostname.includes('lazada')) return 'This is a Lazada product page.'
  if (hostname.includes('nike')) return 'This is a Nike product page.'
  if (hostname.includes('shopify')) return 'This is a Shopify store product page.'
  return ''
}

// ── AI 추출 (강화된 프롬프트) ────────────────────────────────
async function extractWithAI(
  url: string,
  text: string,
  prefilled: Partial<ScrapeResult>,
  htmlAvailable: boolean,
): Promise<ScrapeResult> {
  const hostname = new URL(url).hostname
  const platformHint = getPlatformHint(hostname)

  const prefilledStr = Object.entries(prefilled)
    .filter(([, v]) => v && (Array.isArray(v) ? v.length > 0 : String(v).length > 0))
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
    .join('\n')

  const systemPrompt = `You are an elite product data extraction specialist. Your job: extract maximum accurate product information from any e-commerce page.

Rules:
- NEVER include error messages ("Access Denied", "Forbidden", "로봇" etc.) in product fields
- ALWAYS infer intelligently — if HTML is blocked, use URL structure + brand knowledge
- product_name: exact full product name with model/variant if available
- description: 250-400 chars, sales-focused, includes benefits, features, target customer
- features: 4-6 specific bullet points about product advantages
- keywords: 8-12 SEO keywords in the product's primary language
- category MUST be one of: food/beauty/living/fashion/electronics/health/pet/sports/saas/other
- If price info exists, include currency symbol (원, ¥, $, ¥)
- Return ONLY valid JSON. No markdown. No explanation.`

  const userPrompt = `Extract product info from this ${platformHint ? `[${platformHint}]` : 'e-commerce'} page.

URL: ${url}
${prefilledStr ? `\nAlready extracted:\n${prefilledStr}` : ''}
${htmlAvailable ? `\nPage text (truncated):\n${text.slice(0, 9000)}` : `\nNote: Page could not be fetched directly. Use URL structure and domain knowledge to infer product details.`}

Return this exact JSON:
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
}`

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 2500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const raw = msg.content[0]
  if (raw.type !== 'text') throw new Error('AI 응답 오류')

  const cleaned = raw.text.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI JSON 파싱 실패')

  const parsed = JSON.parse(jsonMatch[0]) as ScrapeResult

  // 이미지 복원 (AI가 지웠을 경우)
  if ((!parsed.image_urls || !parsed.image_urls.length) && prefilled.image_urls?.length) {
    parsed.image_urls = prefilled.image_urls
  }

  // 에러 메시지가 제품명에 들어간 경우 제거
  const errorKeywords = ['access denied', 'forbidden', 'captcha', 'just a moment', 'robot', '로봇', 'error']
  if (parsed.product_name && errorKeywords.some(k => parsed.product_name.toLowerCase().includes(k))) {
    parsed.product_name = prefilled.product_name ?? ''
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

    // ── 1단계: HTML 수집 (다중 전략) ──────────────────────────
    const { html, ok: fetchOk } = await fetchHtml(fetchUrl)

    // ── 2단계: 구조화 데이터 파싱 ─────────────────────────────
    const jsonLdData  = html ? parseJsonLd(html)  : {}
    const metaData    = html ? parseMeta(html)    : {}
    const platformData = html ? parsePlatformSpecific(html, hostname) : {}
    const priceData   = html ? parsePrice(html, hostname)  : {}
    const pageImages  = html && fetchOk ? parseImages(html, hostname) : []

    // 이미지 우선순위 병합 (플랫폼 > JSON-LD > OG > 본문)
    const allImages = [
      ...(platformData.image_urls ?? []),
      ...(jsonLdData.image_urls ?? []),
      ...(metaData.image_urls ?? []),
      ...pageImages,
    ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5)

    // prefilled 데이터 병합 (플랫폼 파서 우선)
    const prefilled: Partial<ScrapeResult> = {
      product_name: platformData.product_name ?? jsonLdData.product_name ?? metaData.product_name ?? '',
      brand:        platformData.brand ?? jsonLdData.brand ?? metaData.brand ?? '',
      description:  jsonLdData.description ?? metaData.description ?? '',
      price:        platformData.price ?? jsonLdData.price ?? metaData.price ?? priceData.price ?? '',
      original_price: platformData.original_price ?? jsonLdData.original_price ?? priceData.original_price ?? '',
      image_urls:   allImages,
      material:     platformData.material ?? jsonLdData.material ?? '',
      sizes:        platformData.sizes ?? jsonLdData.sizes ?? [],
      colors:       platformData.colors ?? jsonLdData.colors ?? [],
      features:     platformData.features ?? [],
      keywords:     platformData.keywords ?? [],
    }

    // ── 3단계: AI 보강 ─────────────────────────────────────────
    const cleanText = html ? htmlToCleanText(html) : ''
    const result = await extractWithAI(fetchUrl, cleanText, prefilled, fetchOk && html.length > 500)

    const isPartial = !fetchOk || !result.product_name

    return NextResponse.json({ ...result, partial: isPartial })

  } catch (err: unknown) {
    console.error('Scrape URL error:', err)
    const msg = err instanceof Error ? err.message : 'URL 분석 실패'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
