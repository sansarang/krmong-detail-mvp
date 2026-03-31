'use client'
import { useState } from 'react'
import { toast } from 'sonner'

export default function BillingPortalButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false)

  async function handlePortal() {
    setLoading(true)
    try {
      const res = await fetch('/api/payment/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error(data.error || '오류가 발생했습니다.')
    } catch {
      toast.error('처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePortal}
      disabled={loading}
      className={className ?? 'text-xs font-black underline underline-offset-2 opacity-90 hover:opacity-100 disabled:opacity-50'}
    >
      {loading ? '처리 중...' : '플랜 관리 / 해지 →'}
    </button>
  )
}
