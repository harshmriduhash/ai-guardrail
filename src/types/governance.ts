// Core governance types

export interface DemoSession {
  id: string;
  name: string;
  email: string;
  company: string;
  role: 'CTO' | 'PLATFORM' | 'ENGINEER' | 'FOUNDER' | 'OTHER';
  expiresAt: Date;
  createdAt: Date;
  proxyCallCount: number;
}

export type PolicyType = 
  | 'MODEL_RESTRICTION'
  | 'TOKEN_LIMIT'
  | 'PII_BLOCK'
  | 'PROMPT_KEYWORD_BLOCK'
  | 'COST_LIMIT';

export interface Policy {
  id: string;
  name: string;
  policyType: PolicyType;
  config: Record<string, unknown>;
  enabled: boolean;
  createdAt: Date;
}

export interface LLMRequest {
  id: string;
  demoSessionId: string;
  model: string;
  prompt: string;
  tokensRequested: number;
  createdAt: Date;
}

export type Decision = 'ALLOW' | 'BLOCK';

export type ViolationReason = 
  | 'PII_DETECTED'
  | 'TOKEN_LIMIT_EXCEEDED'
  | 'MODEL_NOT_ALLOWED'
  | 'KEYWORD_BLOCKED'
  | 'COST_LIMIT_EXCEEDED';

export interface LLMDecision {
  id: string;
  llmRequestId: string;
  decision: Decision;
  reasons: ViolationReason[];
  costEstimate: number;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface RequestWithDecision extends LLMRequest {
  decision: LLMDecision;
}

export interface PolicyStats {
  totalViolations: number;
  violationsByType: Record<ViolationReason, number>;
  recentBlocks: RequestWithDecision[];
}

export interface DemoAccessForm {
  name: string;
  email: string;
  company: string;
  role: DemoSession['role'];
  useCase?: string;
}
