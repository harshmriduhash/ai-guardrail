import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For individuals exploring AI governance.',
    features: [
      '100 API calls/month',
      'Basic policy types',
      '2 policies max',
      'GPT-3.5, Gemini Flash',
      '7-day log retention',
      'Community support'
    ],
    cta: 'Get Started',
    href: '/auth?mode=signup&plan=free',
    highlighted: false
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For growing teams with comprehensive needs.',
    features: [
      '5,000 API calls/month',
      'All policy types',
      'Unlimited policies',
      'All LLM models',
      '90-day log retention',
      'Priority support',
      'Team analytics',
      'Webhook integrations'
    ],
    cta: 'Start Free Trial',
    href: '/auth?mode=signup&plan=pro',
    highlighted: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations with advanced needs.',
    features: [
      'Unlimited API calls',
      'Custom policy engine',
      'SSO / SAML',
      'All LLM providers',
      'Unlimited retention',
      'Dedicated support',
      'SLA guarantee',
      'On-premise option',
      'Custom integrations'
    ],
    cta: 'Contact Sales',
    href: '/contact',
    highlighted: false
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  },
};

export function Pricing() {
  return (
    <section id="pricing" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 hero-gradient opacity-50" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 pill-button mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Simple Pricing</span>
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Transparent
            <br />
            <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((plan, i) => (
            <motion.div 
              key={i}
              variants={itemVariants}
              className={cn(
                'relative rounded-3xl p-8 flex flex-col transition-all duration-500',
                plan.highlighted 
                  ? 'gradient-border glow bg-card scale-105 md:scale-110' 
                  : 'border border-border bg-card hover:border-primary/30'
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 bg-gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-lg">{plan.period}</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.highlighted ? 'default' : 'outline'} 
                className={cn(
                  'w-full h-12 rounded-xl font-semibold',
                  plan.highlighted && 'bg-gradient-primary hover:opacity-90 border-0 shadow-lg shadow-primary/20'
                )}
                asChild
              >
                <Link to={plan.href} className="flex items-center justify-center gap-2">
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground">
            All plans include SSL encryption, 99.9% uptime SLA, and GDPR compliance.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
