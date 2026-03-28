'use client'
import { useEffect, useState } from 'react'

const EVENTS = [
  { name: '이지윤', city: '서울',  category: '뷰티/화장품',  time: '방금' },
  { name: '박민준', city: '부산',  category: '건강식품',     time: '1분 전' },
  { name: '고우빈', city: '대구',  category: '전자제품',     time: '2분 전' },
  { name: '신재연', city: '인천',  category: '식품/음료',    time: '방금' },
  { name: '조수양', city: '광주',  category: '패션/의류',    time: '3분 전' },
  { name: '김서현', city: '수원',  category: '생활용품',     time: '1분 전' },
  { name: '이현우', city: '성남',  category: '뷰티/화장품',  time: '방금' },
  { name: '박지수', city: '울산',  category: '건강/의료',    time: '2분 전' },
  { name: '최다인', city: '창원',  category: '식품/음료',    time: '방금' },
  { name: '정우성', city: '전주',  category: '스포츠용품',   time: '4분 전' },
  { name: '한소희', city: '청주',  category: '패션/의류',    time: '1분 전' },
  { name: '오세진', city: '제주',  category: '식품/음료',    time: '방금' },
]

export default function LiveTicker() {
  const [idx, setIdx]         = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      // fade out → 교체 → fade in
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % EVENTS.length)
        setVisible(true)
      }, 350)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const ev = EVENTS[idx]
  const initials = ev.name[0]
  const colors = ['#FF5C35','#6366F1','#0EA5E9','#10B981','#F59E0B','#8B5CF6']
  const color = colors[idx % colors.length]

  return (
    <div
      className="fixed bottom-6 left-6 z-50 transition-all duration-350"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(8px)' }}
    >
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/8 px-4 py-3 flex items-center gap-3 max-w-xs">
        {/* 아바타 */}
        <div
          className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-black"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>

        {/* 텍스트 */}
        <div className="min-w-0">
          <p className="text-xs font-black text-gray-900 truncate">
            {ev.name}
            <span className="font-normal text-gray-400">({ev.city})</span>
          </p>
          <p className="text-[11px] text-gray-500 truncate">
            {ev.category} 상세페이지 생성 완료 · <span className="font-bold text-green-500">{ev.time}</span>
          </p>
        </div>

        {/* 라이브 도트 */}
        <div className="shrink-0">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}
