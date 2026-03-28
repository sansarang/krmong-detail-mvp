import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { message, sections, productName, category } = await req.json()

    if (!message || !sections) {
      return NextResponse.json({ error: '메시지와 섹션 정보가 필요합니다' }, { status: 400 })
    }

    const sectionsText = sections.map((s: { id: number; name: string; title: string; body: string }) =>
      `[섹션 ${s.id} - ${s.name}]\n제목: ${s.title}\n본문: ${s.body}`
    ).join('\n\n')

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `당신은 "${productName}" (${category}) 상세페이지를 담당하는 AI 마케팅 어시스턴트입니다.

현재 상세페이지 내용:
${sectionsText}

사용자 요청: ${message}

지시사항:
- 특정 섹션 수정 요청이면: 해당 섹션의 개선된 버전을 제안하고 JSON으로 반환
- 전체 수정 요청이면: 관련 섹션들을 모두 개선하여 JSON으로 반환
- 질문이나 조언 요청이면: 친절하게 텍스트로 답변
- 항상 한국어로 응답

반드시 아래 JSON 형식으로 응답하세요:
{
  "message": "사용자에게 보낼 친절한 설명 메시지",
  "modified_sections": [
    { "id": 섹션ID, "name": "섹션명", "title": "수정된 제목", "body": "수정된 본문" }
  ]
}

수정이 없는 답변이면 "modified_sections"는 빈 배열 []로 설정하세요.
JSON 외 다른 텍스트는 절대 출력하지 마세요.`
      }]
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Invalid response')

    const jsonMatch = content.text.trim().match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON 파싱 실패')

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)

  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI 응답 실패' },
      { status: 500 }
    )
  }
}
