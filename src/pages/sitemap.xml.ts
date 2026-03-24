import type { GetServerSideProps } from "next";
import { getAllProducts } from "@/lib/repositories/productRepository";

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://rossyresinaonlineweb.vercel.app";
  const products = await getAllProducts();
  const now = new Date().toISOString();

  const staticUrls = ["/", "/productos", "/search", "/cart", "/checkout", "/contact", "/faq"];
  const categoryUrls = Array.from(
    new Set(products.map((p) => String(p.category || "").trim()).filter(Boolean))
  ).map((c) => `/categoria/${encodeURIComponent(c.toLowerCase().replace(/\s+/g, "-"))}`);
  const productUrls = products.map((p) => `/${encodeURIComponent(String(p.code || p._id))}`);

  const urls = Array.from(new Set([...staticUrls, ...categoryUrls, ...productUrls]));
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) => `<url><loc>${xmlEscape(`${siteUrl}${path}`)}</loc><lastmod>${now}</lastmod></url>`
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
