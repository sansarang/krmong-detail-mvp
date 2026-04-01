/**
 * POST /api/payment/checkout
 * Body: { priceId: string }
 * Returns: { url: string }
 *
 * Stripe 웹훅 설정 (Stripe 대시보드 → Developers → Webhooks):
 * Endpoint URL: https://pagebeer.beer/api/payment/webhook
 * Events: checkout.session.completed, invoice.payment_succeeded,
 *         invoice.payment_failed, customer.subscription.deleted
 */
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { priceId } = await req.json()
    if (!priceId) return NextResponse.json({ error: 'priceId required' }, { status: 400 })

    const admin = createAdminClient()

    // 기존 Stripe Customer ID 조회
    const { data: sub } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    let customerId = sub?.stripe_customer_id

    // 없으면 새로 생성
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pagebeer.beer'}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pagebeer.beer'}/pricing`,
      allow_promotion_codes: true,
      metadata: { supabase_user_id: user.id },
      subscription_data: { metadata: { supabase_user_id: user.id } },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
