import { MetadataRoute } from 'next'
import { BLOG_POSTS } from '@/lib/blog'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://pagebeer.beer'
  const now = new Date()

  // Core pages — highest priority
  const coreRoutes: MetadataRoute.Sitemap = [
    { url: base,           lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/en`,   lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/ja`,   lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/zh`,   lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
  ]

  // Feature landing pages — high crawl priority
  const featureRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/order/new`,                       lastModified: now, changeFrequency: 'weekly',  priority: 0.9  },
    // KR free tools
    { url: `${base}/samples`,                         lastModified: now, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${base}/tools/keyword-checker`,           lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    { url: `${base}/tools/seo-checker`,               lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    // EN free tools
    { url: `${base}/en/samples`,                      lastModified: now, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${base}/en/tools/keyword-checker`,        lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    { url: `${base}/en/tools/description-generator`,  lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    // other
    { url: `${base}/blog`,    lastModified: now, changeFrequency: 'daily',   priority: 0.85 },
    { url: `${base}/login`,   lastModified: now, changeFrequency: 'monthly', priority: 0.5  },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly',  priority: 0.2  },
    { url: `${base}/terms`,   lastModified: now, changeFrequency: 'yearly',  priority: 0.2  },
  ]

  const SAMPLE_CATEGORIES = ['뷰티', '식품', '패션', '전자기기', '생활용품', '반려동물', '스포츠', '유아동']
  const sampleRoutes: MetadataRoute.Sitemap = SAMPLE_CATEGORIES.map(cat => ({
    url: `${base}/samples/${cat}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map(post => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...coreRoutes, ...featureRoutes, ...sampleRoutes, ...blogRoutes]
}
