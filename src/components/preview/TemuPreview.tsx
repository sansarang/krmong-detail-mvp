'use client'
import React from 'react'

interface Section { id: number; name: string; title: string; body: string }
interface Props { sections: Section[]; photos: string[]; productName: string; onPhotoClick: (i: number) => void }

function PhotoSlot({ url, index, onClick }: { url?: string; index: number; onClick: () => void }) {
  return (
    <div onClick={onClick} className="cursor-pointer w-full rounded-lg border-2 border-dashed border-[#FF6B35]/30 bg-[#fff8f5] hover:border-[#FF6B35] transition-all group my-3" style={{ minHeight: 150 }}>
      {url
        ? <img src={url} alt={`photo-${index}`} className="w-full object-cover rounded-lg" style={{ maxHeight: 300 }} />
        : <div className="flex flex-col items-center justify-center gap-1 py-10 text-[#FF6B35]/40 group-hover:text-[#FF6B35]">
            <span className="text-2xl">📷</span><span className="text-xs font-bold">Add photo</span>
          </div>
      }
    </div>
  )
}

export default function TemuPreview({ sections, photos, productName, onPhotoClick }: Props) {
  return (
    <div className="max-w-[480px] mx-auto bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      {/* Temu header */}
      <div className="bg-[#FF6B35] px-5 py-3 flex items-center gap-3">
        <span className="text-white font-black text-base">temu</span>
        <span className="ml-auto flex gap-1">
          <span className="bg-white text-[#FF6B35] text-[9px] font-black px-2 py-0.5 rounded">Free Ship</span>
        </span>
      </div>

      {/* Hot badge */}
      <div className="bg-[#fff3ed] border-b border-[#FF6B35]/20 px-4 py-1.5 flex items-center gap-2">
        <span className="text-[#FF6B35] font-black text-xs">🔥 #1 Trending · 50,000+ Sold</span>
      </div>

      <div className="p-4">
        <h1 className="text-sm font-bold text-gray-900 mb-1 leading-tight">{productName}</h1>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl font-black text-[#FF6B35]">$12.99</span>
          <span className="text-gray-400 text-sm line-through">$29.99</span>
          <span className="bg-[#FF6B35] text-white text-[9px] font-black px-1.5 py-0.5 rounded">57% OFF</span>
        </div>

        <PhotoSlot url={photos[0]} index={0} onClick={() => onPhotoClick(0)} />

        {sections.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="bg-white border border-gray-100 rounded-xl p-3 mb-2 shadow-sm">
              <p className="text-[10px] font-black text-[#FF6B35] uppercase tracking-wider mb-1">{s.name}</p>
              <h3 className="text-xs font-black text-gray-900 mb-1">{s.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
            {i === 1 && <PhotoSlot url={photos[1]} index={1} onClick={() => onPhotoClick(1)} />}
          </React.Fragment>
        ))}

        <div className="bg-[#fff3ed] rounded-xl p-3 mt-2">
          <div className="flex flex-wrap gap-2 text-[10px]">
            {['🔄 Free Returns', '🛡 Buyer Protection', '🚚 Fast Shipping', '✅ Authentic'].map(b => (
              <span key={b} className="bg-white border border-[#FF6B35]/20 px-2 py-1 rounded font-bold text-gray-700">{b}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#FF6B35] p-3 text-center">
        <span className="text-white font-bold text-sm">Buy Now — Free Shipping</span>
      </div>
    </div>
  )
}
