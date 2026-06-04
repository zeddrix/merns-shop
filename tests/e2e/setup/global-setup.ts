import { assertMongoHealthy, seedDatabase } from '../fixtures/mongo-helpers';

export default async function globalSetup(): Promise<void> {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'e2e-test-jwt-secret-change-in-ci';
  }
  if (!process.env.PAYPAL_CLIENT_ID) {
    process.env.PAYPAL_CLIENT_ID = 'e2e-placeholder-paypal-client-id';
  }

  await assertMongoHealthy();
  await seedDatabase();
}
