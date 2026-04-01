'use client'
import React from 'react'

interface Section { id: number; name: string; title: string; body: string }
interface Props {
  sections: Section[]
  photos: string[]
  productName: string
  onPhotoClick: (index: number) => void
}

function PhotoSlot({ url, index, onClick }: { url?: string; index: number; onClick: () => void }) {
  return (
    <div onClick={onClick} className="cursor-pointer my-4 w-full overflow-hidden rounded-xl border-2 border-dashed border-[#03C75A]/40 bg-[#f0fdf4] hover:border-[#03C75A] transition-all group" style={{ minHeight: 180 }}>
      {url
        ? <img src={url} alt={`photo-${index}`} className="w-full object-cover" style={{ maxHeight: 360 }} />
        : <div className="flex flex-col items-center justify-center gap-2 py-12 text-[#03C75A]/60 group-hover:text-[#03C75A]">
            <span className="text-3xl">📷</span>
            <span className="text-xs font-bold">클릭하여 사진 추가</span>
          </div>
      }
    </div>
  )
}

export default function NaverBlogPreview({ sections, photos, productName, onPhotoClick }: Props) {
  const PHOTO_AFTER = [0, 2, 4]
  return (
    <div className="max-w-[680px] mx-auto bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
      {/* Naver Blog Header */}
      <div className="bg-[#03C75A] px-5 py-3 flex items-center gap-3">
        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center font-black text-[#03C75A] text-sm">N</div>
        <span className="text-white font-bold text-sm">네이버 블로그</span>
        <span className="ml-auto text-white/70 text-xs">미리보기</span>
      </div>
      {/* Blog toolbar */}
      <div className="bg-[#f4f4f4] border-b border-gray-200 px-4 py-2 flex gap-3 text-xs text-gray-500">
        <span className="font-bold text-gray-700">{productName}</span>
        <span>·</span><span>리뷰</span><span>·</span><span>오늘</span>
      </div>

      <div className="p-5 font-sans" style={{ fontFamily: "'Apple SD Gothic Neo', Malgun Gothic, sans-serif" }}>
        {/* Hero */}
        <PhotoSlot url={photos[0]} index={0} onClick={() => onPhotoClick(0)} />

        {/* Title */}
        <div className="text-center py-5 border-b-2 border-gray-900 mb-5">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest mb-1">PRODUCT REVIEW</p>
          <h1 className="text-xl font-black text-gray-900 leading-tight">{productName}</h1>
        </div>

        {/* Sections */}
        {sections.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className={`rounded-xl p-5 mb-4 ${i % 2 === 0 ? 'bg-white border border-gray-100' : 'bg-[#f9f9f9]'}`}>
              <p className="text-[10px] font-bold text-[#03C75A] uppercase tracking-widest mb-1">{s.name}</p>
              <h2 className="text-base font-black text-gray-900 mb-3 leading-snug">{s.title}</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
            {PHOTO_AFTER.includes(i) && (
              <PhotoSlot url={photos[PHOTO_AFTER.indexOf(i) + 1]} index={PHOTO_AFTER.indexOf(i) + 1} onClick={() => onPhotoClick(PHOTO_AFTER.indexOf(i) + 1)} />
            )}
          </React.Fragment>
        ))}

        {/* CTA */}
        <div className="bg-gray-900 rounded-xl p-5 text-center mt-4">
          <p className="text-white font-black mb-3 text-sm">지금 바로 구매하러 가기 →</p>
          <span className="inline-block bg-[#03C75A] text-white text-xs font-bold px-5 py-2 rounded-full">구매 링크</span>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-3">페이지AI로 자동 생성된 콘텐츠입니다.</p>
      </div>
    </div>
  )
}
