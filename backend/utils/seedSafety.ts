export const DESTRUCTIVE_SEED_CONFIRM = 'I_UNDERSTAND_DATA_LOSS';

export const isLocalMongoUri = (uri: string): boolean =>
  /mongodb(\+srv)?:\/\/(127\.0\.0\.1|localhost)([:/]|$)/i.test(uri.trim());

export const logDestructiveSeedSummary = (counts: {
  orders: number;
  products: number;
  users: number;
  productsAction: 'delete' | 'upsert';
}): void => {
  const productVerb = counts.productsAction === 'delete' ? 'remove' : 'upsert';
  console.log(
    `Destructive seed: will remove ${counts.orders} orders, ${counts.users} users; ${productVerb} ${counts.products} products.`
  );
};

export const assertDestructiveSeedAllowed = (mongoUri: string | undefined): void => {
  const uri = mongoUri?.trim() ?? '';
  if (!uri || isLocalMongoUri(uri)) {
    return;
  }

  if (process.env.ALLOW_DESTRUCTIVE_SEED !== DESTRUCTIVE_SEED_CONFIRM) {
    console.error(
      'Refusing destructive seed on remote database. Set ALLOW_DESTRUCTIVE_SEED=I_UNDERSTAND_DATA_LOSS to proceed.'
    );
    process.exit(1);
  }
};
