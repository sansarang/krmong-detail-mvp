import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const FREE_LIMIT = 5

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

    // ── 사용량 제한 체크 (무료 플랜) ──────────────────────────────
    const userSupabase = await createServerSupabaseClient()
    const { data: { user } } = await userSupabase.auth.getUser()

    if (user) {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { count } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth)
        .neq('status', 'error')

      const monthlyCount = count ?? 0

      // profiles 테이블에서 플랜 확인 (없으면 free로 간주)
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()

      const plan = profile?.plan ?? 'free'

      if (plan === 'free' && monthlyCount > FREE_LIMIT) {
        return NextResponse.json(
          { error: 'LIMIT_EXCEEDED', message: `무료 플랜은 월 ${FREE_LIMIT}회까지 생성할 수 있어요.` },
          { status: 402 }
        )
      }
    }
    // ─────────────────────────────────────────────────────────────

    // 상태 업데이트
    await supabase.from('orders').update({ status: 'generating' }).eq('id', orderId)

    // Claude API 호출
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `당신은 대한민국 스마트스토어·쿠팡 상세페이지 전문 카피라이터이자 SEO 전문가입니다.
아래 제품 정보를 바탕으로 전환율 높고 검색 최적화된 상세페이지를 JSON 형식으로 작성해주세요.

제품명: ${order.product_name}
카테고리: ${order.category}
제품 설명: ${order.description}

반드시 지켜야 할 SEO 규칙:
1. 섹션 제목 중 최소 3개에 숫자를 포함하세요 (예: "3가지", "100%", "2주", "50%" 등 구체적 수치)
2. 최소 1개 섹션 제목은 반드시 의문형으로 작성하세요 (예: "~하고 계신가요?", "~때문은 아닐까요?")
3. 제품명(${order.product_name.slice(0, 6)}) 또는 카테고리(${order.category}) 키워드를 최소 3개 섹션 제목에 포함하세요
4. 각 섹션 본문은 반드시 150자 이상 작성하세요 (6개 섹션 합계 최소 900자)
5. 마지막 섹션(구매 CTA) 본문에는 "지금", "바로", "구매", "시작", "할인", "무료" 중 최소 2개를 포함하세요
6. 제목 길이는 15~40자 사이로 작성하세요

다음 6개 섹션을 포함한 JSON만 출력하세요 (다른 텍스트 없이):

{
  "sections": [
    { "id": 1, "name": "후킹 헤드라인", "title": "의문형 제목 (예: ~때문에 고민이신가요?)", "body": "고객 공감 카피 + 문제 제기 (150자 이상)", "bg_color": "#FFFFFF" },
    { "id": 2, "name": "문제 공감", "title": "숫자 포함 제목 (예: 3가지 이유로 효과 없는 ~)", "body": "구체적 문제 상황 묘사 (150자 이상)", "bg_color": "#F8F9FA" },
    { "id": 3, "name": "제품 소개", "title": "제품명+핵심 키워드 포함 제목", "body": "제품 핵심 가치 + 차별점 (150자 이상)", "bg_color": "#FFFFFF" },
    { "id": 4, "name": "핵심 특징", "title": "숫자 포함 (예: 3가지 핵심 성분/특징)", "body": "각 특징을 ✓ 기호로 구분, 설명 포함 (150자 이상)", "bg_color": "#F0F7FF" },
    { "id": 5, "name": "사용 방법", "title": "숫자 포함 단계별 안내 (예: 하루 2회, 3단계)", "body": "구체적인 사용법 + 팁 (150자 이상)", "bg_color": "#FFFFFF" },
    { "id": 6, "name": "구매 유도 CTA", "title": "혜택 강조 제목 (숫자 포함)", "body": "지금 바로 구매해야 하는 이유 + 혜택 + 행동 유도 (150자 이상, '지금'·'바로'·'구매' 포함 필수)", "bg_color": "#FFF8E7" }
  ]
}`,
      }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Invalid response')

    const text = content.text.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON 파싱 실패')

    const result = JSON.parse(jsonMatch[0])

    await supabase
      .from('orders')
      .update({ status: 'done', result_json: result })
      .eq('id', orderId)

    return NextResponse.json({ success: true, result })

  } catch (err: unknown) {
    console.error('Generate error:', err)
    const supabase = createAdminClient()
    try {
      const body = await new Response((err as { body?: ReadableStream }).body).text()
      const { orderId } = JSON.parse(body)
      if (orderId) await supabase.from('orders').update({ status: 'error' }).eq('id', orderId)
    } catch { /* ignore */ }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI 생성 실패' },
      { status: 500 }
    )
  }
}
