/** Dedicated ports for Playwright E2E — separate from manual `pnpm dev` (5020/5021). */
export const E2E_CLIENT_PORT = 5030;
export const E2E_API_PORT = 5031;
export const E2E_CLIENT_URL = `http://localhost:${E2E_CLIENT_PORT}`;
export const E2E_API_URL = `http://localhost:${E2E_API_PORT}`;
