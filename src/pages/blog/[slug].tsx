import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaPinterestP, FaWhatsapp } from "react-icons/fa";
import fs from "fs";
import path from "path";
import { sanitizeHumanText } from "@/lib/textFormat";

type Post = {
  slug: string;
  title: string;
  author: string;
  date: string;
  comments: number;
  content: string[];
  excerpt?: string;
  image?: string;
};

interface Props {
  post: Post;
  recent: Post[];
}

const normImg = (value?: string) => {
  const s = String(value || "").trim();
  if (!s) return "/images/hero/sliderImg_two.jpg";
  const u = s.replace(/\\/g, "/");
  if (/^https?:\/\//i.test(u)) return u;
  return u.startsWith("/") ? u : `/${u}`;
};

const fmtDate = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
};

const cleanPost = (p: any): Post => ({
  slug: String(p?.slug || ""),
  title: sanitizeHumanText(String(p?.title || "")),
  author: sanitizeHumanText(String(p?.author || "Rossy Resina")),
  date: String(p?.date || ""),
  comments: Number(p?.comments || 0),
  excerpt: sanitizeHumanText(String(p?.excerpt || "")),
  image: String(p?.image || ""),
  content: Array.isArray(p?.content)
    ? p.content.map((x: any) => sanitizeHumanText(String(x || "")))
    : [],
});

export default function BlogDetailPage({ post, recent }: Props) {
  const categories = [
    { href: "/categoria/resina", label: "Resina" },
    { href: "/categoria/moldes-de-silicona", label: "Moldes de silicona" },
    { href: "/categoria/pigmentos", label: "Pigmentos" },
    { href: "/categoria/accesorios", label: "Accesorios" },
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rossyresinaonlineweb.vercel.app";
  const postUrl = `${siteUrl}/blog/${encodeURIComponent(post.slug)}`;
  const shareText = `${post.title} | Blog Rossy Resina`;

  const shareLinks = [
    { href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, label: "Facebook", icon: <FaFacebookF /> },
    { href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}`, label: "Twitter", icon: <FaTwitter /> },
    { href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`, label: "LinkedIn", icon: <FaLinkedinIn /> },
    { href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(postUrl)}&description=${encodeURIComponent(shareText)}`, label: "Pinterest", icon: <FaPinterestP /> },
    { href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${postUrl}`)}`, label: "WhatsApp", icon: <FaWhatsapp /> },
  ];

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <Head>
        <title>{post?.title ? `${post.title} | Blog Rossy Resina` : "Blog Rossy Resina"}</title>
        <meta
          name="description"
          content={post?.excerpt || "Guías y recomendaciones para resina epóxica, moldes y pigmentos."}
        />
      </Head>

      <div className="mb-5 text-xs md:text-sm text-gray-500">
        <Link href="/" className="hover:text-amazon_blue">Inicio</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-amazon_blue">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{post.title}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 md:gap-8">
        <main>
          <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="relative h-64 md:h-[420px]">
              <Image src={normImg(post.image)} alt={post.title} fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-white/90">Blog Rossy Resina</p>
                <h1 className="mt-2 text-2xl md:text-4xl font-extrabold leading-tight max-w-4xl">{post.title}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs md:text-sm text-white/90">
                  <span>{post.author}</span>
                  <span>{fmtDate(post.date)}</span>
                  <span>{post.comments} comentarios</span>
                </div>
              </div>
            </div>

            <div className="p-5 md:p-8">
              {post.excerpt ? (
                <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm md:text-base text-blue-900">
                  {post.excerpt}
                </p>
              ) : null}

              <div className="mt-5 grid gap-4 text-[15px] leading-7 text-gray-800 md:text-base">
                {post.content.map((paragraph, i) => (
                  <p key={`${post.slug}-${i}`}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-8 border-t border-gray-100 pt-5">
                <p className="text-sm font-semibold text-gray-900">Compartir artículo</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {shareLinks.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.label}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:border-amazon_blue hover:text-amazon_blue transition"
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
            <h2 className="text-lg font-extrabold text-gray-900">Sobre la autora</h2>
            <div className="mt-3 flex items-start gap-3">
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-amazon_blue to-[#2c7be5]" />
              <div>
                <p className="font-semibold text-gray-900">{post.author}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Compartimos ideas aplicables para emprender con resina, mejorar tus acabados y vender con confianza.
                </p>
              </div>
            </div>
          </section>
        </main>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-base font-extrabold text-gray-900">Categorías</h3>
            <ul className="mt-3 grid gap-2">
              {categories.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="block rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-amazon_blue hover:text-amazon_blue transition">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-base font-extrabold text-gray-900">Entradas recientes</h3>
            <div className="mt-3 space-y-3">
              {recent.map((p) => (
                <article key={`recent-${p.slug}`} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <Link href={`/blog/${p.slug}`} className="text-sm font-semibold text-gray-900 hover:text-amazon_blue transition line-clamp-2">
                    {p.title}
                  </Link>
                  <p className="mt-1 text-xs text-gray-500">{fmtDate(p.date)}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#cb299e]/25 bg-gradient-to-b from-[#fff2fa] to-white p-5">
            <h3 className="text-base font-extrabold text-[#831f69]">Llévalo a la práctica</h3>
            <p className="mt-2 text-sm text-[#6f4a66]">
              Encuentra moldes, pigmentos y kits para aplicar las técnicas del artículo.
            </p>
            <Link href="/productos" className="mt-4 inline-flex rounded-full bg-[#cb299e] px-4 py-2 text-sm font-semibold text-white hover:brightness-95 transition">
              Ir a productos
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export const getServerSideProps = async (ctx: any) => {
  const slug = String(ctx.params.slug || "");
  try {
    const dataPath = path.join(process.cwd(), "src", "data", "blog.json");
    const raw = fs.readFileSync(dataPath, "utf-8");
    const items = JSON.parse(raw);
    const posts = (Array.isArray(items) ? items : []).map(cleanPost);
    const post = posts.find((p: Post) => String(p.slug) === slug);
    if (!post) return { notFound: true };
    const recent = posts.filter((p: Post) => String(p.slug) !== slug).slice(0, 4);
    return { props: { post, recent } };
  } catch {
    return { notFound: true };
  }
};
