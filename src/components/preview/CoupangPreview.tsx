'use client'
import React from 'react'

interface Section { id: number; name: string; title: string; body: string }
interface Props { sections: Section[]; photos: string[]; productName: string; onPhotoClick: (i: number) => void }

function PhotoSlot({ url, index, onClick }: { url?: string; index: number; onClick: () => void }) {
  return (
    <div onClick={onClick} className="cursor-pointer w-full rounded-lg border-2 border-dashed border-[#1A73E8]/30 bg-[#f0f7ff] hover:border-[#1A73E8] transition-all group my-3" style={{ minHeight: 150 }}>
      {url
        ? <img src={url} alt={`photo-${index}`} className="w-full object-cover rounded-lg" style={{ maxHeight: 300 }} />
        : <div className="flex flex-col items-center justify-center gap-1 py-10 text-[#1A73E8]/50 group-hover:text-[#1A73E8]">
            <span className="text-2xl">📷</span><span className="text-xs font-bold">사진 추가</span>
          </div>
      }
    </div>
  )
}

export default function CoupangPreview({ sections, photos, productName, onPhotoClick }: Props) {
  return (
    <div className="max-w-[680px] mx-auto bg-[#f7f8fc] rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-[#1A73E8] px-5 py-3 flex items-center gap-3">
        <span className="text-white font-black text-base">coupang</span>
        <span className="ml-auto bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">로켓배송</span>
      </div>

      <div className="bg-white p-5">
        {/* Product name + badges */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <h1 className="text-base font-black text-gray-900 leading-tight flex-1">{productName}</h1>
          <div className="flex flex-col gap-1 shrink-0">
            <span className="bg-[#e63312] text-white text-[9px] font-bold px-2 py-0.5 rounded">로켓배송</span>
            <span className="bg-[#1A73E8] text-white text-[9px] font-bold px-2 py-0.5 rounded">무료반품</span>
          </div>
        </div>

        {/* Hero photo */}
        <PhotoSlot url={photos[0]} index={0} onClick={() => onPhotoClick(0)} />

        {/* Spec-focused sections */}
        {sections.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="border border-gray-100 rounded-xl p-4 mb-3 bg-white">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 bg-[#1A73E8] rounded-full" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{s.name}</p>
              </div>
              <h3 className="text-sm font-black text-gray-900 mb-2">{s.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
            {i === 1 && <PhotoSlot url={photos[1]} index={1} onClick={() => onPhotoClick(1)} />}
            {i === 3 && <PhotoSlot url={photos[2]} index={2} onClick={() => onPhotoClick(2)} />}
          </React.Fragment>
        ))}
      </div>

      {/* Buy bar */}
      <div className="bg-white border-t-4 border-[#1A73E8] p-4">
        <div className="flex gap-2">
          <div className="flex-1 bg-[#1A73E8] text-white text-center py-3 rounded-xl font-black text-sm">바로구매</div>
          <div className="flex-1 border-2 border-[#1A73E8] text-[#1A73E8] text-center py-3 rounded-xl font-black text-sm">장바구니</div>
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-gray-500">
          <span className="text-[#e63312] font-bold">🚀 로켓배송</span><span>· 무료반품 · A/S 보증</span>
        </div>
      </div>
    </div>
  )
}
