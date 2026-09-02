// Migracion de datos unica: mueve data/marketplace.json (fs) y las filas de
// CapacitacionInscripcion usadas como almacenamiento improvisado del marketplace
// (curso = VENDE_CON_NOSOTROS / MARKETPLACE_PRODUCT) hacia los modelos Prisma
// dedicados (SellerApplication, SellerShop, SellerProduct, MarketplaceEvent).
// Se puede correr mas de una vez: usa upsert por id para las fuentes JSON.
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const slugify = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'tienda';

const uniqueSlug = (base, taken) => {
  let candidate = slugify(base);
  if (!taken.has(candidate)) {
    taken.add(candidate);
    return candidate;
  }
  let i = 2;
  while (taken.has(`${candidate}-${i}`)) i += 1;
  const final = `${candidate}-${i}`;
  taken.add(final);
  return final;
};

const safeParseMeta = (value) => {
  try {
    return JSON.parse(String(value || '{}'));
  } catch {
    return {};
  }
};

async function migrateFromJson() {
  const filePath = path.join(process.cwd(), 'data', 'marketplace.json');
  const shopEmailToId = new Map();

  if (!fs.existsSync(filePath)) {
    console.log('No hay data/marketplace.json, se omite esa fuente.');
    return { shopEmailToId };
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const applications = Array.isArray(raw.applications) ? raw.applications : [];
  const shops = Array.isArray(raw.shops) ? raw.shops : [];
  const products = Array.isArray(raw.products) ? raw.products : [];
  const events = Array.isArray(raw.events) ? raw.events : [];

  for (const app of applications) {
    await prisma.sellerApplication.upsert({
      where: { id: app.id },
      update: {},
      create: {
        id: app.id,
        userEmail: String(app.userEmail || '').toLowerCase(),
        fullName: app.fullName || '',
        sellerDni: app.sellerDni || null,
        businessName: app.businessName || '',
        city: app.city || '',
        whatsapp: app.whatsapp || '',
        productType: app.productType || '',
        description: app.description || '',
        socialUrl: app.socialUrl || '',
        logoUrl: app.logoUrl || '',
        dniFrontUrl: app.dniFrontUrl || null,
        dniBackUrl: app.dniBackUrl || null,
        businessPhotoUrl: app.businessPhotoUrl || null,
        status: app.status || 'PENDING',
        note: app.note || '',
        createdAt: new Date(app.createdAt || Date.now()),
        updatedAt: new Date(app.updatedAt || Date.now()),
      },
    });
  }
  console.log(`Aplicaciones importadas desde JSON: ${applications.length}`);

  for (const shop of shops) {
    await prisma.sellerShop.upsert({
      where: { id: shop.id },
      update: {},
      create: {
        id: shop.id,
        userEmail: String(shop.userEmail || '').toLowerCase(),
        applicationId: shop.applicationId || '',
        slug: shop.slug,
        logoUrl: shop.logoUrl || '',
        commercialName: shop.commercialName || '',
        city: shop.city || '',
        description: shop.description || '',
        whatsapp: shop.whatsapp || '',
        facebook: shop.facebook || '',
        instagram: shop.instagram || '',
        tiktok: shop.tiktok || '',
        status: shop.status || 'ACTIVE',
        featured: Boolean(shop.featured),
        createdAt: new Date(shop.createdAt || Date.now()),
        updatedAt: new Date(shop.updatedAt || Date.now()),
      },
    });
    shopEmailToId.set(String(shop.userEmail || '').toLowerCase(), shop.id);
  }
  console.log(`Tiendas importadas desde JSON: ${shops.length}`);

  for (const product of products) {
    await prisma.sellerProduct.upsert({
      where: { id: product.id },
      update: {},
      create: {
        id: product.id,
        sellerEmail: String(product.sellerEmail || '').toLowerCase(),
        shopId: product.shopId,
        slug: product.slug,
        name: product.name || '',
        category: product.category || '',
        price: Number(product.price || 0),
        description: product.description || '',
        images: Array.isArray(product.images) ? product.images : [],
        status: product.status || 'PENDING',
        featured: Boolean(product.featured),
        rejectionReason: product.rejectionReason || '',
        createdAt: new Date(product.createdAt || Date.now()),
        updatedAt: new Date(product.updatedAt || Date.now()),
      },
    });
  }
  console.log(`Productos importados desde JSON: ${products.length}`);

  for (const event of events) {
    await prisma.marketplaceEvent
      .create({
        data: {
          type: event.type,
          shopId: event.shopId || null,
          productId: event.productId || null,
          createdAt: new Date(event.createdAt || Date.now()),
        },
      })
      .catch(() => {});
  }
  console.log(`Eventos importados desde JSON: ${events.length}`);

  return { shopEmailToId };
}

const mapEstadoApplication = (estado) => {
  const value = String(estado || '').toUpperCase();
  if (value === 'APROBADO' || value === 'APPROVED') return 'APPROVED';
  if (value === 'RECHAZADO' || value === 'REJECTED') return 'REJECTED';
  return 'PENDING';
};

const mapEstadoProduct = (estado) => {
  const value = String(estado || '').toUpperCase();
  if (value === 'PUBLICADO' || value === 'PUBLISHED') return 'PUBLISHED';
  if (value === 'PAUSADO' || value === 'PAUSED') return 'PAUSED';
  if (value === 'RECHAZADO' || value === 'REJECTED') return 'REJECTED';
  return 'PENDING';
};

async function migrateFromCapacitacionHack(shopEmailToId) {
  const applicationRows = await prisma.capacitacionInscripcion.findMany({
    where: { curso: 'VENDE_CON_NOSOTROS' },
    orderBy: { createdAt: 'asc' },
  });

  const takenShopSlugs = new Set((await prisma.sellerShop.findMany({ select: { slug: true } })).map((s) => s.slug));
  let importedApplications = 0;
  let importedShops = 0;

  for (const row of applicationRows) {
    const meta = safeParseMeta(row.mensaje);
    const email = String(row.email || '').toLowerCase();
    const status = mapEstadoApplication(row.estado);

    const created = await prisma.sellerApplication.create({
      data: {
        userEmail: email,
        fullName: row.nombre || '',
        sellerDni: meta.dni || null,
        businessName: meta.emprendimiento || row.nombre || '',
        city: meta.ciudad || '',
        whatsapp: meta.whatsapp || row.telefono || '',
        productType: meta.productos || '',
        description: meta.descripcion || '',
        socialUrl: meta.redes || '',
        logoUrl: meta.logo || '',
        dniFrontUrl: meta.dniFrente || null,
        dniBackUrl: meta.dniReverso || null,
        businessPhotoUrl: meta.fotoEmprendimiento || null,
        status,
        note: row.notaAdmin || '',
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
    });
    importedApplications += 1;

    if (status === 'APPROVED' && !shopEmailToId.has(email)) {
      const slug = uniqueSlug(meta.emprendimiento || row.nombre || email, takenShopSlugs);
      const shop = await prisma.sellerShop.create({
        data: {
          userEmail: email,
          applicationId: created.id,
          slug,
          logoUrl: meta.logo || '',
          commercialName: meta.emprendimiento || row.nombre || 'Mi emprendimiento',
          city: meta.ciudad || '',
          description: meta.descripcion || '',
          whatsapp: meta.whatsapp || row.telefono || '',
          facebook: meta.facebook || '',
          instagram: meta.redes || '',
          tiktok: meta.tiktok || '',
          status: 'ACTIVE',
          featured: false,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        },
      });
      shopEmailToId.set(email, shop.id);
      importedShops += 1;
    }
  }
  console.log(
    `Aplicaciones importadas desde CapacitacionInscripcion: ${importedApplications} (tiendas creadas: ${importedShops})`
  );

  const productRows = await prisma.capacitacionInscripcion.findMany({
    where: { curso: 'MARKETPLACE_PRODUCT' },
    orderBy: { createdAt: 'asc' },
  });

  const takenProductSlugs = new Set(
    (await prisma.sellerProduct.findMany({ select: { slug: true } })).map((p) => p.slug)
  );
  let importedProducts = 0;
  let skippedProducts = 0;

  for (const row of productRows) {
    const meta = safeParseMeta(row.mensaje);
    const email = String(row.email || '').toLowerCase();
    const shopId = shopEmailToId.get(email);
    if (!shopId) {
      console.warn(`Producto sin tienda para ${email} (fila ${row.id}), se omite.`);
      skippedProducts += 1;
      continue;
    }
    const name = meta.nombre || row.nombre || 'Producto';
    const slug = uniqueSlug(meta.slug || name, takenProductSlugs);
    await prisma.sellerProduct.create({
      data: {
        sellerEmail: email,
        shopId,
        slug,
        name,
        category: meta.categoria || '',
        price: Number(meta.precio || 0),
        description: meta.descripcion || '',
        images: Array.isArray(meta.imagenes) ? meta.imagenes : [],
        status: mapEstadoProduct(row.estado),
        featured: Boolean(meta.destacado),
        rejectionReason: row.notaAdmin || '',
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
    });
    importedProducts += 1;
  }
  console.log(
    `Productos importados desde CapacitacionInscripcion: ${importedProducts} (omitidos sin tienda: ${skippedProducts})`
  );
}

async function main() {
  const { shopEmailToId } = await migrateFromJson();
  await migrateFromCapacitacionHack(shopEmailToId);
  console.log('Migracion de datos de marketplace completada.');
}

main()
  .catch((error) => {
    console.error('Error en la migracion:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
