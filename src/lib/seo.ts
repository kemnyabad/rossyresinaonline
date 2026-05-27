export const SITE_NAME = "Rossy Resina";
export const DEFAULT_SITE_URL = "https://rossyresina.vercel.app";
export const DEFAULT_OG_IMAGE = "/web-app-manifest-512x512.png";

const isLocalUrl = (value?: string) => /localhost|127\.0\.0\.1/i.test(String(value || ""));

export const getSiteUrl = () => {
  const publicUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const authUrl = process.env.NEXTAUTH_URL;
  const siteUrl = publicUrl || (isLocalUrl(authUrl) ? "" : authUrl) || DEFAULT_SITE_URL;
  return String(siteUrl).replace(/\/+$/, "");
};

export const absoluteUrl = (path = "/") => {
  const siteUrl = getSiteUrl();
  const value = String(path || "/").trim();
  if (/^https?:\/\//i.test(value)) return value;
  return `${siteUrl}${value.startsWith("/") ? value : `/${value}`}`;
};

export const absoluteImageUrl = (image?: string) => {
  const value = String(image || DEFAULT_OG_IMAGE).trim().replace(/\\/g, "/");
  if (/^https?:\/\//i.test(value)) return value;
  return absoluteUrl(value || DEFAULT_OG_IMAGE);
};

export const truncateMeta = (value: string, max = 155) => {
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
};

export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: getSiteUrl(),
  logo: absoluteImageUrl("/web-app-manifest-512x512.png"),
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+51 966 357 648",
      contactType: "customer service",
      areaServed: "PE",
      availableLanguage: "es",
    },
  ],
  sameAs: [
    "https://facebook.com",
    "https://instagram.com",
    "https://tiktok.com",
  ],
});

export const websiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: getSiteUrl(),
  potentialAction: {
    "@type": "SearchAction",
    target: `${getSiteUrl()}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const breadcrumbJsonLd = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.url),
  })),
});
