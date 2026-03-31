import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Free AI Product Page Samples — Amazon JP, Shopify, Tmall | PageAI',
  description: 'Browse free AI-generated product page samples for Amazon JP, Shopify, Tmall and more. See how PageAI creates professional listings in 4 languages in 5 minutes.',
  keywords: ['AI product page samples', 'Amazon listing examples', 'Shopify product description sample', 'free product page generator'],
  alternates: { canonical: 'https://pagebeer.beer/en/samples' },
  openGraph: {
    title: 'Free AI Product Page Samples — Amazon JP, Shopify, Tmall',
    description: 'See real AI-generated product page samples by category.',
    url: 'https://pagebeer.beer/en/samples',
  },
}

const SAMPLES = [
  {
    category: 'Beauty',
    icon: '💄',
    cards: [
      {
        badge: '🌿 Vegan · Clean Beauty',
        title: '[Vegan Certified] Hyaluronic Acid Ampoule Serum 50ml — 72h Deep Hydration',
        markets: ['Amazon JP', 'Shopify'],
        preview: "Struggling with dry, tight skin? Our 5-layer hyaluronic acid complex penetrates deep into the dermis to deliver lasting moisture. Clinically tested on sensitive skin, fragrance-free and paraben-free. One pump, morning and evening — that's all it takes.",
        sections: ['Why it works', 'Key ingredients', 'How to apply', 'Skin type guide'],
      },
      {
        badge: '💄 Makeup',
        title: 'Long-Lasting Cushion Foundation SPF50+ PA+++ — 15g + Refill',
        markets: ['Amazon JP', 'Tmall'],
        preview: 'Full coverage that moves with your skin — not against it. Our cushion foundation delivers a natural semi-matte finish that lasts up to 14 hours without touch-ups. Available in 5 shades to match every complexion.',
        sections: ['Coverage technology', 'Staying power test', 'Shade guide', 'Application tips'],
      },
    ],
  },
  {
    category: 'Electronics',
    icon: '📱',
    cards: [
      {
        badge: '🎧 Audio',
        title: 'Hybrid ANC Wireless Earbuds Pro — 36h Playback, IPX5',
        markets: ['Amazon JP', 'Shopify'],
        preview: 'Block up to 98% of ambient noise with hybrid active noise cancellation. Three microphones isolate your voice perfectly during calls. With 36 hours of total playback, your music never stops.',
        sections: ['ANC technology', 'Sound profile', 'Battery & charging', 'App features'],
      },
      {
        badge: '⚡ Charging',
        title: 'Ultra-Slim 15W Wireless Charger — iPhone & Galaxy Compatible',
        markets: ['Amazon JP', 'Rakuten'],
        preview: 'At just 5mm thin and 60g, this wireless charger disappears on your desk. Charges to 80% in under 60 minutes at 15W. Certified by KC, FCC, and CE.',
        sections: ['Compatible models', 'Charging speed chart', 'Safety certifications', 'Setup guide'],
      },
    ],
  },
  {
    category: 'Food',
    icon: '🍎',
    cards: [
      {
        badge: '🌱 Organic',
        title: 'Organic Korean Bellflower & Pear Extract — 30 Packs, HACCP Certified',
        markets: ['Amazon JP', 'Tmall'],
        preview: 'One pack every morning — the easiest way to support respiratory health. Cold-extracted from 100% Korean-grown organic bellflower and pear, preserving all active compounds.',
        sections: ['Why bellflower + pear', 'Ingredient sourcing', 'Daily serving guide', 'Nutrition facts'],
      },
      {
        badge: '💪 High-Protein',
        title: 'Grilled Chicken Meal Prep 5-Pack — 25g Protein, Under 150kcal',
        markets: ['Shopify', 'Rakuten'],
        preview: 'Meal prep without the prep. Each pack delivers 25g of lean protein in under 150 calories — microwave in 3 minutes and ready.',
        sections: ['Macro breakdown', 'Flavor lineup', 'Storage instructions', 'Diet compatibility'],
      },
    ],
  },
  {
    category: 'Fashion',
    icon: '👗',
    cards: [
      {
        badge: '👗 Basics',
        title: 'Oversized Cotton Crewneck Sweatshirt — Unisex, 7 Colors, M–2XL',
        markets: ['Shopify', 'Amazon JP'],
        preview: 'The more you wash it, the better it gets. Made from 300g premium cotton fleece with a tight-knit construction that holds its shape wash after wash.',
        sections: ['Why this fabric', 'Wash & care', 'Size guide', 'Styling ideas'],
      },
      {
        badge: '👜 Bags',
        title: 'Minimalist Vegan Leather Crossbody Bag — Water-Resistant, Daily Carry',
        markets: ['Shopify', 'Tmall'],
        preview: 'Small enough to carry everywhere, smart enough to hold everything. Water-resistant vegan leather with main compartment, front zip pocket, and card slots.',
        sections: ['Storage layout', 'Material & durability', 'Size specs', 'Styling combos'],
      },
    ],
  },
  {
    category: 'Pet',
    icon: '🐾',
    cards: [
      {
        badge: '🐕 Dog · Food',
        title: 'Grain-Free Wild Salmon Dog Food — Sensitive Digestion Formula, 2kg',
        markets: ['Amazon JP', 'Shopify'],
        preview: 'Real wild-caught salmon as the #1 ingredient — 32% protein, zero corn, wheat, or soy. Formulated for dogs with sensitive stomachs.',
        sections: ['Why grain-free', 'Ingredient breakdown', 'Feeding guide', 'Allergy checklist'],
      },
      {
        badge: '🐱 Cat · Toys',
        title: 'Collapsible 3-Hole Cat Tunnel + Feather Wand Combo Set',
        markets: ['Amazon JP', 'Rakuten'],
        preview: 'Every day feels like a hunt. The crinkle-lined tunnel triggers natural stalking instincts, while the feather wand keeps play sessions exciting.',
        sections: ['Why cats love it', 'Material safety', 'Size & setup', 'Play techniques'],
      },
    ],
  },
  {
    category: 'Sports',
    icon: '💪',
    cards: [
      {
        badge: '🧘 Yoga',
        title: 'Eco-Friendly TPE Yoga Mat 6mm — Non-Slip, Foldable, Carry Strap',
        markets: ['Amazon JP', 'Shopify'],
        preview: 'Zero harmful chemicals, zero compromises. Our TPE yoga mat is free from PVC, latex, and heavy metals — confirmed by third-party lab tests.',
        sections: ['TPE vs PVC', 'Grip performance', 'Fold & carry guide', 'Beginner tips'],
      },
      {
        badge: '⛰ Outdoor',
        title: 'Ultralight Folding Trekking Poles — Aluminum, 110–135cm Adjustable',
        markets: ['Amazon JP', 'Shopify'],
        preview: 'At 185g each, aircraft-grade aluminum with a flip-lock system that deploys in 2 seconds. Ergonomic cork-composite grip reduces joint strain.',
        sections: ['Weight & strength', 'Wrist strap system', 'Height adjustment', 'Trail guide'],
      },
    ],
  },
  {
    category: 'Home',
    icon: '🏠',
    cards: [
      {
        badge: '🏠 Storage',
        title: 'No-Drill Wall Shelf — 15kg Load, Adhesive + Lock System',
        markets: ['Amazon JP', 'Shopify'],
        preview: 'No holes. No landlord drama. Our dual-lock adhesive system holds up to 15kg without a single nail. Removes cleanly with no residue.',
        sections: ['How the adhesive works', '5-step install guide', 'Load test results', 'Size options'],
      },
      {
        badge: '✨ Organization',
        title: 'Antibacterial Silicone Drawer Organizer 6-Set — Dishwasher Safe',
        markets: ['Shopify', 'Tmall'],
        preview: 'Made from food-grade silicone that inhibits bacterial growth and survives the dishwasher up to 100°C. Six sizes in one set.',
        sections: ['Antibacterial science', 'Full set contents', 'Use case guide', 'Cleaning & care'],
      },
    ],
  },
]

export default function EnSamplesPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <div className="border-b border-white/5 px-5 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/en" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg" />
            <span className="font-black text-white text-sm">PageAI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/en/tools/keyword-checker" className="text-xs text-gray-500 hover:text-white transition-colors">Keyword Checker</Link>
            <Link href="/login" className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">Start Free</Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-16">
        <div className="text-center mb-14">
          <span className="text-xs font-black bg-blue-500/15 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full mb-4 inline-block">
            Free Samples
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            Free AI Product Page Samples<br />— Amazon JP, Shopify, Tmall
          </h1>
          <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
            Real-quality AI-generated product listings by category. PageAI creates the same for your products in 4 languages — in under 5 minutes.
          </p>
        </div>

        <div className="space-y-14 mb-16">
          {SAMPLES.map(cat => (
            <div key={cat.category}>
              <h2 className="text-lg font-black text-white mb-5 flex items-center gap-2">
                <span>{cat.icon}</span> {cat.category}
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                {cat.cards.map((card, i) => (
                  <div key={i} className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black bg-blue-500/15 text-blue-400 px-2.5 py-1 rounded-full">{card.badge}</span>
                        <div className="flex gap-1">
                          {card.markets.map(m => (
                            <span key={m} className="text-[9px] font-bold bg-white/8 text-gray-400 px-1.5 py-0.5 rounded">{m}</span>
                          ))}
                        </div>
                      </div>
                      <h3 className="text-sm font-black text-white mb-3 leading-snug">{card.title}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-4">{card.preview}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {card.sections.map((s, j) => (
                          <span key={j} className="text-[10px] bg-white/5 border border-white/10 text-gray-500 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-white/5 px-6 py-4 bg-white/3 flex items-center justify-between">
                      <p className="text-xs text-gray-600">AI-generated sample</p>
                      <Link href="/login" className="text-xs font-black text-blue-400 hover:text-blue-300 transition-colors">
                        Generate Your Own with PageAI →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-3xl p-10">
          <h2 className="text-xl font-black text-white mb-3">Generate Your Product Page in 4 Languages</h2>
          <p className="text-gray-400 text-sm mb-6">Enter a product URL or paste your info — PageAI generates optimized listings for Amazon JP, Tmall, Shopify, Rakuten and more.</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3.5 rounded-2xl text-sm transition-all hover:shadow-xl hover:shadow-blue-500/30">
            Generate Your Own with PageAI →
          </Link>
        </div>
      </div>
    </main>
  )
}
