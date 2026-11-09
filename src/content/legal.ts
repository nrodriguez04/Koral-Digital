/**
 * DRAFT privacy policy and terms of use.
 *
 * These are professionally structured templates that describe what this
 * application actually does. They have NOT been reviewed by an attorney.
 * The /privacy and /terms pages display a "Draft - pending legal review"
 * banner; do not remove it until counsel has reviewed the text, the vendor
 * list and the actual data processing.
 *
 * Keep these in sync with the app: if a form field, vendor category, analytics
 * event or retention practice changes, update the matching section here.
 */

export type LegalSection = { heading: string; paragraphs: string[]; bullets?: string[] };

export const legalLastUpdated = 'November 9, 2026';

export const privacySections: LegalSection[] = [
  {
    heading: 'Who we are',
    paragraphs: [
      'Koral Digital ("Koral Digital," "we," "us" or "our") is a digital operations and systems integration consultancy based in Frisco, Texas. We help home-service businesses connect and improve the tools they use to respond to inquiries, follow up on estimates and track results.',
      'This privacy policy explains what personal information we collect through koraldigital.com (the "website") and our client portal (the "portal"), how we use it, who we share it with and the choices you have. It does not cover the websites, software or services of other companies, including tools our clients use, which are governed by their own policies.',
    ],
  },
  {
    heading: 'Information we collect',
    paragraphs: [
      'We collect information you give us directly, information generated when you use the website or portal, and limited technical information needed to keep our services secure.',
      'Information you provide through our contact form may include:',
    ],
    bullets: [
      'Your name, company name and email address.',
      'Your phone number, if you choose to provide it.',
      'Your industry, the approximate number of leads your business receives each month, the CRM or software you currently use and the service you are interested in, if you choose to provide them.',
      'A description of the problem you would like help with, and any message you include.',
      'Your contact preferences, including whether you agree to receive email or text messages from us.',
      'How you reached us: campaign (UTM) parameters in the link you followed, the referring website and the page on which you first arrived.',
    ],
  },
  {
    heading: 'Information from portal accounts, communications and website use',
    paragraphs: [
      'If you are invited to the client portal, we collect your name, email address, the organization you belong to, your role in that organization and an identifier from our authentication provider that links your sign-in to your account. We also store content you or your colleagues submit in the portal, such as support requests, messages, comments and uploaded documents, along with records of key account activity (for example, who changed a project status or invited a team member) for security and audit purposes.',
      'When you email us, book a meeting or work with us on a project, we keep the correspondence, meeting notes and project records needed to provide our services.',
      'When you browse the website, we record limited first-party usage events, such as the page path you viewed, clicks on calls to action (for example, a "Book a consultation" button), campaign (UTM) parameters, the domain of the referring website and a random identifier generated in your browser for the current browsing session. This identifier is not linked to your name or email address. We do not use advertising cookies or third-party advertising trackers.',
      'To protect the website from spam and abuse, we process your IP address when you submit a form or make other requests. For rate limiting, we store only a salted hash of your IP address rather than the address itself. Our hosting and security providers may also process IP addresses and similar technical data in their own logs. Our application logs are configured to redact sensitive values such as passwords and access tokens.',
    ],
  },
  {
    heading: 'How we use information',
    paragraphs: ['We use the information described above to:'],
    bullets: [
      'Respond to your inquiry, schedule consultations and provide the services you request.',
      'Create and manage our internal record of your inquiry, including follow-up tasks and proposals.',
      'Notify our staff that a new inquiry has arrived, which may involve sending an internal email that contains the details you submitted.',
      "Operate the client portal, including authenticating users, controlling access to each organization's information and sharing project updates and documents.",
      'Send you messages you have agreed to receive, and service messages related to an active engagement.',
      'Understand, in aggregate, which pages and campaigns lead people to contact us, so we can improve the website.',
      'Protect the website, portal and our users, including preventing spam, abuse and unauthorized access.',
      'Comply with legal obligations and enforce our agreements.',
    ],
  },
  {
    heading: 'Legal bases and consent',
    paragraphs: [
      'We process personal information when it is necessary to respond to your request or to perform a contract with you or your organization, when we have a legitimate business interest that is not outweighed by your rights (such as keeping our services secure and understanding how the website is used), when the law requires it, or with your consent.',
      'Our contact form asks for your contact preferences separately from your inquiry. We record those preferences with your submission. We do not send marketing text messages without your express consent, and you can withdraw consent at any time by replying STOP to a text message, using the unsubscribe link in an email or contacting us at contact@koraldigital.com. Withdrawing consent does not affect messages already sent or processing that relies on a different legal basis.',
      'We do not send the information you submit through our contact form or portal to third-party artificial intelligence providers without disclosing it. If we introduce AI-assisted features that involve personal information, we will update this policy to describe the provider category and the data involved before those features are used, and a person will review any AI-assisted content before it is sent on our behalf.',
    ],
  },
  {
    heading: 'Sharing with service providers',
    paragraphs: [
      'We do not sell your personal information, and we do not share it for cross-context behavioral advertising. We share personal information only as described below.',
      'We use service providers that process information on our behalf to run the website and portal. They are permitted to use it only to provide services to us. The categories of providers we use or may use are:',
    ],
    bullets: [
      'Website and application hosting providers.',
      'A cloud provider that hosts our PostgreSQL database, where contact form submissions, portal accounts and project records are stored.',
      'An authentication provider (Descope) that manages sign-in for client and staff portal accounts.',
      'An email service provider that delivers internal notification emails and service messages.',
      'A cloud object storage provider that stores documents shared through the client portal.',
      "Scheduling tools, if you choose to book a meeting through a booking link. Information you enter there is also subject to that provider's own privacy policy.",
      'Professional advisers, such as accountants and attorneys, where needed.',
    ],
  },
  {
    heading: 'Other disclosures',
    paragraphs: [
      'A list of the specific vendors we use in each category will be published before the website and portal launch publicly, and kept up to date afterward.',
      'We may also disclose information when required by law or legal process, to protect the rights, safety or property of Koral Digital, our clients or others, or in connection with a merger, acquisition or sale of all or part of our business, in which case we will require the recipient to honor this policy. We will share information with other parties at your direction, for example when you ask us to connect one of your business tools.',
      "When we work inside a client's own systems, such as their CRM, we access and process that information only on the client's instructions and under our written agreement with that client. The client's own privacy notice governs how it handles its customers' information.",
    ],
  },
  {
    heading: 'Retention',
    paragraphs: [
      'We keep personal information only as long as we need it for the purposes described in this policy. As a general guide, we keep inquiry records while we are in active conversation with you and for a reasonable period afterward in case you contact us again; we keep client and project records for the duration of the engagement and as long as needed afterward for legal, accounting and dispute-resolution purposes; and we keep usage events and rate-limiting records only as long as they are useful for security and aggregate reporting.',
      'When information is no longer needed, we delete it or de-identify it. Specific retention periods will be confirmed before public launch. Copies may persist for a limited time in backups maintained by our hosting providers before they are overwritten.',
    ],
  },
  {
    heading: 'Security',
    paragraphs: [
      "We use reasonable administrative, technical and organizational measures designed to protect personal information. These include encrypted connections (HTTPS), authentication through a dedicated identity provider, role-based access controls that limit each portal user to their own organization's information, server-side permission checks, audit logs of key changes, and expiring links for downloading shared documents.",
      'No method of transmission or storage is completely secure, and we cannot guarantee absolute security. If we learn of a security incident that affects your personal information, we will notify you as required by applicable law.',
    ],
  },
  {
    heading: 'Your choices and rights',
    paragraphs: [
      "You can ask us to access, correct or delete the personal information we hold about you, and you can opt out of marketing messages at any time. Portal users can also ask their organization's account owner or us to update their account details.",
      'Depending on where you live and whether a particular law applies to us, state privacy laws, such as the Texas Data Privacy and Security Act, may give you additional rights, such as the right to obtain a copy of your data, to correct or delete it, to opt out of certain processing, and to appeal a decision we make about your request. We will respond to requests as required by applicable law.',
      'To make a request, email contact@koraldigital.com. We may need to verify your identity before acting on a request, and we will not discriminate against you for exercising your rights.',
    ],
  },
  {
    heading: "Children's privacy",
    paragraphs: [
      'The website and portal are intended for businesses and are not directed to children. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'We may update this policy as our services, vendors or legal obligations change. When we do, we will revise the "last updated" date on this page. If we make a material change, we will take reasonable steps to let you know, such as posting a notice on the website or emailing portal users.',
    ],
  },
  {
    heading: 'Contact us',
    paragraphs: [
      'If you have questions about this policy or how we handle personal information, contact Koral Digital at contact@koraldigital.com. We are based in Frisco, Texas.',
    ],
  },
];

export const termsSections: LegalSection[] = [
  {
    heading: 'About these terms',
    paragraphs: [
      'These terms of use ("terms") govern your use of koraldigital.com (the "website") and the Koral Digital client portal (the "portal"), which are operated by Koral Digital, based in Frisco, Texas ("Koral Digital," "we," "us" or "our"). By using the website or portal, you agree to these terms. If you use the portal on behalf of an organization, you confirm that you are authorized to accept these terms for it.',
      'Our privacy policy explains how we handle personal information and forms part of these terms.',
    ],
  },
  {
    heading: 'Use of the website',
    paragraphs: [
      'You may use the website to learn about our services, read our articles and contact us. You agree to provide accurate information when you submit a form and not to submit information about other people without their permission.',
      'We may change, suspend or discontinue any part of the website at any time.',
    ],
  },
  {
    heading: 'Information only; no guarantee of results',
    paragraphs: [
      'Content on the website, including articles, examples and illustrative workflows, is general information about business operations and technology. It is not legal, tax, financial or compliance advice, and you should consult a qualified professional about your specific situation, particularly regarding consent requirements for text messages and email.',
      'Examples on the website are illustrative and are not presented as results achieved for any client. We do not guarantee any particular outcome from using our website or services, including more leads, more booked appointments, higher revenue or search engine rankings. Results depend on many factors outside our control.',
    ],
  },
  {
    heading: 'Services are governed by separate agreements',
    paragraphs: [
      'Our consulting, implementation and support services are provided only under a separate written proposal, statement of work or services agreement between Koral Digital and the client. That agreement sets out the scope, deliverables, fees, payment terms, timelines and any service-specific terms.',
      'Any prices or package descriptions on the website are indicative, are subject to scope and do not constitute an offer. If these terms conflict with a signed services agreement, the services agreement controls for the services it covers.',
    ],
  },
  {
    heading: 'Client portal accounts',
    paragraphs: [
      'Portal access is by invitation only. You are responsible for keeping your sign-in methods secure, for activity that occurs under your account, and for notifying us promptly at contact@koraldigital.com if you suspect unauthorized access.',
      "An organization's account owner may invite or remove members of that organization and is responsible for ensuring that each invited person is authorized to see the organization's information. We may suspend or disable access to protect the portal, our clients or others, or when an engagement ends, and we will try to give reasonable notice where practical.",
    ],
  },
  {
    heading: 'Acceptable use',
    paragraphs: ['When using the website or portal, you agree not to:'],
    bullets: [
      'Attempt to access accounts, organizations, files or data that you are not authorized to access, including by altering links or identifiers.',
      'Probe, scan or test the vulnerability of our systems, or interfere with their operation, without our written permission.',
      'Upload malware or any file you do not have the right to share.',
      'Upload payment card numbers, government identification numbers, health information or similar sensitive data unless we have agreed in writing to handle it.',
      'Use automated means to scrape the website or portal, or submit spam through our forms.',
      'Use the website or portal in violation of any law or the rights of others.',
    ],
  },
  {
    heading: 'Confidentiality of portal content',
    paragraphs: [
      'Project plans, documents, updates, proposals and other materials in the portal are confidential to Koral Digital and the client organization they relate to. Portal users agree to use that content only for the engagement and not to share it outside their organization without permission, except as required by law.',
      "We treat client content in the portal as confidential and make it available only to authorized members of that client's organization and to Koral Digital personnel who need it to provide services. A signed services agreement may contain additional confidentiality terms, which control where they apply.",
    ],
  },
  {
    heading: 'Intellectual property',
    paragraphs: [
      'The website, the portal, and our content, design, logos and branding are owned by Koral Digital or our licensors and are protected by intellectual property laws. You may view and print pages for your own internal business use, but you may not copy, modify or redistribute our content or branding without permission.',
      'You keep ownership of the content and files you upload to the portal. You give us permission to host, copy and process that content as needed to operate the portal and provide our services to you. Ownership of deliverables created during an engagement is governed by the applicable services agreement.',
    ],
  },
  {
    heading: 'Third-party tools and integrations',
    paragraphs: [
      'Our work often involves software you license from other companies, such as CRMs, phone systems, scheduling tools, email and text messaging platforms, and integration platforms. Your use of those tools is governed by your agreements with those vendors, and you are responsible for maintaining your accounts, licenses and any required consents with them.',
      'We do not control third-party tools and are not responsible for their availability, changes to their features or pricing, or their handling of data. Mentioning a product on the website does not imply a partnership with, or endorsement by, its vendor.',
    ],
  },
  {
    heading: 'Disclaimers',
    paragraphs: [
      'The website and portal are provided "as is" and "as available." To the fullest extent permitted by law, we disclaim all warranties, express or implied, including implied warranties of merchantability, fitness for a particular purpose and non-infringement. We do not warrant that the website or portal will be uninterrupted, error-free or free of harmful components.',
    ],
  },
  {
    heading: 'Limitation of liability',
    paragraphs: [
      'To the fullest extent permitted by law, Koral Digital will not be liable for any indirect, incidental, special, consequential or punitive damages, or for any loss of profits, revenue, data or business opportunities, arising out of or related to your use of the website or portal, even if we have been advised of the possibility of those damages.',
      'To the fullest extent permitted by law, our total liability for any claim arising out of or related to the website or portal is limited to one hundred U.S. dollars (US$100). Liability related to paid services is governed by the applicable services agreement. Some jurisdictions do not allow certain limitations, so some of these limits may not apply to you.',
    ],
  },
  {
    heading: 'Indemnity',
    paragraphs: [
      "You agree to indemnify and hold harmless Koral Digital from claims, losses and expenses, including reasonable attorneys' fees, arising out of your misuse of the website or portal, content you upload, or your violation of these terms or of any law or third-party right.",
    ],
  },
  {
    heading: 'Governing law',
    paragraphs: [
      'These terms are governed by the laws of the State of Texas, without regard to its conflict-of-law rules. Any dispute arising out of or related to these terms or your use of the website or portal will be brought in the state or federal courts located in Texas, and you consent to the jurisdiction of those courts, unless a signed services agreement provides otherwise.',
    ],
  },
  {
    heading: 'Changes to these terms',
    paragraphs: [
      'We may update these terms from time to time. When we do, we will revise the "last updated" date on this page. Your continued use of the website or portal after an update means you accept the revised terms. If you do not agree, please stop using the website and portal.',
    ],
  },
  {
    heading: 'Contact us',
    paragraphs: [
      'Questions about these terms can be sent to contact@koraldigital.com. Koral Digital is based in Frisco, Texas.',
    ],
  },
];
