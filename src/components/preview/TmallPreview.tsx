'use client'
import React from 'react'

interface Section { id: number; name: string; title: string; body: string }
interface Props { sections: Section[]; photos: string[]; productName: string; onPhotoClick: (i: number) => void }

function PhotoSlot({ url, index, onClick }: { url?: string; index: number; onClick: () => void }) {
  return (
    <div onClick={onClick} className="cursor-pointer w-full rounded-lg border-2 border-dashed border-[#FF4400]/30 bg-[#fff5f0] hover:border-[#FF4400] transition-all group my-2" style={{ minHeight: 160 }}>
      {url
        ? <img src={url} alt={`photo-${index}`} className="w-full object-cover rounded-lg" style={{ maxHeight: 320 }} />
        : <div className="flex flex-col items-center justify-center gap-1 py-10 text-[#FF4400]/40 group-hover:text-[#FF4400]">
            <span className="text-2xl">📷</span><span className="text-xs font-bold">点击添加图片</span>
          </div>
      }
    </div>
  )
}

export default function TmallPreview({ sections, photos, productName, onPhotoClick }: Props) {
  return (
    <div className="max-w-[480px] mx-auto bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      {/* Tmall header */}
      <div className="bg-[#FF4400] px-5 py-3 flex items-center gap-3">
        <span className="text-white font-black text-base">天猫 Tmall</span>
        <span className="ml-auto flex gap-1">
          <span className="bg-yellow-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded">官方旗舰店</span>
        </span>
      </div>

      {/* Hot badge */}
      <div className="bg-[#fff0eb] border-b border-[#FF4400]/20 px-4 py-1.5 flex items-center gap-2">
        <span className="text-[#FF4400] font-black text-xs">🔥 爆款热销</span>
        <span className="text-gray-500 text-[10px]">已售100万+ · 好评率99.8%</span>
      </div>

      {/* Long-form 长图 style */}
      <div className="p-4" style={{ fontFamily: 'PingFang SC, Noto Sans SC, sans-serif' }}>
        <h1 className="text-sm font-black text-gray-900 mb-2 leading-tight">{productName}</h1>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-yellow-500 text-sm">★★★★★</span>
          <span className="text-[#FF4400] text-xs font-bold">已售 100万+件</span>
        </div>

        {/* Full-width photos between sections — 长图 style */}
        <PhotoSlot url={photos[0]} index={0} onClick={() => onPhotoClick(0)} />
        {sections.slice(0, 2).map((s, i) => (
          <div key={s.id} className="mb-3 bg-[#fff5f0] border-l-4 border-[#FF4400] p-3 rounded-r-xl">
            <p className="text-[10px] font-black text-[#FF4400] mb-1">【{s.name}】</p>
            <h3 className="text-sm font-black text-gray-900 mb-1">{s.title}</h3>
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{s.body}</p>
          </div>
        ))}

        <PhotoSlot url={photos[1]} index={1} onClick={() => onPhotoClick(1)} />
        {sections.slice(2, 4).map((s, i) => (
          <div key={s.id} className="mb-3 bg-white border border-gray-100 p-3 rounded-xl">
            <p className="text-[10px] font-black text-[#FF4400] mb-1">【{s.name}】</p>
            <h3 className="text-sm font-black text-gray-900 mb-1">{s.title}</h3>
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{s.body}</p>
          </div>
        ))}

        <PhotoSlot url={photos[2]} index={2} onClick={() => onPhotoClick(2)} />
        {sections.slice(4).map(s => (
          <div key={s.id} className="mb-3 bg-[#fff5f0] border-l-4 border-[#FF4400] p-3 rounded-r-xl">
            <p className="text-[10px] font-black text-[#FF4400] mb-1">【{s.name}】</p>
            <h3 className="text-sm font-black text-gray-900 mb-1">{s.title}</h3>
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{s.body}</p>
          </div>
        ))}
        <PhotoSlot url={photos[3]} index={3} onClick={() => onPhotoClick(3)} />

        {/* Guarantee bar */}
        <div className="grid grid-cols-3 gap-2 text-center mt-2">
          {['正品保障', '7天无理由', '顺丰包邮'].map(b => (
            <div key={b} className="bg-[#fff5f0] border border-[#FF4400]/20 rounded-lg py-2 text-[10px] font-bold text-[#FF4400]">{b}</div>
          ))}
        </div>
      </div>

      {/* Buy bar */}
      <div className="bg-[#FF4400] p-4 flex gap-2">
        <div className="flex-1 bg-white text-[#FF4400] text-center py-2.5 rounded-xl font-black text-xs">加入购物车</div>
        <div className="flex-1 bg-yellow-400 text-black text-center py-2.5 rounded-xl font-black text-xs">立即购买</div>
      </div>
    </div>
  )
}
