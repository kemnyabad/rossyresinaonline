/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function readCatalog() {
  const runtimePath = path.join(process.cwd(), "data", "products.json");
  const legacyPath = path.join(process.cwd(), "src", "data", "products.json");
  const filePath = fs.existsSync(runtimePath) ? runtimePath : legacyPath;
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, "");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeImage(img) {
  const t = String(img || "").trim();
  if (!t) return "/favicon-96x96.png";
  let u = t.replace(/\\/g, "/");
  if (!u.startsWith("/") && !/^https?:\/\//i.test(u)) u = "/" + u;
  return u;
}

async function run() {
  const rows = readCatalog();
  if (rows.length === 0) {
    console.log("No hay productos para migrar.");
    return;
  }

  let migrated = 0;
  for (const p of rows) {
    const legacyId = String(p?._id ?? "").trim();
    const code = String(p?.code ?? "").trim() || null;
    const where =
      legacyId
        ? { legacyId }
        : code
          ? { code }
          : null;
    if (!where) continue;

    await prisma.product.upsert({
      where,
      update: {
        code,
        title: String(p?.title || "Producto"),
        description: String(p?.description || ""),
        brand: String(p?.brand || ""),
        category: String(p?.category || ""),
        image: normalizeImage(p?.image),
        price: Number(p?.price || 0),
        oldPrice: p?.oldPrice != null ? Number(p.oldPrice) : null,
        isNew: Boolean(p?.isNew),
      },
      create: {
        legacyId,
        code,
        title: String(p?.title || "Producto"),
        description: String(p?.description || ""),
        brand: String(p?.brand || ""),
        category: String(p?.category || ""),
        image: normalizeImage(p?.image),
        price: Number(p?.price || 0),
        oldPrice: p?.oldPrice != null ? Number(p.oldPrice) : null,
        isNew: Boolean(p?.isNew),
      },
    });
    migrated += 1;
  }
  console.log(`Productos migrados: ${migrated}`);
}

run()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
