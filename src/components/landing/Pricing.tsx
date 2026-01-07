import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For individuals and small projects exploring AI governance.',
    features: [
      '100 API calls/month',
      'Basic policy types',
      '2 policies max',
      'GPT-3.5, Gemini Flash',
      '7-day log retention',
      'Community support'
    ],
    cta: 'Get Started Free',
    href: '/auth?mode=signup&plan=free',
    highlighted: false
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For growing teams that need comprehensive AI governance.',
    features: [
      '5,000 API calls/month',
      'All policy types',
      'Unlimited policies',
      'GPT-4, Claude, all models',
      '90-day log retention',
      'Priority email support',
      'Team analytics',
      'Webhook integrations'
    ],
    cta: 'Start Pro Trial',
    href: '/auth?mode=signup&plan=pro',
    highlighted: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations with advanced security and compliance needs.',
    features: [
      'Unlimited API calls',
      'Custom policy engine',
      'SSO / SAML',
      'All LLM providers',
      'Unlimited log retention',
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

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div 
              key={i}
              className={cn(
                'relative rounded-2xl border p-8 flex flex-col',
                plan.highlighted 
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                  : 'border-border bg-card'
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    <Zap className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.highlighted ? 'default' : 'outline'} 
                className="w-full"
                asChild
              >
                <Link to={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include SSL encryption, 99.9% uptime SLA, and GDPR compliance.
          </p>
        </div>
      </div>
    </section>
  );
}
