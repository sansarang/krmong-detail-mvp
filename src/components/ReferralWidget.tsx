'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Lang = 'ko' | 'en' | 'ja' | 'zh'

const COPY = {
  ko: {
    title: '친구 초대하기',
    sub: '친구 가입 시 둘 다 3회 무료 추가',
    codeLabel: '내 초대 코드',
    copy: '복사',
    copied: '복사됨 ✓',
    friends: '초대한 친구',
    friendsUnit: (n: number) => `${n}명 · +${n * 3}회 획득`,
    toastCopied: '초대 링크 복사됨!',
  },
  en: {
    title: 'Invite Friends',
    sub: 'Both get 3 free uses when a friend joins',
    codeLabel: 'My referral code',
    copy: 'Copy',
    copied: 'Copied ✓',
    friends: 'Friends invited',
    friendsUnit: (n: number) => `${n} friends · +${n * 3} uses earned`,
    toastCopied: 'Referral link copied!',
  },
  ja: {
    title: '友達を招待',
    sub: '友達が登録すると2人とも3回無料追加',
    codeLabel: '招待コード',
    copy: 'コピー',
    copied: 'コピー済み ✓',
    friends: '招待した友達',
    friendsUnit: (n: number) => `${n}人 · +${n * 3}回獲得`,
    toastCopied: '招待リンクをコピーしました！',
  },
  zh: {
    title: '邀请好友',
    sub: '好友注册后双方各获3次免费使用',
    codeLabel: '我的邀请码',
    copy: '复制',
    copied: '已复制 ✓',
    friends: '已邀请好友',
    friendsUnit: (n: number) => `${n}人 · 已获得+${n * 3}次`,
    toastCopied: '邀请链接已复制！',
  },
}

interface Props {
  lang?: Lang
}

export default function ReferralWidget({ lang = 'ko' }: Props) {
  const [code, setCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [referralCount, setReferralCount] = useState(0)
  const supabase = createClient()
  const t = COPY[lang]

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code, referral_count')
        .eq('id', user.id)
        .single()

      if (profile?.referral_code) {
        setCode(profile.referral_code)
        setReferralCount(profile.referral_count ?? 0)
      } else {
        const newCode = user.id.replace(/-/g, '').slice(0, 8).toUpperCase()
        await supabase.from('profiles').upsert({ id: user.id, referral_code: newCode })
        setCode(newCode)
      }
    }
    load()
  }, [])

  const referralLink = code
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://pagebeer.beer'}/login?ref=${code}`
    : ''

  async function handleCopy() {
    if (!referralLink) return
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success(t.toastCopied)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!code) return null

  return (
    <div className="bg-gradient-to-br from-black to-gray-900 rounded-3xl p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-xl">🎁</div>
        <div>
          <p className="font-black text-sm tracking-tight">{t.title}</p>
          <p className="text-gray-400 text-xs">{t.sub}</p>
        </div>
      </div>

      <div className="bg-white/10 rounded-2xl px-4 py-3 mb-3 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium">{t.codeLabel}</span>
        <span className="font-black text-white tracking-widest text-sm">{code}</span>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-400 truncate font-mono">
          {referralLink.replace('https://', '')}
        </div>
        <button
          onClick={handleCopy}
          className="bg-white text-black text-xs font-black px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-all shrink-0"
        >
          {copied ? t.copied : t.copy}
        </button>
      </div>

      {referralCount > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-gray-400">{t.friends}</span>
          <span className="text-sm font-black text-white">{t.friendsUnit(referralCount)}</span>
        </div>
      )}
    </div>
  )
}
