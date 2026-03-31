import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL을 입력해주세요' }, { status: 400 })
    }

    let fetchUrl = url.trim()
    if (!/^https?:\/\//i.test(fetchUrl)) fetchUrl = 'https://' + fetchUrl

    const pageRes = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(12000),
    })

    if (!pageRes.ok) throw new Error(`페이지 응답 오류 (${pageRes.status})`)

    const html = await pageRes.text()
    const cleanText = html
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

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1200,
      system: 'You are a product information extraction expert. Extract product/service data from webpage text and return ONLY valid JSON.',
      messages: [{
        role: 'user',
        content: `아래 웹페이지 텍스트에서 제품/서비스 정보를 추출하고 JSON으로만 반환하세요.

페이지 URL: ${fetchUrl}

페이지 텍스트:
${cleanText}

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

    const parsed = JSON.parse(jsonMatch[0]) as {
      product_name: string
      category: string
      description: string
    }

    return NextResponse.json(parsed)
  } catch (err: unknown) {
    console.error('Scrape URL error:', err)
    const msg = err instanceof Error ? err.message : 'URL 스크래핑 실패'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
