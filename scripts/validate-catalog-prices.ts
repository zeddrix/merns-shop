import buildSeedProducts, { getCatalogStats } from '../backend/data/catalog/index.js';

let errors = 0;

for (const product of buildSeedProducts()) {
  for (const variant of product.variants) {
    if (variant.price >= variant.listPrice) {
      console.error(
        `Price error: ${product.name} / ${variant.sku} price ${variant.price} >= list ${variant.listPrice}`
      );
      errors += 1;
    }
    if (variant.price <= 0 || variant.listPrice <= 0) {
      console.error(`Invalid price: ${product.name} / ${variant.sku}`);
      errors += 1;
    }
  }
}

const stats = getCatalogStats();

if (stats.parentCount < 140) {
  console.error(`Catalog too small: ${stats.parentCount} parents (need >= 140)`);
  errors += 1;
}

if (stats.variantCount < 475) {
  console.error(`Variants too few: ${stats.variantCount} (need >= 475)`);
  errors += 1;
}

if (errors > 0) {
  process.exit(1);
}

console.log(`Catalog OK: ${stats.parentCount} products, ${stats.variantCount} variants`);
