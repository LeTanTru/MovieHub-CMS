---
name: nextjs-seo
description: >
  Comprehensive guide for implementing SEO in Next.js (App Router). Use this skill
  whenever a user asks about SEO in Next.js, improving search rankings for a Next.js
  app, metadata, sitemaps, robots.txt, structured data, Core Web Vitals, or any
  question about making a Next.js site discoverable by search engines. Trigger even
  for partial questions like "how do I add meta tags", "next.js sitemap", "open graph
  next.js", or "why is my next.js site not ranking".
---

# Next.js SEO Skill

A complete reference for production-grade SEO in Next.js App Router.

## 1. Metadata API

### Static metadata

```ts
// app/page.tsx or any layout/page
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description (150–160 chars ideal)',
  keywords: ['nextjs', 'seo'],
  openGraph: {
    title: 'OG Title',
    description: 'OG Description',
    url: 'https://example.com',
    siteName: 'Site Name',
    images: [{ url: 'https://example.com/og.png', width: 1200, height: 630 }],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Twitter Title',
    description: 'Twitter Description',
    images: ['https://example.com/og.png']
  },
  alternates: {
    canonical: 'https://example.com/page-slug'
  }
};
```

### Dynamic metadata

```ts
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `https://example.com/blog/${params.slug}` },
    openGraph: {
      title: post.title,
      images: [{ url: post.coverImage }]
    }
  };
}
```

### Title templates (in root layout)

```ts
export const metadata: Metadata = {
  title: { template: '%s | Site Name', default: 'Site Name' }
};
```

---

## 2. Sitemap

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchAllPosts();

  return [
    {
      url: 'https://example.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: 'https://example.com/about',
      changeFrequency: 'monthly',
      priority: 0.8
    },
    ...posts.map((post) => ({
      url: `https://example.com/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6
    }))
  ];
}
```

---

## 3. Robots

```ts
// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/private/', '/api/'] }],
    sitemap: 'https://example.com/sitemap.xml'
  };
}
```

---

## 4. Structured Data (JSON-LD)

Add as a `<script>` in the page or layout — no extra packages needed:

```tsx
// Reusable component
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Usage in a blog post page
<JsonLd
  data={{
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: post.author },
    image: post.coverImage
  }}
/>;
```

Common schema types: `Article`, `Product`, `BreadcrumbList`, `FAQPage`, `Organization`, `WebSite`.

---

## 5. Rendering Strategy

| Use case                     | Strategy | Next.js mechanism                        |
| ---------------------------- | -------- | ---------------------------------------- |
| Blog posts, marketing pages  | SSG      | `generateStaticParams` + no `revalidate` |
| Content updated occasionally | ISR      | `export const revalidate = 3600`         |
| User-specific or real-time   | SSR      | `export const dynamic = 'force-dynamic'` |
| Avoid for indexed content    | CSR      | —                                        |

ISR example:

```ts
export const revalidate = 3600; // revalidate every hour

export async function generateStaticParams() {
  const posts = await fetchAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}
```

---

## 6. Canonical URLs

Always set canonicals to prevent duplicate-content penalties (paginated pages, UTM params, etc.):

```ts
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://example.com/blog/my-post',
    languages: {
      'en-US': '/en-US/blog/my-post',
      'de-DE': '/de-DE/blog/my-post'
    }
  }
};
```

---

## 7. Core Web Vitals

- **Fonts** — use `next/font` to eliminate CLS from font loading:
  ```ts
  import { Inter } from 'next/font/google';
  const inter = Inter({ subsets: ['latin'], display: 'swap' });
  ```
- **Images** — always use `next/image`; fill in `alt`, set `priority` on LCP images:
  ```tsx
  <Image src={hero} alt='Hero image' priority width={1200} height={630} />
  ```
- **JS bundle** — prefer Server Components; use `next/dynamic` with `ssr: false` only for truly client-only heavy libs
- **Analyze bundle**: `ANALYZE=true next build` with `@next/bundle-analyzer`

---

## 8. Redirects & Headers (`next.config.ts`)

```ts
const config: NextConfig = {
  async redirects() {
    return [{ source: '/old-slug', destination: '/new-slug', permanent: true }];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'X-Robots-Tag', value: 'index, follow' }]
      }
    ];
  }
};
```

---

## 9. URL Structure Best Practices

- Lowercase, hyphen-separated slugs: `/blog/nextjs-seo-guide`
- Avoid query strings for indexable content — use path segments instead
- Keep URLs short and descriptive
- Never change a URL without a 301 redirect

---

## 10. Checklist

- [ ] `title` and `description` on every page (unique, within character limits)
- [ ] Open Graph + Twitter card metadata
- [ ] Canonical URL on every indexable page
- [ ] `app/sitemap.ts` submitted to Google Search Console
- [ ] `app/robots.ts` configured
- [ ] JSON-LD structured data on key page types
- [ ] `next/image` with `alt` on all images; `priority` on LCP image
- [ ] `next/font` for all fonts
- [ ] SSG or ISR for all indexable content (not SSR/CSR)
- [ ] 301 redirects for any changed URLs
- [ ] Google Search Console connected + sitemap submitted
- [ ] Lighthouse CI in pipeline to catch regressions

---

## Reference files

- `references/schema-types.md` — Common JSON-LD schema examples (Article, Product, FAQ, Breadcrumb, Organization)
