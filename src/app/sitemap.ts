import { MetadataRoute } from 'next'
import { BLOG_POSTS } from '@/lib/blog'
import { EN_POSTS, JA_POSTS, ZH_POSTS } from '@/lib/blogMultilang'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://pagebeer.beer'
  const now = new Date()

  // Core pages
  const coreRoutes: MetadataRoute.Sitemap = [
    { url: base,         lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/en`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/ja`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/zh`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
  ]

  // Feature + SEO landing pages
  const featureRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/order/new`,                        lastModified: now, changeFrequency: 'weekly',  priority: 0.9  },
    // KR free tools (existing)
    { url: `${base}/samples`,                          lastModified: now, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${base}/tools/keyword-checker`,            lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    { url: `${base}/tools/seo-checker`,                lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    // EN free tools (existing)
    { url: `${base}/en/samples`,                       lastModified: now, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${base}/en/tools/keyword-checker`,         lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    { url: `${base}/en/tools/description-generator`,   lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    // FAQ (4 languages)
    { url: `${base}/faq`,                              lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/en/faq`,                           lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/ja/faq`,                           lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/zh/faq`,                           lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    // Compare pages
    { url: `${base}/compare/chatgpt`,                  lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    { url: `${base}/compare/outsourcing`,              lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    { url: `${base}/en/compare/chatgpt`,               lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    { url: `${base}/en/compare/outsourcing`,           lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    { url: `${base}/ja/compare/chatgpt`,               lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    { url: `${base}/zh/compare/chatgpt`,               lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    // Templates (4 languages)
    { url: `${base}/templates`,                        lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    { url: `${base}/en/templates`,                     lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    { url: `${base}/ja/templates`,                     lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    { url: `${base}/zh/templates`,                     lastModified: now, changeFrequency: 'monthly', priority: 0.8  },
    // Widget / Embed
    { url: `${base}/embed`,                            lastModified: now, changeFrequency: 'monthly', priority: 0.7  },
    { url: `${base}/en/embed`,                         lastModified: now, changeFrequency: 'monthly', priority: 0.7  },
    // Blog index
    { url: `${base}/blog`,                             lastModified: now, changeFrequency: 'daily',   priority: 0.85 },
    // Static pages
    { url: `${base}/login`,                            lastModified: now, changeFrequency: 'monthly', priority: 0.5  },
    { url: `${base}/privacy`,                          lastModified: now, changeFrequency: 'yearly',  priority: 0.2  },
    { url: `${base}/terms`,                            lastModified: now, changeFrequency: 'yearly',  priority: 0.2  },
  ]

  // KR sample category pages
  const SAMPLE_CATEGORIES = ['뷰티', '식품', '패션', '전자기기', '생활용품', '반려동물', '스포츠', '유아동']
  const sampleRoutes: MetadataRoute.Sitemap = SAMPLE_CATEGORIES.map(cat => ({
    url: `${base}/samples/${cat}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  // KR blog posts
  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map(post => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // EN blog posts
  const enBlogRoutes: MetadataRoute.Sitemap = EN_POSTS.map(post => ({
    url: `${base}/en/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // JA blog posts
  const jaBlogRoutes: MetadataRoute.Sitemap = JA_POSTS.map(post => ({
    url: `${base}/ja/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // ZH blog posts
  const zhBlogRoutes: MetadataRoute.Sitemap = ZH_POSTS.map(post => ({
    url: `${base}/zh/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    ...coreRoutes,
    ...featureRoutes,
    ...sampleRoutes,
    ...blogRoutes,
    ...enBlogRoutes,
    ...jaBlogRoutes,
    ...zhBlogRoutes,
  ]
}
