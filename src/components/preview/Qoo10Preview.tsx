'use client'
import React from 'react'

interface Section { id: number; name: string; title: string; body: string }
interface Props { sections: Section[]; photos: string[]; productName: string; onPhotoClick: (i: number) => void }

function PhotoSlot({ url, index, onClick }: { url?: string; index: number; onClick: () => void }) {
  return (
    <div onClick={onClick} className="cursor-pointer w-full rounded-lg border-2 border-dashed border-[#FF7300]/30 bg-[#fff8f0] hover:border-[#FF7300] transition-all group my-3" style={{ minHeight: 150 }}>
      {url
        ? <img src={url} alt={`photo-${index}`} className="w-full object-cover rounded-lg" style={{ maxHeight: 300 }} />
        : <div className="flex flex-col items-center justify-center gap-1 py-10 text-[#FF7300]/40 group-hover:text-[#FF7300]">
            <span className="text-2xl">📷</span><span className="text-xs font-bold">写真を追加</span>
          </div>
      }
    </div>
  )
}

export default function Qoo10Preview({ sections, photos, productName, onPhotoClick }: Props) {
  return (
    <div className="max-w-[480px] mx-auto bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      {/* Qoo10 header */}
      <div className="bg-[#FF7300] px-5 py-3 flex items-center gap-3">
        <span className="text-white font-black text-base">Qoo10</span>
        <span className="ml-auto flex gap-1">
          <span className="bg-yellow-300 text-black text-[9px] font-black px-2 py-0.5 rounded">Mega Week</span>
        </span>
      </div>

      {/* Deal banner */}
      <div className="bg-[#fff3e0] border-b border-[#FF7300]/30 px-4 py-2 flex items-center gap-2">
        <span className="text-[#FF7300] font-black text-xs">🔶 本日限定 30%OFF</span>
        <span className="ml-auto text-[10px] text-[#FF7300] font-bold">クーポン適用可</span>
      </div>

      <div className="p-4" style={{ fontFamily: 'Hiragino Kaku Gothic Pro, Meiryo, sans-serif' }}>
        <h1 className="text-sm font-bold text-gray-900 mb-2 leading-tight">{productName}</h1>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-yellow-500 text-sm">★★★★☆</span>
          <span className="text-gray-600 text-xs">4.2（567件）</span>
          <span className="ml-auto text-xs font-black text-[#FF7300]">¥2,980</span>
        </div>

        <PhotoSlot url={photos[0]} index={0} onClick={() => onPhotoClick(0)} />

        {sections.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="border border-gray-100 rounded-xl p-3 mb-2 bg-white">
              <p className="text-[10px] font-bold text-[#FF7300] mb-1">【{s.name}】</p>
              <h3 className="text-xs font-bold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
            {i === 1 && <PhotoSlot url={photos[1]} index={1} onClick={() => onPhotoClick(1)} />}
          </React.Fragment>
        ))}

        <div className="bg-[#fff3e0] rounded-xl p-3 mt-2 text-[10px] text-gray-600">
          <p className="font-bold text-[#FF7300] mb-1">📦 配送・返品</p>
          <p>送料無料 · 7日間返品可 · セラー評価 ★4.8</p>
        </div>
      </div>

      <div className="bg-[#FF7300] p-3 text-center">
        <span className="text-white font-bold text-sm">今すぐ購入 →</span>
      </div>
    </div>
  )
}
