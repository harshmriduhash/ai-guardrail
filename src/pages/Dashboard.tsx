import { useDemoSession } from '@/context/DemoSessionContext';
import { mockStats, mockRequests, mockPolicies } from '@/lib/mock-data';
import { StatusBadge, ReasonBadge } from '@/components/StatusBadge';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { session } = useDemoSession();
  
  const allowedCount = mockRequests.filter(r => r.decision.decision === 'ALLOW').length;
  const blockedCount = mockRequests.filter(r => r.decision.decision === 'BLOCK').length;
  const activePolicies = mockPolicies.filter(p => p.enabled).length;
  
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono mb-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          DEMO SESSION ACTIVE
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
          value={mockRequests.length} 
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
            {Object.entries(mockStats.violationsByType).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(mockStats.violationsByType).map(([reason, count]) => (
                  <div key={reason} className="flex items-center justify-between">
                    <ReasonBadge reason={reason as any} />
                    <div className="flex items-center gap-3 flex-1 ml-4">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-destructive/60 rounded-full"
                          style={{ width: `${(count / mockStats.totalViolations) * 100}%` }}
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
              <p className="text-muted-foreground text-sm">No violations recorded</p>
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
              {mockRequests.slice(0, 5).map((request) => (
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
                          {formatDistanceToNow(request.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <StatusBadge decision={request.decision.decision} />
                  </div>
                </div>
              ))}
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
            {mockPolicies.filter(p => p.enabled).map((policy) => (
              <div key={policy.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{policy.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{policy.policyType}</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-success" />
              </div>
            ))}
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
