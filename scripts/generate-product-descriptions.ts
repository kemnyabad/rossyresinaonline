import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const db = prisma as any;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Extrae "de N" al final del título (cantidad de cavidades / piezas por set).
const extractCount = (title: string): { base: string; count: number | null } => {
  const m = title.match(/^(.*?)\s+de\s+(\d+)$/i);
  if (m) return { base: m[1].trim(), count: Number(m[2]) };
  return { base: title.trim(), count: null };
};

const moldeDescription = (title: string): string => {
  const { base, count } = extractCount(title);
  const shape = base.toLowerCase().replace(/^(mini|dije)\s+/i, (m) => m);
  const countPhrase = count ? ` Incluye ${count} cavidades por molde.` : '';
  return `Molde de silicona flexible con diseño de ${shape}, ideal para trabajar con resina epóxica o resina UV.${countPhrase} Es antiadherente, fácil de desmoldar y reutilizable; perfecto para crear dijes, llaveros, adornos y piezas decorativas hechas a mano.`;
};

const pigmentoDescription = (title: string): string => {
  const t = title.toLowerCase();
  const color = t.includes('dorad') ? 'dorado' : t.includes('plateada') || t.includes('plateado') ? 'plateado' : t.includes('azul') ? 'azul' : t.includes('rosad') ? 'rosado' : 'brillante';
  const tipo = t.includes('purpurina') ? 'Purpurina' : 'Pigmento perlado';
  return `${tipo} en polvo de tono ${color} para mezclar con resina epóxica o UV. Se integra fácilmente sin grumos y aporta un acabado uniforme y brillante a tus piezas de resina, moldes y manualidades.`;
};

const ACCESORIO_OVERRIDES: Record<string, string> = {
  'cinta-para-bisuteria': 'Cinta/cordón para bisutería, ideal para armar collares, pulseras y colgantes con tus piezas de resina. Resistente y fácil de anudar o combinar con broches y conectores.',
  'vasito-medidor': 'Vaso medidor graduado para dosificar con precisión resina y catalizador antes de mezclar. Material flexible que facilita despegar los residuos de resina ya curada.',
  'pan-de-oro': 'Láminas de pan de oro para incluir dentro de piezas de resina o decorar la superficie una vez curada. Aporta un acabado metálico y brillante muy usado en joyería y arte en resina.',
  'conector-plateado-de-alecion-para-dijes': 'Conector metálico plateado (aleación) para armar dijes, llaveros y bisutería con tus piezas de resina. Incluye argolla para facilitar el ensamblado.',
  'conector-dorado-de-aleacion-para-dije': 'Conector metálico dorado (aleación) para armar dijes, llaveros y bisutería con tus piezas de resina. Incluye argolla para facilitar el ensamblado.',
  'fiomix-de-frutas': 'Mix decorativo de frutas en miniatura para incluir dentro de piezas de resina. Ideal para crear llaveros, imanes y adornos con efecto "postre" o frutal.',
  'taladro-electrico': 'Taladro eléctrico compacto para perforar piezas de resina ya curadas y colocar argollas, llaveros o cordones. Práctico para trabajo de precisión en manualidades.',
  'taladro-manual': 'Taladro manual (de mano) para hacer pequeños orificios en piezas de resina curada sin necesidad de electricidad. Ideal para trabajos delicados y de precisión.',
  'lampara-uv-36w': 'Lámpara UV de 36W para curar resina UV en minutos. Uso sencillo, ideal para moldes pequeños, uñas y detalles que requieren secado rápido.',
  'vaso-mezclador': 'Vaso mezclador reutilizable para preparar tu resina y catalizador en las proporciones correctas. Facilita un mezclado uniforme y sin grumos.',
  'balanza-electronica': 'Balanza electrónica digital para pesar con precisión resina, catalizador y pigmentos antes de mezclar. Ayuda a lograr proporciones exactas y evitar desperdicios.',
  'mini-balanza': 'Mini balanza digital portátil para pesar pequeñas cantidades de resina, catalizador o pigmentos con precisión. Compacta y fácil de usar.',
};

const KIT_OVERRIDES: Record<string, string> = {
  'kit-resinero-misa': 'Kit resinero temático para primera comunión / misa: incluye insumos y moldes seleccionados para crear recuerdos y detalles en resina para esta ocasión especial.',
  'kit-resinero-baby-shower': 'Kit resinero temático para baby shower: incluye insumos y moldes seleccionados para crear recuerdos y souvenirs en resina para el evento.',
  'kit-completo': 'Kit resinero completo con los insumos esenciales para iniciarte en el arte de la resina: resina, moldes y accesorios básicos en un solo pack.',
};

const RESINA_OVERRIDES: Record<string, string> = {
  'resina-uv-100-gramos': 'Resina UV de 100 gramos, cura en minutos bajo lámpara UV. Ideal para piezas pequeñas, dijes, llaveros y detalles que requieren un acabado rápido y transparente.',
  'resina-epoxica-1-en-1': 'Resina epóxica cristalina en proporción 1 a 1 (resina y catalizador en partes iguales), fácil de medir y mezclar. Ideal para moldes, cuadros, posavasos y piezas decorativas con acabado transparente de alto brillo.',
};

const describe = (p: { slug: string; title: string; category: string }): string => {
  const cat = p.category.toLowerCase();
  if (ACCESORIO_OVERRIDES[p.slug]) return ACCESORIO_OVERRIDES[p.slug];
  if (KIT_OVERRIDES[p.slug]) return KIT_OVERRIDES[p.slug];
  if (RESINA_OVERRIDES[p.slug]) return RESINA_OVERRIDES[p.slug];
  if (cat.includes('pigmento') || cat.includes('glitter')) return pigmentoDescription(p.title);
  if (cat.includes('molde')) return moldeDescription(p.title);
  // Fallback generico (no debería usarse si las categorias de arriba cubren todo)
  return `${cap(p.title)}: producto de Rossy Resina para tus proyectos de resina epóxica y UV. Descripción pendiente de completar por el equipo.`;
};

async function main() {
  const products = await db.product.findMany({
    where: { description: '' },
    select: { id: true, slug: true, title: true, category: true },
    orderBy: { category: 'asc' },
  });

  const results = products.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    description: describe(p),
  }));

  const outDir = path.join(process.cwd(), 'scratchpad-output');
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, 'product-descriptions-draft.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf8');

  const md = [
    '# Borradores de descripción de producto',
    '',
    `${results.length} productos sin descripción. Revisa y edita el texto antes de aplicar.`,
    '',
    ...results.map(
      (r: any) =>
        `## ${r.title} (${r.category})\n- slug: \`${r.slug}\`\n- id: \`${r.id}\`\n\n${r.description}\n`
    ),
  ].join('\n');
  const mdPath = path.join(outDir, 'product-descriptions-draft.md');
  fs.writeFileSync(mdPath, md, 'utf8');

  console.log(`Generados ${results.length} borradores.`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`Markdown: ${mdPath}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
