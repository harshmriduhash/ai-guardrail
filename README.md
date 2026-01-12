# PolicyShield

> Enterprise AI Governance Platform — Secure, govern, and control your AI at scale.

---

## 🎯 Summary

PolicyShield is a premium SaaS platform that sits between your applications and LLM providers, enforcing security policies, blocking sensitive data, and providing audit-grade visibility into every AI request. Built for security teams, platform engineers, and compliance officers.

---

## ✨ Key Features

- **Policy Enforcement** — Block risky models, limit tokens, control costs in real-time
- **PII Protection** — Automatically detect and block emails, phones, SSNs, credit cards
- **Full Visibility** — Real-time dashboards, request logs, and detailed analytics
- **Audit-Ready Logs** — Immutable, append-only trail for SOC 2, ISO 27001, GDPR
- **Cost Control** — Budget limits per request/user, cost estimates before execution
- **Sub-15ms Latency** — Edge-deployed policy engine with minimal overhead
- **Universal Proxy** — Single integration for OpenAI, Anthropic, Google, and more
- **User Onboarding** — Step-by-step wizard for new users
- **Freemium Model** — 100 free API calls/month, upgrade for more

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Animations | Framer Motion |
| State | TanStack Query, React Context |
| Auth | Supabase Auth (Email + Google OAuth) |
| Backend | Supabase Edge Functions (Deno) |
| Database | PostgreSQL (Supabase) |
| Real-time | Supabase Realtime |
| LLM Gateway | Lovable AI Gateway |

---

## 🎨 Design System

### Visual Aesthetic
- **Theme**: Premium dark/black inspired by huly.io, Stripe, Clay
- **Typography**: Sora for headings, Inter for body, JetBrains Mono for code
- **Colors**: Warm amber/orange primary (#F59E0B), subtle glass effects
- **Effects**: Light beam animations, gradient orbs, spotlight hover effects, glassmorphism

### Key Components
- `Hero` — Full-screen landing with animated dashboard preview
- `Features` — 9-card bento grid with spotlight hover effects
- `Pricing` — 3-tier pricing with highlighted "Pro" plan
- `OnboardingWizard` — 4-step guided setup for new users

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     POLICYSHIELD PLATFORM                        │
├─────────────────────────────────────────────────────────────────┤
│  Landing Page → Auth (Email/Google) → Onboarding → Dashboard    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LLM PROXY SERVICE                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Auth/Tier   │  │   Policy    │  │      Audit Logger       │  │
│  │ Validation  │──│   Engine    │──│   (append-only)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌─────────┐    ┌─────────────┐  ┌──────────┐
        │  ALLOW  │    │    BLOCK    │  │   LOG    │
        └────┬────┘    └─────────────┘  └──────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       LLM PROVIDERS                              │
│         (OpenAI, Anthropic, Google via Lovable Gateway)         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Models

### Users & Subscriptions
```sql
profiles (id, email, full_name, company, avatar_url)
user_roles (user_id, role: free|pro|enterprise)
subscriptions (user_id, plan, status, proxy_calls_used, proxy_calls_limit)
```

### Governance
```sql
policies (name, policy_type, config, enabled, priority)
llm_requests (user_id, model, prompt, tokens_requested)
llm_decisions (llm_request_id, decision: ALLOW|BLOCK, reasons, cost_estimate)
audit_logs (entity_type, entity_id, action, metadata)
```

---

## 💰 Pricing Tiers

| Plan | Price | API Calls | Features |
|------|-------|-----------|----------|
| Free | $0/mo | 100/month | Basic policies, 7-day logs |
| Pro | $49/mo | 5,000/month | All policies, 90-day logs, analytics |
| Enterprise | Custom | Unlimited | SSO, SLA, on-premise option |

---

## ✅ MVP Checklist

- [x] Landing page with hero, features, pricing
- [x] Premium dark theme with animations
- [x] Responsive navbar and footer
- [x] Email + Google OAuth authentication
- [x] User onboarding wizard
- [x] User profiles and subscription tiers
- [x] Freemium access model (100 free calls)
- [x] Policy engine with 5 policy types
- [x] LLM proxy with real-time evaluation
- [x] Dashboard with request/violation metrics
- [x] Analytics page with charts
- [x] Settings page
- [x] Audit log viewer
- [x] API documentation page
- [x] Demo mode for unauthenticated trials

---

## 🚀 Launch Checklist

- [ ] Configure Google OAuth in Lovable Cloud
- [ ] Set up Stripe for Pro/Enterprise billing
- [ ] Add custom domain
- [ ] Enable email confirmation (production)
- [ ] Set up monitoring and alerting
- [ ] Create onboarding email sequence
- [ ] Add analytics (Posthog/Mixpanel)
- [ ] Write integration guides for Python/JS SDKs
- [ ] Security audit and penetration testing
- [ ] SOC 2 Type II certification

---

## 🗂 Project Structure

```
├── src/
│   ├── components/
│   │   ├── landing/      # Navbar, Footer, Hero, Features, Pricing, CTA
│   │   ├── layout/       # Dashboard layout, Sidebar
│   │   ├── onboarding/   # OnboardingWizard
│   │   └── ui/           # shadcn/ui components
│   ├── context/          # Auth and session providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # API client, utilities
│   ├── pages/            # Route pages
│   └── types/            # TypeScript types
├── supabase/
│   ├── functions/        # Edge functions (demo-access, llm-proxy)
│   └── migrations/       # Database migrations
└── README.md
```

---

## 🏃 Local Development

```bash
npm install
npm run dev
```

---

## 📄 License

MIT

---

**PolicyShield** — Control > Convenience. Auditability > Intelligence. Security > Speed.
