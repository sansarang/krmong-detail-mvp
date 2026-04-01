'use client'
import React from 'react'

interface Section { id: number; name: string; title: string; body: string }
interface Props { sections: Section[]; photos: string[]; productName: string; onPhotoClick: (i: number) => void }

function PhotoSlot({ url, index, onClick }: { url?: string; index: number; onClick: () => void }) {
  return (
    <div onClick={onClick} className="cursor-pointer w-full rounded-lg border-2 border-dashed border-[#F57224]/30 bg-[#fff8f4] hover:border-[#F57224] transition-all group my-3" style={{ minHeight: 150 }}>
      {url
        ? <img src={url} alt={`photo-${index}`} className="w-full object-cover rounded-lg" style={{ maxHeight: 300 }} />
        : <div className="flex flex-col items-center justify-center gap-1 py-10 text-[#F57224]/40 group-hover:text-[#F57224]">
            <span className="text-2xl">📷</span><span className="text-xs font-bold">Add photo</span>
          </div>
      }
    </div>
  )
}

export default function LazadaPreview({ sections, photos, productName, onPhotoClick }: Props) {
  return (
    <div className="max-w-[480px] mx-auto bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      {/* Lazada header */}
      <div style={{ background: 'linear-gradient(90deg, #F57224, #E31837)' }} className="px-5 py-3 flex items-center gap-3">
        <span className="text-white font-black text-base">Lazada</span>
        <span className="ml-auto flex gap-1">
          <span className="bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded">Free Ship</span>
          <span className="bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded">Lazada Mall</span>
        </span>
      </div>

      <div className="p-4">
        <h1 className="text-sm font-bold text-gray-900 mb-2 leading-tight">{productName}</h1>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-yellow-500 text-sm">★★★★☆</span>
          <span className="text-gray-500 text-xs">4.4 (2,341 ratings)</span>
          <span className="ml-auto text-[10px] bg-[#F57224] text-white px-2 py-0.5 rounded font-bold">Flash Sale</span>
        </div>

        <PhotoSlot url={photos[0]} index={0} onClick={() => onPhotoClick(0)} />

        {sections.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="bg-white border border-gray-100 rounded-xl p-3 mb-2 shadow-sm">
              <p className="text-[10px] font-black text-[#F57224] uppercase tracking-wider mb-1">{s.name}</p>
              <h3 className="text-xs font-black text-gray-900 mb-1">{s.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
            {i === 2 && <PhotoSlot url={photos[1]} index={1} onClick={() => onPhotoClick(1)} />}
          </React.Fragment>
        ))}

        {/* Lazada guarantee */}
        <div className="bg-[#fff8f4] border border-[#F57224]/20 rounded-xl p-3 mt-2">
          <div className="flex flex-wrap gap-2 text-[10px]">
            {['🛡 Lazada Guarantee', '🚚 Free Shipping', '↩ Free Returns', '✅ Authentic'].map(b => (
              <span key={b} className="bg-white border border-gray-200 px-2 py-1 rounded font-bold text-gray-700">{b}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(90deg, #F57224, #E31837)' }} className="p-3 text-center">
        <span className="text-white font-bold text-sm">Add to Cart</span>
      </div>
    </div>
  )
}
