import Product from '../../../backend/models/Product.js';

export async function getSeededProductId(modelKey: string): Promise<string> {
  const product = await Product.findOne({ modelKey }).select('_id');
  if (!product) {
    throw new Error(`Seed product not found for modelKey: ${modelKey}`);
  }
  return String(product._id);
}
