import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

async function scrapeUrl(url: string): Promise<string> {
  let fetchUrl = url.trim()
  if (!/^https?:\/\//i.test(fetchUrl)) fetchUrl = 'https://' + fetchUrl

  const res = await fetch(fetchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(12000),
  })
  if (!res.ok) throw new Error(`페이지 응답 오류 (${res.status})`)

  const html = await res.text()
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
    .slice(0, 8000)
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, competitorUrl } = await req.json() as { orderId: string; competitorUrl: string }

    if (!orderId || !competitorUrl) {
      return NextResponse.json({ error: '필수 값 누락' }, { status: 400 })
    }

    // 내 주문 정보 조회
    const supabase = createAdminClient()
    const { data: order, error } = await supabase.from('orders').select('*').eq('id', orderId).single()
    if (error || !order) return NextResponse.json({ error: '주문 없음' }, { status: 404 })

    const myContent = (() => {
      const rj = order.result_json as { sections?: { title: string; body: string }[]; ko?: { sections?: { title: string; body: string }[] } } | null
      const sections = rj?.sections ?? rj?.ko?.sections ?? []
      return sections.map((s: { title: string; body: string }) => `${s.title}\n${s.body}`).join('\n\n').slice(0, 4000)
    })()

    // 경쟁사 페이지 스크래핑
    const competitorText = await scrapeUrl(competitorUrl)

    // AI 비교 분석
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2000,
      system: 'You are a cross-border e-commerce content analyst. Analyze and compare two product pages and return ONLY valid JSON.',
      messages: [{
        role: 'user',
        content: `아래 두 제품 페이지를 분석하고 비교 리포트를 JSON으로 반환하세요.

=== 내 제품 (PageAI 생성) ===
제품명: ${order.product_name}
카테고리: ${order.category}
${myContent}

=== 경쟁사 페이지 ===
URL: ${competitorUrl}
${competitorText}

다음 JSON 형식으로만 반환 (다른 텍스트 없이):
{
  "competitor_name": "경쟁사 제품/브랜드명",
  "my_score": 숫자(0-100, 내 페이지 종합 점수),
  "competitor_score": 숫자(0-100, 경쟁사 페이지 점수),
  "my_strengths": ["내 페이지 강점 3개"],
  "competitor_strengths": ["경쟁사 강점 3개"],
  "my_weaknesses": ["내 페이지 개선점 2개"],
  "recommendations": ["우위 확보를 위한 전략 3개"],
  "verdict": "종합 판단 (내가 유리/경쟁사 유리/비슷) 한 줄 요약"
}`,
      }],
    })

    const c = message.content[0]
    if (c.type !== 'text') throw new Error('AI 응답 오류')
    const raw = c.text.trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('분석 결과 파싱 실패')

    const result = JSON.parse(match[0]) as {
      competitor_name: string
      my_score: number
      competitor_score: number
      my_strengths: string[]
      competitor_strengths: string[]
      my_weaknesses: string[]
      recommendations: string[]
      verdict: string
    }

    return NextResponse.json({ success: true, result, competitorUrl })
  } catch (err: unknown) {
    console.error('Competitor analysis error:', err)
    const msg = err instanceof Error ? err.message : '분석 실패'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
