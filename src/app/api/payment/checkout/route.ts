/**
 * Paddle Billing v2에서 결제는 client-side (paddle.Checkout.open) 처리.
 * 이 엔드포인트는 현재 유저의 paddle_customer_id를 반환해 checkout pre-fill에 활용.
 *
 * Paddle 대시보드 설정:
 * https://vendors.paddle.com → Notifications → New Notification
 * URL: https://pagebeer.beer/api/payment/webhook
 * Events: subscription.created / subscription.updated / subscription.canceled / transaction.payment_failed
 */
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: sub } = await admin
      .from('subscriptions')
      .select('paddle_customer_id, plan, status')
      .eq('user_id', user.id)
      .maybeSingle()

    return NextResponse.json({
      email: user.email,
      paddleCustomerId: sub?.paddle_customer_id ?? null,
      plan: sub?.plan ?? 'free',
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
