import { mockStats, mockRequests } from '@/lib/mock-data';
import { StatusBadge, ReasonBadge } from '@/components/StatusBadge';
import { ViolationReason } from '@/types/governance';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, TrendingUp } from 'lucide-react';

const reasonDescriptions: Record<ViolationReason, string> = {
  PII_DETECTED: 'Personally identifiable information detected in prompt',
  TOKEN_LIMIT_EXCEEDED: 'Request exceeded maximum allowed token count',
  MODEL_NOT_ALLOWED: 'Requested model is not in the approved list',
  KEYWORD_BLOCKED: 'Prompt contains blocked keywords or phrases',
  COST_LIMIT_EXCEEDED: 'Estimated cost exceeds configured limit'
};

export default function Violations() {
  const blockedRequests = mockRequests.filter(r => r.decision.decision === 'BLOCK');
  const totalViolations = Object.values(mockStats.violationsByType).reduce((a, b) => a + b, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Policy Violations</h1>
        <p className="text-muted-foreground">
          Requests blocked due to governance policy violations.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="governance-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <div className="metric-value text-destructive">{blockedRequests.length}</div>
              <div className="metric-label">Blocked Requests</div>
            </div>
          </div>
        </div>
        
        <div className="governance-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-warning" />
            </div>
            <div>
              <div className="metric-value text-warning">{totalViolations}</div>
              <div className="metric-label">Total Violations</div>
            </div>
          </div>
        </div>
        
        <div className="governance-card p-5">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
            Violations by Type
          </div>
          <div className="space-y-2">
            {Object.entries(mockStats.violationsByType).map(([reason, count]) => (
              <div key={reason} className="flex items-center justify-between">
                <ReasonBadge reason={reason as ViolationReason} />
                <span className="font-mono text-sm">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Violation Details */}
      <div className="governance-card">
        <div className="governance-card-header">
          <h2 className="font-semibold">Blocked Requests</h2>
          <span className="text-sm text-muted-foreground font-mono">
            {blockedRequests.length} records
          </span>
        </div>
        
        <div className="divide-y divide-border">
          {blockedRequests.map((request) => (
            <div key={request.id} className="p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge decision="BLOCK" />
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(request.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="font-mono text-sm">{request.prompt}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-muted-foreground block mb-1">
                    {request.model}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {request.tokensRequested.toLocaleString()} tokens
                  </span>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
                  Violation Reasons
                </div>
                <div className="space-y-1">
                  {request.decision.reasons.map((reason, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <ReasonBadge reason={reason} />
                      <span className="text-sm text-muted-foreground">
                        {reasonDescriptions[reason]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {blockedRequests.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No violations recorded. All requests have been allowed.
          </div>
        )}
      </div>
    </div>
  );
}
