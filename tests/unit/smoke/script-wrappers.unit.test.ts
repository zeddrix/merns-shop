import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('script wrappers', () => {
  it('wraps_key_package_scripts_with_run_with_project_node', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>;
    };

    const wrappedScripts = [
      'quality',
      'build',
      'db:seed',
      'db:destroy',
      'db:sync',
      'db:sync:fixtures',
      'db:sync:prod',
      'db:seed:prod',
      'test:unit',
      'test:integration',
      'verify',
      'verify:full'
    ];

    for (const scriptName of wrappedScripts) {
      expect(packageJson.scripts[scriptName]).toContain('run-with-project-node.sh');
    }
  });
});
