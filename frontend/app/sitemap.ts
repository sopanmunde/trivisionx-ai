import type { MetadataRoute } from "next";

const BASE_URL = "https://trivisionx-ai.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/features",
    "/pricing",
    "/docs",
    "/guides",
    "/blog",
    "/about",
    "/careers",
    "/contact",
    "/privacy",
    "/terms",
    "/security",
    "/cookies",
    "/licenses",
    "/demo",
    "/login",
    "/signup",
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1.0 : 0.7,
  }));
}
