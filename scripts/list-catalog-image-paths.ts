import buildSeedProducts from '../backend/data/catalog/index.js';

const paths = new Set<string>();

for (const product of buildSeedProducts()) {
  paths.add(product.image);
  for (const variant of product.variants) {
    if (variant.image) {
      paths.add(variant.image);
    }
  }
}

const legacy = [
  '/images/airpods.jpg',
  '/images/phone.jpg',
  '/images/camera.jpg',
  '/images/playstation.jpg',
  '/images/mouse.jpg',
  '/images/alexa.jpg',
  '/images/sample.jpg'
];
for (const p of legacy) {
  paths.add(p);
}

console.log(JSON.stringify([...paths].sort()));
