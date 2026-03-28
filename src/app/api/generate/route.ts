import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json()
    const supabase = createAdminClient()

    // 주문 조회
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
    }

    // 상태 업데이트
    await supabase
      .from('orders')
      .update({ status: 'generating' })
      .eq('id', orderId)

    // Claude API 호출
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `당신은 대한민국 스마트스토어·쿠팡 상세페이지 전문 카피라이터입니다.
아래 제품 정보를 바탕으로 전환율 높은 상세페이지 기획안을 JSON 형식으로 작성해주세요.

제품명: ${order.product_name}
카테고리: ${order.category}
제품 설명: ${order.description}

다음 6개 섹션을 포함한 JSON만 출력하세요 (다른 텍스트 없이):

{
  "sections": [
    {
      "id": 1,
      "name": "후킹 헤드라인",
      "title": "강렬한 한 줄 제목 (20자 이내)",
      "body": "본문 카피 (100자 이내, 모바일 가독성 고려)",
      "bg_color": "#FFFFFF"
    },
    {
      "id": 2,
      "name": "문제 공감",
      "title": "고객의 문제/불편함",
      "body": "공감 카피",
      "bg_color": "#F8F9FA"
    },
    {
      "id": 3,
      "name": "제품 소개",
      "title": "제품 핵심 소개",
      "body": "제품 설명 카피",
      "bg_color": "#FFFFFF"
    },
    {
      "id": 4,
      "name": "핵심 특징",
      "title": "3가지 핵심 특징",
      "body": "특징 1, 특징 2, 특징 3 형식으로",
      "bg_color": "#F0F7FF"
    },
    {
      "id": 5,
      "name": "사용 방법",
      "title": "간단한 사용법",
      "body": "단계별 사용 방법",
      "bg_color": "#FFFFFF"
    },
    {
      "id": 6,
      "name": "구매 유도 CTA",
      "title": "지금 바로 구매해야 하는 이유",
      "body": "강력한 구매 유도 카피",
      "bg_color": "#FFF8E7"
    }
  ]
}`,
        },
      ],
    })

    // 응답 파싱
    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Invalid response')

    const text = content.text.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON 파싱 실패')

    const result = JSON.parse(jsonMatch[0])

    // DB 저장
    await supabase
      .from('orders')
      .update({
        status: 'done',
        result_json: result,
      })
      .eq('id', orderId)

    return NextResponse.json({ success: true, result })

  } catch (err: any) {
    console.error('Generate error:', err)

    // 에러 시 상태 업데이트
    const supabase = createAdminClient()
    const { orderId } = await req.json().catch(() => ({}))
    if (orderId) {
      await supabase
        .from('orders')
        .update({ status: 'error' })
        .eq('id', orderId)
    }

    return NextResponse.json(
      { error: err.message || 'AI 생성 실패' },
      { status: 500 }
    )
  }
}
