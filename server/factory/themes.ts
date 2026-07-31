export const FACTORY_THEMES = [
  'Conversion & Revenue',
  'Margin & Operations',
  'Acquisition & Lead Systems',
  'Governance & Trust',
  'Growth Infrastructure',
] as const;

export type FactoryTheme = typeof FACTORY_THEMES[number];

export interface AppDefinition {
  appName: string;
  oneLinePromise: string;
  targetCustomer: string;
  coreProblem: string;
  aiDoes: string[];
  differentiator: string;
  successMetric: string;
  suggestedPricing: string;
  liquidGlassNote?: string;
  technicalNotes: string;
}

export interface SalesProposal {
  title: string;
  type: 'single' | 'suite';
  appName?: string;
  markdown: string;
}

export interface QualityCheck {
  explainUnder20Sec: boolean;
  measurableOutcome: boolean;
  pricingJustified: boolean;
  wouldBuy: boolean;
  languageCurrent: boolean;
  passed: boolean;
  notes?: string;
}

export interface DailyRun {
  id: string;
  date: string;
  theme: FactoryTheme;
  clusterName: string;
  folderPath: string;
  apps: AppDefinition[];
  proposals: SalesProposal[];
  qualityChecks: QualityCheck[];
  qualityPassed: boolean;
  createdAt: string;
}

/** App seeds per theme — pulled from Sovereign Growth OS buckets */
export const THEME_CLUSTERS: Record<FactoryTheme, { clusterName: string; apps: Omit<AppDefinition, 'liquidGlassNote'>[] }> = {
  'Conversion & Revenue': {
    clusterName: 'ConversionRevenue',
    apps: [
      {
        appName: 'PriceLift AI',
        oneLinePromise: 'Raise prices without losing customers — AI finds your optimal price point in 48 hours.',
        targetCustomer: 'SaaS founders & agency owners doing $10K–$500K MRR',
        coreProblem: 'Most businesses underprice by 20–40% because they guess instead of testing. Manual A/B pricing takes months and loses revenue every day.',
        aiDoes: [
          'Analyzes competitor pricing, willingness-to-pay signals, and churn patterns',
          'Runs simulated price scenarios against your customer segments',
          'Generates a pricing ladder with feature gates and upsell triggers',
          'Drafts customer communication scripts for price changes',
          'Monitors post-change retention and auto-adjusts recommendations',
        ],
        differentiator: 'Unlike ProfitWell or Price Intelligently (enterprise-only), this is AI-native, runs in 48hrs, and includes ready-to-send customer scripts.',
        successMetric: 'Average 18–32% revenue lift within 90 days without increasing churn above 2%',
        suggestedPricing: '$297/mo or $2,497/yr — ROI positive if it lifts MRR by even 5%',
        technicalNotes: 'Stripe/RevenueCat integration, CRM webhook, anonymized cohort analysis',
      },
      {
        appName: 'DemoClose Copilot',
        oneLinePromise: 'Turn more demos into paid contracts with real-time AI coaching during sales calls.',
        targetCustomer: 'B2B sales teams, solo consultants, and high-ticket coaches',
        coreProblem: 'Reps lose deals in the last 10 minutes of demos — wrong objection handling, weak close, no urgency. Managers can\'t join every call.',
        aiDoes: [
          'Listens to live demo audio and surfaces objection responses in real-time',
          'Scores talk-ratio, question quality, and close attempts',
          'Generates personalized follow-up emails within 5 minutes of call end',
          'Builds a win/loss pattern library from your team\'s calls',
          'Suggests pricing and package based on prospect signals',
        ],
        differentiator: 'Gong costs $1,400+/seat/yr and is post-call only. This is live, affordable, and built for teams under 20 reps.',
        successMetric: '25–40% improvement in demo-to-close rate within 60 days',
        suggestedPricing: '$147/mo per seat or $997/mo team (up to 10 seats)',
        technicalNotes: 'Zoom/Google Meet API, Whisper transcription, CRM sync (HubSpot/Pipedrive)',
      },
      {
        appName: 'Referral Revenue Engine',
        oneLinePromise: 'Launch a self-running referral program that generates 15–30% of new revenue on autopilot.',
        targetCustomer: 'Subscription businesses, course creators, and local service companies',
        coreProblem: 'Referral programs fail because setup is complex, rewards are wrong, and follow-up is manual. Most never launch one.',
        aiDoes: [
          'Designs reward structure based on your margins and LTV',
          'Generates referral landing pages, emails, and social share assets',
          'Tracks referrer performance and auto-sends reward reminders',
          'Identifies your top 10% customers most likely to refer',
          'A/B tests incentive amounts and messaging automatically',
        ],
        differentiator: 'ReferralCandy and PartnerStack require weeks of setup. This launches in one afternoon with AI-generated assets.',
        successMetric: '15–30% of new customers from referrals within 90 days',
        suggestedPricing: '$97/mo + 2% of referral-attributed revenue',
        technicalNotes: 'Stripe/payment webhooks, unique referral codes, email automation (SendGrid/Resend)',
      },
      {
        appName: 'ChurnShield AI',
        oneLinePromise: 'Catch at-risk customers before they cancel — AI predicts churn 14 days early and triggers saves.',
        targetCustomer: 'SaaS, membership sites, and subscription box companies',
        coreProblem: 'By the time a customer hits "cancel," it\'s too late. Teams react instead of prevent. Churn costs 5–25x acquisition.',
        aiDoes: [
          'Scores every account daily on churn risk (usage, support tickets, billing)',
          'Triggers automated save sequences: personal outreach, offers, check-ins',
          'Identifies feature gaps causing churn patterns',
          'Generates win-back campaigns for recently churned users',
          'Reports ROI of every save attempt',
        ],
        differentiator: 'ChurnZero and Totango are enterprise-priced. This is SMB-friendly with pre-built save playbooks.',
        successMetric: 'Reduce monthly churn by 20–35% within 60 days',
        suggestedPricing: '$197/mo for up to 1,000 accounts, $497/mo for 5,000',
        technicalNotes: 'Product analytics (Mixpanel/PostHog), billing events, email/in-app messaging',
      },
      {
        appName: 'Upsell Moment Detector',
        oneLinePromise: 'Find the exact moment each customer is ready to upgrade — and send the perfect offer automatically.',
        targetCustomer: 'Freemium SaaS, app developers, and tiered service businesses',
        coreProblem: 'Upsells are sent randomly (newsletters, pop-ups) instead of when customers actually hit usage limits or success milestones.',
        aiDoes: [
          'Monitors usage patterns to detect upgrade readiness signals',
          'Generates personalized upgrade offers with ROI justification',
          'Times in-app prompts, emails, and sales outreach for max conversion',
          'Tracks expansion revenue per segment and channel',
          'Learns from won/lost upsells to improve timing',
        ],
        differentiator: 'Pendo and Appcues focus on onboarding, not revenue expansion. This is purpose-built for upgrade conversion.',
        successMetric: '20–45% increase in expansion MRR within 90 days',
        suggestedPricing: '$127/mo or 3% of expansion revenue generated',
        technicalNotes: 'Usage event tracking, in-app messaging SDK, Stripe subscription upgrades',
      },
    ],
  },
  'Margin & Operations': {
    clusterName: 'MarginOperations',
    apps: [
      {
        appName: 'ExpenseLeak Finder',
        oneLinePromise: 'Find hidden margin leaks across vendors, subscriptions, and ops — recover 8–15% automatically.',
        targetCustomer: 'Agencies, e-commerce brands, and ops-heavy SMBs',
        coreProblem: 'SaaS sprawl and vendor creep silently eat margins. Nobody audits subscriptions monthly.',
        aiDoes: ['Scans bank/card feeds for duplicate and unused subscriptions', 'Benchmarks vendor pricing against market rates', 'Flags auto-renewals 30 days before charge', 'Generates cancellation/renegotiation scripts', 'Tracks recovered savings month-over-month'],
        differentiator: 'Not just expense tracking — AI actively finds leaks and drafts recovery actions.',
        successMetric: '8–15% opex reduction within 60 days',
        suggestedPricing: '$97/mo — pays for itself with first recovered subscription',
        technicalNotes: 'Plaid/bank API, receipt OCR, vendor database',
      },
      {
        appName: 'Compliance AutoPilot',
        oneLinePromise: 'Stay compliant with GDPR, SOC2-lite, and industry rules without hiring a compliance team.',
        targetCustomer: 'Startups selling to enterprise, health/fintech adjacent SMBs',
        coreProblem: 'Compliance audits stall deals. Manual checklist tracking fails and creates liability.',
        aiDoes: ['Maintains living compliance checklist per framework', 'Auto-generates policy docs and audit evidence', 'Alerts on regulatory changes affecting your stack', 'Preps audit-ready export packages', 'Scores compliance readiness for sales proposals'],
        differentiator: 'Vanta/Drata are $20K+/yr. This is the SMB on-ramp with AI-generated docs.',
        successMetric: 'Audit-ready in 30 days vs 6-month industry average',
        suggestedPricing: '$247/mo',
        technicalNotes: 'Doc templates, cloud infra scan, employee policy tracking',
      },
      {
        appName: 'OnboardFlow AI',
        oneLinePromise: 'Cut customer onboarding time in half with AI-generated playbooks per client segment.',
        targetCustomer: 'Agencies, B2B SaaS with services component, consultants',
        coreProblem: 'Every client onboarding is reinvented. Time-to-value is slow and inconsistent.',
        aiDoes: ['Generates segment-specific onboarding checklists', 'Auto-creates welcome sequences and milestone emails', 'Tracks onboarding completion and bottlenecks', 'Surfaces at-risk onboardings before they churn', 'Builds reusable templates from successful onboardings'],
        differentiator: 'Project tools don\'t understand onboarding psychology. This is outcome-driven.',
        successMetric: '50% faster time-to-first-value, 30% fewer early churners',
        suggestedPricing: '$147/mo',
        technicalNotes: 'CRM integration, task automation, client portal',
      },
      {
        appName: 'AuditTrail Guardian',
        oneLinePromise: 'Immutable audit logs and anomaly detection for every critical business action.',
        targetCustomer: 'Finance teams, agencies handling client funds, regulated SMBs',
        coreProblem: 'When something goes wrong, nobody knows who did what. Disputes and fraud go undetected.',
        aiDoes: ['Logs all critical actions with tamper-proof timestamps', 'Detects anomalous patterns (unusual refunds, access)', 'Generates incident reports automatically', 'Role-based access reviews monthly', 'Export for legal/accounting review'],
        differentiator: 'Enterprise SIEM is overkill. This is business-action focused for SMBs.',
        successMetric: '100% critical action coverage, <1hr incident response time',
        suggestedPricing: '$177/mo',
        technicalNotes: 'Webhook ingestion, immutable storage, Slack alerts',
      },
      {
        appName: 'VendorScore AI',
        oneLinePromise: 'Score, compare, and renegotiate every vendor contract with AI-powered benchmarks.',
        targetCustomer: 'Ops managers, CFOs at 20–200 person companies',
        coreProblem: 'Vendor contracts auto-renew at inflated rates. No one tracks performance vs cost.',
        aiDoes: ['Centralizes all vendor contracts and renewal dates', 'Benchmarks pricing against industry data', 'Scores vendor performance from team feedback', 'Drafts renegotiation emails with data backing', 'Recommends consolidate-or-switch decisions'],
        differentiator: 'Procurement software is enterprise. This is self-serve and AI-negotiation ready.',
        successMetric: '12–22% vendor cost reduction on renegotiated contracts',
        suggestedPricing: '$127/mo',
        technicalNotes: 'Contract upload/OCR, calendar reminders, email drafts',
      },
    ],
  },
  'Acquisition & Lead Systems': {
    clusterName: 'AcquisitionLeads',
    apps: [
      {
        appName: 'IntentScore Engine',
        oneLinePromise: 'Score every lead by buying intent so sales only talks to prospects ready to close.',
        targetCustomer: 'B2B sales teams, high-ticket coaches, agency owners',
        coreProblem: 'Sales wastes 60% of time on cold leads while hot prospects go cold waiting.',
        aiDoes: ['Aggregates signals: site visits, email opens, content downloads', 'Scores 0–100 intent with explainable factors', 'Routes hot leads to sales instantly via Slack/SMS', 'Suggests personalized outreach based on behavior', 'Learns from closed-won patterns'],
        differentiator: '6sense and Demandbase are enterprise. This works for teams under 50 with plug-and-play setup.',
        successMetric: '40% more meetings booked from same lead volume',
        suggestedPricing: '$197/mo',
        technicalNotes: 'Website pixel, CRM sync, email tracking',
      },
      {
        appName: 'GrantFinder AI',
        oneLinePromise: 'Discover and draft winning grant applications for your business — automatically.',
        targetCustomer: 'Nonprofits, research startups, minority-owned businesses, civic orgs',
        coreProblem: 'Grant opportunities are scattered across 100+ databases. Applications take 40+ hours each.',
        aiDoes: ['Scans federal, state, and private grant databases daily', 'Matches grants to your org profile with fit score', 'Drafts application narratives from your past wins', 'Tracks deadlines and required documents', 'Alerts on new high-fit opportunities'],
        differentiator: 'Grant writers charge $5K–$15K per app. This finds AND drafts at fraction of cost.',
        successMetric: '3x more grant applications submitted, 2x win rate improvement',
        suggestedPricing: '$147/mo or $497 per successful application assist',
        technicalNotes: 'Grant API feeds, document generation, deadline calendar',
      },
      {
        appName: 'LeadMagnet Factory',
        oneLinePromise: 'Generate high-converting lead magnets tailored to your niche in under 30 minutes.',
        targetCustomer: 'Coaches, consultants, course creators, local service businesses',
        coreProblem: 'Generic ebooks and checklists don\'t convert anymore. Creating custom magnets takes days.',
        aiDoes: ['Researches what your audience actually searches for', 'Generates ebooks, quizzes, calculators, templates', 'Creates matching landing pages and email sequences', 'A/B tests headlines and opt-in forms', 'Tracks cost-per-lead by magnet type'],
        differentiator: 'Canva + ChatGPT is manual. This is end-to-end: research → asset → page → sequence.',
        successMetric: '2–4x opt-in rate vs generic lead magnets',
        suggestedPricing: '$77/mo unlimited magnets',
        technicalNotes: 'Landing page builder, email integration, analytics',
      },
      {
        appName: 'IntakeBot Pro',
        oneLinePromise: 'Replace static contact forms with AI intake that qualifies, schedules, and nurtures leads 24/7.',
        targetCustomer: 'Law firms, medical practices, agencies, home services',
        coreProblem: 'Contact forms capture junk leads. Staff spends hours qualifying before a single call.',
        aiDoes: ['Conversational intake that adapts questions to answers', 'Qualifies budget, timeline, and fit automatically', 'Books qualified leads directly on calendar', 'Routes unqualified to nurture sequences', 'Syncs enriched data to CRM'],
        differentiator: 'Drift and Intercom are expensive and generic. This is qualification-first for SMBs.',
        successMetric: '70% reduction in unqualified calls, 35% more booked meetings',
        suggestedPricing: '$127/mo',
        technicalNotes: 'Chat widget, Calendly sync, CRM webhook',
      },
      {
        appName: 'WarmIntro Network',
        oneLinePromise: 'Map your network and generate warm intro requests that actually get responses.',
        targetCustomer: 'Founders, sales leaders, business development professionals',
        coreProblem: 'Cold outreach converts at 1–3%. Warm intros convert at 30–50% but nobody systematizes asking.',
        aiDoes: ['Maps LinkedIn/email network for path to target accounts', 'Drafts intro request messages for mutual connections', 'Tracks intro status and follow-up timing', 'Suggests give-before-ask reciprocity moves', 'Reports intro-to-meeting conversion rates'],
        differentiator: 'LinkedIn Sales Nav shows paths but doesn\'t draft asks. This closes the loop.',
        successMetric: '5x more warm intros per month, 40% meeting rate',
        suggestedPricing: '$97/mo',
        technicalNotes: 'LinkedIn API (where available), email parsing, CRM logging',
      },
    ],
  },
  'Governance & Trust': {
    clusterName: 'GovernanceTrust',
    apps: [
      {
        appName: 'BrandGuard AI',
        oneLinePromise: 'Ensure every piece of content, ad, and email stays on-brand — automatically flagged before publish.',
        targetCustomer: 'Marketing teams, agencies managing multiple brands, franchise ops',
        coreProblem: 'Off-brand content erodes trust and wastes ad spend. Manual brand reviews bottleneck output.',
        aiDoes: ['Learns your brand voice, visuals, and taboo topics', 'Reviews content pre-publish with fix suggestions', 'Scores brand alignment 0–100 with explanations', 'Maintains approved phrase/messaging library', 'Tracks brand consistency across channels'],
        differentiator: 'Brand folders in Notion don\'t enforce anything. This is active gatekeeping.',
        successMetric: '90% reduction in off-brand publishes, 50% faster review cycles',
        suggestedPricing: '$147/mo',
        technicalNotes: 'CMS plugin, social scheduler integration, style guide upload',
      },
      {
        appName: 'SecurityPosture Scanner',
        oneLinePromise: 'Continuous security scoring for your SaaS stack — close gaps before customers ask.',
        targetCustomer: 'SaaS startups, agencies handling client data, e-commerce',
        coreProblem: 'Enterprise buyers require security questionnaires. Startups fail audits ad-hoc.',
        aiDoes: ['Scans infra, dependencies, and access patterns weekly', 'Generates security questionnaire auto-fill responses', 'Prioritizes fixes by risk and effort', 'Tracks remediation progress', 'Produces customer-ready security one-pager'],
        differentiator: 'Pen tests cost $10K+. This is continuous, affordable monitoring.',
        successMetric: 'Security questionnaire completion in 2hrs vs 2 weeks',
        suggestedPricing: '$197/mo',
        technicalNotes: 'GitHub/cloud scan, dependency audit, SSO check',
      },
      {
        appName: 'IP Shield Tracker',
        oneLinePromise: 'Monitor and protect your trademarks, content, and code from unauthorized use.',
        targetCustomer: 'Creators, SaaS companies, brands with unique IP',
        coreProblem: 'IP theft is discovered too late. Manual Google alerts miss most infringements.',
        aiDoes: ['Monitors web for trademark and content copies', 'Detects code/asset reuse across repos and sites', 'Generates cease-and-desist drafts', 'Tracks takedown request status', 'Maintains IP asset registry'],
        differentiator: 'Legal teams are reactive and expensive. This is proactive monitoring for creators.',
        successMetric: 'Detect infringements within 72hrs vs weeks/months',
        suggestedPricing: '$127/mo',
        technicalNotes: 'Web crawler, image hash matching, DMCA templates',
      },
      {
        appName: 'VerifyTrust Portal',
        oneLinePromise: 'Give customers a public trust page proving your security, uptime, and compliance status.',
        targetCustomer: 'B2B SaaS, fintech-adjacent, healthcare-adjacent startups',
        coreProblem: 'Prospects ask "are you secure?" and sales scrambles for proof. Trust pages are static and stale.',
        aiDoes: ['Auto-updates trust page from live security/compliance scans', 'Displays uptime, certifications, and audit status', 'Embeds in sales proposals and website', 'Alerts when trust score drops', 'Generates prospect-specific trust summaries'],
        differentiator: 'Static Notion trust centers go stale. This is live and sales-integrated.',
        successMetric: '30% shorter enterprise sales cycles',
        suggestedPricing: '$97/mo',
        technicalNotes: 'Status page integration, badge embed, webhook updates',
      },
      {
        appName: 'Alignment Audit AI',
        oneLinePromise: 'Audit whether your product, marketing, and sales promises actually match what you deliver.',
        targetCustomer: 'Growing startups experiencing churn from expectation gaps',
        coreProblem: 'Marketing overpromises, product underdelivers, sales mispositions. Churn follows.',
        aiDoes: ['Compares marketing copy vs product capabilities vs support tickets', 'Flags promise gaps with severity scores', 'Suggests copy fixes and product priority shifts', 'Tracks alignment score over time', 'Generates customer expectation management guides'],
        differentiator: 'No tool connects marketing claims to product reality. This prevents reputation damage.',
        successMetric: '25% reduction in "doesn\'t match expectations" churn reasons',
        suggestedPricing: '$147/mo',
        technicalNotes: 'Content crawl, support ticket NLP, product roadmap sync',
      },
    ],
  },
  'Growth Infrastructure': {
    clusterName: 'GrowthInfrastructure',
    apps: [
      {
        appName: 'Revenue Command Dashboard',
        oneLinePromise: 'One screen showing MRR, pipeline, churn, and expansion — updated live from all your tools.',
        targetCustomer: 'Founders and revenue leaders at $50K–$2M ARR companies',
        coreProblem: 'Data lives in 8 tools. Monday meetings waste an hour compiling numbers that are already stale.',
        aiDoes: ['Pulls live data from Stripe, CRM, analytics, support', 'Shows MRR waterfall, pipeline velocity, churn cohorts', 'AI narrates weekly revenue story in plain English', 'Alerts on anomalies (spike in churn, dip in pipeline)', 'Exports board-ready reports'],
        differentiator: 'Baremetrics + HubSpot dashboards require manual setup. This is AI-narrated and instant.',
        successMetric: 'Save 5+ hours/week on reporting, catch revenue issues 7 days earlier',
        suggestedPricing: '$197/mo',
        technicalNotes: 'Stripe, HubSpot, Mixpanel, Intercom APIs',
      },
      {
        appName: 'DeployFlow Orchestrator',
        oneLinePromise: 'Coordinate multi-app deployments with AI-managed dependencies and rollback safety.',
        targetCustomer: 'Small eng teams, agencies shipping client projects, solo devs with micro-SaaS',
        coreProblem: 'Deploying 5 related apps means manual coordination, broken dependencies, and scary rollbacks.',
        aiDoes: ['Maps dependency graph across services', 'Orchestrates staged deployments with health checks', 'Auto-rolls back on error thresholds', 'Generates deployment runbooks', 'Notifies stakeholders with status updates'],
        differentiator: 'Kubernetes is overkill. This is the SMB multi-app deploy layer.',
        successMetric: '80% fewer deployment incidents, 50% faster release cycles',
        suggestedPricing: '$127/mo',
        technicalNotes: 'GitHub Actions, Vercel/Railway webhooks, Slack notifications',
      },
      {
        appName: 'Analytics Unifier',
        oneLinePromise: 'Unify product, marketing, and revenue analytics into one AI-queryable brain.',
        targetCustomer: 'Growth teams drowning in disconnected dashboards',
        coreProblem: 'Ask "why did conversions drop?" and spend a day in 5 tools. Insights are slow and siloed.',
        aiDoes: ['Connects all analytics sources into unified data model', 'Natural language queries: "why did trial conversion drop?"', 'Auto-generates weekly insight reports', 'Correlates marketing spend to revenue outcomes', 'Surfaces actionable recommendations'],
        differentiator: 'Looker and Tableau need data teams. This is ask-a-question-get-an-answer for founders.',
        successMetric: 'Answer business questions in minutes vs days',
        suggestedPricing: '$247/mo',
        technicalNotes: 'GA4, Mixpanel, ad platform APIs, data warehouse lite',
      },
      {
        appName: 'Growth Experiment Lab',
        oneLinePromise: 'Run structured growth experiments with AI-designed hypotheses and automatic result analysis.',
        targetCustomer: 'Growth marketers, product managers, founder-led growth teams',
        coreProblem: 'Teams run random tests without hypotheses, proper sample sizes, or learning capture.',
        aiDoes: ['Generates testable hypotheses from your metrics gaps', 'Calculates required sample sizes and duration', 'Tracks experiment results with statistical significance', 'Documents learnings in searchable experiment library', 'Suggests next experiments based on results'],
        differentiator: 'Optimizely is A/B only. This is full experiment lifecycle with AI hypothesis generation.',
        successMetric: '3x more experiments run, 2x win rate on prioritized tests',
        suggestedPricing: '$147/mo',
        technicalNotes: 'Feature flag integration, analytics events, experiment DB',
      },
      {
        appName: 'StackHealth Monitor',
        oneLinePromise: 'Monitor your entire SaaS stack health — uptime, costs, performance, and security in one place.',
        targetCustomer: 'Technical founders, dev agencies, ops-conscious SMBs',
        coreProblem: 'Tool sprawl means nobody knows if something is down, slow, or over budget until customers complain.',
        aiDoes: ['Monitors uptime and response times for all connected services', 'Tracks monthly tool costs and flags budget overruns', 'Detects performance regressions after deploys', 'Scores overall stack health 0–100', 'Weekly health report with prioritized fixes'],
        differentiator: 'Datadog is dev-focused and expensive. This is business-owner friendly stack monitoring.',
        successMetric: 'Detect outages 10x faster, reduce tool spend 10–15%',
        suggestedPricing: '$97/mo',
        technicalNotes: 'HTTP checks, billing API pulls, GitHub deploy hooks',
      },
    ],
  },
};

export function getThemeForDay(date: Date = new Date()): FactoryTheme {
  const dayIndex = date.getDay(); // 0=Sun, 1=Mon...
  const workDayIndex = dayIndex === 0 ? 4 : dayIndex === 6 ? 4 : dayIndex - 1; // Mon=0..Thu=3, Fri=4
  return FACTORY_THEMES[Math.min(workDayIndex, 4)];
}
