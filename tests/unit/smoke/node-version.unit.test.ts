import { describe, expect, it } from 'vitest';

describe('node version smoke', () => {
  it('runs on Node 22+ when REQUIRE_NODE_22 is set', () => {
    if (process.env.REQUIRE_NODE_22 !== '1') {
      return;
    }
    const major = Number(process.versions.node.split('.')[0]);
    expect(major).toBeGreaterThanOrEqual(22);
  });
});
