export default async function globalTeardown(): Promise<void> {
  // No-op — shared DB; re-seed with `pnpm db:seed` when needed
}
