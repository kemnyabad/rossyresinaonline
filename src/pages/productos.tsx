import Head from "next/head";
import Products from "@/components/Products";
import type { ProductProps } from "../../type";
import { readCatalog } from "@/lib/catalogStore";

interface Props {
  allProducts: ProductProps[];
}

export default function ProductosPage({ allProducts }: Props) {
  const total = allProducts.length;

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8">
      <Head>
        <title>Todos los productos — Rossy Resina</title>
      </Head>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Todos los productos</h1>
        <span className="text-sm text-gray-500">{total} productos</span>
      </div>
      {total === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
          No se encontraron productos.
        </div>
      ) : (
        <Products productData={allProducts} />
      )}
    </div>
  );
}

export async function getServerSideProps() {
  return { props: { allProducts: readCatalog() } };
}

