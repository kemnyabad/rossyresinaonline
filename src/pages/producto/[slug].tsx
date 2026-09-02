import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { readMarketplace, recordMarketplaceEvent, toPublicProduct, toPublicShop } from "@/lib/marketplaceStore";

export default function MarketplaceProductPage({ product, shop }: any) {
  const whatsapp = String(shop?.whatsapp || "").replace(/\D/g, "");
  const message = encodeURIComponent(`Hola, quiero consultar por el producto ${product.name} en Rossy Resina.`);
  return (
    <>
      <Head><title>{product.name} | Rossy Resina</title></Head>
      <main className="bg-white">
        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="grid gap-3">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
              <img src={product.images?.[0] || "/favicon-96x96.png"} alt={product.name} className="h-full w-full object-cover" />
            </div>
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(1, 5).map((src: string) => (
                  <div key={src} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                    <img src={src} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#e4147f]">{product.category}</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950">{product.name}</h1>
            <p className="mt-4 text-3xl font-black text-[#e4147f]">S/ {Number(product.price || 0).toFixed(2)}</p>
            <p className="mt-5 text-base leading-8 text-slate-700">{product.description}</p>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}?text=${message}`}
                onClick={() => fetch("/api/marketplace/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "WHATSAPP_CLICK", shopId: shop?.id, productId: product.id }) })}
                className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-[#e4147f] px-6 text-base font-bold text-white"
              >
                Consultar por WhatsApp
              </a>
            )}
            {shop && (
              <div className="mt-6 rounded-xl border border-pink-100 bg-[#fff8fb] p-5">
                <p className="text-sm font-semibold text-slate-500">Vendido por</p>
                <Link href={`/tienda/${shop.slug}`} className="mt-1 inline-flex text-lg font-black text-slate-950 hover:text-[#e4147f]">
                  {shop.commercialName}
                </Link>
                {shop.city && <p className="mt-1 text-sm text-slate-600">{shop.city}</p>}
                <Link href={`/tienda/${shop.slug}`} className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-pink-200 bg-white px-4 text-sm font-bold text-[#e4147f]">
                  Ver tienda
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { shops, products: productsSource } = await readMarketplace();
  const product = productsSource.find((item) => item.slug === String(params?.slug || "") && item.status === "PUBLISHED");
  if (!product) return { notFound: true };
  const shop = shops.find((item) => item.id === product.shopId) || null;
  await recordMarketplaceEvent({ type: "PRODUCT_VIEW", shopId: shop?.id, productId: product.id });
  return {
    props: {
      product: toPublicProduct(product),
      shop: toPublicShop(shop),
    },
  };
};
