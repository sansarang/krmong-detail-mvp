import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const REFERRAL_BONUS = 3

export async function POST(req: NextRequest) {
  try {
    const { refCode, newUserId } = await req.json()
    if (!refCode || !newUserId) return NextResponse.json({ ok: false })

    const supabase = createAdminClient()

    // 1. refCode로 초대한 사람 찾기
    const { data: referrer } = await supabase
      .from('profiles')
      .select('id, referral_bonus, referral_count')
      .eq('referral_code', refCode.toUpperCase())
      .single()

    if (!referrer) return NextResponse.json({ ok: false, error: 'Invalid code' })
    if (referrer.id === newUserId) return NextResponse.json({ ok: false, error: 'Self-referral' })

    // 2. 초대한 사람 보너스 +3, count +1
    await supabase.from('profiles').update({
      referral_bonus: (referrer.referral_bonus ?? 0) + REFERRAL_BONUS,
      referral_count: (referrer.referral_count ?? 0) + 1,
    }).eq('id', referrer.id)

    // 3. 신규 가입자 보너스 +3
    await supabase.from('profiles').upsert({
      id: newUserId,
      referral_bonus: REFERRAL_BONUS,
      referred_by: referrer.id,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Referral error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
