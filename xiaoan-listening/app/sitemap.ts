import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://xiaoan-listening.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/write", "/plaza", "/joy", "/glow", "/music"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "daily",
    priority: path === "" ? 1 : 0.8,
  }));
}
