#!/usr/bin/env node

/**
 * Script para generar SKUs únicos para todos los productos
 * Formato: CAT-YYYY-XXXX
 * CAT: Primera 3 letras de la categoría
 * YYYY: Año de creación
 * XXXX: Número secuencial
 */

const fs = require("fs");
const path = require("path");

// Leer datos de productos
const productsPath = path.join(__dirname, "../src/data/products.json");
const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

// Función para generar SKU
function generateSKU(product, index) {
  // Obtener 3 primeras letras de categoría en mayúscula
  const catPrefix = (product.category || "PRD")
    .substring(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "A");

  // Obtener año (simulamos 2026 o del código si existe)
  const year = "2026";

  // Número secuencial de 4 dígitos
  const sequence = String(index + 1).padStart(4, "0");

  return `${catPrefix}-${year}-${sequence}`;
}

// Generar SKUs
const updatedProducts = products.map((product, index) => ({
  ...product,
  sku: generateSKU(product, index),
}));

// Guardar actualizado
fs.writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2));

console.log(
  `✅ SKUs generados para ${updatedProducts.length} productos en ${productsPath}`
);
console.log("Ejemplos:");
updatedProducts.slice(0, 3).forEach((p) => {
  console.log(`  - ${p.title} → ${p.sku}`);
});
