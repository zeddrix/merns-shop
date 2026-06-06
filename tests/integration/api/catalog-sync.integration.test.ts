import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import User from '../../../backend/models/User.js';
import Product from '../../../backend/models/Product.js';
import Order from '../../../backend/models/Order.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';
import { syncCatalogOnly, syncFixturesOnly } from '../../../backend/utils/importSeedData.js';

describe('catalog sync integration', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
  });

  it('sync_updates_iphone_description_and_reviews_without_deleting_users', async () => {
    const extraUser = await User.create({
      name: 'Extra Shopper',
      email: 'extra@example.com',
      password: 'hashed',
      isAdmin: false
    });
    const userCountBefore = await User.countDocuments();

    await syncCatalogOnly();

    expect(await User.countDocuments()).toBe(userCountBefore);
    expect(await User.findById(extraUser._id)).toBeTruthy();

    const list = await request(app).get('/api/products?keyword=iPhone%2015%20Pro');
    const iphone15Pro = list.body.products.find(
      (product: { name: string }) => product.name === 'iPhone 15 Pro'
    );
    expect(iphone15Pro).toBeDefined();

    const detail = await request(app).get(`/api/products/${iphone15Pro._id}`);
    expect(detail.status).toBe(200);
    expect(detail.body.description.length).toBeGreaterThan(40);
    expect(detail.body.reviews.length).toBeGreaterThan(0);
  });

  it('sync_is_idempotent_second_run_no_duplicates', async () => {
    await syncCatalogOnly();
    const countAfterFirst = await Product.countDocuments();

    await syncCatalogOnly();
    const countAfterSecond = await Product.countDocuments();

    expect(countAfterSecond).toBe(countAfterFirst);
  });

  it('sync_fixtures_adds_john_delivered_orders_once', async () => {
    await syncFixturesOnly();
    const john = await User.findOne({ email: 'john@gmail.com' });
    expect(john).toBeTruthy();

    const firstCount = await Order.countDocuments({
      user: john?._id,
      isDelivered: true
    });
    expect(firstCount).toBeGreaterThan(0);

    await syncFixturesOnly();
    const secondCount = await Order.countDocuments({
      user: john?._id,
      isDelivered: true
    });
    expect(secondCount).toBe(firstCount);
  });
});
