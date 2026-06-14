import type { MetadataRoute } from "next"

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ajrniplus.com"

const staticRoutes = [
  "",
  "/cars",
  "/offices",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/favorites",
  "/auth/login",
  "/auth/register",
]

export default function sitemap(): MetadataRoute.Sitemap {
  return staticRoutes.map((route) => ({
    url: `${BASE}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/cars" || route === "/offices" ? "daily" : "monthly" as any,
    priority: route === "" ? 1 : route === "/cars" ? 0.9 : route === "/offices" ? 0.8 : 0.5,
  }))
}
