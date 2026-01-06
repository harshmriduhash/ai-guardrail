import { useState } from 'react';
import { mockPolicies } from '@/lib/mock-data';
import { Policy, PolicyType } from '@/types/governance';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
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
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [policies, setPolicies] = useState<Policy[]>(mockPolicies);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  const togglePolicy = (id: string) => {
    setPolicies(policies.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

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
            const Icon = policyIcons[policy.policyType];
            
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
                        {policy.policyType}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {policyDescriptions[policy.policyType]}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Switch 
                    checked={policy.enabled}
                    onCheckedChange={() => togglePolicy(policy.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
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
                    const Icon = policyIcons[selectedPolicy.policyType];
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
                <p className="font-mono text-sm mt-1">{selectedPolicy.policyType}</p>
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
                    togglePolicy(selectedPolicy.id);
                    setSelectedPolicy({
                      ...selectedPolicy,
                      enabled: !selectedPolicy.enabled
                    });
                  }}
                />
              </div>
              
              <p className="text-xs text-muted-foreground italic">
                Configuration changes are read-only in demo mode.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
