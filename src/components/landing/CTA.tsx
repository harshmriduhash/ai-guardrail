import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { value: '10M+', label: 'Requests governed' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '<15ms', label: 'Avg latency' },
  { value: '500+', label: 'Companies' },
];

export function CTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-card via-background to-background" />
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 dot-grid opacity-20" />
      
      {/* Light beam */}
      <div className="light-beam opacity-50" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 pill-button mb-8">
            <Zap className="w-4 h-4 text-primary" />
            <span>Ready to start?</span>
          </span>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
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
              className="w-full sm:w-auto h-14 px-10 text-base font-semibold bg-gradient-primary hover:opacity-90 transition-all border-0 shadow-xl shadow-primary/20 rounded-full"
              asChild
            >
              <Link to="/auth?mode=signup" className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto h-14 px-10 text-base font-medium border-border/50 hover:bg-accent hover:border-primary/30 rounded-full"
              asChild
            >
              <Link to="/demo">Try Live Demo</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div 
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold gradient-text font-mono">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
