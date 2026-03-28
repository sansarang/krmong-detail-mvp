'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const DURATION_MS = 72 * 60 * 60 * 1000 // 72시간

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function CountdownBanner() {
  const [timeLeft, setTimeLeft] = useState<{ h: string; m: string; s: string } | null>(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const KEY = 'earlybird_deadline'
    let deadline = localStorage.getItem(KEY)
    if (!deadline) {
      deadline = String(Date.now() + DURATION_MS)
      localStorage.setItem(KEY, deadline)
    }
    const end = Number(deadline)

    function tick() {
      const diff = end - Date.now()
      if (diff <= 0) {
        setExpired(true)
        return
      }
      const totalSec = Math.floor(diff / 1000)
      const h = Math.floor(totalSec / 3600)
      const m = Math.floor((totalSec % 3600) / 60)
      const s = totalSec % 60
      setTimeLeft({ h: pad(h), m: pad(m), s: pad(s) })
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  if (expired || !timeLeft) return null

  return (
    <div className="bg-black text-white text-center py-2.5 px-4 text-sm font-medium">
      <span className="text-yellow-400 font-black">⚡ 얼리버드 특가</span>
      {' '}프로 플랜{' '}
      <span className="line-through text-gray-500">₩29,000</span>{' '}
      <span className="font-black">₩14,500</span>
      <span className="inline-flex items-center gap-1 mx-2 bg-white/10 border border-white/20 rounded-lg px-2 py-0.5 font-black tabular-nums text-xs">
        <span>{timeLeft.h}</span>
        <span className="opacity-50">:</span>
        <span>{timeLeft.m}</span>
        <span className="opacity-50">:</span>
        <span>{timeLeft.s}</span>
      </span>
      남음
      <Link href="/#pricing" className="ml-3 underline underline-offset-2 text-yellow-400 font-bold hover:text-yellow-300 transition-colors">
        지금 시작 →
      </Link>
    </div>
  )
}
