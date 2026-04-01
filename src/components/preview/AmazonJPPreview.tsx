'use client'
import React from 'react'

interface Section { id: number; name: string; title: string; body: string }
interface Props { sections: Section[]; photos: string[]; productName: string; onPhotoClick: (i: number) => void }

function PhotoSlot({ url, index, onClick }: { url?: string; index: number; onClick: () => void }) {
  return (
    <div onClick={onClick} className="cursor-pointer w-full rounded-lg border-2 border-dashed border-[#FF9900]/40 bg-[#fff8f0] hover:border-[#FF9900] transition-all group my-3" style={{ minHeight: 160 }}>
      {url
        ? <img src={url} alt={`photo-${index}`} className="w-full object-cover rounded-lg" style={{ maxHeight: 320 }} />
        : <div className="flex flex-col items-center justify-center gap-1 py-10 text-[#FF9900]/50 group-hover:text-[#FF9900]">
            <span className="text-2xl">📷</span><span className="text-xs font-bold">Click to add photo</span>
          </div>
      }
    </div>
  )
}

export default function AmazonJPPreview({ sections, photos, productName, onPhotoClick }: Props) {
  return (
    <div className="max-w-[680px] mx-auto bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      {/* Amazon header */}
      <div className="bg-[#232F3E] px-5 py-3 flex items-center gap-3">
        <span className="text-[#FF9900] font-black text-lg italic">amazon</span>
        <span className="text-white/50 text-xs">Japan</span>
        <span className="ml-auto flex items-center gap-1">
          <span className="text-yellow-400 text-xs">★★★★★</span>
          <span className="text-gray-400 text-xs">4.8</span>
        </span>
      </div>

      {/* A+ Content area */}
      <div className="bg-[#fff8f0] border-b border-[#FF9900]/20 px-5 py-2">
        <span className="text-[10px] font-black text-[#FF9900] uppercase tracking-widest">A+ Content · Premium Brand</span>
      </div>

      <div className="p-5">
        <h1 className="text-base font-black text-gray-900 mb-2 leading-tight">{productName}</h1>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-yellow-500 text-sm">★★★★★</span>
          <span className="text-[#1A73E8] text-xs underline">4.8 (12,000+ 件)</span>
          <span className="ml-auto text-[10px] bg-[#FF9900] text-white px-2 py-0.5 rounded font-bold">Prime</span>
        </div>

        {/* 2-column A+ layout */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <PhotoSlot url={photos[0]} index={0} onClick={() => onPhotoClick(0)} />
          <PhotoSlot url={photos[1]} index={1} onClick={() => onPhotoClick(1)} />
        </div>

        {sections.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className={`rounded-xl p-4 mb-3 ${i % 2 === 0 ? 'bg-[#fff8f0] border border-[#FF9900]/20' : 'bg-white border border-gray-100'}`}>
              <p className="text-[10px] font-black text-[#FF9900] uppercase tracking-widest mb-1">{s.name}</p>
              <h3 className="text-sm font-black text-gray-900 mb-2">{s.title}</h3>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
            {i === 2 && <PhotoSlot url={photos[2]} index={2} onClick={() => onPhotoClick(2)} />}
          </React.Fragment>
        ))}

        {/* Social proof bar */}
        <div className="bg-[#232F3E] rounded-xl p-4 text-white">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold">★4.8 · 12,000+ verified reviews</span>
            <span className="text-[10px] text-gray-400">30日間返品保証 · Amazon.co.jp直送</span>
          </div>
        </div>
      </div>

      {/* Buy box */}
      <div className="bg-[#FFF3E0] border-t border-[#FF9900]/30 p-4">
        <div className="bg-[#FF9900] text-white text-center py-3 rounded-xl font-black text-sm mb-2">今すぐ購入</div>
        <div className="border border-[#FF9900] text-[#FF9900] text-center py-2 rounded-xl text-sm font-bold">カートに追加</div>
      </div>
    </div>
  )
}
