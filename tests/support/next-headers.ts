// Minimal stand-in for next/headers in unit/integration tests.
const store = new Map<string, string>();
export async function headers() {
  return new Headers({ 'x-forwarded-for': (globalThis as { __testIp?: string }).__testIp ?? '203.0.113.10' });
}
export async function cookies() {
  return {
    get: (name: string) => (store.has(name) ? { name, value: store.get(name)! } : undefined),
    set: (name: string, value: string) => store.set(name, value),
    delete: (name: string) => store.delete(name),
  };
}
