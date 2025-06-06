Product Requirements Document (PRD) — “FastInsight”
A privacy-respectful, revenue-centric web-analytics platform inspired by Datafa.st

1. Purpose & Vision
Provide founders, startups, and digital-first agencies with actionable growth insights—not vanity metrics—via a friction-free analytics suite that tracks the full journey from first click to revenue while staying lightweight, GDPR-compliant, and simple enough to master in minutes.

2. Target Users
Persona	Goals	Pain Points
Indie Founder	See which channels drive $$; ship faster	GA4 overload, lack of time
Startup Growth Marketer	Optimize CAC, ROAS; share wins with execs	Stitching ad + revenue data; messy dashboards
Digital Agency PM	One portal for many client sites, branded reports	Per-site logins, poor collaboration

3. Success Metrics (v1)
≤ 5 min onboarding from script install to first dashboard view.

90 %+ CSAT for “ease of finding revenue insights”.

< 10 KB total JS payload, zero impact on Core Web Vitals.

30 % MoM trial-to-paid conversion within first 6 months.

4. Feature List & Requirements
#	Epic / Feature	Description & Acceptance Criteria
4.1	Lightweight Tracking Script	<ul><li>4 kB gzipped JS snippet served via CDN.</li><li>No 3rd-party cookies; uses hashed, rotating anon ID.</li><li>≤ 50 ms added FCP (Lighthouse).</li></ul>
4.2	Core Traffic Analytics	<ul><li>Unique visitors, sessions, pageviews, bounce rate, avg session duration.</li><li>Auto group referrers into Direct / Organic / Social / Paid / AI.</li><li>Real-time view updates ≤ 5 s lag.</li></ul>
4.3	Revenue Attribution Module	<ul><li>Native Stripe & LemonSqueezy connectors (OAuth).</li><li>Server-side webhook maps charge → visitor ID.</li><li>Metrics: Revenue per Visitor, ARPU, AOV, LTV (rolling 6-mo).</li><li>UI table: Top channels by revenue, sortable.</li></ul>
4.4	Goal & Funnel Builder (No-Code)	<ul><li>Add goal via UI (URL match or custom event) in ≤ 3 clicks.</li><li>Drag-and-drop funnel up to 6 steps.</li><li>Drop-off % and color-coded heat bars.</li></ul>
4.5	Collaboration & Multi-Site Hub	<ul><li>Unlimited websites per account.</li><li>User roles: Owner / Admin / Analyst / Viewer.</li><li>Org & Client Workspaces (isolate data + billing).</li><li>Inline dashboard annotations & @mentions.</li></ul>
4.6	Reporting & Alerts	<ul><li>Scheduled PDF/HTML reports (daily, weekly, monthly).</li><li>Slack & Teams alerts: traffic spike, funnel drop, revenue milestone.</li><li>Custom thresholds per metric.</li></ul>
4.7	Public / White-Label Sharing	<ul><li>Toggle “public link” with optional password.</li><li>Custom sub-domain + logo for agencies.</li><li>Embed widget ≤ 600 px responsive iframe.</li></ul>
4.8	REST & GraphQL API	<ul><li>Rate-limited at 120 rq/s per token.</li><li>Endpoints: /stats, /events, /sites, /insights.</li><li>Signed webhooks for event backup export.</li></ul>
4.9	Privacy & Compliance	<ul><li>GDPR, CCPA, PECR audited.</li><li>Cookieless default; consent mode fallback for advanced IDs.</li><li>Data residency: EU (Frankfurt) & US (Ohio) clusters.</li></ul>
4.10	Performance & Reliability	<ul><li>SLO: 99.95 % monthly uptime.</li><li>Edge-cached script, 200 ms p95 API response.</li><li>Scalable ingestion via Kafka + ClickHouse.</li></ul>
4.11	Self-Serve Billing	<ul><li>Usage-based tiers (10k, 100k, 1M events) auto-upgrade.</li><li>In-app overage estimator + email notice at 80 % quota.</li><li>Supports promo codes, annual discounts.</li></ul>
4.12	Insight Engine (v1.1)	<ul><li>Nightly cron runs anomaly detection (3 σ) on key metrics.</li><li>Generates plain-language “Insights Digest” email.</li><li>Beta feature flag per account.</li></ul>

5. Non-Functional Requirements
Security: SOC 2 Type II within 18 months; encrypt data at rest (AES-256) and in transit (TLS 1.3).

Localization: UI strings externalized; launch EN/FR/DE/ES by Q3.

Accessibility: WCAG 2.2 AA compliance.

Browser Support: Evergreen + last two LTS Safari/Firefox.

6. Milestone Roadmap (12 Months)
MVP (Month 3): Scripts, core traffic, simple dashboard, Stripe revenue, basic roles.

Beta (Month 6): Goals/funnels, Slack alerts, white-label sharing, API v1.

Launch (Month 9): Insights Engine, multi-org, PDF reports, self-serve billing.

Scale (Month 12): LemonSqueezy connector, GDPR rep service, anomaly heatmaps.

7. Open Questions & Dependencies
Will we support self-hosting later? (Impacts architecture decisions.)

Decision on clickhouse vs. managed DB for event storage.

Legal budget for EU representative under GDPR Article 27.

8. Out-of-Scope (v1)
Session replays / heatmaps (evaluate for v2).

A/B testing & feature flags.

Native mobile SDKs.

9. Acceptance & Launch Criteria
≥ 50 active beta users sending > 5k events/day each.

≥ 20 Stripe-connected accounts showing revenue in dashboard.

Production error rate < 0.1 % over rolling 30 days.

Positive feedback from at least 3 pilot agencies on multi-client features.