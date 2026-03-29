import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server'
import { applyImageActions, isImageAction } from '@/lib/chatImageActions'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      message,
      sections,
      productName,
      category,
      orderId,
      imageUrls = [],
    } = body as {
      message: string
      sections: { id: number; name: string; title: string; body: string }[]
      productName: string
      category: string
      orderId?: string
      imageUrls?: string[]
    }

    if (!message || !sections) {
      return NextResponse.json({ error: '메시지와 섹션 정보가 필요합니다' }, { status: 400 })
    }

    let canMutateImages = false
    let ownerUserId: string | null = null
    let verifiedOrderId: string | null = null

    // IMAGE_GEN_DISABLED=1 이면 이미지 자동 생성 전부 끔. Replicate는 REPLICATE_API_TOKEN + chatImageActions에서 처리.
    if (orderId && process.env.IMAGE_GEN_DISABLED !== '1') {
      const authClient = await createServerSupabaseClient()
      const { data: { user } } = await authClient.auth.getUser()
      if (user) {
        const admin = createAdminClient()
        const { data: ord } = await admin
          .from('orders')
          .select('id, user_id, image_urls')
          .eq('id', orderId)
          .single()
        if (ord && ord.user_id === user.id) {
          canMutateImages = true
          ownerUserId = user.id
          verifiedOrderId = ord.id
        }
      }
    }

    const sectionsText = sections
      .map(s => `[섹션 ${s.id} - ${s.name}]\n제목: ${s.title}\n본문: ${s.body}`)
      .join('\n\n')

    const imgList = Array.isArray(imageUrls) ? imageUrls : []
    const imageContext =
      imgList.length > 0
        ? `현재 제품 이미지: ${imgList.length}장 (슬롯 0~${imgList.length - 1}).`
        : '현재 제품 이미지: 없음 (추가 시 append 사용, 첫 장은 슬롯 0).'

    const imageJsonHelp = canMutateImages
      ? `
이미지(사진) 요청 처리 — 사용자가 사진 교체·추가·삭제(빈칸 채우기)를 말하면 "image_actions" 배열을 채울 수 있습니다. (한 요청에 최대 3개)
각 항목 형식:
- 교체: { "action": "replace", "slot": 0, "mode": "generate", "prompt": "영어로 매우 구체적인 장면 설명. 제품/서비스 실사 느낌, 조명, 각도, 배경" }
- 추가: { "action": "append", "mode": "generate", "prompt": "..." }
- 사용자가 메시지에 https 이미지 URL을 붙여 넣었으면: { "action": "replace", "slot": 0, "mode": "fetch_url", "source_url": "https://..." }
규칙:
- "prompt"는 항상 영어로, 시각적 디테일 위주 (텍스트 문구는 이미지에 넣지 말 것).
- 슬롯 번호는 0부터. 1번째 사진=slot 0.
- 이미지가 0장이면 append로 추가하거나 replace slot 0으로 첫 장 생성.
- 텍스트만 수정하는 요청이면 image_actions는 [].
- 사진과 글을 동시에 바꾸면 modified_sections와 image_actions 둘 다 채울 수 있음.
`
      : `
이미지 자동 반영은 이 세션에서 사용할 수 없습니다(order 미연동 또는 비로그인). 사진 요청 시 사용자에게 미리보기 위 "제품 이미지"에서 직접 교체하도록 안내하고 image_actions는 반드시 [].
`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2500,
      messages: [{
        role: 'user',
        content: `당신은 "${productName}" (${category}) 상세페이지를 담당하는 AI 마케팅 어시스턴트입니다.

${imageContext}

현재 상세페이지 내용:
${sectionsText}

사용자 요청: ${message}

지시사항:
- 특정 섹션 수정 요청이면: 해당 섹션의 개선된 버전을 제안
- 전체 톤·카피 수정이면: 관련 섹션들을 개선
- 질문·조언은 친절하게 텍스트로
- 항상 한국어로 "message" 필드 작성
${imageJsonHelp}

반드시 아래 JSON만 출력 (다른 텍스트 금지):
{
  "message": "사용자에게 보낼 설명 (이미지를 생성·반영했다면 그 사실을 짧게)",
  "modified_sections": [
    { "id": 섹션ID, "name": "섹션명", "title": "수정된 제목", "body": "수정된 본문" }
  ],
  "image_actions": []
}

수정 없으면 modified_sections는 []. 이미지 작업 없으면 image_actions는 [].`,
      }],
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Invalid response')

    const jsonMatch = content.text.trim().match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON 파싱 실패')

    const result = JSON.parse(jsonMatch[0]) as {
      message: string
      modified_sections?: unknown
      image_actions?: unknown[]
    }

    let image_urls: string[] | undefined
    let image_errors: string[] | undefined

    const rawActions = Array.isArray(result.image_actions) ? result.image_actions : []
    const sanitized = rawActions.filter(isImageAction).slice(0, 3)

    if (canMutateImages && ownerUserId && verifiedOrderId && sanitized.length > 0) {
      const admin = createAdminClient()
      const { image_urls: nextUrls, errors } = await applyImageActions(
        admin,
        ownerUserId,
        verifiedOrderId,
        imgList,
        sanitized
      )
      image_urls = nextUrls
      image_errors = errors.length ? errors : undefined

      await admin
        .from('orders')
        .update({ image_urls: nextUrls })
        .eq('id', verifiedOrderId)
        .eq('user_id', ownerUserId)
    }

    return NextResponse.json({
      message: result.message,
      modified_sections: result.modified_sections ?? [],
      image_urls,
      image_errors,
    })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI 응답 실패' },
      { status: 500 }
    )
  }
}
