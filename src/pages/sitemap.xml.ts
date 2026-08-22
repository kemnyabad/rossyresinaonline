import type { GetServerSideProps } from "next";
import { getAllProducts } from "@/lib/repositories/productRepository";
import { getSiteUrl } from "@/lib/seo";

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const siteUrl = getSiteUrl();
  const products = await getAllProducts();
  const now = new Date().toISOString();

  const staticUrls = [
    "/",
    "/productos",
    "/productos?ofertas=1",
    "/categoria/resina",
    "/categoria/moldes-de-silicona",
    "/categoria/pigmentos",
    "/categoria/accesorios",
    "/categoria/creaciones",
    "/escuela",
    "/mayoristas",
    "/contact",
    "/faq",
    "/about-us",
    "/proceso-envio",
    "/privacy",
    "/terms",
  ];
  const dynamicCategoryUrls = Array.from(
    new Set(
      products
        .map((p: any) => String(p.category || "").trim())
        .filter(Boolean)
        .map((category) =>
          `/categoria/${encodeURIComponent(
            category
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "")
          )}`
        )
    )
  );
  const productUrls = products
    .filter((p: any) => p.slug)
    .map((p: any) => ({
      path: `/${encodeURIComponent(String(p.slug))}`,
      lastmod: new Date(p.updatedAt || p.createdAt || now).toISOString(),
    }));

  const urls = [
    ...Array.from(new Set([...staticUrls, ...dynamicCategoryUrls])).map((path) => ({ path, lastmod: now })),
    ...productUrls,
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ path, lastmod }) => {
      const priority = path === "/" ? "1.0" : path.startsWith("/categoria") || path === "/productos" ? "0.8" : path.startsWith("/") && !path.includes("?") ? "0.7" : "0.6";
      const changefreq = path === "/" || path === "/productos" || path.startsWith("/categoria") ? "daily" : "weekly";
      return `<url><loc>${xmlEscape(`${siteUrl}${path}`)}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
    }
  )
  .join("")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.write(body);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
