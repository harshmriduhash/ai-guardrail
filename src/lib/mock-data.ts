import { 
  Policy, 
  LLMRequest, 
  LLMDecision, 
  AuditLog, 
  RequestWithDecision,
  PolicyStats,
  ViolationReason 
} from '@/types/governance';

// Generate deterministic UUIDs for demo
const uuid = (seed: number) => 
  `${seed.toString(16).padStart(8, '0')}-${(seed * 2).toString(16).padStart(4, '0')}-4${(seed * 3).toString(16).padStart(3, '0')}-a${(seed * 4).toString(16).padStart(3, '0')}-${(seed * 5).toString(16).padStart(12, '0')}`;

export const mockPolicies: Policy[] = [
  {
    id: uuid(1),
    name: 'Approved Models Only',
    policyType: 'MODEL_RESTRICTION',
    config: {
      allowedModels: ['gpt-4', 'gpt-4-turbo', 'claude-3-opus'],
      blockedModels: ['gpt-3.5-turbo', 'claude-instant']
    },
    enabled: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: uuid(2),
    name: 'Token Rate Limit',
    policyType: 'TOKEN_LIMIT',
    config: {
      maxTokensPerRequest: 4096,
      maxTokensPerSession: 100000,
      maxTokensPerDay: 500000
    },
    enabled: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: uuid(3),
    name: 'PII Detection & Block',
    policyType: 'PII_BLOCK',
    config: {
      patterns: ['email', 'phone', 'ssn', 'credit_card'],
      action: 'BLOCK',
      logDetections: true
    },
    enabled: true,
    createdAt: new Date('2024-01-16')
  },
  {
    id: uuid(4),
    name: 'Sensitive Keyword Filter',
    policyType: 'PROMPT_KEYWORD_BLOCK',
    config: {
      blockedKeywords: ['password', 'api_key', 'secret', 'internal docs', 'confidential'],
      caseSensitive: false
    },
    enabled: true,
    createdAt: new Date('2024-01-17')
  },
  {
    id: uuid(5),
    name: 'Cost Guardrail',
    policyType: 'COST_LIMIT',
    config: {
      maxCostPerRequest: 0.50,
      maxCostPerSession: 10.00,
      maxCostPerDay: 100.00
    },
    enabled: false,
    createdAt: new Date('2024-01-18')
  }
];

const prompts = [
  { prompt: 'Summarize the Q4 financial report', model: 'gpt-4', tokens: 512 },
  { prompt: 'Send email to john@company.com with the report', model: 'gpt-4', tokens: 256 },
  { prompt: 'Analyze customer feedback trends', model: 'gpt-4-turbo', tokens: 1024 },
  { prompt: 'Generate API documentation', model: 'gpt-3.5-turbo', tokens: 2048 },
  { prompt: 'What is the password for the admin account?', model: 'gpt-4', tokens: 128 },
  { prompt: 'Process this credit card: 4111-1111-1111-1111', model: 'gpt-4', tokens: 64 },
  { prompt: 'Create marketing copy for product launch', model: 'claude-3-opus', tokens: 768 },
  { prompt: 'Translate internal docs to Spanish', model: 'gpt-4', tokens: 4500 },
  { prompt: 'Review code for security vulnerabilities', model: 'gpt-4', tokens: 1536 },
  { prompt: 'Summarize customer support tickets', model: 'gpt-4', tokens: 512 },
];

const determineDecision = (prompt: string, model: string, tokens: number): { decision: 'ALLOW' | 'BLOCK', reasons: ViolationReason[] } => {
  const reasons: ViolationReason[] = [];
  
  // PII detection
  if (prompt.includes('@') || prompt.includes('4111') || prompt.match(/\d{3}-\d{2}-\d{4}/)) {
    reasons.push('PII_DETECTED');
  }
  
  // Keyword blocking
  if (prompt.toLowerCase().includes('password') || prompt.toLowerCase().includes('internal docs')) {
    reasons.push('KEYWORD_BLOCKED');
  }
  
  // Model restriction
  if (model === 'gpt-3.5-turbo' || model === 'claude-instant') {
    reasons.push('MODEL_NOT_ALLOWED');
  }
  
  // Token limit
  if (tokens > 4096) {
    reasons.push('TOKEN_LIMIT_EXCEEDED');
  }
  
  return {
    decision: reasons.length > 0 ? 'BLOCK' : 'ALLOW',
    reasons
  };
};

export const mockRequests: RequestWithDecision[] = prompts.map((p, i) => {
  const requestId = uuid(100 + i);
  const { decision, reasons } = determineDecision(p.prompt, p.model, p.tokens);
  const costEstimate = (p.tokens / 1000) * 0.03;
  
  return {
    id: requestId,
    demoSessionId: uuid(1000),
    model: p.model,
    prompt: p.prompt,
    tokensRequested: p.tokens,
    createdAt: new Date(Date.now() - (i * 300000)), // 5 min apart
    decision: {
      id: uuid(200 + i),
      llmRequestId: requestId,
      decision,
      reasons,
      costEstimate,
      createdAt: new Date(Date.now() - (i * 300000) + 50)
    }
  };
});

export const mockAuditLogs: AuditLog[] = [
  ...mockRequests.map((r, i) => ({
    id: uuid(300 + i),
    entityType: 'llm_request',
    entityId: r.id,
    action: r.decision.decision === 'ALLOW' ? 'REQUEST_ALLOWED' : 'REQUEST_BLOCKED',
    metadata: {
      model: r.model,
      reasons: r.decision.reasons,
      costEstimate: r.decision.costEstimate
    },
    createdAt: r.createdAt
  })),
  {
    id: uuid(400),
    entityType: 'policy',
    entityId: mockPolicies[4].id,
    action: 'POLICY_DISABLED',
    metadata: { policyName: 'Cost Guardrail' },
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    id: uuid(401),
    entityType: 'demo_session',
    entityId: uuid(1000),
    action: 'SESSION_CREATED',
    metadata: { company: 'Acme Corp' },
    createdAt: new Date(Date.now() - 7200000)
  }
].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

export const mockStats: PolicyStats = {
  totalViolations: mockRequests.filter(r => r.decision.decision === 'BLOCK').length,
  violationsByType: mockRequests
    .filter(r => r.decision.decision === 'BLOCK')
    .flatMap(r => r.decision.reasons)
    .reduce((acc, reason) => {
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<ViolationReason, number>),
  recentBlocks: mockRequests.filter(r => r.decision.decision === 'BLOCK').slice(0, 5)
};

export const SESSION_LIMITS = {
  maxProxyCalls: 50,
  maxRequestsPerMinute: 10,
  sessionDurationHours: 48
};
