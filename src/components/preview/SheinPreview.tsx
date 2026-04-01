'use client'
import React from 'react'

interface Section { id: number; name: string; title: string; body: string }
interface Props { sections: Section[]; photos: string[]; productName: string; onPhotoClick: (i: number) => void }

function PhotoSlot({ url, index, onClick }: { url?: string; index: number; onClick: () => void }) {
  return (
    <div onClick={onClick} className="cursor-pointer w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-900 transition-all group my-3" style={{ minHeight: 180 }}>
      {url
        ? <img src={url} alt={`photo-${index}`} className="w-full object-cover rounded-xl" style={{ maxHeight: 380 }} />
        : <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400 group-hover:text-gray-900">
            <span className="text-3xl">📷</span><span className="text-xs font-bold">Add photo</span>
          </div>
      }
    </div>
  )
}

export default function SheinPreview({ sections, photos, productName, onPhotoClick }: Props) {
  return (
    <div className="max-w-[480px] mx-auto bg-[#fafafa] rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      {/* SHEIN header */}
      <div className="bg-black px-5 py-3 flex items-center justify-between">
        <span className="text-white font-black text-base tracking-widest">SHEIN</span>
        <div className="flex items-center gap-2 text-white/60 text-xs">
          <span>New In</span><span>|</span><span>Sale</span><span>🛒</span>
        </div>
      </div>

      {/* Trend badge */}
      <div className="bg-[#f5f5f5] border-b border-gray-200 px-4 py-1.5 flex items-center gap-2">
        <span className="text-black font-black text-xs">🔥 Trending Now</span>
        <span className="ml-auto text-[10px] bg-black text-white px-2 py-0.5 rounded font-bold">NEW IN</span>
      </div>

      <div className="p-4" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
        {/* Hero photo */}
        <PhotoSlot url={photos[0]} index={0} onClick={() => onPhotoClick(0)} />

        {/* Product name + price */}
        <div className="mb-3">
          <h1 className="text-sm font-bold text-gray-900 mb-1 leading-tight">{productName}</h1>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-black">$24.99</span>
            <span className="text-gray-400 text-sm line-through">$49.99</span>
            <span className="bg-black text-white text-[9px] font-black px-1.5 py-0.5 rounded">50% OFF</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-yellow-500 text-xs">★★★★★</span>
            <span className="text-gray-500 text-xs">4.9 (23,400 reviews)</span>
          </div>
        </div>

        {/* Sections */}
        {sections.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="bg-white border border-gray-100 rounded-xl p-3 mb-2 shadow-sm">
              <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">{s.name}</p>
              <h3 className="text-xs font-bold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
            {(i === 0 || i === 2 || i === 4) && (
              <PhotoSlot url={photos[Math.floor(i / 2) + 1]} index={Math.floor(i / 2) + 1} onClick={() => onPhotoClick(Math.floor(i / 2) + 1)} />
            )}
          </React.Fragment>
        ))}

        {/* Size / Style guide */}
        <div className="bg-gray-900 text-white rounded-xl p-4 mt-2">
          <p className="text-xs font-black mb-2">SIZE GUIDE</p>
          <div className="flex gap-2">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => (
              <div key={sz} className="border border-white/30 rounded px-2 py-1 text-xs font-bold text-white/70 hover:bg-white hover:text-black cursor-pointer transition-all">{sz}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-black p-4 flex gap-2">
        <div className="flex-1 border border-white text-white text-center py-2.5 rounded-xl font-black text-xs">Add to Wishlist ♡</div>
        <div className="flex-1 bg-white text-black text-center py-2.5 rounded-xl font-black text-xs">Add to Bag</div>
      </div>
    </div>
  )
}
