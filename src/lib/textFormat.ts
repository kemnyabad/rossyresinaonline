export function formatProductTitle(value?: string): string {
  const raw = sanitizeHumanText(String(value || "").trim());
  if (!raw) return "";
  const lowered = raw.toLocaleLowerCase("es");
  return lowered.charAt(0).toLocaleUpperCase("es") + lowered.slice(1);
}

export function buildExtendedProductTitle(product: {
  title?: string;
  category?: string;
  measure?: string;
  specs?: Array<{ label: string; value: string }>;
}): string {
  const base = formatProductTitle(product.title || "Producto");
  const parts: string[] = [base];
  const MAX_LEN = 160;

  const addPart = (text?: string) => {
    const clean = sanitizeHumanText(String(text || "").trim());
    if (!clean) return;
    const lowered = clean.toLocaleLowerCase("es");
    if (parts.join(" ").toLocaleLowerCase("es").includes(lowered)) return;
    parts.push(clean);
  };

  addPart(product.measure);
  (product.specs || []).slice(0, 4).forEach((s) => addPart(s.value));
  addPart(product.category);

  let extended = parts.join(", ");
  if (extended.length > MAX_LEN) {
    extended = extended.slice(0, MAX_LEN + 1);
    const lastComma = extended.lastIndexOf(",");
    extended = (lastComma > base.length ? extended.slice(0, lastComma) : extended.slice(0, MAX_LEN)).trim();
  }
  return extended;
}

export function formatDescriptionBullets(description?: string): string[] {
  return String(description || "")
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);
}

export function sanitizeHumanText(input: string): string {
  let out = String(input || "");

  // Repara mojibake UTF-8 interpretado como latin1/cp1252.
  for (let i = 0; i < 3; i += 1) {
    if (!/[\u00C3\u00C2\u00E2]/.test(out)) break;
    let decoded = out;
    try {
      decoded = decodeURIComponent(escape(out));
    } catch {
      decoded = out;
    }
    if (!decoded || decoded === out) break;
    out = decoded;
  }

  const dictionary: Array<[string, string]> = [
    ["quinceañera", "quincea\u00f1era"],
    ["cariñosito", "cari\u00f1osito"],
    ["corazón", "coraz\u00f3n"],
    ["señorita", "se\u00f1orita"],
    ["reseñas", "rese\u00f1as"],
    ["reseña", "rese\u00f1a"],
    ["reseñas", "rese\u00f1as"],
  ];

  for (const [wrong, right] of dictionary) {
    const rx = new RegExp(wrong, "gi");
    out = out.replace(rx, right);
  }

  return out;
}
