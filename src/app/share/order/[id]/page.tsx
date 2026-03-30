import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyOrderShareToken } from '@/lib/orderShareToken'
import { ORDER_PAGE_UI } from '@/lib/orderPageUi'
import { SHARE_PAGE_UI } from '@/lib/sharePageUi'
import type { UiLang } from '@/lib/uiLocale'
import ShareOrderReadonlyView from '@/components/ShareOrderReadonlyView'

type Section = { id: number; name: string; title: string; body: string }

export default async function ShareOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ t?: string }>
}) {
  const { id } = await params
  const { t } = await searchParams

  if (!verifyOrderShareToken(id, t)) {
    const u = SHARE_PAGE_UI.ko
    return (
      <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-lg font-black text-gray-900">{u.invalidTitle}</h1>
          <p className="text-sm text-gray-600 leading-relaxed">{u.invalidBody}</p>
        </div>
      </div>
    )
  }

  const admin = createAdminClient()
  const { data: order, error } = await admin.from('orders').select('*').eq('id', id).single()

  if (error || !order) notFound()

  const sections = order.result_json?.sections as Section[] | undefined
  if (!sections?.length) notFound()

  const lang = (order.result_json?.output_lang as UiLang | undefined) ?? 'ko'
  const uiLang: UiLang = ['ko', 'en', 'ja', 'zh'].includes(lang) ? lang : 'ko'
  const s = SHARE_PAGE_UI[uiLang]
  const p = ORDER_PAGE_UI[uiLang]

  const imageUrls: string[] = Array.isArray(order.image_urls) ? order.image_urls : []

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-amber-50/40 to-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full">
            {s.readonlyBadge}
          </span>
          <h1 className="text-sm font-black text-gray-900">{order.product_name}</h1>
          <p className="text-xs text-gray-500">{order.category}</p>
        </div>

        <ShareOrderReadonlyView imageUrls={imageUrls} sections={sections} p={p} />

        <div className="rounded-2xl border border-amber-200/80 bg-white/90 p-4 text-sm text-amber-950/90">
          <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider mb-1">{s.feedbackTitle}</p>
          <p className="text-xs text-gray-700 leading-relaxed">{s.feedbackBody}</p>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ t?: string }>
}): Promise<Metadata> {
  const { id } = await params
  const { t } = await searchParams
  if (!verifyOrderShareToken(id, t)) {
    return { title: 'Link unavailable', robots: { index: false, follow: false } }
  }
  const admin = createAdminClient()
  const { data: order } = await admin.from('orders').select('product_name, result_json').eq('id', id).single()
  const lang = (order?.result_json?.output_lang as UiLang | undefined) ?? 'ko'
  const uiLang: UiLang = ['ko', 'en', 'ja', 'zh'].includes(lang) ? lang : 'ko'
  const name = order?.product_name ?? 'Preview'
  return {
    title: SHARE_PAGE_UI[uiLang].pageTitle(name),
    robots: { index: false, follow: false },
  }
}
