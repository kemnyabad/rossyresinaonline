import Head from "next/head";
import Products from "@/components/Products";
import fs from "fs";
import path from "path";
import { ProductProps } from "../../type";
import Link from "next/link";
import { useMemo, useState } from "react";

interface Props { productData: ProductProps[] }

export default function ProductosPage({ productData }: Props) {
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const filtered = useMemo(() => {
    let items = [...productData];
    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter((p) =>
        [p.title, p.brand, p.category, p.code].join(" ").toLowerCase().includes(q)
      );
    }
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    if (min !== null && !Number.isNaN(min)) {
      items = items.filter((p) => Number(p.price) >= min);
    }
    if (max !== null && !Number.isNaN(max)) {
      items = items.filter((p) => Number(p.price) <= max);
    }
    switch (sortBy) {
      case "price-asc":
        items.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        items.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "name-asc":
        items.sort((a, b) => String(a.title).localeCompare(String(b.title)));
        break;
      case "newest":
        items.sort((a, b) => Number(b._id) - Number(a._id));
        break;
      default:
        break;
    }
    return items;
  }, [productData, query, minPrice, maxPrice, sortBy]);
  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8">
      <Head>
        <title>Todos los productos — Rossy Resina</title>
      </Head>
      <div className="mb-6">
        <ul className="text-sm text-gray-600 flex items-center gap-2">
          <li>
            <Link href="/" className="hover:underline">Inicio</Link>
          </li>
          <li>/</li>
          <li className="text-gray-800">Todos los productos</li>
        </ul>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto..."
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Precio mínimo"
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Precio máximo"
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
          >
            <option value="featured">Destacados</option>
            <option value="newest">Más nuevos</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="name-asc">Nombre A-Z</option>
          </select>
        </div>
      </div>
      <Products productData={filtered} />
    </div>
  );
}

export const getServerSideProps = async () => {
  try {
    const dataPath = path.join(process.cwd(), "src", "data", "products.json");
    const raw = fs.readFileSync(dataPath, "utf-8");
    const productData = JSON.parse(raw);
    return { props: { productData } };
  } catch (e) {
    return { props: { productData: [] } };
  }
};
