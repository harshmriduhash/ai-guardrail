import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-card">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-6">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
          Ready to Secure Your AI?
        </h2>
        
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Join hundreds of companies using PolicyShield to govern their LLM deployments. 
          Start with 100 free API calls—no credit card required.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/auth?mode=signup">
              Get Started Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/demo">Try Live Demo</Link>
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '10M+', label: 'Requests governed' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '<15ms', label: 'Avg latency' },
            { value: '500+', label: 'Companies' },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-2xl font-bold text-foreground font-mono">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
