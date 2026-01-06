import { useState, useEffect } from 'react';
import { fetchPolicies, togglePolicy, logAuditEvent } from '@/lib/api';
import { useDemoSession } from '@/context/DemoSessionContext';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Shield, 
  Hash, 
  Eye, 
  Ban, 
  DollarSign,
  ChevronRight,
  Settings,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type PolicyType = 'MODEL_RESTRICTION' | 'TOKEN_LIMIT' | 'PII_BLOCK' | 'PROMPT_KEYWORD_BLOCK' | 'COST_LIMIT';

interface Policy {
  id: string;
  name: string;
  policy_type: PolicyType;
  config: Record<string, unknown>;
  enabled: boolean;
  priority: number;
  created_at: string;
}

const policyIcons: Record<PolicyType, React.ElementType> = {
  MODEL_RESTRICTION: Shield,
  TOKEN_LIMIT: Hash,
  PII_BLOCK: Eye,
  PROMPT_KEYWORD_BLOCK: Ban,
  COST_LIMIT: DollarSign
};

const policyDescriptions: Record<PolicyType, string> = {
  MODEL_RESTRICTION: 'Allow only approved LLM models',
  TOKEN_LIMIT: 'Enforce token limits per request/session',
  PII_BLOCK: 'Detect and block personally identifiable information',
  PROMPT_KEYWORD_BLOCK: 'Block prompts containing sensitive keywords',
  COST_LIMIT: 'Prevent requests exceeding cost thresholds'
};

export default function Policies() {
  const { session } = useDemoSession();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const data = await fetchPolicies();
      setPolicies(data || []);
    } catch (error) {
      console.error('Failed to load policies:', error);
      toast.error('Failed to load policies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePolicy = async (id: string, currentEnabled: boolean) => {
    setTogglingId(id);
    try {
      const updated = await togglePolicy(id, !currentEnabled);
      setPolicies(policies.map(p => p.id === id ? { ...p, enabled: updated.enabled } : p));
      
      // Log audit event
      if (session) {
        await logAuditEvent(
          session.id,
          'policy',
          id,
          updated.enabled ? 'POLICY_ENABLED' : 'POLICY_DISABLED',
          { policy_name: policies.find(p => p.id === id)?.name }
        );
      }
      
      toast.success(`Policy ${updated.enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to toggle policy:', error);
      toast.error('Failed to update policy');
    } finally {
      setTogglingId(null);
    }
  };

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
        <h1 className="text-3xl font-bold mb-1">Governance Policies</h1>
        <p className="text-muted-foreground">
          Configure enforcement rules for LLM requests. Policies are evaluated in order.
        </p>
      </div>

      <div className="governance-card">
        <div className="governance-card-header">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-mono">
              {policies.filter(p => p.enabled).length} of {policies.length} active
            </span>
          </div>
        </div>
        
        <div className="divide-y divide-border">
          {policies.map((policy) => {
            const Icon = policyIcons[policy.policy_type] || Shield;
            
            return (
              <div 
                key={policy.id} 
                className="policy-row cursor-pointer"
                onClick={() => setSelectedPolicy(policy)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    policy.enabled ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{policy.name}</h3>
                      <span className="text-xs font-mono text-muted-foreground px-1.5 py-0.5 bg-secondary rounded">
                        {policy.policy_type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {policyDescriptions[policy.policy_type]}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {togglingId === policy.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Switch 
                      checked={policy.enabled}
                      onCheckedChange={() => handleTogglePolicy(policy.id, policy.enabled)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Policy Detail Dialog */}
      <Dialog open={!!selectedPolicy} onOpenChange={() => setSelectedPolicy(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedPolicy && (
                <>
                  {(() => {
                    const Icon = policyIcons[selectedPolicy.policy_type] || Shield;
                    return <Icon className="w-5 h-5 text-primary" />;
                  })()}
                  {selectedPolicy.name}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPolicy && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Policy Type
                </label>
                <p className="font-mono text-sm mt-1">{selectedPolicy.policy_type}</p>
              </div>
              
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Configuration
                </label>
                <pre className="mt-2 p-4 bg-surface-sunken rounded-lg text-xs font-mono overflow-auto">
                  {JSON.stringify(selectedPolicy.config, null, 2)}
                </pre>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={cn(
                    'text-sm font-medium',
                    selectedPolicy.enabled ? 'text-success' : 'text-muted-foreground'
                  )}>
                    {selectedPolicy.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <Switch 
                  checked={selectedPolicy.enabled}
                  onCheckedChange={() => {
                    handleTogglePolicy(selectedPolicy.id, selectedPolicy.enabled);
                    setSelectedPolicy({
                      ...selectedPolicy,
                      enabled: !selectedPolicy.enabled
                    });
                  }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
