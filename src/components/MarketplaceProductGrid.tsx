import Link from "next/link";

type MarketplaceProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  images?: string[];
  shop?: {
    id?: string;
    slug: string;
    commercialName: string;
    city?: string;
    whatsapp?: string;
  } | null;
};

export default function MarketplaceProductGrid({
  products,
  title = "Productos del marketplace",
  emptyText = "Aun no hay creaciones publicadas.",
}: {
  products: MarketplaceProduct[];
  title?: string;
  emptyText?: string;
}) {
  const items = Array.isArray(products) ? products : [];

  return (
    <section className="min-w-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amazon_blue">Mercado Creativo</p>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        <Link href="/mercado-creativo" className="hidden text-sm font-semibold text-amazon_blue hover:underline sm:inline">
          Ver mercado
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">{emptyText}</div>
      ) : (
        <div className="grid w-full grid-cols-2 items-stretch gap-3 px-1 sm:grid-cols-2 md:grid-cols-3 md:px-0 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((product) => {
            const image = product.images?.[0] || "/favicon-96x96.png";
            const whatsapp = String(product.shop?.whatsapp || "").replace(/\D/g, "");
            const message = encodeURIComponent(`Hola, quiero consultar por el producto ${product.name} en Rossy Resina.`);
            return (
              <article
                key={product.id}
                className="group flex h-full flex-col rounded-lg border border-pink-100 bg-white p-2.5 text-black shadow-[0_1px_3px_rgba(17,24,39,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amazon_blue/45 hover:shadow-[0_10px_22px_rgba(17,24,39,0.10)]"
              >
                <Link href={`/producto/${product.slug}`} className="block">
                  <div className="relative w-full overflow-hidden rounded-md bg-gray-50 pb-[100%]">
                    <img
                      src={image}
                      alt={product.name || "Producto artesanal"}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="mt-2 flex flex-1 flex-col">
                  <Link href={`/producto/${product.slug}`} className="block">
                    <p className="line-clamp-2 min-h-[38px] text-sm font-medium leading-[1.15rem] text-gray-800 group-hover:text-amazon_blue">
                      {product.name || "Producto artesanal"}
                    </p>
                  </Link>
                  <p className="mt-1 line-clamp-1 text-xs font-semibold text-gray-500">
                    {product.shop?.commercialName || "Tienda Rossy Resina"}
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-2">
                    <p className="text-base font-semibold text-amazon_blue md:text-xl">
                      S/ {Number(product.price || 0).toFixed(2)}
                    </p>
                  </div>
                  {whatsapp && (
                    <a
                      href={`https://wa.me/${whatsapp}?text=${message}`}
                      onClick={() => fetch("/api/marketplace/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "WHATSAPP_CLICK", shopId: product.shop?.id, productId: product.id }) })}
                      className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-amazon_blue px-3 text-xs font-semibold text-white transition hover:brightness-95"
                    >
                      Contactar
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
