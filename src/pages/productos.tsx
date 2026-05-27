import Head from "next/head";
import Products from "@/components/Products";
import StoreWithAdsLayout from "@/components/store/StoreWithAdsLayout";
import type { ProductProps } from "../../type";
import { useMemo } from "react";
import { useRouter } from "next/router";
import { filterAndSortProducts } from "@/lib/services/productCatalogService";
import { getAllProducts } from "@/lib/repositories/productRepository";
import { absoluteImageUrl, absoluteUrl, truncateMeta } from "@/lib/seo";
import { useLiveProducts } from "@/lib/useLiveProducts";

interface Props {
  allProducts: ProductProps[];
}

export default function ProductosPage({ allProducts }: Props) {
  const router = useRouter();
  const { products: liveProducts } = useLiveProducts(allProducts);
  const categoryFromQuery = String(router.query?.categoria || "").trim();
  const onlyOffers = String(router.query?.ofertas || "").trim() === "1";
  const pageTitle = onlyOffers ? "Ofertas en resina y moldes | Rossy Resina" : "Productos de resina, moldes y pigmentos | Rossy Resina";
  const pageDescription = truncateMeta(
    onlyOffers
      ? "Encuentra ofertas en resina epóxica, moldes de silicona, pigmentos y accesorios para manualidades en Rossy Resina."
      : "Catálogo de productos Rossy Resina: resina epóxica, moldes de silicona, pigmentos, accesorios y creaciones con envío a todo Perú."
  );
  const canonical = absoluteUrl(onlyOffers ? "/productos?ofertas=1" : "/productos");

  const filteredProducts = useMemo(() => {
    const base = filterAndSortProducts(liveProducts, {
      category: categoryFromQuery,
      sort: "relevance",
    });
    if (!onlyOffers) return base;
    return base.filter((p) => Number(p.oldPrice || 0) > Number(p.price || 0));
  }, [liveProducts, categoryFromQuery, onlyOffers]);

  return (
    <StoreWithAdsLayout className="py-8">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} key="description" />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={absoluteImageUrl("/web-app-manifest-512x512.png")} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Head>

      <div className="min-w-0">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {onlyOffers ? "Productos en oferta" : "Todos los productos"}
          </h1>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
            No se encontraron productos.
          </div>
        ) : (
          <Products
            productData={filteredProducts}
            gridClass="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5"
          />
        )}
      </div>
    </StoreWithAdsLayout>
  );
}

export async function getServerSideProps() {
  return { props: { allProducts: await getAllProducts() } };
}
