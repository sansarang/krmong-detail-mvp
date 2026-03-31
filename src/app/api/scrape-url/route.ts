import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// 스크래핑이 잘 안 되는 대형 쇼핑몰 도메인
const RESTRICTED_DOMAINS = [
  'coupang.com', 'amazon.co.jp', 'amazon.com', 'amazon.co.kr',
  'tmall.com', 'taobao.com', 'jd.com', 'rakuten.co.jp',
  'qoo10.jp', 'lazada.com', 'shopee.com',
]

function isRestrictedDomain(hostname: string): boolean {
  return RESTRICTED_DOMAINS.some(d => hostname.includes(d))
}

// HTML에서 OG 태그 / 타이틀만 빠르게 추출
function extractMetaTags(html: string): { title?: string; description?: string; ogTitle?: string; ogDesc?: string } {
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1]
  const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)?.[1]
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]
  const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1]
  return { title, description, ogTitle, ogDesc }
}

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
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10000)
}

async function extractWithAI(fetchUrl: string, context: string, partial: boolean): Promise<{
  product_name: string; category: string; description: string
}> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1200,
    system: 'You are a product information extraction expert. Return ONLY valid JSON, no other text.',
    messages: [{
      role: 'user',
      content: partial
        ? `아래 URL과 부분 정보만으로 제품 정보를 추론해서 JSON으로 반환하세요.
URL: ${fetchUrl}
부분 정보: ${context}

반드시 아래 JSON 형식으로만 반환 (다른 텍스트 없이):
{
  "product_name": "제품명 (URL/정보에서 최대한 추출, 불확실하면 빈칸 가능)",
  "category": "카테고리 영문코드 (food/beauty/living/fashion/electronics/health/pet/sports/saas/other 중 하나, URL 도메인 참고)",
  "description": "알 수 있는 범위 내 제품 설명 (불확실한 내용은 제외)"
}`
        : `아래 웹페이지 정보에서 제품/서비스 정보를 추출하고 JSON으로만 반환하세요.

URL: ${fetchUrl}

페이지 내용:
${context}

반드시 아래 JSON 형식으로만 반환 (다른 텍스트 없이):
{
  "product_name": "제품/서비스명 (간결하게)",
  "category": "카테고리 영문코드 (food/beauty/living/fashion/electronics/health/pet/sports/saas/car_service/interior/restaurant/cafe/academy/fitness/realestate/insurance/it_service/design/press_release/business_proposal/other 중 하나)",
  "description": "제품/서비스 핵심 설명 300자 이내 (주요 특징, 효능, 타겟 고객 포함)"
}`,
    }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('AI 응답 오류')

  const text = content.text.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('정보 추출 실패')

  return JSON.parse(jsonMatch[0]) as { product_name: string; category: string; description: string }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL을 입력해주세요' }, { status: 400 })
    }

    let fetchUrl = url.trim()
    if (!/^https?:\/\//i.test(fetchUrl)) fetchUrl = 'https://' + fetchUrl

    const hostname = new URL(fetchUrl).hostname
    const restricted = isRestrictedDomain(hostname)

    // 1차 시도: 실제 페이지 fetch
    let html = ''
    let fetchOk = false

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
        signal: AbortSignal.timeout(12000),
      })

      if (pageRes.ok) {
        html = await pageRes.text()
        fetchOk = true
      } else if ((pageRes.status === 429 || pageRes.status === 403) && restricted) {
        // 제한된 사이트 → 부분 응답이라도 읽어보기
        try { html = await pageRes.text() } catch { /* ignore */ }
      } else if (!pageRes.ok) {
        throw new Error(`페이지 응답 오류 (${pageRes.status})`)
      }
    } catch (fetchErr: unknown) {
      if (fetchErr instanceof Error && fetchErr.name === 'TimeoutError') {
        throw new Error('페이지 로딩 시간 초과. 제품명과 설명을 직접 입력해 주세요.')
      }
      if (!restricted) throw fetchErr
    }

    // 2차: OG 태그에서 최소 정보 추출
    const meta = html ? extractMetaTags(html) : {}
    const metaHint = [meta.ogTitle ?? meta.title, meta.ogDesc ?? meta.description]
      .filter(Boolean).join(' | ')

    if (fetchOk && html) {
      // 정상 fetch → 전체 텍스트로 AI 추출
      const cleanText = htmlToCleanText(html)
      const parsed = await extractWithAI(fetchUrl, cleanText, false)
      return NextResponse.json(parsed)
    }

    if (metaHint) {
      // OG 태그만 있는 경우 → 부분 정보로 AI 추출 + partial 플래그
      const parsed = await extractWithAI(fetchUrl, metaHint, true)
      return NextResponse.json({ ...parsed, partial: true })
    }

    // 완전 차단 → URL만으로 AI 추론 시도
    if (restricted) {
      const parsed = await extractWithAI(fetchUrl, '(페이지 접근 불가)', true)
      // product_name이 비어있으면 실패 처리
      if (!parsed.product_name || parsed.product_name.length < 2) {
        return NextResponse.json({
          error: '이 사이트는 자동 수집이 제한되어 있어요. 제품명과 설명을 직접 입력해 주세요.',
          restricted: true,
        }, { status: 422 })
      }
      return NextResponse.json({ ...parsed, partial: true })
    }

    throw new Error('페이지 정보를 가져올 수 없습니다.')
  } catch (err: unknown) {
    console.error('Scrape URL error:', err)
    const msg = err instanceof Error ? err.message : 'URL 스크래핑 실패'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
