/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["i.ibb.co", "lh3.googleusercontent.com", "graph.facebook.com", "platform-lookaside.fbsbx.com"],
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "graph.facebook.com" },
      { protocol: "https", hostname: "platform-lookaside.fbsbx.com" },
    ],
  },
  async redirects() {
    const redirects = [
      {
        source: "/p/:slug",
        destination: "/:slug",
        permanent: false,
      },
      {
        source: "/c/:slug",
        destination: "/categoria/:slug",
        permanent: false,
      },
    ];

    if (process.env.TEMP_REDIRECT_TO_TIENDANUBE === "1") {
      const base = process.env.TIENDANUBE_URL || "https://rossyresina.mitiendanube.com";
      redirects.push({
        source: "/:path((?!api|_next|favicon.ico|robots.txt|sitemap.xml|site.webmanifest).*)",
        destination: `${base}/:path`,
        permanent: false,
      });
      redirects.push({
        source: "/",
        destination: base,
        permanent: false,
      });
    }

    return redirects;
  },
};

module.exports = nextConfig;
