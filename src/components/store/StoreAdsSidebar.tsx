const StoreAdsSidebar = () => {
  const facebookPageUrl =
    process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL || "https://www.facebook.com/rossyresinaonline";
  const facebookPostUrl = (process.env.NEXT_PUBLIC_FACEBOOK_POST_URL || "").trim();
  const canEmbedPost =
    facebookPostUrl &&
    /facebook\.com/i.test(facebookPostUrl) &&
    !/facebook\.com\/share\//i.test(facebookPostUrl) &&
    !/facebook\.com\/photo\/?\?/i.test(facebookPostUrl);
  const facebookEmbedUrl = canEmbedPost
    ? `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(facebookPostUrl)}&show_text=true&width=320`
    : `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(facebookPageUrl)}&tabs=timeline&width=320&height=520&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false`;

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-4">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amazon_blue">Facebook</p>
            <h2 className="mt-1 text-base font-bold leading-tight text-gray-900">
              Anuncios y novedades
            </h2>
          </div>

          <div className="bg-gray-50 p-3">
            <iframe
              title="Publicaciones de Facebook de Rossy Resina"
              src={facebookEmbedUrl}
              width="320"
              height={canEmbedPost ? "420" : "520"}
              className="mx-auto block min-h-[420px] w-full max-w-[320px] border-0"
              style={{ overflow: "hidden" }}
              loading="lazy"
              scrolling="no"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
            <div className="mt-3 rounded-md border border-gray-200 bg-white p-3 text-center">
              <p className="text-xs leading-5 text-gray-600">
                Si Facebook no carga aquí, abre la fanpage para ver las publicaciones.
              </p>
              <a
                href={facebookPageUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex h-9 w-full items-center justify-center rounded-full bg-amazon_blue px-3 text-sm font-semibold text-white hover:brightness-95"
              >
                Ver fanpage
              </a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default StoreAdsSidebar;
