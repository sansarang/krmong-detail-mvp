'use client'
import React from 'react'

interface Section { id: number; name: string; title: string; body: string }
interface Props { sections: Section[]; photos: string[]; productName: string; onPhotoClick: (i: number) => void }

function PhotoSlot({ url, index, onClick }: { url?: string; index: number; onClick: () => void }) {
  return (
    <div onClick={onClick} className="cursor-pointer w-full rounded-lg border-2 border-dashed border-red-200 bg-red-50 hover:border-red-500 transition-all group my-3" style={{ minHeight: 150 }}>
      {url
        ? <img src={url} alt={`photo-${index}`} className="w-full object-cover rounded-lg" style={{ maxHeight: 300 }} />
        : <div className="flex flex-col items-center justify-center gap-1 py-10 text-red-300 group-hover:text-red-500">
            <span className="text-2xl">📷</span><span className="text-xs font-bold">사진 추가</span>
          </div>
      }
    </div>
  )
}

export default function Eleven11Preview({ sections, photos, productName, onPhotoClick }: Props) {
  return (
    <div className="max-w-[680px] mx-auto bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-[#FF0000] px-5 py-3 flex items-center gap-3">
        <span className="text-white font-black text-lg">11</span>
        <span className="text-white font-bold text-sm">11번가</span>
        <span className="ml-auto bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded">쿠폰</span>
      </div>

      {/* Coupon banner */}
      <div className="bg-[#fff3cd] border-b border-yellow-200 px-4 py-2 flex items-center gap-2">
        <span className="text-yellow-700 font-black text-xs">🎫 추가 할인 쿠폰 적용 가능</span>
        <span className="ml-auto text-[10px] text-yellow-600 font-bold">SK페이 혜택 포함</span>
      </div>

      <div className="p-5">
        <h1 className="text-base font-black text-gray-900 mb-3 leading-tight">{productName}</h1>
        <PhotoSlot url={photos[0]} index={0} onClick={() => onPhotoClick(0)} />

        {sections.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="border-l-4 border-[#FF0000] pl-3 py-2 mb-3">
              <p className="text-[10px] font-black text-[#FF0000] uppercase tracking-wider mb-1">{s.name}</p>
              <h3 className="text-sm font-black text-gray-900 mb-1">{s.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
            {i === 1 && <PhotoSlot url={photos[1]} index={1} onClick={() => onPhotoClick(1)} />}
            {i === 3 && <PhotoSlot url={photos[2]} index={2} onClick={() => onPhotoClick(2)} />}
          </React.Fragment>
        ))}

        {/* 11번가 benefits */}
        <div className="bg-[#fff3cd] rounded-xl p-4 mt-3">
          <p className="text-xs font-black text-yellow-800 mb-2">🎁 11번가 전용 혜택</p>
          <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
            {['SK페이 5% 적립', '쿠폰 할인', '무료배송'].map(b => (
              <div key={b} className="bg-white rounded-lg py-2 font-bold text-gray-700 border border-yellow-200">{b}</div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#FF0000] p-4 text-center">
        <span className="text-white font-black text-sm">지금 구매하기 →</span>
      </div>
    </div>
  )
}
