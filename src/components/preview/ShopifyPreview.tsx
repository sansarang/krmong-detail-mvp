'use client'
import React from 'react'

interface Section { id: number; name: string; title: string; body: string }
interface Props { sections: Section[]; photos: string[]; productName: string; onPhotoClick: (i: number) => void }

function PhotoSlot({ url, index, onClick }: { url?: string; index: number; onClick: () => void }) {
  return (
    <div onClick={onClick} className="cursor-pointer w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-500 transition-all group my-4" style={{ minHeight: 180 }}>
      {url
        ? <img src={url} alt={`photo-${index}`} className="w-full object-cover rounded-2xl" style={{ maxHeight: 360 }} />
        : <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400 group-hover:text-gray-600">
            <span className="text-3xl">📷</span><span className="text-xs font-bold">Click to add photo</span>
          </div>
      }
    </div>
  )
}

export default function ShopifyPreview({ sections, photos, productName, onPhotoClick }: Props) {
  return (
    <div className="max-w-[680px] mx-auto bg-[#f8f9fa] rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      {/* Shopify store header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
        <span className="font-black text-gray-900 text-sm tracking-tight">{productName.split(' ')[0].toUpperCase()} STORE</span>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Shop</span><span>About</span><span>🛒 0</span>
        </div>
      </div>

      <div className="p-6">
        {/* Hero */}
        <PhotoSlot url={photos[0]} index={0} onClick={() => onPhotoClick(0)} />

        {/* Product header */}
        <div className="mb-6">
          <p className="text-[10px] font-black text-[#96BF48] uppercase tracking-widest mb-1">Premium Collection</p>
          <h1 className="text-xl font-black text-gray-900 mb-2 leading-tight">{productName}</h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm line-through">$89.99</span>
            <span className="text-2xl font-black text-gray-900">$69.99</span>
            <span className="bg-[#96BF48] text-white text-[10px] font-black px-2 py-0.5 rounded-full">SAVE 22%</span>
          </div>
        </div>

        {/* Sections — brand storytelling style */}
        {sections.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className={`rounded-2xl p-5 mb-4 ${i % 2 === 0 ? 'bg-white border border-gray-100 shadow-sm' : 'bg-gray-900 text-white'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${i % 2 === 0 ? 'text-[#96BF48]' : 'text-[#96BF48]'}`}>{s.name}</p>
              <h3 className={`text-base font-black mb-2 leading-snug ${i % 2 === 0 ? 'text-gray-900' : 'text-white'}`}>{s.title}</h3>
              <p className={`text-sm leading-relaxed whitespace-pre-line ${i % 2 === 0 ? 'text-gray-600' : 'text-gray-300'}`}>{s.body}</p>
            </div>
            {(i === 1 || i === 3) && <PhotoSlot url={photos[i === 1 ? 1 : 2]} index={i === 1 ? 1 : 2} onClick={() => onPhotoClick(i === 1 ? 1 : 2)} />}
          </React.Fragment>
        ))}

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-3 text-center mt-2">
          {['Free Shipping', '30-Day Returns', 'Secure Checkout'].map(b => (
            <div key={b} className="bg-white border border-gray-100 rounded-xl py-3 text-[10px] font-bold text-gray-700 shadow-sm">{b}</div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-900 p-5 text-center">
        <div className="bg-[#96BF48] text-white py-3 rounded-xl font-black text-sm mb-2">Add to Cart — $69.99</div>
        <p className="text-gray-500 text-[10px]">Join 5,000+ happy customers · Free shipping over $50</p>
      </div>
    </div>
  )
}
