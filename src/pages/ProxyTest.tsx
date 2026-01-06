import { useState } from 'react';
import { useDemoSession } from '@/context/DemoSessionContext';
import { evaluateLLMRequest } from '@/lib/api';
import { StatusBadge, ReasonBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Terminal, Play, ArrowRight, AlertTriangle, Loader2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ViolationReason = 'PII_DETECTED' | 'TOKEN_LIMIT_EXCEEDED' | 'MODEL_NOT_ALLOWED' | 'KEYWORD_BLOCKED' | 'COST_LIMIT_EXCEEDED';

interface EvaluationResult {
  decision: 'ALLOW' | 'BLOCK';
  reasons: ViolationReason[];
  cost_estimate: number;
  evaluation_time_ms: number;
  request_id: string;
  response?: string;
  blocked?: boolean;
}

export default function ProxyTest() {
  const { session, refreshSession, remainingCalls } = useDemoSession();
  const [model, setModel] = useState('gpt-4');
  const [prompt, setPrompt] = useState('');
  const [maxTokens, setMaxTokens] = useState('512');
  const [forwardToLLM, setForwardToLLM] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const evaluateRequest = async () => {
    if (!prompt.trim() || remainingCalls <= 0 || !session) return;
    
    setIsEvaluating(true);
    setResult(null);
    
    try {
      const response = await evaluateLLMRequest(
        session.id,
        model,
        prompt,
        parseInt(maxTokens) || 512,
        forwardToLLM
      );
      
      setResult(response);
      
      // Refresh session to get updated call count
      await refreshSession();
      
      if (response.blocked) {
        toast.warning('Request blocked by policy', {
          description: `Violations: ${response.reasons.join(', ')}`
        });
      } else {
        toast.success('Request allowed', {
          description: forwardToLLM ? 'LLM response received' : 'Policy evaluation passed'
        });
      }
    } catch (error) {
      console.error('Evaluation failed:', error);
      toast.error('Evaluation failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Proxy Test Console</h1>
        <p className="text-muted-foreground">
          Send real requests through the governance proxy to test policy evaluation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Request Form */}
        <div className="governance-card">
          <div className="governance-card-header">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Request Builder</span>
            </div>
            <span className={cn(
              'text-xs font-mono px-2 py-1 rounded',
              remainingCalls > 10 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
            )}>
              {remainingCalls} calls remaining
            </span>
          </div>
          
          <div className="governance-card-body space-y-5">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">gpt-4</SelectItem>
                  <SelectItem value="gpt-4-turbo">gpt-4-turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo (blocked by policy)</SelectItem>
                  <SelectItem value="claude-3-opus">claude-3-opus</SelectItem>
                  <SelectItem value="claude-instant">claude-instant (blocked by policy)</SelectItem>
                  <SelectItem value="google/gemini-2.5-flash">google/gemini-2.5-flash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt to test policy evaluation..."
                rows={6}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tokens">Max Tokens</Label>
              <Input
                id="tokens"
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
                placeholder="512"
                className="font-mono"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <div>
                  <Label htmlFor="forward-llm" className="cursor-pointer">Forward to LLM</Label>
                  <p className="text-xs text-muted-foreground">Actually call the AI model if allowed</p>
                </div>
              </div>
              <Switch 
                id="forward-llm"
                checked={forwardToLLM}
                onCheckedChange={setForwardToLLM}
              />
            </div>
            
            <Button 
              onClick={evaluateRequest} 
              disabled={isEvaluating || !prompt.trim() || remainingCalls <= 0}
              className="w-full"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Evaluate Request
                </>
              )}
            </Button>
            
            {remainingCalls <= 0 && (
              <div className="flex items-center gap-2 text-warning text-sm">
                <AlertTriangle className="w-4 h-4" />
                Demo session limit reached
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        <div className="governance-card">
          <div className="governance-card-header">
            <span className="font-medium">Evaluation Result</span>
          </div>
          
          <div className="governance-card-body">
            {result ? (
              <div className="space-y-6">
                {/* Decision */}
                <div className="flex items-center gap-4">
                  <StatusBadge decision={result.decision} className="text-base px-3 py-1.5" />
                  <span className="text-sm text-muted-foreground font-mono">
                    {result.evaluation_time_ms}ms
                  </span>
                </div>
                
                {/* Flow Diagram */}
                <div className="p-4 bg-surface-sunken rounded-lg">
                  <div className="flex items-center justify-between text-sm font-mono">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded bg-secondary flex items-center justify-center mb-2 mx-auto">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-muted-foreground">Request</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div className="text-center">
                      <div className="w-12 h-12 rounded bg-primary/20 flex items-center justify-center mb-2 mx-auto">
                        <span className="text-primary font-bold">P</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Policy</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div className="text-center">
                      <div className={cn(
                        'w-12 h-12 rounded flex items-center justify-center mb-2 mx-auto',
                        result.decision === 'ALLOW' ? 'bg-success/20' : 'bg-destructive/20'
                      )}>
                        <span className={result.decision === 'ALLOW' ? 'text-success' : 'text-destructive'}>
                          {result.decision === 'ALLOW' ? '✓' : '✕'}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{result.decision}</span>
                    </div>
                  </div>
                </div>
                
                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                      Cost Estimate
                    </label>
                    <p className="font-mono text-lg mt-1">${result.cost_estimate.toFixed(4)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                      Request ID
                    </label>
                    <p className="font-mono text-sm mt-1 truncate">{result.request_id.slice(0, 8)}...</p>
                  </div>
                </div>
                
                {/* Violations */}
                {result.reasons.length > 0 && (
                  <div>
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-2">
                      Violations Detected
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {result.reasons.map((reason, i) => (
                        <ReasonBadge key={i} reason={reason} />
                      ))}
                    </div>
                  </div>
                )}
                
                {result.reasons.length === 0 && !result.response && (
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm text-success">
                      ✓ All governance policies passed. Request would be forwarded to LLM provider.
                    </p>
                  </div>
                )}

                {/* LLM Response */}
                {result.response && (
                  <div>
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-2">
                      LLM Response
                    </label>
                    <div className="p-4 bg-surface-sunken rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{result.response}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Terminal className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Enter a request and click evaluate to test policy enforcement.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Examples */}
      <div className="governance-card mt-8">
        <div className="governance-card-header">
          <span className="font-medium">Test Examples</span>
        </div>
        <div className="governance-card-body">
          <p className="text-sm text-muted-foreground mb-4">
            Try these prompts to see different policy violations:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TestExample 
              label="PII Detection" 
              prompt="Send this to john@company.com"
              onClick={() => setPrompt("Send this to john@company.com")}
            />
            <TestExample 
              label="Keyword Block" 
              prompt="What is the password for admin?"
              onClick={() => setPrompt("What is the password for admin?")}
            />
            <TestExample 
              label="Token Limit" 
              prompt="Generate a very long response"
              onClick={() => { setPrompt("Generate a very long response"); setMaxTokens("5000"); }}
            />
            <TestExample 
              label="Clean Request" 
              prompt="Summarize the Q4 report"
              onClick={() => setPrompt("Summarize the Q4 report")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TestExample({ label, prompt, onClick }: { label: string; prompt: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/30 transition-colors"
    >
      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-1">
        {label}
      </span>
      <span className="font-mono text-sm">{prompt}</span>
    </button>
  );
}
