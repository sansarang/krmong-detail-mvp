'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function DeleteOrderButton({ orderId, label = '삭제' }: { orderId: string; label?: string }) {
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    setLoading(true)
    const { error } = await supabase.from('orders').delete().eq('id', orderId)
    if (error) {
      toast.error('삭제 중 오류가 발생했습니다.')
    } else {
      toast.success('삭제되었습니다.')
      router.refresh()
    }
    setLoading(false)
    setConfirm(false)
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 transition-all"
        >
          {loading ? '...' : '확인'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
        >
          취소
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
    >
      {label}
    </button>
  )
}
