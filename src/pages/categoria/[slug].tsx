import Head from "next/head";
import Link from "next/link";
import Products from "@/components/Products";
import type { ProductProps } from "../../../type";
import { getAllProducts } from "@/lib/repositories/productRepository";

const slugToCategory: Record<string, string> = {
  resina: "Resinas",
  "moldes-de-silicona": "Moldes de silicona",
  pigmentos: "Pigmentos",
  accesorios: "Accesorios",
  creaciones: "Creaciones",
  talleres: "Talleres",
};

const toCategorySlug = (value: any): string =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

interface Props {
  slug: string;
  label: string | null;
  items: ProductProps[];
}

export default function CategoryPage({ slug, label, items }: Props) {
  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8">
      <Head>
        <title>Rossy Resina - {label || "Categoría"}</title>
        <meta
          name="description"
          content={
            label
              ? `Compra ${label} en Rossy Resina. Resina, moldes, pigmentos y más.`
              : "Explora nuestras categorías de productos."
          }
        />
        <meta property="og:title" content={`Rossy Resina - ${label || "Categoría"}`} />
        <meta
          property="og:description"
          content={label ? `Compra ${label} en Rossy Resina.` : "Explora nuestras categorías de productos."}
        />
        <meta property="og:type" content="website" />
      </Head>

      {label ? (
        <>
          <h1 className="text-2xl font-semibold mb-4">{label}</h1>
          {items.length > 0 ? (
            <Products productData={items} />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-700">No hay productos en esta categoría por ahora.</p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-700">Categoría no válida.</p>
          <div className="mt-4">
            <Link href="/" className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">
              Ir al inicio
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps = async (ctx: any) => {
  const slug: string = String(ctx.params.slug || "");

  try {
    const all: ProductProps[] = await getAllProducts();
    const categories = Array.from(
      new Set(
        all
          .map((p) => String(p.category || "").trim())
          .filter(Boolean)
      )
    );

    const mappedLabel = slugToCategory[slug] || null;
    const matchedBySlug = categories.find((c) => toCategorySlug(c) === slug) || null;
    const label = mappedLabel || matchedBySlug;

    const targetSlug = toCategorySlug(label || slug);
    const items = label
      ? all.filter((p) => toCategorySlug(p.category) === targetSlug)
      : [];

    items.sort((a, b) => {
      const ac = (a.code || "").toString();
      const bc = (b.code || "").toString();
      if (ac && bc) return ac.localeCompare(bc, undefined, { numeric: true, sensitivity: "base" });
      if (ac) return -1;
      if (bc) return 1;
      return (a._id || 0) - (b._id || 0);
    });

    return { props: { slug, label, items } };
  } catch (e) {
    return { props: { slug, label: null, items: [] } };
  }
};
