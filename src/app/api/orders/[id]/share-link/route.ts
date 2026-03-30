import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server'
import { isShareLinkConfigured, signOrderShareToken } from '@/lib/orderShareToken'

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!isShareLinkConfigured()) {
      return NextResponse.json(
        { error: 'SHARE_NOT_CONFIGURED', message: 'ORDER_SHARE_SECRET is not set' },
        { status: 503 },
      )
    }

    const { id: orderId } = await context.params
    const authClient = await createServerSupabaseClient()
    const {
      data: { user },
    } = await authClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: order, error } = await admin.from('orders').select('id, user_id, result_json').eq('id', orderId).single()

    if (error || !order) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
    }
    if (order.user_id !== user.id) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }
    const sections = order.result_json && typeof order.result_json === 'object' && 'sections' in order.result_json
      ? (order.result_json as { sections?: unknown }).sections
      : null
    if (!Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json({ error: 'NO_RESULT' }, { status: 400 })
    }

    const token = signOrderShareToken(orderId)
    const base =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || req.nextUrl.origin
    const url = `${base}/share/order/${orderId}?t=${encodeURIComponent(token)}`

    return NextResponse.json({ url })
  } catch (e) {
    console.error('POST /api/orders/[id]/share-link:', e)
    return NextResponse.json({ error: 'INTERNAL' }, { status: 500 })
  }
}
