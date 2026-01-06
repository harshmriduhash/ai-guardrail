import { useState, useEffect } from 'react';
import { fetchRequests } from '@/lib/api';
import { useRealtimeRequests, useRealtimeDecisions } from '@/hooks/useRealtime';
import { StatusBadge, ReasonBadge } from '@/components/StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, TrendingUp, Loader2, Wifi } from 'lucide-react';

type ViolationReason = 'PII_DETECTED' | 'TOKEN_LIMIT_EXCEEDED' | 'MODEL_NOT_ALLOWED' | 'KEYWORD_BLOCKED' | 'COST_LIMIT_EXCEEDED';

const reasonDescriptions: Record<ViolationReason, string> = {
  PII_DETECTED: 'Personally identifiable information detected in prompt',
  TOKEN_LIMIT_EXCEEDED: 'Request exceeded maximum allowed token count',
  MODEL_NOT_ALLOWED: 'Requested model is not in the approved list',
  KEYWORD_BLOCKED: 'Prompt contains blocked keywords or phrases',
  COST_LIMIT_EXCEEDED: 'Estimated cost exceeds configured limit'
};

interface RequestWithDecision {
  id: string;
  model: string;
  prompt: string;
  tokens_requested: number;
  created_at: string;
  llm_decisions: Array<{
    decision: 'ALLOW' | 'BLOCK';
    reasons: string[];
    cost_estimate: number;
  }>;
}

export default function Violations() {
  const [requests, setRequests] = useState<RequestWithDecision[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time subscriptions
  const { requests: realtimeRequests } = useRealtimeRequests();
  const { decisions: realtimeDecisions } = useRealtimeDecisions();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await fetchRequests();
      setRequests(data || []);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Merge realtime data
  const allRequests = [
    ...realtimeRequests.map(r => ({
      ...r,
      llm_decisions: realtimeDecisions.has(r.id) 
        ? [realtimeDecisions.get(r.id)!] 
        : []
    })),
    ...requests
  ];

  const blockedRequests = allRequests.filter(r => r.llm_decisions?.[0]?.decision === 'BLOCK');
  
  const violationsByType = blockedRequests
    .flatMap(r => r.llm_decisions?.[0]?.reasons || [])
    .reduce((acc, reason) => {
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const totalViolations = Object.values(violationsByType).reduce((a, b) => a + b, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono mb-2">
          <Wifi className="w-3 h-3 text-success" />
          LIVE UPDATES
        </div>
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
            {Object.entries(violationsByType).map(([reason, count]) => (
              <div key={reason} className="flex items-center justify-between">
                <ReasonBadge reason={reason as ViolationReason} />
                <span className="font-mono text-sm">{count}</span>
              </div>
            ))}
            {Object.keys(violationsByType).length === 0 && (
              <p className="text-sm text-muted-foreground">No violations yet</p>
            )}
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
                      {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="font-mono text-sm">{request.prompt}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-muted-foreground block mb-1">
                    {request.model}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {request.tokens_requested.toLocaleString()} tokens
                  </span>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
                  Violation Reasons
                </div>
                <div className="space-y-1">
                  {request.llm_decisions?.[0]?.reasons?.map((reason, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <ReasonBadge reason={reason as ViolationReason} />
                      <span className="text-sm text-muted-foreground">
                        {reasonDescriptions[reason as ViolationReason] || reason}
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
