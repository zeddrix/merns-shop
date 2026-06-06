import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import Order from '../../../backend/models/Order.js';
import Product from '../../../backend/models/Product.js';
import User from '../../../backend/models/User.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';
import { importSeedData, syncCatalogOnly } from '../../../backend/utils/importSeedData.js';

describe('products resolve integration', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
  });

  it('GET_by_model_key_returns_same_product_as_by_id', async () => {
    const list = await request(app).get('/api/products?keyword=iPhone%2015%20Pro');
    const iphone15Pro = list.body.products.find(
      (product: { name: string }) => product.name === 'iPhone 15 Pro'
    );
    expect(iphone15Pro).toBeDefined();

    const byId = await request(app).get(`/api/products/${iphone15Pro._id}`);
    const byModelKey = await request(app).get('/api/products/iphone-15-pro');

    expect(byId.status).toBe(200);
    expect(byModelKey.status).toBe(200);
    expect(byModelKey.body._id).toBe(byId.body._id);
    expect(byModelKey.body.name).toBe('iPhone 15 Pro');
  });

  it('GET_unknown_id_returns_404', async () => {
    const response = await request(app).get('/api/products/000000000000000000000000');
    expect(response.status).toBe(404);
  });
});

describe('products resolve local seed stability', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await importSeedData();
  });

  it('local_seed_preserves_product_id_across_second_seed', async () => {
    const iphoneBefore = await Product.findOne({ modelKey: 'iphone-15-pro' });
    expect(iphoneBefore).toBeTruthy();
    const idBefore = iphoneBefore?._id.toString();

    const syncedProducts = await syncCatalogOnly();
    const iphoneFromSync = syncedProducts.find((product) => product.modelKey === 'iphone-15-pro');
    expect(iphoneFromSync).toBeDefined();
    expect(iphoneFromSync?._id.toString()).toBe(idBefore);

    const iphoneAfter = await Product.findOne({ modelKey: 'iphone-15-pro' });
    expect(iphoneAfter?._id.toString()).toBe(idBefore);
  });
});
