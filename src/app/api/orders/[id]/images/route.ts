import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server'

const MAX_IMAGES = 3
const MAX_BYTES = 8 * 1024 * 1024 // 8MB
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await context.params
    const authClient = await createServerSupabaseClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: order, error: orderErr } = await admin
      .from('orders')
      .select('id, user_id, image_urls')
      .eq('id', orderId)
      .single()

    if (orderErr || !order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
    }
    if (order.user_id !== user.id) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file')
    const slotRaw = formData.get('slot')

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: '이미지 파일이 필요합니다' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: '파일은 8MB 이하여야 합니다' }, { status: 400 })
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: 'JPG, PNG, WEBP, GIF만 업로드할 수 있습니다' }, { status: 400 })
    }

    const slot = Number(slotRaw)
    if (!Number.isInteger(slot) || slot < 0 || slot >= MAX_IMAGES) {
      return NextResponse.json({ error: '슬롯은 0~2 사이여야 합니다' }, { status: 400 })
    }

    const prev: string[] = Array.isArray(order.image_urls) ? [...order.image_urls] : []
    if (slot < prev.length) {
      // replace
    } else if (slot === prev.length && prev.length < MAX_IMAGES) {
      // append
    } else {
      return NextResponse.json(
        { error: '이 슬롯에는 이미지를 둘 수 없습니다. 비어 있는 슬롯부터 순서대로 추가하거나 기존 칸을 교체하세요.' },
        { status: 400 }
      )
    }

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg'
    const path = `${user.id}/${orderId}/${Date.now()}-s${slot}.${safeExt}`

    const buf = Buffer.from(await file.arrayBuffer())
    const { error: upErr } = await admin.storage.from('product-images').upload(path, buf, {
      contentType: file.type,
      upsert: true,
    })
    if (upErr) {
      console.error('Storage upload:', upErr)
      return NextResponse.json({ error: '이미지 업로드에 실패했습니다' }, { status: 500 })
    }

    const { data: pub } = admin.storage.from('product-images').getPublicUrl(path)
    const publicUrl = pub.publicUrl

    const next =
      slot < prev.length
        ? prev.map((u, i) => (i === slot ? publicUrl : u))
        : [...prev, publicUrl]

    const { error: updErr } = await admin
      .from('orders')
      .update({ image_urls: next })
      .eq('id', orderId)
      .eq('user_id', user.id)

    if (updErr) {
      console.error('Order update:', updErr)
      return NextResponse.json({ error: '주문 업데이트에 실패했습니다' }, { status: 500 })
    }

    return NextResponse.json({ image_urls: next, url: publicUrl })
  } catch (e) {
    console.error('POST /api/orders/[id]/images:', e)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
