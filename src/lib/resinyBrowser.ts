type BrowserPage = {
  title: string;
  url: string;
  text: string;
};

const MAX_PAGES = 3;
const MAX_PAGE_CHARS = 2600;
const FETCH_TIMEOUT_MS = 8000;

const normalize = (value: string) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const ARTISAN_SCOPE =
  /resina|epoxi|epoxica|uv|eco resina|molde|moldes|silicona|pigmento|mica|colorante|glitter|escarcha|artesania|manualidad|manualidades|hecho a mano|llavero|dije|arete|joyeria|bisuteria|vela|velas|jabon|jabones|ceramica|porcelana fria|crochet|tejido|macrame|sublimacion|vinil|scrapbook|empaque|emprender|vender|costear|taller|capacitacion|curso|proyecto|diseño|diseno|foto|boceto/;

const BROWSE_INTENT =
  /lee|leer|abre|abrir|revisa|revisar|consulta|consultar|investiga|investigar|busca|buscar|navega|navegar|internet|pagina|página|web|articulo|artículo|fuente|tutorial|tendencia|tendencias|actual|nuevo|nueva/;

const BLOCKED_SCOPE =
  /politica|religion|casino|apuesta|adulto|sexual|arma|medicamento|diagnostico|legal|abogado|criptomoneda|forex|trading|hacking|pirateria/;

const sanitize = (value: any, max = MAX_PAGE_CHARS) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const isEnabled = () => process.env.RESINY_BROWSER_ENABLED === "true";

const splitEnvList = (value?: string) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const extractUrls = (message: string) => {
  const matches = String(message || "").match(/https?:\/\/[^\s)]+/gi) || [];
  return Array.from(new Set(matches)).slice(0, MAX_PAGES);
};

const allowedDomains = () =>
  splitEnvList(process.env.RESINY_BROWSER_ALLOWED_DOMAINS).map((domain) =>
    normalize(domain).replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "")
  );

const sourceUrls = () => splitEnvList(process.env.RESINY_BROWSER_SOURCE_URLS).slice(0, MAX_PAGES);

const isAllowedUrl = (rawUrl: string) => {
  try {
    const url = new URL(rawUrl);
    if (!/^https?:$/.test(url.protocol)) return false;

    const allowed = allowedDomains();
    if (allowed.length === 0) return false;

    const host = normalize(url.hostname).replace(/^www\./, "");
    return allowed.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
};

const shouldUseBrowser = (message: string) => {
  if (!isEnabled()) return false;
  const text = normalize(message);
  if (text.length < 10) return false;
  if (BLOCKED_SCOPE.test(text)) return false;
  return ARTISAN_SCOPE.test(text) && (BROWSE_INTENT.test(text) || extractUrls(message).length > 0);
};

const stripHtml = (html: string) => {
  const title = sanitize(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "", 140)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  return { title, text: sanitize(body, MAX_PAGE_CHARS) };
};

const fetchPage = async (url: string): Promise<BrowserPage | null> => {
  if (!isAllowedUrl(url)) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "ResinyBot/1.0 (+Rossy Resina artesania assistant)",
      },
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return null;

    const html = await response.text();
    const parsed = stripHtml(html);
    if (!parsed.text) return null;

    return {
      title: parsed.title || url,
      url,
      text: parsed.text,
    };
  } catch (error) {
    console.warn("resiny.browser.fetch_failed", String((error as any)?.message || error));
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

export async function getResinyBrowserContext(message: string) {
  if (!shouldUseBrowser(message)) return "";

  const urlsFromMessage = extractUrls(message).filter(isAllowedUrl);
  const urls = urlsFromMessage.length > 0 ? urlsFromMessage : sourceUrls().filter(isAllowedUrl);
  if (urls.length === 0) return "";

  const pages = (await Promise.all(urls.slice(0, MAX_PAGES).map(fetchPage))).filter(Boolean) as BrowserPage[];
  if (pages.length === 0) return "";

  const pageContext = pages
    .map((page, index) => {
      return `${index + 1}. ${page.title}\nURL: ${page.url}\nContenido relevante extraido: ${page.text}`;
    })
    .join("\n\n");

  return `RESINY BROWSER - PAGINAS LEIDAS POR RESINY:
${pageContext}

Instrucciones:
- Usa estas paginas como apoyo, pero responde con voz amable de Resiny.
- Solo aprovecha contenido relacionado con artesania, artesania resinera, materiales, cursos, ventas o proyectos hechos a mano.
- Si la pagina no aporta o parece fuera de tema, ignorala.
- No afirmes que navegaste por todo internet; di "revise la informacion disponible" si hace falta.`;
}
