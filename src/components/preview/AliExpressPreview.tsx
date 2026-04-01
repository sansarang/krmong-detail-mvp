'use client'
import React from 'react'

interface Section { id: number; name: string; title: string; body: string }
interface Props { sections: Section[]; photos: string[]; productName: string; onPhotoClick: (i: number) => void }

function PhotoSlot({ url, index, onClick }: { url?: string; index: number; onClick: () => void }) {
  return (
    <div onClick={onClick} className="cursor-pointer w-full rounded-lg border-2 border-dashed border-[#FF4747]/30 bg-[#fff5f5] hover:border-[#FF4747] transition-all group my-3" style={{ minHeight: 150 }}>
      {url
        ? <img src={url} alt={`photo-${index}`} className="w-full object-cover rounded-lg" style={{ maxHeight: 300 }} />
        : <div className="flex flex-col items-center justify-center gap-1 py-10 text-[#FF4747]/40 group-hover:text-[#FF4747]">
            <span className="text-2xl">📷</span><span className="text-xs font-bold">Add photo</span>
          </div>
      }
    </div>
  )
}

export default function AliExpressPreview({ sections, photos, productName, onPhotoClick }: Props) {
  return (
    <div className="max-w-[680px] mx-auto bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      {/* AliExpress header */}
      <div className="bg-[#FF4747] px-5 py-3 flex items-center gap-3">
        <span className="text-white font-black text-sm">AliExpress</span>
        <span className="ml-auto flex gap-1">
          <span className="bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded">AE Buyer Protection</span>
        </span>
      </div>

      <div className="p-5">
        <h1 className="text-base font-bold text-gray-900 mb-2 leading-tight">{productName}</h1>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-yellow-500 text-sm">★★★★★</span>
          <span className="text-gray-500 text-xs">4.7 (8,932 orders)</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl font-black text-[#FF4747]">US $8.99</span>
          <span className="bg-[#FF4747] text-white text-[10px] font-black px-2 py-0.5 rounded">+ 5 pcs = 10% OFF</span>
        </div>

        <PhotoSlot url={photos[0]} index={0} onClick={() => onPhotoClick(0)} />

        {sections.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="border border-gray-100 rounded-xl p-4 mb-3">
              <p className="text-[10px] font-black text-[#FF4747] uppercase tracking-wider mb-1">{s.name}</p>
              <h3 className="text-sm font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
            {i === 1 && <PhotoSlot url={photos[1]} index={1} onClick={() => onPhotoClick(1)} />}
            {i === 3 && <PhotoSlot url={photos[2]} index={2} onClick={() => onPhotoClick(2)} />}
          </React.Fragment>
        ))}

        {/* Specs table */}
        <div className="bg-[#fff5f5] border border-[#FF4747]/20 rounded-xl p-4 mt-2">
          <p className="text-xs font-black text-[#FF4747] mb-2">📦 Shipping & Protection</p>
          <div className="flex flex-wrap gap-2 text-[10px]">
            {['AliExpress Standard Shipping', 'Buyer Protection', 'Free Returns', 'Secure Payment'].map(b => (
              <span key={b} className="bg-white border border-gray-200 px-2 py-1 rounded font-bold text-gray-700">{b}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#FF4747] p-4 flex gap-2">
        <div className="flex-1 bg-white text-[#FF4747] text-center py-2.5 rounded-xl font-black text-xs">Add to Cart</div>
        <div className="flex-1 bg-yellow-400 text-black text-center py-2.5 rounded-xl font-black text-xs">Buy Now</div>
      </div>
    </div>
  )
}
