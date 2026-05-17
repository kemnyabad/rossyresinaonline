import Head from "next/head";
import Products from "@/components/Products";
import StoreWithAdsLayout from "@/components/store/StoreWithAdsLayout";
import type { ProductProps } from "../../type";
import { filterAndSortProducts } from "@/lib/services/productCatalogService";
import { getAllProducts } from "@/lib/repositories/productRepository";

interface Props {
  q: string;
  results: ProductProps[];
}

export default function SearchPage({ q, results }: Props) {
  return (
    <StoreWithAdsLayout className="py-8">
      <Head>
        <title>Buscar productos | Rossy Resina</title>
        <meta
          name="description"
          content={`Resultados de b?squeda para ${q || "productos"} en Rossy Resina.`}
        />
      </Head>

      <div className="min-w-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-gray-900">Buscar productos</h1>
          <span className="text-sm text-gray-500">{results.length} resultados</span>
        </div>

        {results.length > 0 ? (
          <Products
            productData={results}
            gridClass="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5"
          />
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
            No se encontraron productos para tu b?squeda.
          </div>
        )}
      </div>
    </StoreWithAdsLayout>
  );
}

export async function getServerSideProps(ctx: any) {
  const q = String(ctx.query?.q || "").trim();
  const allProducts = await getAllProducts();
  const results = filterAndSortProducts(allProducts, {
    query: q,
    sort: "relevance",
  });

  return {
    props: { q, results },
  };
}
