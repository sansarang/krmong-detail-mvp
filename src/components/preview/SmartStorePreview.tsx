'use client'
import React from 'react'

interface Section { id: number; name: string; title: string; body: string }
interface Props { sections: Section[]; photos: string[]; productName: string; onPhotoClick: (i: number) => void }

function PhotoSlot({ url, index, onClick }: { url?: string; index: number; onClick: () => void }) {
  return (
    <div onClick={onClick} className="cursor-pointer w-full rounded-xl border-2 border-dashed border-[#03C75A]/40 bg-[#f0fdf4] hover:border-[#03C75A] transition-all group my-3" style={{ minHeight: 160 }}>
      {url
        ? <img src={url} alt={`photo-${index}`} className="w-full object-cover rounded-xl" style={{ maxHeight: 320 }} />
        : <div className="flex flex-col items-center justify-center gap-1 py-10 text-[#03C75A]/50 group-hover:text-[#03C75A]">
            <span className="text-2xl">📷</span><span className="text-xs font-bold">사진 추가</span>
          </div>
      }
    </div>
  )
}

export default function SmartStorePreview({ sections, photos, productName, onPhotoClick }: Props) {
  return (
    <div className="max-w-[480px] mx-auto bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
      {/* Header */}
      <div className="bg-[#03C75A] px-4 py-2.5 flex items-center gap-2">
        <span className="text-white font-black text-sm">NAVER SmartStore</span>
        <span className="ml-auto text-white/70 text-[10px]">미리보기</span>
      </div>
      {/* Product title bar */}
      <div className="px-4 py-3 border-b border-gray-100 bg-[#f8f8f8]">
        <p className="text-xs font-bold text-gray-500 mb-0.5">상품명</p>
        <h1 className="text-base font-black text-gray-900 leading-tight">{productName}</h1>
      </div>

      {/* Hero image */}
      <div className="px-4 pt-3">
        <PhotoSlot url={photos[0]} index={0} onClick={() => onPhotoClick(0)} />
      </div>

      {/* Sections — mobile card style */}
      <div className="p-4 space-y-3">
        {sections.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 rounded-full bg-[#03C75A]" />
                <p className="text-xs font-black text-gray-500 uppercase tracking-wider">{s.name}</p>
              </div>
              <h3 className="text-sm font-black text-gray-900 mb-2">{s.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line line-clamp-4">{s.body}</p>
            </div>
            {i < 2 && <PhotoSlot url={photos[i + 1]} index={i + 1} onClick={() => onPhotoClick(i + 1)} />}
          </React.Fragment>
        ))}
      </div>

      {/* CTA */}
      <div className="p-4 border-t border-gray-100 bg-[#f8f8f8]">
        <div className="bg-[#FF4136] text-white text-center py-3 rounded-xl font-black text-sm">지금 구매하기</div>
        <div className="flex gap-2 mt-2">
          <div className="flex-1 border border-[#03C75A] text-[#03C75A] text-center py-2 rounded-xl text-xs font-bold">장바구니</div>
          <div className="flex-1 border border-gray-300 text-gray-500 text-center py-2 rounded-xl text-xs font-bold">찜하기 ♡</div>
        </div>
      </div>
    </div>
  )
}
