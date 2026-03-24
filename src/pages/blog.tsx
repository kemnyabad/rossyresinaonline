import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import fs from "fs";
import path from "path";
import { sanitizeHumanText } from "@/lib/textFormat";

type Post = {
  slug: string;
  title: string;
  author: string;
  date: string;
  comments: number;
  excerpt: string;
  image?: string;
};

interface Props {
  posts: Post[];
}

const normImg = (value?: string) => {
  const s = String(value || "").trim();
  if (!s) return "/images/hero/sliderImg_one.jpg";
  const u = s.replace(/\\/g, "/");
  if (/^https?:\/\//i.test(u)) return u;
  return u.startsWith("/") ? u : `/${u}`;
};

const fmtDate = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
};

const readingMinutes = (text: string) => {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
};

const cleanPost = (p: any): Post => ({
  slug: String(p?.slug || ""),
  title: sanitizeHumanText(String(p?.title || "")),
  author: sanitizeHumanText(String(p?.author || "Rossy Resina")),
  date: String(p?.date || ""),
  comments: Number(p?.comments || 0),
  excerpt: sanitizeHumanText(String(p?.excerpt || "")),
  image: String(p?.image || ""),
});

export default function BlogPage({ posts }: Props) {
  const categories = [
    { href: "/categoria/resina", label: "Resina" },
    { href: "/categoria/moldes-de-silicona", label: "Moldes de silicona" },
    { href: "/categoria/pigmentos", label: "Pigmentos" },
    { href: "/categoria/accesorios", label: "Accesorios" },
    { href: "/categoria/creaciones", label: "Creaciones" },
    { href: "/categoria/talleres", label: "Talleres" },
  ];

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <Head>
        <title>Blog | Rossy Resina</title>
        <meta
          name="description"
          content="Guías, ideas y tendencias de resina epóxica: moldes, pigmentos y acabados para emprender."
        />
      </Head>

      <section className="relative overflow-hidden rounded-2xl border border-[#1f5eb5]/20 bg-gradient-to-r from-[#0f4ba2] via-[#2a66c8] to-[#4b77d1] p-6 md:p-10 text-white">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute left-0 bottom-0 h-24 w-24 rounded-full bg-[#ffde59]/35 blur-xl" />
        <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-white/90">Blog Rossy Resina</p>
        <h1 className="mt-2 text-3xl md:text-5xl font-extrabold leading-tight">
          Contenido útil para vender más con resina
        </h1>
        <p className="mt-3 max-w-3xl text-sm md:text-lg text-white/90">
          Tutoriales, recomendaciones de materiales y estrategias para mejorar tus acabados y crecer tu marca.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs md:text-sm">
          <span className="rounded-full bg-white/15 px-3 py-1">Guías prácticas</span>
          <span className="rounded-full bg-white/15 px-3 py-1">Novedades semanales</span>
          <span className="rounded-full bg-white/15 px-3 py-1">Enfoque comercial</span>
        </div>
      </section>

      <div className="mt-7 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 md:gap-8">
        <main className="space-y-6">
          {featured ? (
            <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <Link href={`/blog/${featured.slug}`} className="block relative h-64 md:h-80">
                <Image src={normImg(featured.image)} alt={featured.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/85">Destacado</p>
                  <h2 className="mt-1 text-2xl md:text-3xl font-bold leading-tight">{featured.title}</h2>
                  <p className="mt-2 text-sm text-white/85 line-clamp-2">{featured.excerpt}</p>
                </div>
              </Link>
              <div className="p-4 md:p-5 flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{featured.author}</span>
                <span>{fmtDate(featured.date)}</span>
                <span>{featured.comments} comentarios</span>
                <span>{readingMinutes(featured.excerpt)} min lectura</span>
              </div>
            </article>
          ) : null}

          {rest.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {rest.map((p) => (
                <article key={p.slug} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition">
                  <Link href={`/blog/${p.slug}`} className="block relative h-44">
                    <Image src={normImg(p.image)} alt={p.title} fill className="object-cover group-hover:scale-[1.02] transition duration-300" />
                  </Link>
                  <div className="p-4">
                    <h3 className="text-lg font-bold leading-snug text-gray-900 line-clamp-2">
                      <Link href={`/blog/${p.slug}`} className="hover:text-amazon_blue transition">
                        {p.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{p.excerpt}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>{p.author}</span>
                      <span>{fmtDate(p.date)}</span>
                      <span>{p.comments} comentarios</span>
                    </div>
                    <Link href={`/blog/${p.slug}`} className="mt-4 inline-flex rounded-full border border-amazon_blue px-4 py-1.5 text-xs font-semibold text-amazon_blue hover:bg-amazon_blue hover:text-white transition">
                      Leer artículo
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
              Aún no hay publicaciones. Crea entradas desde el panel admin para activar el blog.
            </div>
          ) : null}
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
              {posts.slice(0, 4).map((p) => (
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
            <h3 className="text-base font-extrabold text-[#831f69]">¿Lista para crear?</h3>
            <p className="mt-2 text-sm text-[#6f4a66]">
              Explora kits y moldes para aplicar lo aprendido en cada guía del blog.
            </p>
            <Link href="/productos" className="mt-4 inline-flex rounded-full bg-[#cb299e] px-4 py-2 text-sm font-semibold text-white hover:brightness-95 transition">
              Ver productos
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export const getServerSideProps = async () => {
  try {
    const dataPath = path.join(process.cwd(), "src", "data", "blog.json");
    const raw = fs.readFileSync(dataPath, "utf-8");
    const items = JSON.parse(raw);
    const posts = (Array.isArray(items) ? items : []).map(cleanPost);
    return { props: { posts } };
  } catch {
    return { props: { posts: [] } };
  }
};
