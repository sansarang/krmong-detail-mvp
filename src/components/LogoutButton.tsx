'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function LogoutButton({ label = '로그아웃', className }: { label?: string; className?: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    toast.success('로그아웃 되었습니다.')
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={className ?? 'text-xs text-gray-400 hover:text-black transition-colors disabled:opacity-40 px-3 py-2'}
    >
      {loading ? '...' : label}
    </button>
  )
}
