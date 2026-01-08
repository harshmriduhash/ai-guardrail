import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

const logos = [
  { name: 'OpenAI', opacity: 0.6 },
  { name: 'Anthropic', opacity: 0.6 },
  { name: 'Google', opacity: 0.6 },
  { name: 'Meta', opacity: 0.6 },
  { name: 'Mistral', opacity: 0.6 },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-spotlight" />
      <div className="absolute inset-0 dot-grid opacity-30" />
      
      {/* Floating orb effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Announcement badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 group hover:border-primary/30 transition-colors cursor-pointer">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Introducing PolicyShield v2.0 — Now with real-time monitoring
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
            <span className="text-foreground">Enterprise</span>
            <br />
            <span className="gradient-text">AI Governance</span>
            <br />
            <span className="text-foreground">At Scale.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            PolicyShield sits between your applications and LLM providers, enforcing security policies, 
            blocking sensitive data, and providing complete visibility into every AI request.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="w-full sm:w-auto h-12 px-8 text-base bg-gradient-primary hover:opacity-90 transition-opacity border-0 shadow-lg shadow-primary/25"
              asChild
            >
              <Link to="/auth?mode=signup" className="flex items-center gap-2">
                Start Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto h-12 px-8 text-base border-border/50 hover:bg-accent hover:border-border"
              asChild
            >
              <Link to="/demo" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Live Demo
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 pt-16 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-6">Works with all major LLM providers</p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              {logos.map((logo, i) => (
                <div 
                  key={i} 
                  className="text-muted-foreground/60 font-semibold text-lg tracking-tight hover:text-muted-foreground transition-colors cursor-default"
                >
                  {logo.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 relative">
          <div className="absolute -inset-4 bg-gradient-to-b from-transparent via-background/50 to-background z-10 pointer-events-none" />
          <div className="gradient-border glow overflow-hidden">
            <div className="bg-card/80 backdrop-blur-sm">
              {/* Browser chrome */}
              <div className="bg-accent/50 border-b border-border px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-muted rounded-md px-4 py-1 text-xs text-muted-foreground font-mono">
                    dashboard.policyshield.io
                  </div>
                </div>
              </div>
              
              {/* Dashboard content */}
              <div className="p-6">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Requests Today', value: '12,847', change: '+23%', positive: true },
                    { label: 'Blocked', value: '234', change: '1.8%', positive: false },
                    { label: 'Cost Saved', value: '$1,420', change: '+$320', positive: true },
                    { label: 'Avg Latency', value: '12ms', change: '-2ms', positive: true },
                  ].map((stat, i) => (
                    <div key={i} className="bg-muted/30 rounded-lg p-4 border border-border/50">
                      <p className="text-2xl font-mono font-bold text-foreground">{stat.value}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <span className={`text-xs font-mono ${stat.positive ? 'text-success' : 'text-destructive'}`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { status: 'ALLOW', model: 'gpt-4', prompt: 'Summarize quarterly report for executive team...', time: '12ms' },
                    { status: 'BLOCK', model: 'claude-3', prompt: 'Email: john@example.com, SSN: 123-45-6789...', time: '8ms', reason: 'PII_DETECTED' },
                    { status: 'ALLOW', model: 'gpt-3.5', prompt: 'Generate product description for new feature...', time: '6ms' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between py-3 px-4 bg-muted/20 rounded-lg border border-border/30">
                      <div className="flex items-center gap-4">
                        <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-md ${
                          row.status === 'ALLOW' 
                            ? 'bg-success/15 text-success border border-success/30' 
                            : 'bg-destructive/15 text-destructive border border-destructive/30'
                        }`}>
                          {row.status}
                        </span>
                        <span className="text-sm font-mono text-muted-foreground">{row.model}</span>
                        <span className="text-sm text-foreground truncate max-w-md">{row.prompt}</span>
                        {row.reason && (
                          <span className="text-xs font-mono text-warning bg-warning/10 px-2 py-0.5 rounded">
                            {row.reason}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{row.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}