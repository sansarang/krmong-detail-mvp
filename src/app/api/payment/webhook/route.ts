/**
 * POST /api/payment/webhook
 * Stripe 웹훅 수신 엔드포인트
 *
 * Stripe 대시보드 설정:
 * URL: https://pagebeer.beer/api/payment/webhook
 * Events:
 *   - checkout.session.completed
 *   - invoice.payment_succeeded
 *   - invoice.payment_failed
 *   - customer.subscription.deleted
 */
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const config = { api: { bodyParser: false } }

function planFromPriceId(priceId: string): string {
  const { STRIPE_PRICE_PRO_MONTHLY, STRIPE_PRICE_PRO_YEARLY, STRIPE_PRICE_BIZ_MONTHLY, STRIPE_PRICE_BIZ_YEARLY } = process.env
  if (priceId === STRIPE_PRICE_PRO_MONTHLY || priceId === STRIPE_PRICE_PRO_YEARLY) return 'pro'
  if (priceId === STRIPE_PRICE_BIZ_MONTHLY || priceId === STRIPE_PRICE_BIZ_YEARLY) return 'business'
  return 'free'
}

function billingCycle(priceId: string): string {
  const { STRIPE_PRICE_PRO_YEARLY, STRIPE_PRICE_BIZ_YEARLY } = process.env
  return (priceId === STRIPE_PRICE_PRO_YEARLY || priceId === STRIPE_PRICE_BIZ_YEARLY) ? 'yearly' : 'monthly'
}

// Stripe 신버전에서 current_period_* 가 items 하위로 이동
function getPeriod(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = subscription as any
  const start: number = item?.current_period_start ?? sub.current_period_start ?? 0
  const end: number   = item?.current_period_end   ?? sub.current_period_end   ?? 0
  return {
    current_period_start: start ? new Date(start * 1000).toISOString() : null,
    current_period_end:   end   ? new Date(end   * 1000).toISOString() : null,
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook] signature failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id
      if (!userId || session.mode !== 'subscription') break

      const subscriptionId = session.subscription as string
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = subscription.items.data[0]?.price.id ?? ''
      const plan = planFromPriceId(priceId)
      const cycle = billingCycle(priceId)
      const period = getPeriod(subscription)

      await admin.from('subscriptions').upsert({
        user_id: userId,
        plan,
        status: 'active',
        billing_cycle: cycle,
        ...period,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: priceId,
      }, { onConflict: 'user_id' })

      await admin.from('user_profiles').upsert({ id: userId, plan }, { onConflict: 'id' })
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscriptionId = (invoice as any).subscription as string | undefined
      if (!subscriptionId) break

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const userId = subscription.metadata?.supabase_user_id
      if (!userId) break

      const period = getPeriod(subscription)
      await admin.from('subscriptions').update({ status: 'active', ...period }).eq('user_id', userId)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscriptionId = (invoice as any).subscription as string | undefined
      if (!subscriptionId) break

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const userId = subscription.metadata?.supabase_user_id
      if (!userId) break

      await admin.from('subscriptions').update({ status: 'expired' }).eq('user_id', userId)
      await admin.from('user_profiles').update({ plan: 'free' }).eq('id', userId)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.supabase_user_id
      if (!userId) break

      await admin.from('subscriptions').update({ status: 'cancelled' }).eq('user_id', userId)
      await admin.from('user_profiles').update({ plan: 'free' }).eq('id', userId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
