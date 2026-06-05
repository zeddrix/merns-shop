import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  assertDestructiveSeedAllowed,
  DESTRUCTIVE_SEED_CONFIRM,
  isLocalMongoUri,
  logDestructiveSeedSummary
} from '../../../backend/utils/seedSafety.js';

describe('seedSafety', () => {
  const originalEnv = process.env.ALLOW_DESTRUCTIVE_SEED;

  beforeEach(() => {
    delete process.env.ALLOW_DESTRUCTIVE_SEED;
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.ALLOW_DESTRUCTIVE_SEED;
    } else {
      process.env.ALLOW_DESTRUCTIVE_SEED = originalEnv;
    }
    vi.restoreAllMocks();
  });

  it('allows_localhost_destructive_seed_without_confirm', () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    assertDestructiveSeedAllowed('mongodb://127.0.0.1:27017/merns-shop');
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('refuses_remote_destructive_seed_without_confirm_env', () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    assertDestructiveSeedAllowed('mongodb+srv://user:pass@cluster.mongodb.net/merns-shop');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('requires_confirm_env_for_atlas_uri_even_in_development', () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    process.env.ALLOW_DESTRUCTIVE_SEED = DESTRUCTIVE_SEED_CONFIRM;
    assertDestructiveSeedAllowed('mongodb+srv://user:pass@cluster.mongodb.net/merns-shop');
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('logs_destructive_seed_summary', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    logDestructiveSeedSummary({
      orders: 2,
      products: 212,
      users: 3,
      productsAction: 'upsert'
    });
    expect(logSpy).toHaveBeenCalledWith(
      'Destructive seed: will remove 2 orders, 3 users; upsert 212 products.'
    );
  });

  it('classifies_local_uris', () => {
    expect(isLocalMongoUri('mongodb://127.0.0.1:27017/merns-shop')).toBe(true);
    expect(isLocalMongoUri('mongodb://localhost:27017/merns-shop')).toBe(true);
    expect(isLocalMongoUri('mongodb+srv://cluster.mongodb.net/merns-shop')).toBe(false);
  });
});
