'use client'
import { useEffect, useState } from 'react'

type Lang = 'ko' | 'en' | 'ja' | 'zh'

const COPY: Record<Lang, { suffix: string; times: string[] }> = {
  ko: {
    suffix: '상세페이지 생성 완료 ·',
    times: ['방금', '1분 전', '2분 전', '방금', '3분 전', '1분 전', '방금', '2분 전', '방금', '4분 전', '1분 전', '방금'],
  },
  en: {
    suffix: 'detail page generated ·',
    times: ['just now', '1m ago', '2m ago', 'just now', '3m ago', '1m ago', 'just now', '2m ago', 'just now', '4m ago', '1m ago', 'just now'],
  },
  ja: {
    suffix: '商品ページ生成完了 ·',
    times: ['たった今', '1分前', '2分前', 'たった今', '3分前', '1分前', 'たった今', '2分前', 'たった今', '4分前', '1分前', 'たった今'],
  },
  zh: {
    suffix: '详情页已生成 ·',
    times: ['刚刚', '1分钟前', '2分钟前', '刚刚', '3分钟前', '1分钟前', '刚刚', '2分钟前', '刚刚', '4分钟前', '1分钟前', '刚刚'],
  },
}

const EVENTS: Record<Lang, { name: string; city: string; category: string }[]> = {
  ko: [
    { name: '이지윤', city: '서울', category: '뷰티/화장품' },
    { name: '박민준', city: '부산', category: '건강식품' },
    { name: '고우빈', city: '대구', category: '전자제품' },
    { name: '신재연', city: '인천', category: '식품/음료' },
    { name: '조수양', city: '광주', category: '패션/의류' },
    { name: '김서현', city: '수원', category: '생활용품' },
    { name: '이현우', city: '성남', category: '뷰티/화장품' },
    { name: '박지수', city: '울산', category: '건강/의료' },
    { name: '최다인', city: '창원', category: '식품/음료' },
    { name: '정우성', city: '전주', category: '스포츠용품' },
    { name: '한소희', city: '청주', category: '패션/의류' },
    { name: '오세진', city: '제주', category: '식품/음료' },
  ],
  en: [
    { name: 'Sarah M.', city: 'NYC', category: 'Beauty' },
    { name: 'James L.', city: 'LA', category: 'Supplements' },
    { name: 'Emma K.', city: 'London', category: 'Electronics' },
    { name: 'Mike R.', city: 'Toronto', category: 'Food & Bev' },
    { name: 'Lisa P.', city: 'Sydney', category: 'Fashion' },
    { name: 'Tom H.', city: 'Chicago', category: 'Home' },
    { name: 'Anna V.', city: 'Berlin', category: 'Beauty' },
    { name: 'Chris W.', city: 'Seattle', category: 'Health' },
    { name: 'Julia B.', city: 'Paris', category: 'Food' },
    { name: 'David N.', city: 'Dallas', category: 'Sports' },
    { name: 'Kate F.', city: 'Boston', category: 'Fashion' },
    { name: 'Ryan O.', city: 'Miami', category: 'Food' },
  ],
  ja: [
    { name: '田中', city: '東京', category: 'コスメ' },
    { name: '佐藤', city: '大阪', category: '健康食品' },
    { name: '鈴木', city: '名古屋', category: '家電' },
    { name: '高橋', city: '福岡', category: '食品' },
    { name: '伊藤', city: '札幌', category: 'アパレル' },
    { name: '渡辺', city: '横浜', category: '生活用品' },
    { name: '山本', city: '神戸', category: 'コスメ' },
    { name: '中村', city: '広島', category: '医療' },
    { name: '小林', city: '仙台', category: '食品' },
    { name: '加藤', city: '千葉', category: 'スポーツ' },
    { name: '吉田', city: '埼玉', category: 'ファッション' },
    { name: '山田', city: '沖縄', category: '食品' },
  ],
  zh: [
    { name: '张伟', city: '北京', category: '美妆' },
    { name: '李娜', city: '上海', category: '保健品' },
    { name: '王强', city: '深圳', category: '数码' },
    { name: '刘洋', city: '广州', category: '食品饮料' },
    { name: '陈静', city: '杭州', category: '服饰' },
    { name: '杨洋', city: '成都', category: '家居' },
    { name: '赵敏', city: '南京', category: '美妆' },
    { name: '黄磊', city: '武汉', category: '健康' },
    { name: '周杰', city: '西安', category: '食品' },
    { name: '吴婷', city: '重庆', category: '运动' },
    { name: '徐凯', city: '苏州', category: '服装' },
    { name: '孙悦', city: '厦门', category: '食品' },
  ],
}

export default function LiveTicker({ lang = 'ko' }: { lang?: Lang }) {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const L = COPY[lang] ?? COPY.ko
  const list = EVENTS[lang] ?? EVENTS.ko

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % list.length)
        setVisible(true)
      }, 350)
    }, 5000)
    return () => clearInterval(interval)
  }, [list.length])

  const ev = list[idx]
  const initials = ev.name[0]
  const colors = ['#FF5C35','#6366F1','#0EA5E9','#10B981','#F59E0B','#8B5CF6']
  const color = colors[idx % colors.length]
  const timeStr = L.times[idx % L.times.length]

  return (
    <div
      className="fixed bottom-6 left-6 z-50 transition-all duration-350"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(8px)' }}
    >
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/8 px-4 py-3 flex items-center gap-3 max-w-xs">
        <div
          className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-black"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black text-gray-900 truncate">
            {ev.name}
            <span className="font-normal text-gray-400">({ev.city})</span>
          </p>
          <p className="text-[11px] text-gray-500 truncate">
            {ev.category} {L.suffix} <span className="font-bold text-green-500">{timeStr}</span>
          </p>
        </div>
        <div className="shrink-0">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}
