import { useState, useEffect } from 'react';
import { fetchRequests } from '@/lib/api';
import { useRealtimeRequests, useRealtimeDecisions } from '@/hooks/useRealtime';
import { StatusBadge, ReasonBadge } from '@/components/StatusBadge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, format } from 'date-fns';
import { Filter, Loader2, Wifi } from 'lucide-react';

type Decision = 'ALLOW' | 'BLOCK';

interface RequestWithDecision {
  id: string;
  demo_session_id: string;
  model: string;
  prompt: string;
  tokens_requested: number;
  created_at: string;
  llm_decisions: Array<{
    decision: Decision;
    reasons: string[];
    cost_estimate: number;
    evaluation_time_ms: number;
  }>;
}

export default function Requests() {
  const [requests, setRequests] = useState<RequestWithDecision[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RequestWithDecision | null>(null);
  const [filter, setFilter] = useState<Decision | 'ALL'>('ALL');
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

  // Merge realtime data with loaded data
  const allRequests = [
    ...realtimeRequests.map(r => ({
      ...r,
      llm_decisions: realtimeDecisions.has(r.id) 
        ? [realtimeDecisions.get(r.id)!] 
        : []
    })),
    ...requests
  ];

  const filteredRequests = filter === 'ALL' 
    ? allRequests 
    : allRequests.filter(r => r.llm_decisions?.[0]?.decision === filter);

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
        <h1 className="text-3xl font-bold mb-1">LLM Requests</h1>
        <p className="text-muted-foreground">
          All requests processed through the governance proxy.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground mr-2">Filter:</span>
        {(['ALL', 'ALLOW', 'BLOCK'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="font-mono"
          >
            {f}
          </Button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground font-mono">
          {filteredRequests.length} requests
        </span>
      </div>

      {/* Table */}
      <div className="governance-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Prompt</th>
              <th>Model</th>
              <th>Tokens</th>
              <th>Cost Est.</th>
              <th>Decision</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr 
                key={request.id} 
                className="cursor-pointer"
                onClick={() => setSelectedRequest(request)}
              >
                <td className="max-w-xs truncate">{request.prompt}</td>
                <td className="text-code">{request.model}</td>
                <td>{request.tokens_requested.toLocaleString()}</td>
                <td>${request.llm_decisions?.[0]?.cost_estimate?.toFixed(3) || '0.000'}</td>
                <td>
                  {request.llm_decisions?.[0] ? (
                    <StatusBadge decision={request.llm_decisions[0].decision} />
                  ) : (
                    <span className="text-muted-foreground text-xs">Pending</span>
                  )}
                </td>
                <td className="text-muted-foreground">
                  {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredRequests.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            {filter === 'ALL' 
              ? 'No requests yet. Use the Proxy Test to send your first request.'
              : 'No requests match the current filter.'}
          </div>
        )}
      </div>

      {/* Request Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              Request Details
              {selectedRequest?.llm_decisions?.[0] && (
                <StatusBadge decision={selectedRequest.llm_decisions[0].decision} />
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Request ID
                  </label>
                  <p className="font-mono text-sm mt-1 truncate">{selectedRequest.id}</p>
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Timestamp
                  </label>
                  <p className="font-mono text-sm mt-1">
                    {format(new Date(selectedRequest.created_at), 'PPpp')}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Prompt
                </label>
                <pre className="mt-2 p-4 bg-surface-sunken rounded-lg text-sm font-mono whitespace-pre-wrap">
                  {selectedRequest.prompt}
                </pre>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Model
                  </label>
                  <p className="font-mono text-sm mt-1 text-code">{selectedRequest.model}</p>
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Tokens Requested
                  </label>
                  <p className="font-mono text-sm mt-1">{selectedRequest.tokens_requested.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Cost Estimate
                  </label>
                  <p className="font-mono text-sm mt-1">
                    ${selectedRequest.llm_decisions?.[0]?.cost_estimate?.toFixed(4) || '0.0000'}
                  </p>
                </div>
              </div>
              
              {selectedRequest.llm_decisions?.[0]?.reasons?.length > 0 && (
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Violation Reasons
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedRequest.llm_decisions[0].reasons.map((reason, i) => (
                      <ReasonBadge key={i} reason={reason as any} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
