export type MetaOgPackage = {
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogType: string
  ogUrl: string
  twitterCard: string
  twitterTitle: string
  twitterDescription: string
}

function escAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/\n/g, ' ')
}

/** NEXT_PUBLIC_SITE_URL optional — falls back to placeholder */
export function buildMetaOgPackage(input: {
  productName: string
  category: string
  metaTitle: string
  metaDescription: string
  ogImageUrl?: string | null
  pathOrSlug?: string
}): MetaOgPackage {
  const base =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')) ||
    'https://example.com'
  const path = input.pathOrSlug?.startsWith('/') ? input.pathOrSlug : `/${input.pathOrSlug ?? 'product'}`
  const ogUrl = `${base}${path}`
  const desc = input.metaDescription.slice(0, 160)

  return {
    title: input.metaTitle.slice(0, 70),
    description: desc,
    ogTitle: input.metaTitle.slice(0, 70),
    ogDescription: desc,
    ogImage: input.ogImageUrl?.trim() || '',
    ogType: 'article',
    ogUrl,
    twitterCard: 'summary_large_image',
    twitterTitle: input.metaTitle.slice(0, 70),
    twitterDescription: desc,
  }
}

export function metaOgPackageToJson(pkg: MetaOgPackage): string {
  return JSON.stringify(
    {
      title: pkg.title,
      description: pkg.description,
      openGraph: {
        title: pkg.ogTitle,
        description: pkg.ogDescription,
        type: pkg.ogType,
        url: pkg.ogUrl,
        images: pkg.ogImage ? [{ url: pkg.ogImage }] : [],
      },
      twitter: {
        card: pkg.twitterCard,
        title: pkg.twitterTitle,
        description: pkg.twitterDescription,
        images: pkg.ogImage ? [pkg.ogImage] : [],
      },
    },
    null,
    2,
  )
}

export function metaOgPackageToHtmlMeta(pkg: MetaOgPackage): string {
  const lines = [
    `<title>${escAttr(pkg.title)}</title>`,
    `<meta name="description" content="${escAttr(pkg.description)}" />`,
    `<meta property="og:title" content="${escAttr(pkg.ogTitle)}" />`,
    `<meta property="og:description" content="${escAttr(pkg.ogDescription)}" />`,
    `<meta property="og:type" content="${escAttr(pkg.ogType)}" />`,
    `<meta property="og:url" content="${escAttr(pkg.ogUrl)}" />`,
  ]
  if (pkg.ogImage) {
    lines.push(`<meta property="og:image" content="${escAttr(pkg.ogImage)}" />`)
  }
  lines.push(`<meta name="twitter:card" content="${escAttr(pkg.twitterCard)}" />`)
  lines.push(`<meta name="twitter:title" content="${escAttr(pkg.twitterTitle)}" />`)
  lines.push(`<meta name="twitter:description" content="${escAttr(pkg.twitterDescription)}" />`)
  if (pkg.ogImage) {
    lines.push(`<meta name="twitter:image" content="${escAttr(pkg.ogImage)}" />`)
  }
  return `${lines.join('\n')}\n`
}
