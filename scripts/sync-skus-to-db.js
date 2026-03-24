#!/usr/bin/env node

/**
 * Script para sincronizar productos con SKUs a la base de datos Prisma
 * Ejecutar desde el terminal: node scripts/sync-skus-to-db.js
 */

const fs = require("fs");
const path = require("path");

async function syncSkusToDatabase() {
  // Cargar Prisma
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  try {
    // Leer datos de productos con SKUs
    const productsPath = path.join(__dirname, "../src/data/products.json");
    const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

    console.log(`📦 Sincronizando ${products.length} productos...`);

    let updated = 0;
    let created = 0;

    for (const p of products) {
      const code = p.code || p._id;

      // Buscar si ya existe
      let product = await prisma.product.findUnique({
        where: { code: String(code) },
      });

      if (product) {
        // Actualizar SKU si no tiene
        if (!product.sku && p.sku) {
          await prisma.product.update({
            where: { id: product.id },
            data: { sku: p.sku },
          });
          updated++;
          console.log(`  ✅ Actualizado: ${p.title} → ${p.sku}`);
        }
      } else {
        // Crear nuevo producto
        await prisma.product.create({
          data: {
            code: String(code),
            sku: p.sku || null,
            title: p.title,
            description: p.description || "",
            brand: p.brand || "Rossy Resina",
            category: p.category || "Otros",
            image: p.image || "",
            images: p.images ? JSON.stringify(p.images) : null,
            price: parseFloat(p.price) || 0,
            oldPrice: p.oldPrice ? parseFloat(p.oldPrice) : null,
            stock: p.stock || 0,
            barcode: p.barcode || null,
            isNew: p.isNew || false,
          },
        });
        created++;
        console.log(`  ✨ Creado: ${p.title} → ${p.sku}`);
      }
    }

    console.log(
      `\n✅ Sincronización completada!`
    );
    console.log(`  - ${updated} productos actualizados con SKU`);
    console.log(`  - ${created} productos nuevos creados`);
  } catch (error) {
    console.error("❌ Error durante la sincronización:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

syncSkusToDatabase();
