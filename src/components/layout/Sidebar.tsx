import { NavLink, useNavigate } from 'react-router-dom';
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
  Book,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/policies', icon: FileCode, label: 'Policies' },
  { to: '/requests', icon: Terminal, label: 'LLM Requests' },
  { to: '/violations', icon: AlertTriangle, label: 'Violations' },
  { to: '/audit', icon: ScrollText, label: 'Audit Logs' },
  { to: '/docs', icon: Book, label: 'API Docs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { session, clearSession, remainingCalls } = useDemoSession();

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-semibold text-sidebar-foreground">PolicyShield</span>
            <span className="block text-xs text-muted-foreground">AI Governance</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
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
        <div className="bg-sidebar-accent rounded-xl p-3 mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Session</span>
            <span className={cn(
              'text-xs font-mono font-medium px-2 py-0.5 rounded-md',
              remainingCalls > 10 ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
            )}>
              {remainingCalls}/50
            </span>
          </div>
          <p className="text-sm font-medium truncate text-foreground">{session?.company}</p>
          <p className="text-xs text-muted-foreground truncate">{session?.email}</p>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={clearSession}
        >
          <LogOut className="w-4 h-4 mr-2" />
          End Session
        </Button>
      </div>
    </div>
  );
}