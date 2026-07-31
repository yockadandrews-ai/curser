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

export interface ThemeCluster {
  clusterName: string;
  folderSlug: string;
  suiteTitle: string;
  suitePromise: string;
  suiteIncludes: string;
  suitePricing: string;
  suiteCta: string;
  apps: Omit<AppDefinition, 'liquidGlassNote'>[];
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

export interface MultiThemeRun {
  id: string;
  date: string;
  folderPath: string;
  themes: DailyRun[];
  masterNotes: string;
  totalApps: number;
  totalProposals: number;
  qualityPassed: boolean;
  createdAt: string;
}

/** Sovereign Growth OS — 2026-refined app clusters */
export const THEME_CLUSTERS: Record<FactoryTheme, ThemeCluster> = {
  'Conversion & Revenue': {
    clusterName: 'ConversionRevenue',
    folderSlug: '01_Conversion_Revenue',
    suiteTitle: 'The AI Conversion Operating System',
    suitePromise: 'Five connected portals that move a stranger to a high-ticket buyer and keep more of the money you make.',
    suiteIncludes: 'Offer-Optics + Bridge-Builder + Closer-Command + Echo-Scale + Value-Verify + Master Dashboard',
    suitePricing: '$697–$1,197/mo',
    suiteCta: 'Start the Full Conversion OS trial or book a strategy call.',
    apps: [
      {
        appName: 'Offer-Optics AI',
        oneLinePromise: 'Know the market ceiling and price high-ticket services with precision.',
        targetCustomer: 'Agencies, consultants, coaches ($10k–$500k+/mo)',
        coreProblem: 'Founders underprice because tools are built for SaaS/ecom, not service packages + live demand.',
        aiDoes: [
          'Competitor + market scanning for service-based pricing',
          'Lead-velocity adjustment based on pipeline heat',
          'Confidence-scored price bands with revenue-impact projections',
          'Optional Glass Slider for interactive price exploration',
          'Export pricing recommendations to proposals and CRM',
        ],
        differentiator: 'Service-specific + live lead velocity (not usage-based SaaS pricing models).',
        successMetric: '15–25% higher average initial contract value',
        suggestedPricing: '$149–$249/mo',
        technicalNotes: 'CRM, calendar, public pricing sources',
      },
      {
        appName: 'Bridge-Builder AI',
        oneLinePromise: 'Instant personalized demo of your service applied to any prospect\'s site.',
        targetCustomer: 'Anyone selling services who still builds custom proposals manually',
        coreProblem: 'Interest dies in the gap between "interested" and a tangible vision.',
        aiDoes: [
          'URL → 20–40s branded preview video of your service on their site',
          'Lensing visual treatment for premium aesthetic',
          'Engagement tracking on preview views',
          'Auto follow-up triggers when prospect watches 50%+',
          'Template library for different service types',
        ],
        differentiator: 'Sales asset, not a website builder — purpose-built for closing.',
        successMetric: 'Higher reply and booking rates on follow-ups',
        suggestedPricing: 'Base + credits per demo',
        technicalNotes: 'CRM, email sequences',
      },
      {
        appName: 'Closer-Command AI',
        oneLinePromise: 'Live objection handling and buying-signal detection during the call.',
        targetCustomer: 'Founders who close their own deals + high-ticket sales teams',
        coreProblem: 'Most tools analyze after the call; you need help while the conversation is live.',
        aiDoes: [
          'Real-time/near-real-time audio analysis during sales calls',
          'Whisper Text rebuttals surfaced on second screen',
          'Buying-signal glow indicators when prospect is ready',
          'Post-call coaching summary with improvement areas',
          'Privacy controls — opt-in recording, data retention policies',
        ],
        differentiator: 'In-the-moment assistance, not just post-call summary.',
        successMetric: '10–20% better same-cycle close rate',
        suggestedPricing: '$79–$179/seat/mo',
        technicalNotes: 'Zoom/Meet/Teams, CRM',
      },
      {
        appName: 'Echo-Scale AI',
        oneLinePromise: 'Automatically turn client success milestones into shareable referral assets.',
        targetCustomer: 'Service businesses with clear success events and happy clients',
        coreProblem: 'Happy clients rarely refer because the ask and assets are weak.',
        aiDoes: [
          'Milestone detection from CRM/project tool events',
          'Liquid Glass gift-box referral assets auto-generated',
          'One-tap social share with tracked attribution links',
          'Referral attribution tracking across channels',
          'Automated thank-you sequences for successful referrers',
        ],
        differentiator: 'Triggered by real results + high aesthetic quality.',
        successMetric: '25–40% of new leads from referrals once mature',
        suggestedPricing: '$129–$249/mo',
        technicalNotes: 'CRM, other cluster apps',
      },
      {
        appName: 'Value-Verify AI',
        oneLinePromise: 'Make client results visible in real time so retention and upsells become automatic.',
        targetCustomer: 'Agencies and consultants who struggle to prove ongoing ROI',
        coreProblem: 'Clients forget the value after the initial win.',
        aiDoes: [
          'Live "Win Cards" pushed to Slack/SMS/email',
          'Tracks time/money saved or results achieved automatically',
          'Client-facing dashboard showing cumulative value delivered',
          'Upsell triggers when value threshold milestones hit',
          'Quarterly ROI reports auto-generated from live data',
        ],
        differentiator: 'Continuous proof instead of quarterly reports.',
        successMetric: 'Higher retention and expansion revenue',
        suggestedPricing: '$99–$199/mo',
        technicalNotes: 'Project tools, CRM, Slack',
      },
    ],
  },
  'Margin & Operations': {
    clusterName: 'MarginOperations',
    folderSlug: '02_Margin_Operations',
    suiteTitle: 'The Margin Protection Operating System',
    suitePromise: 'Stop the silent leaks — zombie SaaS, wasted ads, failed payments, risky contracts, and off-process work.',
    suiteIncludes: 'Profit-Pulse + AdAudit + Revenue Rescue + Contract Clarity + System Sentinel + shared dashboard',
    suitePricing: '$597–$997/mo for the full set + shared dashboard',
    suiteCta: 'Book a margin audit call — we\'ll quantify your recoverable spend in 48 hours.',
    apps: [
      {
        appName: 'Profit-Pulse AI',
        oneLinePromise: 'Find and kill revenue-draining zombie subscriptions automatically.',
        targetCustomer: 'Growing service businesses with 10+ tools',
        coreProblem: 'Recurring costs with no clear link to revenue growth.',
        aiDoes: [
          'Stripe/bank/SaaS connection for spend visibility',
          'Revenue-correlation scoring per subscription',
          'Quantified savings recommendations with Glass Shredder UI',
          'Auto-alerts before renewals hit',
          'Monthly margin recovery reports',
        ],
        differentiator: 'Correlates spend to revenue, not just expense tracking.',
        successMetric: '$800–$2,000+/mo typical recoverable spend',
        suggestedPricing: '$99–$199/mo + optional performance share',
        technicalNotes: 'Stripe, bank feeds, SaaS billing APIs',
      },
      {
        appName: 'AdAudit AI',
        oneLinePromise: 'Independent auditor that exposes wasted ad spend, bot clicks, and bid inflation.',
        targetCustomer: 'Businesses spending $3k+/mo on ads',
        coreProblem: 'Platforms optimize for their revenue, not yours.',
        aiDoes: [
          'Cross-platform spend analysis (Google, Meta, TikTok)',
          'Bot/fraud signal detection on click streams',
          'Weak placement and audience overlap detection',
          'Automated alerts on spend anomalies',
          'Recommendations with projected savings',
        ],
        differentiator: 'Independent auditor — works for you, not the ad platform.',
        successMetric: '15–30% reduction in wasted ad spend',
        suggestedPricing: '$149–$299/mo',
        technicalNotes: 'Google Ads, Meta Ads, TikTok Ads APIs',
      },
      {
        appName: 'Revenue Rescue AI',
        oneLinePromise: 'Recover failed payments and involuntary churn before the customer is lost.',
        targetCustomer: 'Subscription or retainer-based businesses',
        coreProblem: 'Card declines and failed payments quietly kill revenue.',
        aiDoes: [
          'Smart retry timing based on customer activity patterns',
          'Personalized SMS/voice recovery sequences',
          'Peak-activity targeting for highest recovery rates',
          'Dunning email sequences with payment link shortcuts',
          'Recovery ROI dashboard',
        ],
        differentiator: 'Activity-aware recovery, not generic retry logic.',
        successMetric: '20–40% recovery of otherwise lost revenue',
        suggestedPricing: '$129–$249/mo or % of recovered revenue',
        technicalNotes: 'Stripe, payment processors, Twilio',
      },
      {
        appName: 'Contract Clarity AI',
        oneLinePromise: 'Instant plain-English risk and reward analysis of any NDA or service agreement.',
        targetCustomer: 'Founders who sign contracts without legal review every time',
        coreProblem: 'Hidden risk and missed negotiation leverage.',
        aiDoes: [
          'Dynamic risk/reward index scoring',
          'Negotiation cheat sheet with suggested changes',
          'Red-flag highlighting on problematic clauses',
          'Comparison against your standard terms library',
          'Export summary for legal review when needed',
        ],
        differentiator: 'Plain-English analysis in minutes, not days waiting for counsel.',
        successMetric: 'Faster, safer contract decisions',
        suggestedPricing: '$79–$149/mo or per-document credits',
        technicalNotes: 'Document upload, OCR, clause library',
      },
      {
        appName: 'System Sentinel AI',
        oneLinePromise: 'Real-time traffic-light verification that team outputs stay on-brand and on-process.',
        targetCustomer: 'Agencies and teams with SOPs that are ignored',
        coreProblem: 'Off-brand or off-process work reaches clients.',
        aiDoes: [
          'Rule-based + AI validation of tasks and outputs',
          'Dashboard alerts on non-compliant items',
          'Blocking of non-compliant deliverables before client send',
          'SOP adherence scoring per team member',
          'Audit trail for compliance reviews',
        ],
        differentiator: 'Active gatekeeping, not passive SOP documentation.',
        successMetric: 'Reduced rework and brand damage',
        suggestedPricing: '$99–$199/mo',
        technicalNotes: 'Project management tools, brand guidelines upload',
      },
    ],
  },
  'Acquisition & Lead Systems': {
    clusterName: 'AcquisitionLeads',
    folderSlug: '03_Acquisition_Lead_Systems',
    suiteTitle: 'The Intelligent Acquisition Operating System',
    suitePromise: 'Score intent, qualify whales, unlock grants, turn content into interactive magnets, and warm every booked lead — automatically.',
    suiteIncludes: 'Inbound Intent + Intake-Intelligence + GrantWriter + Lead-Magnet Logic + Calendar Closer + shared dashboard',
    suitePricing: '$597–$997/mo',
    suiteCta: 'Start the Acquisition OS trial — first 10 leads scored free.',
    apps: [
      {
        appName: 'Inbound Intent AI',
        oneLinePromise: 'Sub-second scoring of every DM and email with budget/urgency signals and reply scripts.',
        targetCustomer: 'Founders and sales teams drowning in inbound',
        coreProblem: 'High-intent leads get generic or slow replies.',
        aiDoes: [
          'Instant intent + budget scoring on every inbound message',
          'Custom reply generation matched to lead profile',
          'Routing rules — hot leads to calendar, warm to nurture',
          'Response time tracking and SLA alerts',
          'Learning from closed-won reply patterns',
        ],
        differentiator: 'Sub-second scoring with ready-to-send scripts, not just lead labels.',
        successMetric: 'Faster response to high-value leads and higher conversion',
        suggestedPricing: '$129–$249/mo',
        technicalNotes: 'Email, Instagram DMs, LinkedIn, CRM',
      },
      {
        appName: 'Intake-Intelligence AI',
        oneLinePromise: 'Adaptive intake that detects high-budget behavior and routes whales to live calendars.',
        targetCustomer: 'High-ticket service businesses',
        coreProblem: 'Static forms treat every lead the same.',
        aiDoes: [
          'Conversational or spatial intake that adapts questions',
          'Behavior scoring during form completion',
          'Smart calendar routing for premium leads',
          'Disqualification with nurture path for poor fits',
          'Intake analytics and drop-off optimization',
        ],
        differentiator: 'Whale detection during intake, not after manual review.',
        successMetric: 'Higher show-up and close rates from premium leads',
        suggestedPricing: '$149–$299/mo',
        technicalNotes: 'Calendly, CRM, form embed SDK',
      },
      {
        appName: 'GrantWriter AI',
        oneLinePromise: 'Match your business to real grants and generate 70% complete drafts automatically.',
        targetCustomer: 'Startups, agencies, and small businesses eligible for funding',
        coreProblem: 'Grant research and writing is slow and often abandoned.',
        aiDoes: [
          'Database matching to eligible grants by business profile',
          'Instant draft generation at 70% completion',
          'Requirement checklists per grant application',
          'Deadline tracking and reminder sequences',
          'Past application library for reuse',
        ],
        differentiator: '70% complete drafts, not just grant discovery lists.',
        successMetric: 'More applications submitted with less time',
        suggestedPricing: '$99–$199/mo or per-grant credits',
        technicalNotes: 'Grant databases, document generation',
      },
      {
        appName: 'Lead-Magnet Logic',
        oneLinePromise: 'Turn any flat PDF into an interactive calculation or assessment portal in minutes.',
        targetCustomer: 'Marketers and consultants who want higher-converting lead magnets',
        coreProblem: 'Static PDFs have low engagement and weak data capture.',
        aiDoes: [
          'PDF → interactive tool conversion',
          'Embeddable portal with branded styling',
          'Rich data capture beyond name/email',
          'Follow-up triggers based on assessment results',
          'A/B testing on magnet variants',
        ],
        differentiator: 'Interactive portals from existing PDFs — no rebuild from scratch.',
        successMetric: 'Higher conversion and richer lead data',
        suggestedPricing: '$79–$149/mo + usage',
        technicalNotes: 'PDF upload, embed widget, email integration',
      },
      {
        appName: 'Calendar Closer AI',
        oneLinePromise: 'Personalized warm-up page and video brief for every booked lead before the call.',
        targetCustomer: 'Anyone running sales calls',
        coreProblem: 'Leads show up cold or forget why they booked.',
        aiDoes: [
          'Auto-generated pre-meeting landing page per lead',
          'Short video brief using lead data and your offer',
          'Reminder sequences with page link',
          'Show-rate tracking and no-show recovery',
          'Post-meeting summary prep for sales rep',
        ],
        differentiator: 'Personalized warm-up at scale — not generic calendar confirmations.',
        successMetric: 'Higher show rates and better-prepared conversations',
        suggestedPricing: '$99–$199/mo',
        technicalNotes: 'Calendly, CRM, video generation',
      },
    ],
  },
  'Governance & Trust': {
    clusterName: 'GovernanceTrust',
    folderSlug: '04_Governance_Trust',
    suiteTitle: 'The Governance & Trust Operating System',
    suitePromise: 'Protect brand, IP, security posture, and customer trust — before problems become crises.',
    suiteIncludes: 'BrandGuard + SecurityPosture + IP Shield + VerifyTrust + Alignment Audit + shared dashboard',
    suitePricing: '$497–$897/mo',
    suiteCta: 'Book a trust audit — see your governance score in 24 hours.',
    apps: [
      {
        appName: 'BrandGuard AI',
        oneLinePromise: 'Ensure every piece of content stays on-brand before publish.',
        targetCustomer: 'Marketing teams, agencies managing multiple brands',
        coreProblem: 'Off-brand content erodes trust and wastes ad spend.',
        aiDoes: ['Learns brand voice and visuals', 'Pre-publish review with fix suggestions', 'Brand alignment scoring 0–100', 'Approved messaging library', 'Cross-channel consistency tracking'],
        differentiator: 'Active gatekeeping, not static brand folders.',
        successMetric: '90% reduction in off-brand publishes',
        suggestedPricing: '$147/mo',
        technicalNotes: 'CMS plugin, social scheduler integration',
      },
      {
        appName: 'SecurityPosture Scanner',
        oneLinePromise: 'Continuous security scoring — close gaps before customers ask.',
        targetCustomer: 'SaaS startups, agencies handling client data',
        coreProblem: 'Enterprise buyers require security questionnaires startups fail ad-hoc.',
        aiDoes: ['Weekly infra and dependency scans', 'Auto-fill security questionnaires', 'Prioritized fix recommendations', 'Customer-ready security one-pager', 'Remediation progress tracking'],
        differentiator: 'Continuous affordable monitoring vs $10K pen tests.',
        successMetric: 'Security questionnaire completion in 2hrs vs 2 weeks',
        suggestedPricing: '$197/mo',
        technicalNotes: 'GitHub/cloud scan, dependency audit',
      },
      {
        appName: 'IP Shield Tracker',
        oneLinePromise: 'Monitor and protect trademarks, content, and code from unauthorized use.',
        targetCustomer: 'Creators, SaaS companies, brands with unique IP',
        coreProblem: 'IP theft discovered too late.',
        aiDoes: ['Web monitoring for trademark/content copies', 'Code/asset reuse detection', 'Cease-and-desist draft generation', 'Takedown request tracking', 'IP asset registry'],
        differentiator: 'Proactive monitoring for creators, not reactive legal.',
        successMetric: 'Detect infringements within 72hrs',
        suggestedPricing: '$127/mo',
        technicalNotes: 'Web crawler, image hash matching',
      },
      {
        appName: 'VerifyTrust Portal',
        oneLinePromise: 'Public trust page proving security, uptime, and compliance status.',
        targetCustomer: 'B2B SaaS selling to enterprise',
        coreProblem: 'Prospects ask "are you secure?" and sales scrambles.',
        aiDoes: ['Auto-updates from live scans', 'Uptime and certification display', 'Embeds in proposals', 'Trust score drop alerts', 'Prospect-specific trust summaries'],
        differentiator: 'Live trust center, not stale Notion pages.',
        successMetric: '30% shorter enterprise sales cycles',
        suggestedPricing: '$97/mo',
        technicalNotes: 'Status page integration, badge embed',
      },
      {
        appName: 'Alignment Audit AI',
        oneLinePromise: 'Audit whether marketing promises match what you deliver.',
        targetCustomer: 'Growing startups with expectation-gap churn',
        coreProblem: 'Marketing overpromises, product underdelivers.',
        aiDoes: ['Compares marketing vs product vs support tickets', 'Flags promise gaps with severity', 'Suggests copy and product fixes', 'Tracks alignment score over time', 'Customer expectation guides'],
        differentiator: 'Connects marketing claims to product reality.',
        successMetric: '25% reduction in expectation-gap churn',
        suggestedPricing: '$147/mo',
        technicalNotes: 'Content crawl, support ticket NLP',
      },
    ],
  },
  'Growth Infrastructure': {
    clusterName: 'GrowthInfrastructure',
    folderSlug: '05_Growth_Infrastructure',
    suiteTitle: 'The Growth Infrastructure Operating System',
    suitePromise: 'One command center for revenue, deployments, analytics, experiments, and stack health.',
    suiteIncludes: 'Revenue Command + DeployFlow + Analytics Unifier + Growth Experiment Lab + StackHealth + shared dashboard',
    suitePricing: '$597–$997/mo',
    suiteCta: 'Connect your stack — live dashboard in 48 hours.',
    apps: [
      {
        appName: 'Revenue Command Dashboard',
        oneLinePromise: 'One screen showing MRR, pipeline, churn, and expansion — live.',
        targetCustomer: 'Founders and revenue leaders at $50K–$2M ARR',
        coreProblem: 'Data lives in 8 tools; Monday meetings waste an hour compiling stale numbers.',
        aiDoes: ['Pulls live data from Stripe, CRM, analytics', 'MRR waterfall and churn cohorts', 'AI narrates weekly revenue story', 'Anomaly alerts', 'Board-ready exports'],
        differentiator: 'AI-narrated instant dashboard vs manual setup.',
        successMetric: 'Save 5+ hours/week, catch issues 7 days earlier',
        suggestedPricing: '$197/mo',
        technicalNotes: 'Stripe, HubSpot, Mixpanel APIs',
      },
      {
        appName: 'DeployFlow Orchestrator',
        oneLinePromise: 'Coordinate multi-app deployments with rollback safety.',
        targetCustomer: 'Small eng teams shipping client projects',
        coreProblem: 'Deploying 5 related apps means manual coordination and scary rollbacks.',
        aiDoes: ['Dependency graph mapping', 'Staged deployments with health checks', 'Auto-rollback on errors', 'Deployment runbooks', 'Stakeholder status updates'],
        differentiator: 'SMB multi-app deploy layer without Kubernetes.',
        successMetric: '80% fewer deployment incidents',
        suggestedPricing: '$127/mo',
        technicalNotes: 'GitHub Actions, Vercel/Railway webhooks',
      },
      {
        appName: 'Analytics Unifier',
        oneLinePromise: 'Unify product, marketing, and revenue analytics into one AI-queryable brain.',
        targetCustomer: 'Growth teams drowning in disconnected dashboards',
        coreProblem: 'Ask "why did conversions drop?" and spend a day in 5 tools.',
        aiDoes: ['Unified data model from all sources', 'Natural language business queries', 'Weekly insight reports', 'Marketing-to-revenue correlation', 'Actionable recommendations'],
        differentiator: 'Ask-a-question-get-an-answer for founders.',
        successMetric: 'Answer business questions in minutes vs days',
        suggestedPricing: '$247/mo',
        technicalNotes: 'GA4, Mixpanel, ad platform APIs',
      },
      {
        appName: 'Growth Experiment Lab',
        oneLinePromise: 'Run structured growth experiments with AI-designed hypotheses.',
        targetCustomer: 'Growth marketers and founder-led growth teams',
        coreProblem: 'Random tests without hypotheses or learning capture.',
        aiDoes: ['AI-generated testable hypotheses', 'Sample size and duration calculation', 'Statistical significance tracking', 'Searchable experiment library', 'Next experiment suggestions'],
        differentiator: 'Full experiment lifecycle with AI hypothesis generation.',
        successMetric: '3x more experiments, 2x win rate',
        suggestedPricing: '$147/mo',
        technicalNotes: 'Feature flags, analytics events',
      },
      {
        appName: 'StackHealth Monitor',
        oneLinePromise: 'Monitor entire SaaS stack — uptime, costs, performance, security.',
        targetCustomer: 'Technical founders and ops-conscious SMBs',
        coreProblem: 'Nobody knows if something is down or over budget until customers complain.',
        aiDoes: ['Uptime and response time monitoring', 'Monthly tool cost tracking', 'Performance regression detection', 'Stack health score 0–100', 'Weekly health reports'],
        differentiator: 'Business-owner friendly vs dev-focused Datadog.',
        successMetric: 'Detect outages 10x faster, reduce tool spend 10–15%',
        suggestedPricing: '$97/mo',
        technicalNotes: 'HTTP checks, billing API pulls',
      },
    ],
  },
};

export function getThemeForDay(date: Date = new Date()): FactoryTheme {
  const dayIndex = date.getDay();
  const workDayIndex = dayIndex === 0 ? 4 : dayIndex === 6 ? 4 : dayIndex - 1;
  return FACTORY_THEMES[Math.min(workDayIndex, 4)];
}
