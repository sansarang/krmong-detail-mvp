'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { persistUiLang, type UiLang } from '@/lib/uiLocale'

const LANGS = [
  { code: 'ko', label: '한국어', flag: '🇰🇷', href: '/' },
  { code: 'en', label: 'English', flag: '🇺🇸', href: '/en' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', href: '/ja' },
  { code: 'zh', label: '中文', flag: '🇨🇳', href: '/zh' },
]

export default function LangSwitcher({ current }: { current: 'ko' | 'en' | 'ja' | 'zh' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const active = LANGS.find(l => l.code === current)!

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black font-medium border border-gray-200 px-3 py-1.5 rounded-xl hover:border-gray-400 transition-all"
      >
        <span>{active.flag}</span>
        <span>{active.label}</span>
        <span className={`text-[10px] transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50 min-w-[140px]">
          {LANGS.map(lang => (
            <Link
              key={lang.code}
              href={lang.href}
              onClick={() => {
                persistUiLang(lang.code as UiLang)
                setOpen(false)
              }}
              className={`flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                lang.code === current ? 'font-black text-black bg-gray-50' : 'text-gray-600'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
              {lang.code === current && <span className="ml-auto text-xs text-gray-400">✓</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
