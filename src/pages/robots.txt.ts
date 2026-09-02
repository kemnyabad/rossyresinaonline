import type { GetServerSideProps } from "next";
import { getSiteUrl } from "@/lib/seo";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const siteUrl = getSiteUrl();
  const body = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /account
Disallow: /cart
Disallow: /checkout
Disallow: /shipping-address
Disallow: /success
Disallow: /search
Sitemap: ${siteUrl}/sitemap.xml
`;

  res.setHeader("Content-Type", "text/plain");
  res.write(body);
  res.end();
  return { props: {} };
};

export default function Robots() {
  return null;
}
