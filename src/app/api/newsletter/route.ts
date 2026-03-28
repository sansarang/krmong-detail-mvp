import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { resend, WELCOME_EMAIL } from '@/lib/resend'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: '유효한 이메일을 입력해주세요' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.toLowerCase().trim() })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: '이미 구독 중인 이메일입니다' }, { status: 409 })
      }
      throw error
    }

    // 환영 이메일 발송
    await resend.emails.send(WELCOME_EMAIL(email))

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '오류가 발생했습니다' }, { status: 500 })
  }
}
