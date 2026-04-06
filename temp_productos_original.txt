import Head from "next/head";
import Products from "@/components/Products";
import type { ProductProps } from "../../type";
import { useMemo } from "react";
import { useRouter } from "next/router";
import { filterAndSortProducts } from "@/lib/services/productCatalogService";
import { getAllProducts } from "@/lib/repositories/productRepository";

interface Props {
  allProducts: ProductProps[];
}

export default function ProductosPage({ allProducts }: Props) {
  const router = useRouter();
  const total = allProducts.length;
  const categoryFromQuery = String(router.query?.categoria || "").trim();
  const onlyOffers = String(router.query?.ofertas || "").trim() === "1";

  const filteredProducts = useMemo(() => {
    const base = filterAndSortProducts(allProducts, {
      category: categoryFromQuery,
      sort: "relevance",
    });
    if (!onlyOffers) return base;
    return base.filter((p) => Number(p.oldPrice || 0) > Number(p.price || 0));
  }, [allProducts, categoryFromQuery, onlyOffers]);

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8">
      <Head>
        <title>Todos los productos - Rossy Resina</title>
      </Head>

      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          {onlyOffers ? "Productos en oferta" : "Todos los productos"}
        </h1>
        <span className="text-sm text-gray-500">
          {filteredProducts.length} de {total} productos
        </span>
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
  );
}

export async function getServerSideProps() {
  return { props: { allProducts: await getAllProducts() } };
}
