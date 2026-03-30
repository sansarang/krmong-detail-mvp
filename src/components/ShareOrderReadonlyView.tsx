import type { OrderPageUi } from '@/lib/orderPageUi'

const ACCENT_COLORS = ['#FF5C35', '#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6']
const BG_COLORS = ['#ffffff', '#fafafa', '#fff8f5', '#f0f7ff', '#f5fff8', '#fdf4ff']

type Section = { id: number; name: string; title: string; body: string }

export default function ShareOrderReadonlyView({
  imageUrls,
  sections,
  p,
}: {
  imageUrls: string[]
  sections: Section[]
  p: Pick<OrderPageUi, 'footerAi' | 'imgAlt'>
}) {
  return (
    <div
      className="mx-auto bg-white overflow-hidden"
      style={{
        maxWidth: '390px',
        borderRadius: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 20px 60px -10px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)',
      }}
    >
      {imageUrls.length > 0 && (
        <div>
          {imageUrls.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary storage URLs
            <img key={url + i} src={url} alt={p.imgAlt(i)} className="w-full object-cover" />
          ))}
        </div>
      )}

      {sections.map((section, i) => (
        <div
          key={section.id}
          className="px-6 py-10"
          style={{
            backgroundColor: BG_COLORS[i % BG_COLORS.length],
            borderTop: i > 0 ? '1px solid #f3f4f6' : 'none',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full" style={{ backgroundColor: ACCENT_COLORS[i % ACCENT_COLORS.length] }} />
            <span
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: ACCENT_COLORS[i % ACCENT_COLORS.length] }}
            >
              {section.name}
            </span>
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-3 leading-tight tracking-tight">{section.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{section.body}</p>
        </div>
      ))}

      <div className="px-6 py-8 bg-gray-50 text-center border-t border-gray-100">
        <p className="text-gray-300 text-xs font-medium">{p.footerAi}</p>
      </div>
    </div>
  )
}
