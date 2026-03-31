import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const TEMPLATE_LINKS: Record<string, string> = {
  'smartstore-beauty':    'https://pagebeer.beer/files/smartstore-beauty-template.pdf',
  'coupang-electronics':  'https://pagebeer.beer/files/coupang-electronics-template.pdf',
  'amazon-jp-food':       'https://pagebeer.beer/files/amazon-jp-food-template.pdf',
  'naver-blog-review':    'https://pagebeer.beer/files/naver-blog-review-template.pdf',
  'amazon-jp-beauty':     'https://pagebeer.beer/files/amazon-jp-beauty-template.pdf',
  'shopify-electronics':  'https://pagebeer.beer/files/shopify-electronics-template.pdf',
  'tmall-food':           'https://pagebeer.beer/files/tmall-food-template.pdf',
  'rakuten-fashion':      'https://pagebeer.beer/files/rakuten-fashion-template.pdf',
}

export async function POST(req: NextRequest) {
  try {
    const { email, templateId, lang } = await req.json()

    if (!email || !templateId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    await supabase.from('template_downloads').upsert(
      { email, template_id: templateId, lang: lang || 'ko', downloaded_at: new Date().toISOString() },
      { onConflict: 'email,template_id' }
    )

    const downloadUrl = TEMPLATE_LINKS[templateId] ?? null

    return NextResponse.json({ success: true, downloadUrl })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
