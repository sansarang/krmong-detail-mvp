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
    // 제품명 — 25개 이상 패턴으로 최대한 포착
    result.product_name =
      // 1) HTML 구조 패턴
      get(/<h2[^>]+class="[^"]*prod-buy-header__title[^"]*"[^>]*>([\s\S]*?)<\/h2>/i)?.replace(/<[^>]+>/g,'').trim() ??
      get(/<h1[^>]+class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)?.replace(/<[^>]+>/g,'').trim() ??
      get(/<span[^>]+class="[^"]*__titleArea[^"]*"[^>]*>([\s\S]*?)<\/span>/i)?.replace(/<[^>]+>/g,'').trim() ??
      get(/<div[^>]+class="[^"]*product-title[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.replace(/<[^>]+>/g,'').trim() ??
      get(/<p[^>]+class="[^"]*prod-name[^"]*"[^>]*>([\s\S]*?)<\/p>/i)?.replace(/<[^>]+>/g,'').trim() ??
      // 2) JSON 데이터 패턴 (쿠팡 내장 JS 변수)
      get(/"productTitle"\s*:\s*"([^"]{5,})"/i) ??
      get(/"name"\s*:\s*"([^"]{5,})",\s*"(?:brand|price|url)"/i) ??
      get(/"itemName"\s*:\s*"([^"]{5,})"/i) ??
      get(/"displayName"\s*:\s*"([^"]{5,})"/i) ??
      get(/data-product-name=["']([^"']{5,})["']/i) ??
      get(/data-item-name=["']([^"']{5,})["']/i) ??
      // 3) OG / meta 태그 (쿠팡이 종종 og:title에 제품명 넣음)
      get(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"'|–]{5,})["']/i) ??
      get(/<title[^>]*>([^<|–]{5,}?)\s*[-|–|·]/i) ??
      get(/<title[^>]*>([^<]{5,}?)\s*\|/i)

    // 제품명 클린업 (쿠팡 브랜드 suffix 제거)
    if (result.product_name) {
      result.product_name = result.product_name
        .replace(/\s*[-|–|·|｜]\s*쿠팡.*/gi, '')
        .replace(/\s*\|\s*COUPANG.*/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
    }

    // 가격 — 쿠팡 특유의 패턴
    const salePrice =
      get(/<strong[^>]+class="[^"]*sale-price[^"]*"[^>]*>\s*([0-9,]+)/i) ??
      get(/<span[^>]+class="[^"]*price-value[^"]*"[^>]*>([0-9,]+)/i) ??
      get(/<em[^>]+class="[^"]*total-price[^"]*"[^>]*>([\s\S]*?)<\/em>/i)?.replace(/[^0-9,]/g,'') ??
      get(/"finalPrice"\s*:\s*([0-9]+)/i) ??
      get(/"salePrice"\s*:\s*([0-9]+)/i) ??
      get(/"price"\s*:\s*([0-9]+)/i)
    if (salePrice) result.price = salePrice.replace(/,/g, '') + '원'

    const origPrice =
      get(/<del[^>]+class="[^"]*base-price[^"]*"[^>]*>\s*([0-9,]+)/i) ??
      get(/<span[^>]+class="[^"]*origin-price[^"]*"[^>]*>([0-9,]+)/i) ??
      get(/"originalPrice"\s*:\s*([0-9]+)/i) ??
      get(/"listPrice"\s*:\s*([0-9]+)/i)
    if (origPrice) result.original_price = origPrice.replace(/,/g, '') + '원'

    // 브랜드
    result.brand =
      get(/<span[^>]+class="[^"]*brand[^"]*"[^>]*>([^<]+)/i) ??
      get(/<a[^>]+class="[^"]*brand[^"]*"[^>]*>([^<]+)/i) ??
      get(/"brand"\s*:\s*\{"name"\s*:\s*"([^"]+)"/i) ??
      get(/"brand"\s*:\s*"([^"]+)"/i) ??
      get(/<a[^>]+href="[^"]*brand[^"]*"[^>]*>([^<]+)/i)

    // 특징 (bullet points)
    const bulletMatches = [...html.matchAll(/<li[^>]+class="[^"]*prod-description-attribute[^"]*"[^>]*>([\s\S]*?)<\/li>/gi)]
      .map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(s => s.length > 3).slice(0, 6)
    if (bulletMatches.length) result.features = bulletMatches

    // 카테고리 breadcrumb
    const cats = [
      ...[...html.matchAll(/<li[^>]+class="[^"]*breadcrumb[^"]*"[^>]*>([\s\S]*?)<\/li>/gi)].map(m => m[1].replace(/<[^>]+>/g,'').trim()),
      ...[...html.matchAll(/"breadcrumb"[^:]*:\s*\[([^\]]+)\]/gi)].map(m => m[1]),
    ].filter(Boolean).slice(0, 5)
    if (cats.length) result.keywords = cats

    // 이미지
    const imgs = [
      ...[...html.matchAll(/https:\/\/thumbnail\d*\.coupangcdn\.com\/thumbnails\/remote\/[^"'\s]+(?:jpg|jpeg|png|webp)/gi)].map(m => m[0]),
      ...[...html.matchAll(/https:\/\/[^"'\s]+\.coupangcdn\.com\/[^"'\s]+(?:jpg|jpeg|png|webp)/gi)].map(m => m[0]),
    ].filter((v, i, a) => a.indexOf(v) === i).filter(u => !u.includes('icon') && !u.includes('logo')).slice(0, 5)
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

// ── 블록/리다이렉트 페이지 감지 ──────────────────────────────
function isBlockedOrRedirectPage(html: string, hostname: string): boolean {
  if (!html || html.length < 2000) return true
  const lower = html.slice(0, 5000).toLowerCase()
  // 공통 블록 패턴
  if (lower.includes('access denied') || lower.includes('403 forbidden')
    || lower.includes('captcha') || lower.includes('robot check')
    || lower.includes('just a moment') || lower.includes('ddos-guard')
    || lower.includes('checking your browser')) return true
  // 쿠팡 전용: 로그인 리다이렉트
  if (hostname.includes('coupang')) {
    if (lower.includes('login') && (lower.includes('redirect') || lower.includes('returnurl'))) return true
    if (lower.includes('로그인이 필요') || lower.includes('회원 전용')) return true
    // 쿠팡 정상 제품 페이지는 prod-buy-header 등 특정 클래스 포함
    const hasProductContent = html.includes('prod-buy-header') || html.includes('productTitle')
      || html.includes('vp-product-') || html.includes('data-product-')
    if (!hasProductContent && html.length < 50000) return true
  }
  return false
}

// ── 제품명 신뢰도 계산 ────────────────────────────────────────
function computeProductNameConfidence(name: string): 'high' | 'medium' | 'low' {
  if (!name || name.length < 3) return 'low'
  const lower = name.toLowerCase()
  const errorWords = ['access', 'denied', 'forbidden', 'login', 'redirect', 'captcha', 'error', '로그인', '오류', 'just a moment', 'cloudflare']
  if (errorWords.some(w => lower.includes(w))) return 'low'
  if (name.length > 10 && !lower.includes('page not found') && !lower.includes('404')) return 'high'
  return 'medium'
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

// ── AI 추출 (강화된 프롬프트 + 제품명 잠금) ──────────────────
async function extractWithAI(
  url: string,
  text: string,
  prefilled: Partial<ScrapeResult>,
  htmlAvailable: boolean,
  lockedProductName?: string, // HTML에서 확실히 추출된 제품명 — AI가 절대 바꾸면 안 됨
): Promise<ScrapeResult> {
  const hostname = new URL(url).hostname
  const platformHint = getPlatformHint(hostname)

  const prefilledStr = Object.entries(prefilled)
    .filter(([k, v]) => k !== 'product_name' && v && (Array.isArray(v) ? v.length > 0 : String(v).length > 0))
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
    .join('\n')

  // 제품명 잠금 여부 결정
  const nameConfidence = prefilled.product_name ? computeProductNameConfidence(prefilled.product_name) : 'low'
  const confirmedName = lockedProductName ?? (nameConfidence === 'high' ? prefilled.product_name : undefined)

  const nameLockInstruction = confirmedName
    ? `\n🔒 CONFIRMED PRODUCT NAME (DO NOT CHANGE): "${confirmedName}"\n   → The product_name field MUST be exactly: "${confirmedName}"\n   → Do NOT replace this with any other name. Do NOT hallucinate a different product.\n`
    : htmlAvailable
    ? '\n⚠️ Extract the product_name ONLY from the actual page text provided. DO NOT guess or invent a product name.\n'
    : '\n⚠️ Page content unavailable. If you cannot determine the product name with high confidence, set product_name to "" (empty string). NEVER guess or hallucinate a product name.\n'

  const systemPrompt = `You are an elite product data extraction specialist. Your job: extract maximum accurate product information from any e-commerce page.

CRITICAL ANTI-HALLUCINATION RULES:
1. NEVER make up or guess a product name you are not sure about
2. NEVER confuse the product with a different category (e.g., do not call a wireless device a "wallet")
3. If product_name is confirmed/locked (shown below), use it EXACTLY — do not modify it
4. If you cannot determine product_name from the text, leave it as "" (empty)
5. NEVER include error messages ("Access Denied", "Forbidden", "로봇" etc.) in any field

Extraction rules:
- product_name: exact full product name with model/variant. If unsure, leave empty.
- description: 250-400 chars, based ONLY on actual product information found in text
- features: 4-6 specific bullet points extracted from actual page content
- keywords: 8-12 SEO keywords in the product's primary language
- category MUST be one of: food/beauty/living/fashion/electronics/health/pet/sports/saas/other
- Infer category from the product_name and description text — electronics/gadgets go to "electronics"
- If price info exists, include currency symbol (원, ¥, $)
- Return ONLY valid JSON. No markdown. No explanation.`

  const userPrompt = `Extract product info from this ${platformHint ? `[${platformHint}]` : 'e-commerce'} page.
${nameLockInstruction}
URL: ${url}
${prefilledStr ? `\nSupporting data already extracted:\n${prefilledStr}` : ''}
${htmlAvailable
  ? `\nPage text (truncated to 8000 chars):\n${text.slice(0, 8000)}`
  : `\n⚠️ WARNING: Page could not be fetched. Only use URL structure for category hints. Set product_name to "" if unknown.`}

Return this exact JSON:
{
  "product_name": "${confirmedName ?? ''}",
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

  // 제품명 잠금 강제 적용 (AI가 무시한 경우 복원)
  if (confirmedName && (!parsed.product_name || parsed.product_name !== confirmedName)) {
    parsed.product_name = confirmedName
  }

  // 에러 메시지가 제품명에 들어간 경우 제거
  const errorKeywords = ['access denied', 'forbidden', 'captcha', 'just a moment', 'robot', '로봇', 'error', 'cloudflare', '로그인', 'login required']
  if (parsed.product_name && errorKeywords.some(k => parsed.product_name.toLowerCase().includes(k))) {
    parsed.product_name = confirmedName ?? prefilled.product_name ?? ''
  }

  // 이미지 복원 (AI가 지웠을 경우)
  if ((!parsed.image_urls || !parsed.image_urls.length) && prefilled.image_urls?.length) {
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

    // ── 1단계: HTML 수집 (다중 전략) ──────────────────────────
    const { html, ok: fetchOk, strategy } = await fetchHtml(fetchUrl)
    const pageBlocked = isBlockedOrRedirectPage(html, hostname)
    const effectiveHtml = pageBlocked ? '' : html
    const htmlIsUsable = fetchOk && !pageBlocked && html.length > 2000

    // ── 2단계: 구조화 데이터 파싱 ─────────────────────────────
    const jsonLdData   = effectiveHtml ? parseJsonLd(effectiveHtml)  : {}
    const metaData     = effectiveHtml ? parseMeta(effectiveHtml)    : {}
    const platformData = effectiveHtml ? parsePlatformSpecific(effectiveHtml, hostname) : {}
    const priceData    = effectiveHtml ? parsePrice(effectiveHtml, hostname) : {}
    const pageImages   = htmlIsUsable  ? parseImages(effectiveHtml, hostname) : []

    // 제품명 신뢰도 체계: 높은 소스 우선
    // 1순위: 플랫폼 전용 파서 (가장 신뢰 높음)
    // 2순위: JSON-LD (공식 구조화 데이터)
    // 3순위: OG/meta title (일반적으로 제품명 포함)
    const candidateNames = [
      platformData.product_name,
      jsonLdData.product_name,
      metaData.product_name,
    ].filter((n): n is string => !!n && n.length > 3)

    const bestName = candidateNames[0] ?? ''
    const nameConf = computeProductNameConfidence(bestName)

    // 확실한 제품명이면 AI에게 잠금 전달 (hallucination 완전 방지)
    const lockedName = (nameConf === 'high' && bestName.length > 5) ? bestName : undefined

    // 이미지 우선순위 병합 (플랫폼 > JSON-LD > OG > 본문)
    const allImages = [
      ...(platformData.image_urls ?? []),
      ...(jsonLdData.image_urls ?? []),
      ...(metaData.image_urls ?? []),
      ...pageImages,
    ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5)

    // prefilled 데이터 병합 (플랫폼 파서 우선)
    const prefilled: Partial<ScrapeResult> = {
      product_name: bestName,
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
    const cleanText = effectiveHtml ? htmlToCleanText(effectiveHtml) : ''
    const result = await extractWithAI(fetchUrl, cleanText, prefilled, htmlIsUsable, lockedName)

    // 후처리: 제품명이 여전히 비어 있으면 메타 title 일부라도 사용
    if (!result.product_name && metaData.product_name && computeProductNameConfidence(metaData.product_name) !== 'low') {
      result.product_name = metaData.product_name
        .replace(/\s*[-|–|·|｜]\s*(쿠팡|네이버|스마트스토어|Coupang|Amazon|Rakuten).*/gi, '')
        .trim()
    }

    const isPartial = pageBlocked || !htmlIsUsable || !result.product_name

    console.log(`[scrape-url] strategy=${strategy} blocked=${pageBlocked} name="${result.product_name}" locked=${!!lockedName}`)

    return NextResponse.json({ ...result, partial: isPartial, _debug: { strategy, blocked: pageBlocked } })

  } catch (err: unknown) {
    console.error('Scrape URL error:', err)
    const msg = err instanceof Error ? err.message : 'URL 분석 실패'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
