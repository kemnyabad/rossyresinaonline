import { NextRequest, NextResponse } from "next/server";

const getCountry = (req: NextRequest): string => {
  const candidates = [
    req.headers.get("x-vercel-ip-country"),
    req.headers.get("cf-ipcountry"),
    req.headers.get("x-country-code"),
  ];
  for (const value of candidates) {
    const c = String(value || "").trim().toUpperCase();
    if (c) return c;
  }
  return "";
};

const isLocalHost = (req: NextRequest): boolean => {
  const host = String(req.headers.get("host") || "").toLowerCase();
  return host.includes("localhost") || host.startsWith("127.0.0.1");
};

export function middleware(req: NextRequest) {
  if (isLocalHost(req)) return NextResponse.next();

  const pathname = req.nextUrl.pathname;
  const country = getCountry(req);
  const allowPeruOnly = process.env.PERU_ONLY_MODE !== "0";

  if (!allowPeruOnly) return NextResponse.next();

  if (country === "PE") return NextResponse.next();

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Acceso restringido</title><style>body{font-family:Arial,sans-serif;background:#f8fafc;color:#0f172a;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px}.card{max-width:680px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px;box-shadow:0 10px 30px rgba(15,23,42,.06)}h1{margin:0 0 8px;font-size:28px}p{margin:0 0 10px;line-height:1.5;color:#334155}.muted{font-size:12px;color:#64748b}</style></head><body><div class="card"><h1>Acceso restringido</h1><p>Esta web solo esta disponible para visitantes de Peru.</p><p>Si estas en Peru y ves este mensaje, desactiva VPN/proxy e intenta nuevamente.</p><p class="muted">Ruta: ${pathname}</p></div></body></html>`;

  return new NextResponse(html, {
    status: 403,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate",
    },
  });
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|site.webmanifest).*)"],
};
