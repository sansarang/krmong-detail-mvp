'use client'
import { useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import {
  PLATFORMS,
  DOMESTIC_PLATFORMS,
  GLOBAL_PLATFORMS,
  type PlatformId,
} from '@/lib/platformPrompts'
import NaverBlogPreview  from '@/components/preview/NaverBlogPreview'
import SmartStorePreview from '@/components/preview/SmartStorePreview'
import CoupangPreview    from '@/components/preview/CoupangPreview'
import Eleven11Preview   from '@/components/preview/Eleven11Preview'
import AmazonJPPreview   from '@/components/preview/AmazonJPPreview'
import RakutenPreview    from '@/components/preview/RakutenPreview'
import TmallPreview      from '@/components/preview/TmallPreview'
import ShopifyPreview    from '@/components/preview/ShopifyPreview'
import Qoo10Preview      from '@/components/preview/Qoo10Preview'
import LazadaPreview     from '@/components/preview/LazadaPreview'
import TemuPreview       from '@/components/preview/TemuPreview'
import AliExpressPreview from '@/components/preview/AliExpressPreview'
import SheinPreview      from '@/components/preview/SheinPreview'

interface Section { id: number; name: string; title: string; body: string }

interface Props {
  sections: Section[]
  productName: string
  defaultPlatformKey?: string   // maps from generate market key e.g. "smartstore"
  uiLang?: string
}

// generate key → PlatformId mapping
const KEY_TO_ID: Record<string, PlatformId> = {
  naver_blog: 'naver_blog', smartstore: 'smartstore', coupang: 'coupang', elevenst: 'elevenst',
  amazon: 'amazon_jp', rakuten: 'rakuten', tmall: 'tmall', shopify: 'shopify',
  qoo10: 'qoo10', lazada: 'lazada', temu: 'temu', aliexpress: 'aliexpress', shein: 'shein',
}

function sectionsToHTML(sections: Section[], productName: string): string {
  const rows = sections.map(s => `<section style="padding:24px;border-bottom:1px solid #eee;">
  <p style="font-size:11px;font-weight:700;color:#999;letter-spacing:2px;margin:0 0 6px">${s.name}</p>
  <h2 style="font-size:18px;font-weight:900;color:#111;margin:0 0 12px">${s.title}</h2>
  <p style="font-size:14px;line-height:1.8;color:#333;margin:0;white-space:pre-line">${s.body}</p>
</section>`).join('\n')
  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><title>${productName}</title></head>
<body style="max-width:680px;margin:0 auto;font-family:sans-serif;">
<h1 style="text-align:center;padding:24px 0;border-bottom:3px solid #111;font-size:22px">${productName}</h1>
${rows}
</body></html>`
}

function sectionsToText(sections: Section[], productName: string): string {
  return [`# ${productName}`, '', ...sections.flatMap(s => [`## ${s.title}`, '', s.body, ''])].join('\n')
}

function sectionsToMarkdown(sections: Section[], productName: string): string {
  return [`# ${productName}`, '', ...sections.flatMap(s => [`## ${s.title}`, `*${s.name}*`, '', s.body, ''])].join('\n')
}

export default function PlatformPreviewPanel({ sections, productName, defaultPlatformKey, uiLang = 'ko' }: Props) {
  const initialId: PlatformId = (defaultPlatformKey ? KEY_TO_ID[defaultPlatformKey] : undefined) ?? 'smartstore'
  const [activePlatform, setActivePlatform] = useState<PlatformId>(initialId)
  const [photos, setPhotos] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const pendingSlot = useRef<number>(0)

  const currentConfig = PLATFORMS.find(p => p.id === activePlatform)!

  const handlePhotoClick = useCallback((index: number) => {
    pendingSlot.current = index
    fileRef.current?.click()
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('사진은 5MB 이하만 가능합니다'); return }
    const reader = new FileReader()
    reader.onload = ev => {
      const url = ev.target?.result as string
      setPhotos(prev => {
        const next = [...prev]
        next[pendingSlot.current] = url
        return next
      })
    }
    reader.readAsDataURL(file)
  }

  function copyContent(type: 'html' | 'text' | 'md') {
    let content = ''
    if (type === 'html') content = sectionsToHTML(sections, productName)
    else if (type === 'text') content = sectionsToText(sections, productName)
    else content = sectionsToMarkdown(sections, productName)
    navigator.clipboard.writeText(content).then(() => {
      toast.success(type === 'html' ? 'HTML 복사 완료' : type === 'text' ? '텍스트 복사 완료' : '마크다운 복사 완료')
    }).catch(() => toast.error('복사 실패'))
  }

  const LABEL: Record<string, string> = {
    ko: { open: '플랫폼 미리보기', close: '닫기', domestic: '국내 마켓', global: '글로벌 마켓' },
    en: { open: 'Platform Preview', close: 'Close', domestic: 'Domestic', global: 'Global' },
    ja: { open: 'プラットフォームプレビュー', close: '閉じる', domestic: '国内', global: 'グローバル' },
    zh: { open: '平台预览', close: '关闭', domestic: '国内', global: '全球' },
  }[uiLang] ?? { open: 'Platform Preview', close: 'Close', domestic: 'Domestic', global: 'Global' }

  function renderPreview() {
    const props = { sections, photos, productName, onPhotoClick: handlePhotoClick }
    switch (activePlatform) {
      case 'naver_blog':  return <NaverBlogPreview  {...props} />
      case 'smartstore':  return <SmartStorePreview {...props} />
      case 'coupang':     return <CoupangPreview    {...props} />
      case 'elevenst':    return <Eleven11Preview   {...props} />
      case 'amazon_jp':   return <AmazonJPPreview   {...props} />
      case 'rakuten':     return <RakutenPreview    {...props} />
      case 'tmall':       return <TmallPreview      {...props} />
      case 'shopify':     return <ShopifyPreview    {...props} />
      case 'qoo10':       return <Qoo10Preview      {...props} />
      case 'lazada':      return <LazadaPreview     {...props} />
      case 'temu':        return <TemuPreview       {...props} />
      case 'aliexpress':  return <AliExpressPreview {...props} />
      case 'shein':       return <SheinPreview      {...props} />
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between bg-white border-2 border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-2xl px-5 py-4 mb-5 transition-all group print:hidden"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🖥️</span>
          <div className="text-left">
            <p className="text-sm font-black text-gray-800 group-hover:text-indigo-700">{LABEL.open}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {uiLang === 'ko' ? '13개 플랫폼 미리보기 · 사진 편집 · 복사' : '13 platforms · photo editing · copy'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end max-w-[260px]">
          {PLATFORMS.slice(0, 6).map(p => (
            <span key={p.id} className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200 text-gray-500">{p.name}</span>
          ))}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200 text-gray-400">+7 more</span>
        </div>
      </button>
    )
  }

  return (
    <div className="mb-5 print:hidden">
      {/* Panel header */}
      <div className="bg-white border border-gray-200 rounded-t-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
        <span className="text-lg">🖥️</span>
        <p className="text-sm font-black text-gray-800">{LABEL.open}</p>

        {/* Copy buttons */}
        <div className="flex items-center gap-1 ml-auto">
          <button type="button" onClick={() => copyContent('html')}
            className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">HTML 복사</button>
          <button type="button" onClick={() => copyContent('text')}
            className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">텍스트</button>
          <button type="button" onClick={() => copyContent('md')}
            className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">Markdown</button>
          <button type="button" onClick={() => setOpen(false)}
            className="ml-2 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 transition-all">{LABEL.close}</button>
        </div>
      </div>

      {/* Platform tab selector */}
      <div className="bg-[#f8f9fa] border-x border-gray-200 px-4 py-3 space-y-2">
        {/* Domestic */}
        <div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{LABEL.domestic}</p>
          <div className="flex flex-wrap gap-1.5">
            {DOMESTIC_PLATFORMS.map(p => (
              <button key={p.id} type="button" onClick={() => setActivePlatform(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  activePlatform === p.id
                    ? 'text-white border-transparent shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
                style={activePlatform === p.id ? { background: p.primaryColor, borderColor: p.primaryColor } : {}}
              >
                <span>{p.icon}</span>{p.name}
              </button>
            ))}
          </div>
        </div>
        {/* Global */}
        <div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{LABEL.global}</p>
          <div className="flex flex-wrap gap-1.5">
            {GLOBAL_PLATFORMS.map(p => (
              <button key={p.id} type="button" onClick={() => setActivePlatform(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  activePlatform === p.id
                    ? 'text-white border-transparent shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
                style={activePlatform === p.id ? { background: p.primaryColor, borderColor: p.primaryColor } : {}}
              >
                <span>{p.icon}</span>{p.name}
              </button>
            ))}
          </div>
        </div>
        {/* Photo management hint */}
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
          <span className="text-sm">📷</span>
          <p className="text-[10px] text-blue-700 font-medium">
            {uiLang === 'ko'
              ? '회색 사진 자리를 클릭하면 이미지를 업로드할 수 있습니다 (JPG/PNG/WEBP · 최대 5MB)'
              : 'Click any grey photo placeholder to upload an image (JPG/PNG/WEBP · max 5MB)'}
          </p>
        </div>
      </div>

      {/* Preview area */}
      <div className="bg-[#e8eaed] border-x border-b border-gray-200 rounded-b-2xl overflow-auto p-4" style={{ maxHeight: '80vh' }}>
        {renderPreview()}
      </div>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
    </div>
  )
}
