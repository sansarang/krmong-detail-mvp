'use client'
import Link from 'next/link'
import { persistUiLang, type UiLang } from '@/lib/uiLocale'

const LANGS = [
  { code: 'ko', flag: '🇰🇷', label: 'KR', href: '/' },
  { code: 'en', flag: '🇺🇸', label: 'EN', href: '/en' },
]

export default function LangSwitcher({ current }: { current: 'ko' | 'en' }) {
  return (
    <div className="flex items-center gap-1">
      {LANGS.map(lang => (
        <Link
          key={lang.code}
          href={lang.href}
          onClick={() => persistUiLang(lang.code as UiLang)}
          title={lang.label}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
            lang.code === current
              ? 'bg-white/15 text-white'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/8'
          }`}
        >
          <span className="text-base leading-none">{lang.flag}</span>
          <span className="hidden sm:inline">{lang.label}</span>
        </Link>
      ))}
    </div>
  )
}