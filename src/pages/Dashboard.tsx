import { useEffect, useState } from 'react';
import { useDemoSession } from '@/context/DemoSessionContext';
import { fetchPolicies, fetchRequests } from '@/lib/api';
import { useRealtimeRequests, useRealtimeDecisions } from '@/hooks/useRealtime';
import { StatusBadge, ReasonBadge } from '@/components/StatusBadge';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  ArrowRight,
  Wifi,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Policy {
  id: string;
  name: string;
  policy_type: string;
  enabled: boolean;
}

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

export default function Dashboard() {
  const { session } = useDemoSession();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [requests, setRequests] = useState<RequestWithDecision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Real-time subscriptions
  const { requests: realtimeRequests } = useRealtimeRequests();
  const { decisions: realtimeDecisions } = useRealtimeDecisions();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [policiesData, requestsData] = await Promise.all([
          fetchPolicies(),
          fetchRequests()
        ]);
        setPolicies(policiesData || []);
        setRequests(requestsData || []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Merge realtime data
  const allRequests = [...realtimeRequests.map(r => ({
    ...r,
    llm_decisions: realtimeDecisions.has(r.id) 
      ? [realtimeDecisions.get(r.id)!] 
      : []
  })), ...requests].slice(0, 50);

  const allowedCount = allRequests.filter(r => r.llm_decisions?.[0]?.decision === 'ALLOW').length;
  const blockedCount = allRequests.filter(r => r.llm_decisions?.[0]?.decision === 'BLOCK').length;
  const activePolicies = policies.filter(p => p.enabled).length;

  // Calculate violations by type
  const violationsByType = allRequests
    .filter(r => r.llm_decisions?.[0]?.decision === 'BLOCK')
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono mb-2">
          <Wifi className="w-3 h-3 text-success" />
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          REALTIME CONNECTED
        </div>
        <h1 className="text-3xl font-bold mb-1">Governance Overview</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.name}. Monitoring LLM requests for {session?.company}.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard 
          icon={Activity} 
          label="Total Requests" 
          value={allRequests.length} 
          color="primary"
        />
        <MetricCard 
          icon={CheckCircle} 
          label="Allowed" 
          value={allowedCount} 
          color="success"
        />
        <MetricCard 
          icon={AlertTriangle} 
          label="Blocked" 
          value={blockedCount} 
          color="destructive"
        />
        <MetricCard 
          icon={Shield} 
          label="Active Policies" 
          value={activePolicies} 
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Violations by Type */}
        <div className="governance-card">
          <div className="governance-card-header">
            <h2 className="font-semibold">Violations by Type</h2>
            <Link to="/violations" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="governance-card-body">
            {Object.keys(violationsByType).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(violationsByType).map(([reason, count]) => (
                  <div key={reason} className="flex items-center justify-between">
                    <ReasonBadge reason={reason as any} />
                    <div className="flex items-center gap-3 flex-1 ml-4">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-destructive/60 rounded-full"
                          style={{ width: `${(count / totalViolations) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-sm text-muted-foreground w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No violations recorded yet</p>
            )}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="governance-card">
          <div className="governance-card-header">
            <h2 className="font-semibold">Recent Requests</h2>
            <Link to="/requests" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="governance-card-body p-0">
            <div className="divide-y divide-border">
              {allRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="px-5 py-3 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm truncate">{request.prompt}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground font-mono">
                          {request.model}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    {request.llm_decisions?.[0] && (
                      <StatusBadge decision={request.llm_decisions[0].decision} />
                    )}
                  </div>
                </div>
              ))}
              {allRequests.length === 0 && (
                <div className="px-5 py-8 text-center text-muted-foreground">
                  No requests yet. Use the Proxy Test to send your first request.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Policies */}
      <div className="governance-card mt-6">
        <div className="governance-card-header">
          <h2 className="font-semibold">Active Policies</h2>
          <Link to="/policies" className="text-sm text-primary hover:underline flex items-center gap-1">
            Manage <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="governance-card-body p-0">
          <div className="divide-y divide-border">
            {policies.filter(p => p.enabled).map((policy) => (
              <div key={policy.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{policy.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{policy.policy_type}</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-success" />
              </div>
            ))}
            {policies.filter(p => p.enabled).length === 0 && (
              <div className="px-5 py-8 text-center text-muted-foreground">
                No active policies
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number;
  color: 'primary' | 'success' | 'destructive';
}) {
  const colorClasses = {
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    destructive: 'text-destructive bg-destructive/10'
  };
  
  return (
    <div className="governance-card p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}
