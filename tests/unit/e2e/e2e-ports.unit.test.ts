import { describe, expect, it } from 'vitest';
import {
  E2E_API_PORT,
  E2E_API_URL,
  E2E_CLIENT_PORT,
  E2E_CLIENT_URL
} from '../../e2e/config/e2e-ports';

describe('e2e-ports', () => {
  it('uses dedicated E2E ports separate from manual dev', () => {
    expect(E2E_CLIENT_PORT).toBe(5030);
    expect(E2E_API_PORT).toBe(5031);
    expect(E2E_CLIENT_URL).toBe('http://localhost:5030');
    expect(E2E_API_URL).toBe('http://localhost:5031');
  });
});
