export default function Home() {
  const stages = [
    {
      title: "1. Schedule & Lead Intake",
      body:
        "A Cron node runs each weekday at 08:00 in your sales rep's timezone. It fans into a Google Sheets node that fetches rows flagged as `Status = new` from an outreach sheet with your prospect list and personalization columns.",
    },
    {
      title: "2. Smart Batching",
      body:
        "Split In Batches processes leads in configurable groups (default 25). A short Function node cleans the record, merges fallback values, and builds an email-friendly payload. If the batch exhausts, the workflow sleeps until the next schedule.",
    },
    {
      title: "3. Dynamic Personalization",
      body:
        "A Set node assembles the subject line and message body using template literals. It supports liquid-style placeholders and conditional snippets (e.g. inserting recent news or product fit bullets when present).",
    },
    {
      title: "4. Email Delivery & Throttling",
      body:
        "The core send step uses an SMTP node (Gmail, AWS SES, Resend, etc.) with per-message metadata for unsubscribe links and optional custom tracking domains. Rate limiting is handled by a Wait node between sends to keep under ESP/API quotas.",
    },
    {
      title: "5. Post-Send Bookkeeping",
      body:
        "Once an email fires successfully, Google Sheets updates the row: `Status = sent`, `Last Touch`, `Campaign`, and `Message Id`. Errors are caught in a separate branch that records the failure reason and leaves the lead available for the next run.",
    },
    {
      title: "6. Optional Follow-Up Branching",
      body:
        "Webhook events (opens, replies, bounces) can trigger the workflow mid-cycle to branch into follow-up messaging, CRM updates, or Slack nudges for manual outreach.",
    },
  ];

  const nodes = [
    {
      name: "Cron Trigger",
      type: "n8n-nodes-base.cron",
      purpose: "Schedule daily outreach windows with timezone support and skip weekends toggle.",
    },
    {
      name: "Google Sheets - Fetch Prospects",
      type: "n8n-nodes-base.googleSheets",
      purpose:
        "Reads rows with `Status = new`, selects key personalization columns, and sorts by `Last Touch`.",
    },
    {
      name: "Split In Batches",
      type: "n8n-nodes-base.splitInBatches",
      purpose:
        "Ensures you only contact a set number of leads per execution to respect sending limits.",
    },
    {
      name: "Function - Build Payload",
      type: "n8n-nodes-base.function",
      purpose:
        "Normalizes fields, stitches together the outreach template, and produces a ready-to-send payload.",
    },
    {
      name: "Set - Compose Email",
      type: "n8n-nodes-base.set",
      purpose:
        "Generates subject/body using personalization tokens like {{company}}, {{pain_point}}, {{cta}}.",
    },
    {
      name: "SMTP Email Node",
      type: "n8n-nodes-base.emailSend",
      purpose:
        "Delivers the message through your ESP with headers for tracking, reply-to routing, and optional BCC logging.",
    },
    {
      name: "Wait - Throttle",
      type: "n8n-nodes-base.wait",
      purpose: "Delays the loop 20–30 seconds between sends to mimic human cadence and avoid blocklists.",
    },
    {
      name: "Google Sheets - Mark Sent",
      type: "n8n-nodes-base.googleSheets",
      purpose:
        "Updates the original row with send metadata so the lead is excluded from future runs until the next follow-up cadence.",
    },
    {
      name: "Error Branch",
      type: "n8n-nodes-base.set",
      purpose: "Captures error detail, writes it back to Sheets, and notifies Slack for manual review.",
    },
  ];

  const personalizationSnippet = `Subject: {{first_name}}, quick idea for {{company}}

Hi {{first_name}},

Noticed {{company}} recently {{hook}}. Teams in {{industry}} use {{product}} to {{value_prop}} without adding headcount.

Happy to send a 2-slide teardown tailored to {{company}}—worth it?

Best,
{{sender_name}}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 py-16 sm:px-10 lg:px-16">
        <section className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl shadow-slate-900/50 lg:flex-row lg:items-start lg:gap-12">
          <div className="flex-1 space-y-4">
            <span className="inline-flex w-fit items-center rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
              n8n Outreach Blueprint
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Cold Email Automation Workflow for n8n
            </h1>
            <p className="text-lg text-slate-200">
              Deploy a production-ready outreach engine that respects sending limits, keeps your campaign
              sheet in sync, and adapts messaging per lead. Import the workflow JSON into n8n, plug in your
              credentials, and you are sending personalized emails in minutes.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/workflow-n8n.json"
                download
                className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-300"
              >
                Download workflow JSON
              </a>
              <a
                href="#implementation"
                className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-white"
              >
                See implementation guide
              </a>
            </div>
          </div>
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-sm text-slate-300">
            <h2 className="text-base font-semibold text-white">Execution Highlights</h2>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>Daily send window with built-in throttling &amp; batching</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>Personalized copy from Google Sheets merge fields</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>Error-safe updates so no lead is contacted twice by accident</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-3">
          {stages.map((stage) => (
            <article
              key={stage.title}
              className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-200"
            >
              <h3 className="text-lg font-semibold text-white">{stage.title}</h3>
              <p className="leading-6 text-slate-300">{stage.body}</p>
            </article>
          ))}
        </section>

        <section
          id="implementation"
          className="rounded-3xl border border-slate-800 bg-slate-900/60 p-10 text-slate-200"
        >
          <h2 className="text-2xl font-semibold text-white">Implementation Checklist</h2>
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Connect data &amp; infrastructure</h3>
              <ul className="space-y-3 text-sm leading-6 text-slate-300">
                <li>
                  • Create a Google Sheet with columns: <strong>First Name</strong>, <strong>Company</strong>,
                  <strong> Role</strong>, <strong>Pain Point</strong>, <strong>Hook</strong>,{" "}
                  <strong>Status</strong>, <strong>Email</strong>, <strong>Last Touch</strong>.
                </li>
                <li>
                  • Share the sheet with the Google service account used in n8n and paste its ID into the
                  workflow credentials.
                </li>
                <li>
                  • Add SMTP credentials (Gmail app password, SES, Resend, etc.) to the Email node credential.
                </li>
                <li>• Optional: set up Slack or CRM credentials to activate the side-channel alerts.</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Configure workflow variables</h3>
              <ul className="space-y-3 text-sm leading-6 text-slate-300">
                <li>• `batchSize` (default 25) in the Split In Batches node.</li>
                <li>• `sendDelaySeconds` (default 30) in the Wait node to manage throttling.</li>
                <li>• Template snippets inside the Set node for subject/body copy.</li>
                <li>• Google Sheets range (e.g., `Leads!A:H`) for reading and writing rows.</li>
              </ul>
            </div>
          </div>
          <div className="mt-8">
            <h3 className="font-semibold text-white">Personalization Template Preview</h3>
            <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-sm text-emerald-100">
              {personalizationSnippet}
            </pre>
          </div>
        </section>

        <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-10 text-slate-200">
          <h2 className="text-2xl font-semibold text-white">Node-by-node Breakdown</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {nodes.map((node) => (
              <div
                key={node.name}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-sm text-slate-300"
              >
                <p className="text-xs uppercase tracking-wide text-emerald-200/80">{node.type}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{node.name}</h3>
                <p className="mt-3 leading-6">{node.purpose}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-400/30 bg-emerald-400/5 p-10 text-slate-100">
          <h2 className="text-2xl font-semibold text-white">Monitoring &amp; Scaling Tips</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-emerald-100/90">
            <li>
              • Activate n8n execution logging with a 30-day retention window to audit sends and bounce causes.
            </li>
            <li>
              • Chain a HubSpot, Pipedrive, or Airtable node after the send to keep the rest of your stack in
              sync.
            </li>
            <li>
              • Use the optional webhook trigger bundled in the workflow to branch follow-ups on opens or
              replies.
            </li>
            <li>
              • Duplicate the workflow per segment (ICP, persona, language) and stagger Cron triggers to avoid
              overlap.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
