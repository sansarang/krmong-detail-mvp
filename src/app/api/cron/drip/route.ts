import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend, ONBOARDING_DAY1_EMAIL, ONBOARDING_DAY3_EMAIL } from '@/lib/resend'

// Vercel Cron이 매일 자정(KST 09:00 UTC)에 호출
export const runtime = 'edge'

export async function GET(req: NextRequest) {
  // Cron 보안 검증 (Vercel이 자동으로 CRON_SECRET 헤더 추가)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const now = new Date()

  // D+1: 어제 가입한 유저 (24~48시간 전)
  const day1Start = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()
  const day1End = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

  // D+3: 3~4일 전 가입한 유저
  const day3Start = new Date(now.getTime() - 96 * 60 * 60 * 1000).toISOString()
  const day3End = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString()

  const [day1Users, day3Users] = await Promise.all([
    supabase
      .from('profiles')
      .select('id')
      .gte('created_at', day1Start)
      .lt('created_at', day1End),
    supabase
      .from('profiles')
      .select('id')
      .gte('created_at', day3Start)
      .lt('created_at', day3End),
  ])

  // 유저 ID로 이메일 조회
  const getUserEmails = async (ids: string[]) => {
    if (!ids.length) return []
    const results = await Promise.all(
      ids.map(id => supabase.auth.admin.getUserById(id))
    )
    return results
      .map(r => r.data?.user?.email)
      .filter(Boolean) as string[]
  }

  const [emails1, emails3] = await Promise.all([
    getUserEmails((day1Users.data ?? []).map(u => u.id)),
    getUserEmails((day3Users.data ?? []).map(u => u.id)),
  ])

  // 이메일 발송
  const sends = [
    ...emails1.map(email => resend.emails.send(ONBOARDING_DAY1_EMAIL(email))),
    ...emails3.map(email => resend.emails.send(ONBOARDING_DAY3_EMAIL(email))),
  ]

  await Promise.allSettled(sends)

  return NextResponse.json({
    ok: true,
    day1: emails1.length,
    day3: emails3.length,
  })
}
