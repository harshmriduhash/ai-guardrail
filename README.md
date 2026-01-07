# AI Governance & Control Plane

> Enterprise-grade policy enforcement layer for LLM usage in production environments

## Overview

The AI Governance & Control Plane is a centralized control system that sits between applications and LLM providers, enforcing governance policies, providing visibility, and enabling audit-grade logging for SOC2/ISO compliance readiness.

### Key Capabilities

- **Policy Enforcement**: Intercept and evaluate all LLM requests against configurable governance policies
- **Real-time Visibility**: Monitor all AI usage across your organization in real-time
- **Audit Trail**: Immutable, append-only audit logs for compliance and forensics
- **Cost Control**: Estimate and limit AI spending before requests execute
- **PII Protection**: Detect and block personally identifiable information in prompts
- **Model Governance**: Restrict which AI models can be used in production

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| State | TanStack Query, React Context |
| Backend | Supabase Edge Functions (Deno) |
| Database | PostgreSQL (Supabase) |
| Real-time | Supabase Realtime |
| LLM Gateway | Lovable AI Gateway |

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATIONS                       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LLM PROXY SERVICE                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Session   │  │   Policy    │  │      Audit Logger       │  │
│  │ Validation  │──│   Engine    │──│   (append-only)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
        ┌─────────┐    ┌─────────────┐  ┌──────────┐
        │  ALLOW  │    │    BLOCK    │  │   LOG    │
        │         │    │  + Reason   │  │  Event   │
        └────┬────┘    └─────────────┘  └──────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       LLM PROVIDERS                              │
│         (OpenAI, Anthropic, Google via Lovable Gateway)         │
└─────────────────────────────────────────────────────────────────┘
```

## Data Models

### Core Entities

```sql
-- Demo sessions for access control
demo_sessions (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  company TEXT,
  role ENUM('CTO','PLATFORM','ENGINEER','FOUNDER','OTHER'),
  expires_at TIMESTAMP,
  proxy_call_count INT DEFAULT 0
)

-- Governance policies
policies (
  id UUID PRIMARY KEY,
  name TEXT,
  policy_type ENUM('MODEL_RESTRICTION','TOKEN_LIMIT','PII_BLOCK','PROMPT_KEYWORD_BLOCK','COST_LIMIT'),
  config JSONB,
  enabled BOOLEAN,
  priority INT
)

-- LLM request tracking
llm_requests (
  id UUID PRIMARY KEY,
  demo_session_id UUID REFERENCES demo_sessions,
  model TEXT,
  prompt TEXT,
  tokens_requested INT,
  created_at TIMESTAMP
)

-- Policy decisions
llm_decisions (
  id UUID PRIMARY KEY,
  llm_request_id UUID REFERENCES llm_requests,
  decision ENUM('ALLOW','BLOCK'),
  reasons JSONB,
  cost_estimate NUMERIC,
  evaluation_time_ms INT
)

-- Audit trail
audit_logs (
  id UUID PRIMARY KEY,
  entity_type TEXT,
  entity_id UUID,
  action TEXT,
  metadata JSONB,
  created_at TIMESTAMP
)
```

## Policy Types

### 1. Model Restriction
Control which LLM models are permitted in your environment.

```json
{
  "allowedModels": ["gpt-4", "gpt-3.5-turbo", "claude-3-opus"],
  "blockedModels": ["gpt-4-32k"]
}
```

### 2. Token Limits
Prevent runaway costs with per-request and per-session token limits.

```json
{
  "maxTokensPerRequest": 4096,
  "maxTokensPerSession": 100000
}
```

### 3. PII Detection
Automatically detect and block prompts containing sensitive information.

```json
{
  "patterns": ["email", "phone", "ssn", "credit_card"]
}
```

### 4. Keyword Blocking
Block prompts containing specific sensitive terms.

```json
{
  "blockedKeywords": ["password", "SSN", "internal docs"],
  "caseSensitive": false
}
```

### 5. Cost Guardrails
Estimate and limit costs before execution.

```json
{
  "maxCostPerRequest": 0.50
}
```

## API Reference

### Create Demo Session

```bash
POST /functions/v1/demo-access

{
  "name": "John Doe",
  "email": "john@enterprise.com",
  "company": "Enterprise Corp",
  "role": "CTO"
}
```

### Evaluate LLM Request

```bash
POST /functions/v1/llm-proxy
X-Demo-Session: <session_id>

{
  "model": "gpt-4",
  "prompt": "Summarize this document...",
  "max_tokens": 1024,
  "forward_to_llm": true
}
```

### Response Codes

| Code | Meaning |
|------|---------|
| 200 | Request allowed |
| 400 | Invalid request |
| 401 | Invalid/expired session |
| 403 | Blocked by policy |
| 429 | Rate limit exceeded |

### Violation Reasons

| Code | Description |
|------|-------------|
| `PII_DETECTED` | Prompt contains personal information |
| `TOKEN_LIMIT_EXCEEDED` | Request exceeds token limits |
| `MODEL_NOT_ALLOWED` | Model not in allowed list |
| `KEYWORD_BLOCKED` | Blocked keyword detected |
| `COST_LIMIT_EXCEEDED` | Estimated cost too high |

## Software Design Principles

### 1. Policy-First Architecture
Every LLM request passes through the policy engine before execution. Policies are evaluated deterministically with clear, auditable reasons for every decision.

### 2. Immutable Audit Trail
All events are logged in an append-only audit log. Records cannot be modified or deleted, ensuring compliance with regulatory requirements.

### 3. Session-Based Access
No user accounts or passwords. Demo access is session-bound with automatic expiry, simplifying the security model while maintaining accountability.

### 4. Determinism Over Magic
Policies produce predictable, reproducible results. No ML-based decisions in the governance layer—only explicit rules.

### 5. Defense in Depth
Multiple policy types can be layered for comprehensive protection. Each policy is independently evaluated and logged.

## Project Structure

```
├── src/
│   ├── components/       # React components
│   │   ├── layout/       # Dashboard layout
│   │   └── ui/           # shadcn/ui components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and API client
│   ├── pages/            # Route pages
│   └── types/            # TypeScript types
├── supabase/
│   ├── functions/        # Edge functions
│   │   ├── demo-access/  # Session creation
│   │   └── llm-proxy/    # Policy evaluation
│   └── migrations/       # Database migrations
└── README.md
```

## Rate Limits

| Limit | Value | Scope |
|-------|-------|-------|
| Proxy calls | 50 | Per demo session |
| Session duration | 48 hours | From creation |

## Enterprise Extension Path

This demo showcases core governance capabilities. Enterprise deployments would extend with:

- **SSO Integration**: SAML/OIDC for enterprise identity
- **Multi-tenancy**: Organization-scoped policies and data isolation
- **Custom Policies**: Pluggable policy engine for domain-specific rules
- **Alerting**: Real-time notifications for violations
- **Analytics**: Usage trends, cost forecasting, anomaly detection
- **API Gateway**: Rate limiting, request signing, API key management
- **Data Residency**: Regional deployment options for compliance

## Tradeoffs

| Decision | Rationale |
|----------|-----------|
| No user accounts | Simpler demo UX, session-based accountability |
| PostgreSQL over NoSQL | Strong consistency for audit logs, complex queries |
| Edge Functions | Low latency, co-located with database |
| Real-time updates | Instant visibility, operational awareness |
| Deterministic policies | Auditability, reproducibility, trust |

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## License

MIT

---

**Built for enterprise AI governance. Control > Convenience. Auditability > Intelligence. Determinism > Magic.**
