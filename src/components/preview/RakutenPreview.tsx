'use client'
import React from 'react'

interface Section { id: number; name: string; title: string; body: string }
interface Props { sections: Section[]; photos: string[]; productName: string; onPhotoClick: (i: number) => void }

function PhotoSlot({ url, index, onClick }: { url?: string; index: number; onClick: () => void }) {
  return (
    <div onClick={onClick} className="cursor-pointer w-full rounded-lg border-2 border-dashed border-[#BF0000]/30 bg-[#fff5f5] hover:border-[#BF0000] transition-all group my-3" style={{ minHeight: 150 }}>
      {url
        ? <img src={url} alt={`photo-${index}`} className="w-full object-cover rounded-lg" style={{ maxHeight: 300 }} />
        : <div className="flex flex-col items-center justify-center gap-1 py-10 text-[#BF0000]/40 group-hover:text-[#BF0000]">
            <span className="text-2xl">📷</span><span className="text-xs font-bold">写真を追加</span>
          </div>
      }
    </div>
  )
}

export default function RakutenPreview({ sections, photos, productName, onPhotoClick }: Props) {
  return (
    <div className="max-w-[680px] mx-auto bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      {/* Rakuten header */}
      <div className="bg-[#BF0000] px-5 py-3 flex items-center gap-3">
        <span className="text-white font-black text-base italic">Rakuten</span>
        <span className="text-white/60 text-xs">楽天市場</span>
        <span className="ml-auto bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded">ポイント2倍</span>
      </div>

      {/* Breadcrumb */}
      <div className="bg-[#f8f8f8] border-b border-gray-200 px-4 py-1.5 text-[10px] text-gray-500">
        楽天市場 &gt; ショッピング &gt; {productName}
      </div>

      <div className="p-5" style={{ fontFamily: 'Hiragino Kaku Gothic Pro, Meiryo, sans-serif' }}>
        <h1 className="text-base font-bold text-gray-900 mb-3 leading-tight">{productName}</h1>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-yellow-500 text-sm">★★★★★</span>
          <span className="text-[#BF0000] text-xs font-bold">4.8（1,234件）</span>
          <span className="ml-auto text-[10px] bg-[#BF0000] text-white px-2 py-0.5 rounded">送料無料</span>
        </div>

        <PhotoSlot url={photos[0]} index={0} onClick={() => onPhotoClick(0)} />

        {sections.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="border-b border-gray-100 py-4">
              <p className="text-[10px] font-bold text-[#BF0000] uppercase tracking-wider mb-1">【{s.name}】</p>
              <h3 className="text-sm font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
            {i === 2 && <PhotoSlot url={photos[1]} index={1} onClick={() => onPhotoClick(1)} />}
            {i === 4 && <PhotoSlot url={photos[2]} index={2} onClick={() => onPhotoClick(2)} />}
          </React.Fragment>
        ))}

        {/* Rakuten benefits */}
        <div className="bg-[#fff5f5] border border-[#BF0000]/20 rounded-xl p-4 mt-3">
          <p className="text-xs font-bold text-[#BF0000] mb-2">🎏 楽天購入特典</p>
          <div className="flex gap-2 flex-wrap text-[10px]">
            {['ポイント2倍', '送料無料', '30日返品', '楽天スーパーセール対象'].map(b => (
              <span key={b} className="bg-white border border-[#BF0000]/30 text-gray-700 px-2 py-1 rounded font-bold">{b}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#BF0000] p-4 text-center">
        <span className="text-white font-bold text-sm">今すぐご注文 →</span>
      </div>
    </div>
  )
}
