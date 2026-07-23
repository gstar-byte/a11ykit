import type { MetadataRoute } from "next";
import { liveTools } from "@/lib/tools";

export const dynamic = "force-static";

const BASE_URL = "https://a11ykit.site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/tools`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/accessibility-report`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];

  const toolPages: MetadataRoute.Sitemap = liveTools.map((tool) => ({
    url: `${BASE_URL}/tools/${tool.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...toolPages];
}
