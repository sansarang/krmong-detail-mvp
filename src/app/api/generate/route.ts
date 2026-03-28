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

    // ── 업종 타입 자동 감지 ────────────────────────────────────
    const SERVICE_CATS = ['car_service','car_repair','interior','window','cleaning','moving',
      'construction','restaurant','cafe','delivery','franchise','academy','coaching','medical',
      'beauty_shop','fitness','realestate','pension','travel','insurance','saas','it_service','design']
    const AUTO_CATS = ['used_car','new_car']
    const isService = SERVICE_CATS.includes(order.category)
    const isAuto    = AUTO_CATS.includes(order.category)

    const sectionGuide = isAuto ? `
[자동차 업종 — 6개 섹션 구성]
1. 후킹 헤드라인: 차량 핵심 어필 + 의문형 (연식/상태 포함)
2. 차량 상태: 사고 이력·점검 결과·보증 (숫자/수치 포함)
3. 주요 사양: 핵심 옵션과 특장점 나열 (✓ 기호 활용)
4. 구매 혜택: 할부/금융/보험 등 구매 지원 조건
5. 시승 안내: 방문·비대면 시승 예약 방법
6. 상담 유도 CTA: 지금 바로 연락/상담 유도` :
    isService ? `
[서비스업 — 6개 섹션 구성]
1. 후킹 헤드라인: 의문형으로 고객의 핵심 고민 제기
2. 고객 고민 공감: 이 서비스가 필요한 상황·불편함 묘사
3. 서비스 소개: 핵심 서비스 내용과 차별점 (수치/경력 포함)
4. 작업/시공 과정: 단계별 프로세스 (신뢰도 향상, 숫자 포함)
5. 시공 사례/후기: 실제 결과·고객 반응 구체적으로 언급
6. 예약/상담 CTA: 지금 바로 견적·예약·문의 유도` : `
[제품 상세페이지 — 6개 섹션 구성]
1. 후킹 헤드라인: 의문형으로 고객 문제 제기
2. 문제 공감: 구매 전 고민·불편함 공감
3. 제품 소개: 핵심 가치와 차별점 (수치 포함)
4. 핵심 특징: 3~5가지 특징 (✓ 기호, 숫자 포함)
5. 사용 방법/추천 대상: 단계별 안내 또는 이런 분께 추천
6. 구매 유도 CTA: 지금 바로 구매·시작 유도`

    // Claude API 호출
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `당신은 대한민국 최고의 마케팅 카피라이터이자 SEO 전문가입니다.
아래 업종과 제품/서비스 정보를 분석하여, 업종에 맞는 상세페이지를 작성해주세요.

카테고리: ${order.category}
제품/서비스명: ${order.product_name}
설명: ${order.description}

${sectionGuide}

반드시 지켜야 할 규칙:
1. 섹션 제목 3개 이상에 구체적 숫자 포함 (예: "3가지", "10년", "100%", "무료 견적 5분")
2. 최소 1개 섹션 제목은 의문형으로 작성 (예: "~하고 계신가요?", "~이 문제인가요?")
3. 제품/서비스명 키워드를 최소 3개 섹션 제목에 자연스럽게 포함
4. 각 섹션 본문 150자 이상 (구체적 정보, 감성 카피, 설득력 있는 문장)
5. 마지막 섹션 본문에 행동 유도 키워드 2개 이상 포함 ("지금", "바로", "무료", "상담", "예약", "구매", "문의")
6. 제목 길이 15~40자
7. 업종에 맞는 전문 용어 사용 (자동차→차량 컨디션, 썬팅→시공 퀄리티, 음식점→식재료 품질 등)

JSON만 출력 (다른 텍스트 없이):

{
  "sections": [
    { "id": 1, "name": "섹션명", "title": "제목", "body": "본문 150자 이상", "bg_color": "#FFFFFF" },
    { "id": 2, "name": "섹션명", "title": "제목", "body": "본문 150자 이상", "bg_color": "#F8F9FA" },
    { "id": 3, "name": "섹션명", "title": "제목", "body": "본문 150자 이상", "bg_color": "#FFFFFF" },
    { "id": 4, "name": "섹션명", "title": "제목", "body": "본문 150자 이상", "bg_color": "#F0F7FF" },
    { "id": 5, "name": "섹션명", "title": "제목", "body": "본문 150자 이상", "bg_color": "#FFFFFF" },
    { "id": 6, "name": "섹션명", "title": "제목", "body": "본문 150자 이상", "bg_color": "#FFF8E7" }
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
