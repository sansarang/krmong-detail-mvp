/**
 * POST /api/payment/portal — Paddle Customer Portal 세션 생성
 * PADDLE_API_KEY 미설정 시 { error: 'Paddle not configured' } 반환
 */
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST() {
  const paddleApiKey = process.env.PADDLE_API_KEY
  if (!paddleApiKey) {
    return NextResponse.json({ error: 'Paddle not configured' }, { status: 503 })
  }

  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: sub } = await admin
      .from('subscriptions')
      .select('paddle_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    const customerId = sub?.paddle_customer_id
    if (!customerId) {
      return NextResponse.json({ error: '구독 정보를 찾을 수 없습니다.' }, { status: 404 })
    }

    // Paddle v2 API: Customer Portal 세션 생성
    const isProd = process.env.NODE_ENV === 'production'
    const baseUrl = isProd
      ? 'https://api.paddle.com'
      : 'https://sandbox-api.paddle.com'

    const res = await fetch(`${baseUrl}/customers/${customerId}/portal-sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paddleApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[paddle portal] api error', err)
      return NextResponse.json({ error: '포털 생성 실패' }, { status: 500 })
    }

    const json = await res.json()
    const portalUrl = json?.data?.urls?.general?.overview ?? json?.data?.url ?? null

    if (!portalUrl) {
      return NextResponse.json({ error: '포털 URL을 가져올 수 없습니다.' }, { status: 500 })
    }

    return NextResponse.json({ url: portalUrl })
  } catch (err) {
    console.error('[paddle portal]', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
