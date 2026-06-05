import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('node version smoke', () => {
  it('package_json_requires_node_22', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      engines: { node: string };
    };
    expect(packageJson.engines.node).toBe('>=22');
  });

  it('nvmrc_matches_engines', () => {
    const nvmrc = readFileSync('.nvmrc', 'utf8').trim();
    expect(nvmrc).toBe('22');
  });

  it('runs on Node 22+ when REQUIRE_NODE_22 is set', () => {
    if (process.env.REQUIRE_NODE_22 !== '1') {
      return;
    }
    const major = Number(process.versions.node.split('.')[0]);
    expect(major).toBeGreaterThanOrEqual(22);
  });

  it('check_node_version_script_exits_nonzero_below_22', () => {
    const result = spawnSync('node', ['scripts/check-node-version.mjs'], {
      env: { ...process.env, NODE_TEST_MAJOR: '20' },
      encoding: 'utf8'
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Node.js 22');
  });
});
