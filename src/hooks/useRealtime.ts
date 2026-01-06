import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeRequest {
  id: string;
  demo_session_id: string;
  model: string;
  prompt: string;
  tokens_requested: number;
  created_at: string;
}

interface RealtimeDecision {
  id: string;
  llm_request_id: string;
  decision: 'ALLOW' | 'BLOCK';
  reasons: string[];
  cost_estimate: number;
  evaluation_time_ms: number;
  created_at: string;
}

interface RealtimeAuditLog {
  id: string;
  demo_session_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function useRealtimeRequests(onNewRequest?: (request: RealtimeRequest) => void) {
  const [requests, setRequests] = useState<RealtimeRequest[]>([]);

  useEffect(() => {
    const channel: RealtimeChannel = supabase
      .channel('llm-requests-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'llm_requests'
        },
        (payload) => {
          console.log('[REALTIME] New request:', payload.new);
          const newRequest = payload.new as RealtimeRequest;
          setRequests(prev => [newRequest, ...prev]);
          onNewRequest?.(newRequest);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onNewRequest]);

  return { requests, setRequests };
}

export function useRealtimeDecisions(onNewDecision?: (decision: RealtimeDecision) => void) {
  const [decisions, setDecisions] = useState<Map<string, RealtimeDecision>>(new Map());

  useEffect(() => {
    const channel: RealtimeChannel = supabase
      .channel('llm-decisions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'llm_decisions'
        },
        (payload) => {
          console.log('[REALTIME] New decision:', payload.new);
          const newDecision = payload.new as RealtimeDecision;
          setDecisions(prev => {
            const updated = new Map(prev);
            updated.set(newDecision.llm_request_id, newDecision);
            return updated;
          });
          onNewDecision?.(newDecision);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onNewDecision]);

  const getDecision = useCallback((requestId: string) => {
    return decisions.get(requestId);
  }, [decisions]);

  return { decisions, getDecision, setDecisions };
}

export function useRealtimeAuditLogs(onNewLog?: (log: RealtimeAuditLog) => void) {
  const [logs, setLogs] = useState<RealtimeAuditLog[]>([]);

  useEffect(() => {
    const channel: RealtimeChannel = supabase
      .channel('audit-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs'
        },
        (payload) => {
          console.log('[REALTIME] New audit log:', payload.new);
          const newLog = payload.new as RealtimeAuditLog;
          setLogs(prev => [newLog, ...prev]);
          onNewLog?.(newLog);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onNewLog]);

  return { logs, setLogs };
}

// Combined hook for all realtime subscriptions
export function useGovernanceRealtime() {
  const [isConnected, setIsConnected] = useState(false);
  const { requests, setRequests } = useRealtimeRequests();
  const { decisions, getDecision, setDecisions } = useRealtimeDecisions();
  const { logs, setLogs } = useRealtimeAuditLogs();

  useEffect(() => {
    setIsConnected(true);
    return () => setIsConnected(false);
  }, []);

  return {
    isConnected,
    requests,
    decisions,
    logs,
    getDecision,
    setRequests,
    setDecisions,
    setLogs
  };
}
