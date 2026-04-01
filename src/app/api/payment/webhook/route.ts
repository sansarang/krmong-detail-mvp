/**
 * POST /api/payment/webhook — Paddle Billing v2 웹훅
 *
 * Paddle 대시보드 설정:
 * https://vendors.paddle.com → Notifications → New Notification
 * Endpoint URL : https://pagebeer.beer/api/payment/webhook
 * Events       : subscription.created / subscription.updated /
 *                subscription.canceled / transaction.payment_failed
 *
 * PADDLE_WEBHOOK_SECRET 미설정 시 서명 검증 skip (개발/스테이징용)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'

// Paddle 서명 검증 (ts=TIMESTAMP;h1=HASH)
function verifyPaddleSignature(rawBody: string, header: string, secret: string): boolean {
  try {
    const parts = Object.fromEntries(header.split(';').map(p => p.split('=')))
    const ts = parts['ts']
    const h1 = parts['h1']
    if (!ts || !h1) return false
    const payload = `${ts}:${rawBody}`
    const expected = createHmac('sha256', secret).update(payload).digest('hex')
    return expected === h1
  } catch {
    return false
  }
}

function planFromPriceId(priceId: string): string {
  const { NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY, NEXT_PUBLIC_PADDLE_PRICE_PRO_YEARLY,
    NEXT_PUBLIC_PADDLE_PRICE_BIZ_MONTHLY, NEXT_PUBLIC_PADDLE_PRICE_BIZ_YEARLY } = process.env
  if (priceId === NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY || priceId === NEXT_PUBLIC_PADDLE_PRICE_PRO_YEARLY) return 'pro'
  if (priceId === NEXT_PUBLIC_PADDLE_PRICE_BIZ_MONTHLY || priceId === NEXT_PUBLIC_PADDLE_PRICE_BIZ_YEARLY) return 'business'
  return 'free'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPaddleUserId(data: any): string | null {
  return data?.custom_data?.supabase_user_id ?? null
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const paddleSig = req.headers.get('paddle-signature') ?? ''
  const secret = process.env.PADDLE_WEBHOOK_SECRET

  // 서명 검증 (secret 없으면 개발 모드로 skip)
  if (secret) {
    if (!verifyPaddleSignature(rawBody, paddleSig, secret)) {
      console.error('[paddle webhook] signature invalid')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } else {
    console.warn('[paddle webhook] PADDLE_WEBHOOK_SECRET not set, skipping verification')
  }

  let event: { event_type: string; data: Record<string, unknown> }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { event_type, data } = event

  try {
    switch (event_type) {
      case 'subscription.created': {
        const userId = getPaddleUserId(data)
        if (!userId) break

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = (data.items as any[]) ?? []
        const priceId = items[0]?.price?.id ?? ''
        const plan = planFromPriceId(priceId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const period = data.current_billing_period as any

        await admin.from('subscriptions').upsert({
          user_id: userId,
          plan,
          status: 'active',
          billing_cycle: (data.billing_cycle as { interval?: string })?.interval === 'year' ? 'yearly' : 'monthly',
          current_period_start: period?.starts_at ?? null,
          current_period_end: period?.ends_at ?? null,
          paddle_customer_id: data.customer_id as string,
          paddle_subscription_id: data.id as string,
          paddle_price_id: priceId,
        }, { onConflict: 'user_id' })

        await admin.from('user_profiles').upsert({ id: userId, plan }, { onConflict: 'id' })
        break
      }

      case 'subscription.updated': {
        const userId = getPaddleUserId(data)
        if (!userId) break

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = (data.items as any[]) ?? []
        const priceId = items[0]?.price?.id ?? ''
        const plan = planFromPriceId(priceId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const period = data.current_billing_period as any
        const status = (data.status as string) === 'active' ? 'active' : 'expired'

        await admin.from('subscriptions').update({
          plan,
          status,
          current_period_start: period?.starts_at ?? null,
          current_period_end: period?.ends_at ?? null,
          paddle_price_id: priceId,
        }).eq('user_id', userId)

        await admin.from('user_profiles').update({ plan: status === 'active' ? plan : 'free' }).eq('id', userId)
        break
      }

      case 'subscription.canceled': {
        const userId = getPaddleUserId(data)
        if (!userId) break

        await admin.from('subscriptions').update({ status: 'cancelled' }).eq('user_id', userId)
        await admin.from('user_profiles').update({ plan: 'free' }).eq('id', userId)
        break
      }

      case 'transaction.payment_failed': {
        const userId = getPaddleUserId(data)
        if (!userId) break

        await admin.from('subscriptions').update({ status: 'past_due' }).eq('user_id', userId)
        break
      }
    }
  } catch (err) {
    console.error('[paddle webhook] handler error', err)
  }

  return NextResponse.json({ received: true })
}
