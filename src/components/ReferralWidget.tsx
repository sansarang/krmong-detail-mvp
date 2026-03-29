'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ReferralWidget() {
  const [code, setCode]       = useState<string | null>(null)
  const [copied, setCopied]   = useState(false)
  const [referralCount, setReferralCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // profiles에서 referral_code 조회 (없으면 생성)
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code, referral_count')
        .eq('id', user.id)
        .single()

      if (profile?.referral_code) {
        setCode(profile.referral_code)
        setReferralCount(profile.referral_count ?? 0)
      } else {
        // 없으면 새 코드 생성 (user id 앞 8자리)
        const newCode = user.id.replace(/-/g, '').slice(0, 8).toUpperCase()
        await supabase.from('profiles').upsert({ id: user.id, referral_code: newCode })
        setCode(newCode)
      }
    }
    load()
  }, [])

  const referralLink = code
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://krmong-detail-mvp.vercel.app'}/login?ref=${code}`
    : ''

  async function handleCopy() {
    if (!referralLink) return
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('초대 링크 복사됨!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (!code) return null

  return (
    <div className="bg-gradient-to-br from-black to-gray-900 rounded-3xl p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-xl">🎁</div>
        <div>
          <p className="font-black text-sm tracking-tight">친구 초대하기</p>
          <p className="text-gray-400 text-xs">친구 가입 시 둘 다 3회 무료 추가</p>
        </div>
      </div>

      {/* 내 코드 */}
      <div className="bg-white/10 rounded-2xl px-4 py-3 mb-3 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium">내 초대 코드</span>
        <span className="font-black text-white tracking-widest text-sm">{code}</span>
      </div>

      {/* 링크 + 복사 버튼 */}
      <div className="flex gap-2">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-400 truncate font-mono">
          {referralLink.replace('https://', '')}
        </div>
        <button
          onClick={handleCopy}
          className="bg-white text-black text-xs font-black px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-all shrink-0"
        >
          {copied ? '복사됨 ✓' : '복사'}
        </button>
      </div>

      {referralCount > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-gray-400">초대한 친구</span>
          <span className="text-sm font-black text-white">{referralCount}명 · +{referralCount * 3}회 획득</span>
        </div>
      )}
    </div>
  )
}
