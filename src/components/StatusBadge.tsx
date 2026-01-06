import { cn } from '@/lib/utils';
import { Decision, ViolationReason } from '@/types/governance';
import { CheckCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  decision: Decision;
  className?: string;
}

export function StatusBadge({ decision, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono font-medium',
      decision === 'ALLOW' ? 'status-allow' : 'status-block',
      className
    )}>
      {decision === 'ALLOW' ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {decision}
    </span>
  );
}

const reasonLabels: Record<ViolationReason, string> = {
  PII_DETECTED: 'PII',
  TOKEN_LIMIT_EXCEEDED: 'TOKENS',
  MODEL_NOT_ALLOWED: 'MODEL',
  KEYWORD_BLOCKED: 'KEYWORD',
  COST_LIMIT_EXCEEDED: 'COST'
};

interface ReasonBadgeProps {
  reason: ViolationReason;
  className?: string;
}

export function ReasonBadge({ reason, className }: ReasonBadgeProps) {
  return (
    <span className={cn(
      'inline-block px-1.5 py-0.5 rounded text-xs font-mono bg-destructive/10 text-destructive border border-destructive/20',
      className
    )}>
      {reasonLabels[reason]}
    </span>
  );
}
