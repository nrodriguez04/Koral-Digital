/**
 * Makes the Descope project match the access model in src/lib/auth/descope-roles.ts:
 *  - the internal (staff) and external (clients' parent) tenants exist
 *  - every Internal:* and External:Client* role exists, carrying its permission
 * Idempotent: anything already present is left as it is. Needs DESCOPE_MANAGEMENT_KEY.
 *
 *   npm run descope:setup
 */
import 'dotenv/config';
import { config } from 'dotenv';
import descopeSdk from '@descope/node-sdk';
import {
  DESCOPE_CLIENTS_PARENT_TENANT,
  DESCOPE_STAFF_TENANT,
  MEMBER_ROLE_NAMES,
  ROLE_PERMISSIONS,
  STAFF_ROLE_NAMES,
} from '../src/lib/auth/descope-roles';

config({ path: '.env.local', override: false });

const DESCRIPTIONS: Record<string, string> = {
  'Internal:Owner': 'Koral staff: everything, including staff, settings and the audit log',
  'Internal:Employee': 'Koral staff: everything except staff, site settings and the audit log',
  'Internal:Contractor': 'Koral staff: delivery work on client accounts; no leads, proposals or invoices',
  'External:ClientOwner': "Client: manages their company's team and accepts proposals",
  'External:ClientMember': 'Client: opens support requests and shares files',
  'External:ClientReadOnly': "Client: views their company's portal only",
};

async function main() {
  const projectId = process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID;
  const managementKey = process.env.DESCOPE_MANAGEMENT_KEY;
  if (!projectId || !managementKey) {
    console.error('[descope] NEXT_PUBLIC_DESCOPE_PROJECT_ID and DESCOPE_MANAGEMENT_KEY must be set.');
    process.exit(1);
  }
  const sdk = descopeSdk({ projectId, managementKey });

  for (const [id, name] of [
    [DESCOPE_STAFF_TENANT, 'Koral Digital Internal'],
    [DESCOPE_CLIENTS_PARENT_TENANT, 'Koral Digital External'],
  ]) {
    const found = await sdk.management.tenant.load(id);
    if (found.ok) continue;
    const res = await sdk.management.tenant.createWithId(id, name);
    if (!res.ok) throw new Error(`Tenant ${id}: ${res.error?.errorMessage}`);
    console.log(`[descope] Tenant created: ${id}`);
  }

  const roles = await sdk.management.role.loadAll();
  if (!roles.ok) throw new Error(`Roles: ${roles.error?.errorMessage}`);
  const existing = new Set((roles.data ?? []).filter((r) => !r.tenantId).map((r) => r.name));
  for (const name of [...Object.values(STAFF_ROLE_NAMES), ...Object.values(MEMBER_ROLE_NAMES)]) {
    if (existing.has(name)) {
      console.log(`[descope] Role exists: ${name}`);
      continue;
    }
    const res = await sdk.management.role.create(name, DESCRIPTIONS[name], [ROLE_PERMISSIONS[name]!]);
    if (!res.ok) throw new Error(`Role ${name}: ${res.error?.errorMessage}`);
    console.log(`[descope] Role created: ${name}`);
  }
}

main().catch((err) => {
  console.error('[descope] Failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
