import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-card via-background to-background" />
      <div className="absolute inset-0 bg-gradient-radial" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
          Ready to Secure
          <br />
          <span className="gradient-text">Your AI?</span>
        </h2>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
          Join hundreds of companies using PolicyShield to govern their LLM deployments. 
          Start with 100 free API calls—no credit card required.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            size="lg" 
            className="w-full sm:w-auto h-12 px-8 text-base bg-gradient-primary hover:opacity-90 transition-opacity border-0 shadow-lg shadow-primary/25"
            asChild
          >
            <Link to="/auth?mode=signup" className="flex items-center gap-2">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto h-12 px-8 text-base"
            asChild
          >
            <Link to="/demo">Try Live Demo</Link>
          </Button>
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '10M+', label: 'Requests governed' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '<15ms', label: 'Avg latency' },
            { value: '500+', label: 'Companies' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold gradient-text font-mono">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}