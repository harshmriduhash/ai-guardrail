import { mockAuditLogs } from '@/lib/mock-data';
import { format } from 'date-fns';
import { ScrollText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const actionColors: Record<string, string> = {
  REQUEST_ALLOWED: 'border-l-success text-success',
  REQUEST_BLOCKED: 'border-l-destructive text-destructive',
  POLICY_DISABLED: 'border-l-warning text-warning',
  POLICY_ENABLED: 'border-l-success text-success',
  SESSION_CREATED: 'border-l-primary text-primary',
};

export default function AuditLogs() {
  const [search, setSearch] = useState('');
  
  const filteredLogs = search
    ? mockAuditLogs.filter(log => 
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.entityType.toLowerCase().includes(search.toLowerCase()) ||
        JSON.stringify(log.metadata).toLowerCase().includes(search.toLowerCase())
      )
    : mockAuditLogs;

  return (
    <div className="p-8">
      <div className="mb-8">
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
            DEMO WATERMARK
          </span>
        </div>
        
        <div className="log-viewer">
          {filteredLogs.map((log, i) => (
            <div 
              key={log.id} 
              className={cn(
                'log-entry',
                actionColors[log.action] || 'border-l-muted-foreground text-muted-foreground'
              )}
            >
              <div className="flex items-start gap-4">
                <span className="text-muted-foreground w-40 flex-shrink-0">
                  {format(log.createdAt, 'yyyy-MM-dd HH:mm:ss')}
                </span>
                <span className="w-32 flex-shrink-0 font-medium">
                  {log.action}
                </span>
                <span className="text-muted-foreground">
                  {log.entityType}:{log.entityId.slice(0, 8)}
                </span>
                <span className="text-muted-foreground/60 flex-1 truncate">
                  {JSON.stringify(log.metadata)}
                </span>
              </div>
            </div>
          ))}
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No logs match your search.
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
