import { content } from "@/content";

const siteUrl = content.seo.siteUrl;

export const SEO = {
  siteUrl,
  siteName: content.brand.name,
  title: content.seo.title,
  description: content.seo.description,
  ogImagePath: content.seo.ogImagePath,
  canonical: content.seo.canonical
} as const;
