import { useState } from 'react';
import { mockRequests } from '@/lib/mock-data';
import { StatusBadge, ReasonBadge } from '@/components/StatusBadge';
import { RequestWithDecision, Decision } from '@/types/governance';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, format } from 'date-fns';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Requests() {
  const [selectedRequest, setSelectedRequest] = useState<RequestWithDecision | null>(null);
  const [filter, setFilter] = useState<Decision | 'ALL'>('ALL');

  const filteredRequests = filter === 'ALL' 
    ? mockRequests 
    : mockRequests.filter(r => r.decision.decision === filter);

  return (
    <div className="p-8">
      <div className="mb-8">
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
                <td>{request.tokensRequested.toLocaleString()}</td>
                <td>${request.decision.costEstimate.toFixed(3)}</td>
                <td>
                  <StatusBadge decision={request.decision.decision} />
                </td>
                <td className="text-muted-foreground">
                  {formatDistanceToNow(request.createdAt, { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredRequests.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No requests match the current filter.
          </div>
        )}
      </div>

      {/* Request Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              Request Details
              {selectedRequest && (
                <StatusBadge decision={selectedRequest.decision.decision} />
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
                    {format(selectedRequest.createdAt, 'PPpp')}
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
                  <p className="font-mono text-sm mt-1">{selectedRequest.tokensRequested.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Cost Estimate
                  </label>
                  <p className="font-mono text-sm mt-1">${selectedRequest.decision.costEstimate.toFixed(4)}</p>
                </div>
              </div>
              
              {selectedRequest.decision.reasons.length > 0 && (
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Violation Reasons
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedRequest.decision.reasons.map((reason, i) => (
                      <ReasonBadge key={i} reason={reason} />
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
