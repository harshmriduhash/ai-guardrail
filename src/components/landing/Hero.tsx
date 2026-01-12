import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles, Shield, Zap, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const logos = ['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral', 'Cohere'];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 dot-grid opacity-20" />
      
      {/* Light beam effect - huly.io inspired */}
      <div className="light-beam" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-radial blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-conic blur-3xl opacity-30 pointer-events-none" />

      <motion.div 
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 pt-40"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="text-center max-w-5xl mx-auto">
          {/* Announcement badge */}
          <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
            <Link 
              to="/features" 
              className="inline-flex items-center gap-2 pill-button mb-8 group"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Introducing PolicyShield v2.0</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          </motion.div>

          {/* Main headline - Stripe/Clay inspired large typography */}
          <motion.h1 
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight"
          >
            <span className="text-foreground">Enterprise</span>
            <br />
            <span className="gradient-text">AI Governance</span>
            <br />
            <span className="text-foreground">Made Simple.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            PolicyShield sits between your apps and LLM providers, enforcing security policies, 
            blocking sensitive data, and giving you complete visibility into every AI request.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              size="lg" 
              className="w-full sm:w-auto h-14 px-10 text-base font-semibold bg-gradient-primary hover:opacity-90 transition-all border-0 shadow-xl shadow-primary/20 rounded-full"
              asChild
            >
              <Link to="/auth?mode=signup" className="flex items-center gap-2">
                Start Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto h-14 px-10 text-base font-medium border-border/50 hover:bg-accent hover:border-primary/30 rounded-full"
              asChild
            >
              <Link to="/demo" className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </Link>
            </Button>
          </motion.div>

          {/* Quick feature highlights */}
          <motion.div 
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            {[
              { icon: Shield, text: 'SOC 2 Compliant' },
              { icon: Zap, text: '<15ms Latency' },
              { icon: Lock, text: 'End-to-End Encrypted' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Trust logos */}
          <motion.div 
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-20 pt-12 border-t border-border/50"
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-8">
              Trusted by teams using
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
              {logos.map((logo, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="text-muted-foreground/50 font-semibold text-lg tracking-tight hover:text-muted-foreground transition-colors cursor-default"
                >
                  {logo}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Dashboard Preview - Bento style */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-24 relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-b from-transparent via-background/50 to-background z-10 pointer-events-none" />
          <div className="gradient-border glow-lg overflow-hidden">
            <div className="bg-card/90 backdrop-blur-sm noise">
              {/* Browser chrome */}
              <div className="bg-accent/30 border-b border-border px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-muted/50 rounded-lg px-6 py-1.5 text-xs text-muted-foreground font-mono">
                    dashboard.policyshield.io
                  </div>
                </div>
              </div>
              
              {/* Dashboard content - Bento grid */}
              <div className="p-6">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Requests Today', value: '12,847', change: '+23%', positive: true },
                    { label: 'Blocked', value: '234', change: '1.8%', positive: false },
                    { label: 'Cost Saved', value: '$1,420', change: '+$320', positive: true },
                    { label: 'Avg Latency', value: '12ms', change: '-2ms', positive: true },
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="bg-accent/30 rounded-xl p-4 border border-border/50"
                    >
                      <p className="text-2xl font-bold font-mono text-foreground">{stat.value}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <span className={`text-xs font-mono ${stat.positive ? 'text-success' : 'text-destructive'}`}>
                          {stat.change}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { status: 'ALLOW', model: 'gpt-4', prompt: 'Summarize quarterly report for executive team...', time: '12ms' },
                    { status: 'BLOCK', model: 'claude-3', prompt: 'Email: john@example.com, SSN: 123-45-6789...', time: '8ms', reason: 'PII_DETECTED' },
                    { status: 'ALLOW', model: 'gpt-3.5', prompt: 'Generate product description for new feature...', time: '6ms' },
                  ].map((row, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + i * 0.1 }}
                      className="flex items-center justify-between py-3 px-4 bg-muted/20 rounded-xl border border-border/30"
                    >
                      <div className="flex items-center gap-4">
                        <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-lg ${
                          row.status === 'ALLOW' 
                            ? 'bg-success/15 text-success border border-success/30' 
                            : 'bg-destructive/15 text-destructive border border-destructive/30'
                        }`}>
                          {row.status}
                        </span>
                        <span className="text-sm font-mono text-muted-foreground">{row.model}</span>
                        <span className="text-sm text-foreground truncate max-w-md">{row.prompt}</span>
                        {row.reason && (
                          <span className="text-xs font-mono text-warning bg-warning/10 px-2 py-0.5 rounded-lg">
                            {row.reason}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{row.time}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
