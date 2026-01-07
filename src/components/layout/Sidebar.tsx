import { NavLink, useLocation } from 'react-router-dom';
import { useDemoSession } from '@/context/DemoSessionContext';
import { 
  Shield, 
  LayoutDashboard, 
  FileCode, 
  AlertTriangle, 
  ScrollText, 
  Settings,
  Terminal,
  LogOut,
  Book
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/policies', icon: FileCode, label: 'Policies' },
  { to: '/requests', icon: Terminal, label: 'LLM Requests' },
  { to: '/violations', icon: AlertTriangle, label: 'Violations' },
  { to: '/audit', icon: ScrollText, label: 'Audit Logs' },
  { to: '/proxy', icon: Settings, label: 'Proxy Test' },
  { to: '/docs', icon: Book, label: 'API Docs' },
];

export function Sidebar() {
  const location = useLocation();
  const { session, clearSession, remainingCalls } = useDemoSession();

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="font-mono text-sm font-semibold text-sidebar-foreground">AI GOVERNANCE</span>
            <span className="block text-xs text-muted-foreground font-mono">CONTROL PLANE</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
              'hover:bg-sidebar-accent',
              isActive 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                : 'text-sidebar-foreground/70'
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Session Info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-sidebar-accent rounded-lg p-3 mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-muted-foreground">DEMO SESSION</span>
            <span className={cn(
              'text-xs font-mono px-1.5 py-0.5 rounded',
              remainingCalls > 10 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
            )}>
              {remainingCalls}/50
            </span>
          </div>
          <p className="text-sm font-medium truncate">{session?.company}</p>
          <p className="text-xs text-muted-foreground truncate">{session?.email}</p>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={clearSession}
        >
          <LogOut className="w-4 h-4 mr-2" />
          End Session
        </Button>
      </div>
    </div>
  );
}
