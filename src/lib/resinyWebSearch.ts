type SearchResult = {
  title: string;
  url: string;
  snippet: string;
};

type CacheEntry = {
  expiresAt: number;
  context: string;
};

const cache = new Map<string, CacheEntry>();

const SEARCH_TTL_MS = 30 * 60 * 1000;
const MAX_RESULTS = 5;

const normalize = (value: string) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const ARTISAN_KEYWORDS =
  /resina|epoxi|epoxica|uv|eco resina|molde|moldes|silicona|pigmento|mica|colorante|glitter|escarcha|artesania|manualidad|joyeria|arete|dije|llavero|lapicero|shaker|bandeja|portavaso|curado|mezcla|catalizador|endurecedor|burbujas|pulido|lijado|flores secas|encapsulado|taller|capacitacion|emprendimiento artesanal|hecho a mano|manualidades/;

const BLOCKED_KEYWORDS =
  /politica|religion|apuesta|casino|adulto|sexual|arma|medicamento|diagnostico|legal|abogado|criptomoneda|forex|trading|hacking|pirateria/;

const sanitize = (value: any, max = 320) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const isWebSearchEnabled = () => process.env.RESINY_WEB_SEARCH_ENABLED === "true";

export const shouldSearchWebForResiny = (message: string) => {
  const text = normalize(message);
  if (!isWebSearchEnabled()) return false;
  if (text.length < 12) return false;
  if (BLOCKED_KEYWORDS.test(text)) return false;
  if (!ARTISAN_KEYWORDS.test(text)) return false;

  return /actual|hoy|nuevo|nueva|tendencia|tendencias|internet|buscar|busca|investiga|proveedor|proveedores|comparar|recomienda|recomendacion|ideas|inspiracion|inspiración|tecnica|tecnica nueva|precio|precios|curso|tutorial|como hacer|paso a paso/.test(text);
};

const buildSearchQuery = (message: string) => {
  const clean = sanitize(message, 180);
  return `${clean} resina epoxica artesania manualidades Peru`;
};

const isRelevantResult = (result: SearchResult) => {
  const text = normalize(`${result.title} ${result.snippet} ${result.url}`);
  if (!result.url || !/^https?:\/\//i.test(result.url)) return false;
  if (BLOCKED_KEYWORDS.test(text)) return false;
  return ARTISAN_KEYWORDS.test(text);
};

const braveSearch = async (query: string): Promise<SearchResult[]> => {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) return [];

  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(MAX_RESULTS));
  url.searchParams.set("country", "pe");
  url.searchParams.set("search_lang", "es");
  url.searchParams.set("safesearch", "strict");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Brave Search error: ${response.status}`);
  }

  const data = await response.json();
  return (data?.web?.results || []).map((item: any) => ({
    title: sanitize(item?.title, 120),
    url: sanitize(item?.url, 220),
    snippet: sanitize(item?.description, 300),
  }));
};

const tavilySearch = async (query: string): Promise<SearchResult[]> => {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "basic",
      max_results: MAX_RESULTS,
      include_answer: false,
      include_raw_content: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily Search error: ${response.status}`);
  }

  const data = await response.json();
  return (data?.results || []).map((item: any) => ({
    title: sanitize(item?.title, 120),
    url: sanitize(item?.url, 220),
    snippet: sanitize(item?.content, 300),
  }));
};

const runSearch = async (query: string) => {
  const provider = normalize(process.env.RESINY_WEB_SEARCH_PROVIDER || "brave");
  if (provider === "tavily") return tavilySearch(query);

  const brave = await braveSearch(query);
  if (brave.length > 0 || !process.env.TAVILY_API_KEY) return brave;
  return tavilySearch(query);
};

export async function getResinyWebContext(message: string) {
  if (!shouldSearchWebForResiny(message)) return "";

  const query = buildSearchQuery(message);
  const cacheKey = normalize(query);
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.context;

  try {
    const results = (await runSearch(query)).filter(isRelevantResult).slice(0, MAX_RESULTS);
    if (results.length === 0) return "";

    const sources = results
      .map((result, index) => {
        return `${index + 1}. ${result.title}\nURL: ${result.url}\nResumen: ${result.snippet}`;
      })
      .join("\n\n");

    const context = `INFORMACION RECIENTE DE INTERNET FILTRADA PARA RESINY:
Consulta buscada: "${sanitize(message, 180)}"

Fuentes encontradas:
${sources}

Instrucciones:
- Usa esta informacion solo si ayuda a responder sobre resina, artesania, moldes, pigmentos, compras, capacitaciones o emprendimiento artesanal.
- Si una fuente no parece confiable o no encaja con artesania/resina, ignorala.
- No respondas temas fuera del mundo artesanal aunque aparezcan en internet.
- No inventes datos no presentes en las fuentes.`;

    cache.set(cacheKey, { context, expiresAt: Date.now() + SEARCH_TTL_MS });
    return context;
  } catch (error) {
    console.warn("resiny.web_search.failed", String((error as any)?.message || error));
    return "";
  }
}
