import { useState, useEffect } from 'react';
import { fetchAuditLogs } from '@/lib/api';
import { useRealtimeAuditLogs } from '@/hooks/useRealtime';
import { format } from 'date-fns';
import { ScrollText, Search, Loader2, Wifi } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AuditLog {
  id: string;
  demo_session_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

const actionColors: Record<string, string> = {
  REQUEST_ALLOWED: 'border-l-success text-success',
  REQUEST_BLOCKED: 'border-l-destructive text-destructive',
  POLICY_DISABLED: 'border-l-warning text-warning',
  POLICY_ENABLED: 'border-l-success text-success',
  SESSION_CREATED: 'border-l-primary text-primary',
  SESSION_ENDED: 'border-l-muted-foreground text-muted-foreground',
  DASHBOARD_VIEWED: 'border-l-primary text-primary',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Real-time subscription
  const { logs: realtimeLogs } = useRealtimeAuditLogs();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await fetchAuditLogs();
      setLogs(data || []);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Merge realtime logs with loaded logs
  const allLogs = [...realtimeLogs, ...logs];
  
  const filteredLogs = search
    ? allLogs.filter(log => 
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.entity_type.toLowerCase().includes(search.toLowerCase()) ||
        JSON.stringify(log.metadata).toLowerCase().includes(search.toLowerCase())
      )
    : allLogs;

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
          LIVE STREAM
        </div>
        <h1 className="text-3xl font-bold mb-1">Audit Logs</h1>
        <p className="text-muted-foreground">
          Immutable record of all governance events. SOC2-ready format.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search logs..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 font-mono"
        />
      </div>

      {/* Log Viewer */}
      <div className="governance-card">
        <div className="governance-card-header">
          <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-mono">
              {filteredLogs.length} entries
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-mono uppercase">
            DEMO SESSION
          </span>
        </div>
        
        <div className="log-viewer">
          {filteredLogs.map((log) => (
            <div 
              key={log.id} 
              className={cn(
                'log-entry',
                actionColors[log.action] || 'border-l-muted-foreground text-muted-foreground'
              )}
            >
              <div className="flex items-start gap-4">
                <span className="text-muted-foreground w-40 flex-shrink-0">
                  {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                </span>
                <span className="w-32 flex-shrink-0 font-medium">
                  {log.action}
                </span>
                <span className="text-muted-foreground">
                  {log.entity_type}:{log.entity_id?.slice(0, 8) || 'N/A'}
                </span>
                <span className="text-muted-foreground/60 flex-1 truncate">
                  {JSON.stringify(log.metadata)}
                </span>
              </div>
            </div>
          ))}
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {search ? 'No logs match your search.' : 'No audit logs yet.'}
            </div>
          )}
        </div>
      </div>

      {/* Export Info */}
      <div className="mt-4 p-4 border border-border rounded-lg bg-card">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-success" />
          Audit logs are append-only and immutable. Export functionality available in production deployment.
        </div>
      </div>
    </div>
  );
}
