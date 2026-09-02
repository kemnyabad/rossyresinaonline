import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { readMarketplace, recordMarketplaceEvent, toPublicProduct, toPublicShop } from "@/lib/marketplaceStore";

export default function PublicShopPage({ shop, products }: any) {
  const whatsapp = String(shop.whatsapp || "").replace(/\D/g, "");
  return (
    <>
      <Head><title>{shop.commercialName} | Rossy Resina</title></Head>
      <main className="bg-white">
        <section className="border-b border-pink-100 bg-[#fff4f9]">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm">
                <img src={shop.logoUrl || "/favicon-96x96.png"} alt={shop.commercialName} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold uppercase tracking-wide text-[#e4147f]">{shop.city}</p>
                <h1 className="mt-1 text-4xl font-black text-slate-950">{shop.commercialName}</h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">{shop.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
                  {shop.instagram && <a className="rounded-full border border-pink-200 px-3 py-1 text-slate-700" href={shop.instagram}>Instagram</a>}
                  {shop.facebook && <a className="rounded-full border border-pink-200 px-3 py-1 text-slate-700" href={shop.facebook}>Facebook</a>}
                  {shop.tiktok && <a className="rounded-full border border-pink-200 px-3 py-1 text-slate-700" href={shop.tiktok}>TikTok</a>}
                  {whatsapp && <a className="rounded-full bg-[#e4147f] px-3 py-1 text-white" href={`https://wa.me/${whatsapp}`}>WhatsApp</a>}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <h2 className="mb-5 text-2xl font-black text-slate-950">Productos publicados</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product: any) => {
              const message = encodeURIComponent(`Hola, quiero consultar por el producto ${product.name} en Rossy Resina.`);
              return (
                <article key={product.id} className="overflow-hidden rounded-xl border border-pink-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <Link href={`/producto/${product.slug}`} className="block">
                    <div className="relative aspect-square bg-slate-100">
                      <img src={product.images?.[0] || "/favicon-96x96.png"} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/producto/${product.slug}`} className="block">
                      <p className="line-clamp-2 min-h-[44px] font-black text-slate-950 hover:text-[#e4147f]">{product.name}</p>
                    </Link>
                    <p className="mt-1 line-clamp-1 text-sm text-slate-500">{shop.commercialName}</p>
                    <p className="mt-2 text-lg font-black text-[#e4147f]">S/ {Number(product.price || 0).toFixed(2)}</p>
                    {whatsapp && (
                      <a
                        href={`https://wa.me/${whatsapp}?text=${message}`}
                        onClick={() => fetch("/api/marketplace/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "WHATSAPP_CLICK", shopId: shop.id, productId: product.id }) })}
                        className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#e4147f] px-4 text-sm font-bold text-white"
                      >
                        Contactar
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { shops, products: productsSource } = await readMarketplace();
  const shop = shops.find((item) => item.slug === String(params?.slug || "") && item.status === "ACTIVE");
  if (!shop) return { notFound: true };
  await recordMarketplaceEvent({ type: "SHOP_VIEW", shopId: shop.id });
  const products = productsSource
    .filter((item) => item.shopId === shop.id && item.status === "PUBLISHED")
    .map(toPublicProduct);
  return { props: { shop: toPublicShop(shop), products } };
};
