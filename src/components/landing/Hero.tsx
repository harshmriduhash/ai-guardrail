import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, Play, CheckCircle } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 blur-[120px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Enterprise AI Governance</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
            Secure, Govern, and Control
            <span className="block text-primary mt-2">Your AI at Scale</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            PolicyShield sits between your applications and LLM providers, enforcing security policies, 
            blocking sensitive data, and providing audit-grade visibility into every AI request.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link to="/auth?mode=signup">
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
              <Link to="/demo">
                <Play className="mr-2 w-4 h-4" />
                Live Demo
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>100 free API calls/month</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Setup in 5 minutes</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <div className="rounded-xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
            <div className="bg-muted/50 border-b border-border px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-warning/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
              <span className="ml-4 text-xs text-muted-foreground font-mono">PolicyShield Dashboard</span>
            </div>
            <div className="p-6 bg-gradient-to-b from-card to-background">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Requests Today', value: '12,847', change: '+23%' },
                  { label: 'Blocked', value: '234', change: '1.8%' },
                  { label: 'Cost Saved', value: '$1,420', change: '+$320' },
                ].map((stat, i) => (
                  <div key={i} className="bg-muted/30 rounded-lg p-4 border border-border/50">
                    <p className="text-2xl font-mono font-semibold text-foreground">{stat.value}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <span className="text-xs text-success">{stat.change}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { status: 'ALLOW', model: 'gpt-4', prompt: 'Summarize quarterly report...', time: '12ms' },
                  { status: 'BLOCK', model: 'claude-3', prompt: 'Email: john@example.com...', time: '8ms' },
                  { status: 'ALLOW', model: 'gpt-3.5', prompt: 'Generate product description...', time: '6ms' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-3 px-4 bg-muted/20 rounded-lg border border-border/30">
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-mono font-medium px-2 py-1 rounded ${
                        row.status === 'ALLOW' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                      }`}>
                        {row.status}
                      </span>
                      <span className="text-sm font-mono text-muted-foreground">{row.model}</span>
                      <span className="text-sm text-foreground truncate max-w-xs">{row.prompt}</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{row.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
