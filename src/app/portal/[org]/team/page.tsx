import { ActionForm } from '@/components/app/action-form';
import { Badge, Card, CardHeader, PageHeader } from '@/components/ui/primitives';
import { Field, Input, Select } from '@/components/ui/form';
import { pageRequireOrgMember } from '@/lib/auth/guards';
import { titleCase } from '@/lib/utils';
import { portalTeam } from '@/server/portal';
import { portalInviteTeammate, portalRemoveTeammate } from '../actions';

export const metadata = { title: 'Team' };

export default async function PortalTeam({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const { org, actor } = await pageRequireOrgMember(slug, 'team:manage');
  const members = await portalTeam(org.id);
  return (
    <>
      <PageHeader title="Team" description={`People at ${org.name} who can use this portal.`} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <ul className="divide-y divide-ink/6">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <span>
                  <span className="block font-medium">{m.name ?? m.email}</span>
                  <span className="block text-xs text-ink/50">{m.email}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Badge tone="ocean">{titleCase(m.role).replace('Client ', '')}</Badge>
                  {m.userId !== actor.user.id && m.role !== 'client_owner' ? (
                    <ActionForm action={portalRemoveTeammate} hideSubmit inline confirm={`Remove ${m.email}'s access?`}>
                      <input type="hidden" name="org" value={org.slug} />
                      <input type="hidden" name="membershipId" value={m.id} />
                      <button type="submit" className="text-xs font-semibold text-red-600 hover:underline">Remove</button>
                    </ActionForm>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Invite a teammate" />
          <div className="p-5">
            <ActionForm action={portalInviteTeammate} submitLabel="Send invitation" resetOnSuccess>
              <input type="hidden" name="org" value={org.slug} />
              <Field label="Email" htmlFor="email" required><Input id="email" name="email" type="email" required /></Field>
              <Field label="Name" htmlFor="name"><Input id="name" name="name" /></Field>
              <Field label="Access" htmlFor="role" required>
                <Select id="role" name="role" defaultValue="client_member">
                  <option value="client_member">Member — can open requests and share files</option>
                  <option value="read_only">Read only</option>
                </Select>
              </Field>
            </ActionForm>
          </div>
        </Card>
      </div>
    </>
  );
}
