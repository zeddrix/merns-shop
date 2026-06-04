import buildSeedProducts, { type SeedProduct } from './catalog/index.js';

export type { SeedProduct };

const products: SeedProduct[] = buildSeedProducts();

export default products;
