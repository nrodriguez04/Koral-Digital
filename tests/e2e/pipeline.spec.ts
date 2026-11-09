import { expect, test } from '@playwright/test';
import { expectNoAppError, loginAs, sql } from './helpers';

/**
 * The core commercial path, end to end through the real UI and database:
 * visitor inquiry → internal pipeline → discovery → proposal → client workspace
 * → project → invitation → client sees the project in their portal.
 */
test.describe.serial('inquiry to client portal', () => {
  const company = `Lone Star Roofing E2E ${Date.now()}`;
  const email = `owner+${Date.now()}@lonestar-e2e.test`;
  let leadUrl = '';
  let clientUrl = '';
  let inviteLink = '';
  let orgSlug = '';

  test('visitor submits the contact form', async ({ page }) => {
    await page.goto('/contact?service=lead-to-booked&utm_source=e2e&utm_campaign=launch');
    await page.waitForTimeout(3000); // fill-time spam check
    await page.getByLabel('Your name').fill('Taylor Prospect');
    await page.getByLabel('Company').fill(company);
    await page.getByLabel('Work email').fill(email);
    await page.getByLabel('Phone').fill('214-555-0199');
    await page.getByLabel('Industry').selectOption('Roofing');
    await page.getByLabel('Approximate new leads per month').selectOption('25–75');
    await page.getByLabel('Current CRM or job-management software').fill('JobNimbus');
    await page
      .getByLabel('What do you most want help with?')
      .selectOption('Leads are slow to get a response');
    await page.getByLabel('Anything else we should know?').fill('Storm season leads pile up in voicemail.');
    await page.getByText('You may email me occasional').click();
    await page.getByRole('button', { name: 'Request my free consultation' }).click();
    await expect(page.getByText('Thank you — we have your message.')).toBeVisible();

    const db = sql();
    const rows =
      await db`select l.stage, l.utm_source, l.consent_email, l.service_interest, l.notification_status from leads l join contacts c on c.id = l.contact_id where c.email = ${email.toLowerCase()}`;
    await db.end();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      stage: 'new',
      utm_source: 'e2e',
      consent_email: true,
      service_interest: 'lead-to-booked',
      notification_status: 'not_configured',
    });
  });

  test('sales sees it in the pipeline and works the lead', async ({ page }) => {
    await loginAs(page, 'dev-sales', '/app/leads');
    await expect(page).toHaveURL(/\/app\/leads/);
    await page.getByRole('link', { name: company }).click();
    await page.waitForURL(/\/app\/leads\/[0-9a-f-]{36}$/);
    leadUrl = page.url();
    await expect(page.getByRole('heading', { level: 1, name: company })).toBeVisible();
    await expect(page.getByText('Storm season leads pile up in voicemail.').first()).toBeVisible();
    await expect(page.getByText('No email notification was sent for this inquiry')).toBeVisible();

    // Log a call → auto-advances new → contacted.
    await page.getByLabel('Activity type').selectOption('call');
    await page
      .getByLabel('Activity details')
      .fill('Intro call. They use JobNimbus; storms overwhelm the office.');
    await page.getByRole('button', { name: 'Log activity' }).click();
    await expect(page.getByText('Activity logged.')).toBeVisible();
    await expect(
      page.getByText('Stage changed from new to contacted (first logged outreach).'),
    ).toBeVisible();

    // Qualify.
    await page.locator('select[name="stage"]').selectOption('qualified');
    await page.getByRole('button', { name: 'Update stage' }).click();
    await expect(page.getByText('Moved to qualified.')).toBeVisible();

    // Discovery checklist.
    await page.getByText('Open checklist').click();
    await page.locator('textarea[name="q_lead_sources"]').fill('Website form, Google LSA, referrals');
    await page
      .locator('textarea[name="q_success_criteria"]')
      .fill('Every web lead gets a human reply in under 15 minutes during business hours');
    await page.getByRole('button', { name: 'Save discovery' }).click();
    await expect(page.getByText(/Discovery saved \(2\/12 answered\)/)).toBeVisible();

    // Follow-up task.
    await page.getByLabel('Task title').fill('Send discovery recap');
    await page.getByRole('button', { name: 'Add task' }).click();
    await expect(page.getByText('Task added.')).toBeVisible();

    // Record consultation.
    await page.getByLabel('Date and time (Central)').fill('2026-11-12T10:00');
    await page.getByRole('button', { name: 'Record meeting' }).click();
    await expect(page.getByText('Meeting recorded.')).toBeVisible();

    // Survives a refresh.
    await page.reload();
    await expect(page.getByText('Send discovery recap')).toBeVisible();
    await expect(
      page.getByText('Intro call. They use JobNimbus; storms overwhelm the office.'),
    ).toBeVisible();
    await expectNoAppError(page);
  });

  test('sales drafts, prices and sends a proposal', async ({ page }) => {
    await loginAs(page, 'dev-sales', leadUrl.replace(/^https?:\/\/[^/]+/, ''));
    await page.getByRole('button', { name: 'Draft proposal' }).click();
    await expect(page).toHaveURL(/\/app\/proposals\/[0-9a-f-]{36}$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Lead-to-Booked Pilot');
    await page.getByLabel('Item description').fill('Second lead source (Google LSA)');
    await page.getByLabel('Unit price in dollars').fill('750');
    await page.getByRole('button', { name: 'Add item' }).click();
    await expect(page.getByText('Line item added.')).toBeVisible();
    await expect(page.getByText(/Fixed fee \$3,250/)).toBeVisible();
    await page.getByLabel('New status').selectOption('sent');
    await page.getByRole('button', { name: 'Update status' }).click();
    await expect(page.getByText('Proposal marked sent.')).toBeVisible();

    // Printable client-facing document.
    const printUrl = page.url() + '/print';
    await page.goto(printUrl);
    await expect(page.getByText('Fixed project fee')).toBeVisible();
    await expect(page.getByText('$1,625').first()).toBeVisible(); // 50% deposit
  });

  test('sales converts the won lead into a client workspace', async ({ page }) => {
    await loginAs(page, 'dev-sales', leadUrl.replace(/^https?:\/\/[^/]+/, ''));
    await expect(page.getByText('Proposal').first()).toBeVisible();
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: 'Create client workspace' }).click();
    await expect(page).toHaveURL(/\/app\/clients\/[0-9a-f-]{36}/);
    clientUrl = page
      .url()
      .replace(/^https?:\/\/[^/]+/, '')
      .split('?')[0]!;
    await expect(page.getByRole('heading', { level: 1, name: company })).toBeVisible();
    orgSlug = (await page.getByText(/^Portal: \/portal\//).innerText()).match(/\/portal\/([a-z0-9-]+)/)![1]!;
  });

  test('delivery creates a project from the template and publishes an update', async ({ page }) => {
    await loginAs(page, 'dev-admin', `${clientUrl}?tab=projects`);
    await page.getByRole('button', { name: 'Create project' }).click();
    await expect(page).toHaveURL(/\/app\/projects\/[0-9a-f-]{36}$/);
    await expect(page.getByText('Discovery & baseline')).toBeVisible();
    await expect(page.getByText('Grant CRM administrator (or integration) access')).toBeVisible();
    await page.getByLabel('Status of Discovery & baseline').selectOption('in_progress');
    await page.getByRole('button', { name: 'Set' }).first().click();
    await page.getByLabel('Milestone title').fill('Second source go-live');
    await page.getByRole('button', { name: 'Add milestone' }).click();
    await expect(page.getByText('Milestone added.')).toBeVisible();
    await page.getByLabel('Update title').fill('Kickoff complete');
    await page.getByLabel('Update body').fill('We mapped your lead sources. Next: CRM access.');
    await page.getByText('Publish to the client portal').last().click();
    await page.getByRole('button', { name: 'Post update' }).click();
    await expect(page.getByText('Update published to the client portal.')).toBeVisible();
  });

  test('admin invites the client owner (manual link because Descope is not configured)', async ({ page }) => {
    await loginAs(page, 'dev-admin', `${clientUrl}?tab=team`);
    await expect(page.getByText('Descope is not configured')).toBeVisible();
    await page.getByLabel('Email').fill('nobody@example.org');
    await page.getByLabel('Role').selectOption('client_owner');
    await page.getByRole('button', { name: 'Create invitation' }).click();
    const msg = await page.getByText(/Send this single-use link/).innerText();
    inviteLink = msg.match(/https?:\/\/\S+\/invite\/[A-Za-z0-9_-]+/)![0]!;
    expect(inviteLink).toBeTruthy();
  });

  test('invited client accepts and sees only their workspace', async ({ page }) => {
    await loginAs(page, 'dev-no-access');
    await expect(page).toHaveURL(/\/no-access/);
    await page.goto(inviteLink.replace(/^https?:\/\/[^/]+/, ''));
    await page.getByRole('button', { name: 'Accept invitation' }).click();
    await expect(page).toHaveURL(new RegExp(`/portal/${orgSlug}$`));
    await expect(page.getByText(`${company} — Lead-to-Booked pilot`)).toBeVisible();
    await expect(page.getByText('Kickoff complete')).toBeVisible();
    await expect(page.getByText('Grant CRM administrator (or integration) access')).toBeVisible();

    // Proposal visible and acknowledgeable by the owner.
    await page.getByRole('link', { name: 'Proposals & billing' }).click();
    await page.getByRole('link', { name: /Lead-to-Booked Pilot/ }).click();
    await page.getByLabel('Your full name').fill('Nora Owner');
    await page.getByText(/I am authorized to accept/).click();
    await page.getByRole('button', { name: 'Record acceptance' }).click();
    await expect(page.getByText('Thank you — your acceptance has been recorded.')).toBeVisible();

    // Support request round-trip.
    await page.goto(`/portal/${orgSlug}/support`);
    await page.getByLabel('Subject').fill('Who gets the alerts?');
    await page.getByLabel('Details').fill('Please add our office manager to new-lead alerts.');
    await page.getByRole('button', { name: 'Submit request' }).click();
    await expect(page).toHaveURL(/\/support\/[0-9a-f-]{36}$/);
    await expect(page.getByText('Please add our office manager to new-lead alerts.')).toBeVisible();

    // Cannot reach another tenant or the internal portal.
    const other = await page.goto('/portal/acme-roofing-demo');
    expect(other?.status()).toBe(404);
    await page.goto('/app');
    await expect(page).toHaveURL(/\/no-access|\/portal/);
  });

  test('staff sees the client request in the support queue', async ({ page }) => {
    await loginAs(page, 'dev-delivery', '/app/tickets');
    await page.getByRole('link', { name: 'Who gets the alerts?' }).click();
    await page.getByLabel('Reply').fill('Done — added to routing.');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByText('Reply sent to the client portal.')).toBeVisible();
  });

  test('audit log captured the critical changes', async ({ page }) => {
    await loginAs(page, 'dev-admin', '/app/audit');
    for (const action of [
      'lead.stage_changed',
      'proposal.status_changed',
      'lead.converted',
      'project.created',
      'invitation.accepted',
      'proposal.acknowledged_by_client',
    ]) {
      await expect(page.getByRole('cell', { name: action, exact: true }).first()).toBeVisible();
    }
  });
});
