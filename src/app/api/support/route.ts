import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const SERVICE_INFO = `
PageAI is a SaaS that auto-generates professional documents (product detail pages, press releases, business proposals, academic summaries, etc.) in 5 minutes using AI.

Key facts:
- Supported: 40+ categories (e-commerce, automotive, restaurants, clinics, real estate, IT/SaaS, government docs, R&D proposals, academic papers, and more)
- Core features: 6-section auto-generation, inline editing, PDF download, SEO analysis, AI chat assistant, multi-platform blog export (Naver Blog, Tistory, WordPress, Instagram)
- Blog publishing: 1-click HTML copy → paste into blog editor
- Pricing: Free (5/month), Pro ₩29,000/month (unlimited + SEO + blog), Business ₩79,000/month (team features)
- 30-day refund guarantee, no credit card required to start
`

function buildSystemPrompt(lang: string): string {
  const langInstruction: Record<string, string> = {
    ko: '항상 한국어로 응답하세요. 이모지 적절히 사용.',
    en: 'Always respond in English. Use emojis appropriately.',
    ja: '常に日本語で返答してください。絵文字を適切に使用してください。',
    zh: '始终用中文回答。适当使用表情符号。',
  }

  return `You are PageAI's friendly customer support AI.
${SERVICE_INFO}

Response style:
- Friendly and concise (3-5 sentences)
- Focus on key points only
- Naturally encourage sign-up/trial at the end
- For unknown topics: "For more details, email privacy@pageai.kr"
- ${langInstruction[lang] ?? langInstruction.en}`
}

export async function POST(req: NextRequest) {
  try {
    const { messages, lang = 'ko' } = await req.json()

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 500,
      system: buildSystemPrompt(lang),
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Invalid response')

    return NextResponse.json({ message: content.text })
  } catch (err) {
    console.error('Support chat error:', err)
    return NextResponse.json(
      { message: 'Sorry, please try again shortly. For urgent inquiries, email privacy@pageai.kr' },
      { status: 500 }
    )
  }
}

