import { 
  Shield, 
  Eye, 
  Lock, 
  FileCheck, 
  DollarSign, 
  Zap,
  Server,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Policy Enforcement',
    description: 'Define and enforce granular policies across all LLM requests. Block risky models, limit tokens, and control costs in real-time.'
  },
  {
    icon: Lock,
    title: 'PII Protection',
    description: 'Automatically detect and block prompts containing emails, phone numbers, SSNs, credit cards, and other sensitive data patterns.'
  },
  {
    icon: Eye,
    title: 'Full Visibility',
    description: 'See every LLM request across your organization. Real-time dashboards, request logs, and detailed analytics at your fingertips.'
  },
  {
    icon: FileCheck,
    title: 'Audit-Ready Logs',
    description: 'Immutable, append-only audit trail for SOC 2, ISO 27001, and GDPR compliance. Export logs anytime for security reviews.'
  },
  {
    icon: DollarSign,
    title: 'Cost Control',
    description: 'Set budget limits per request, user, or department. Get cost estimates before execution and prevent runaway AI spending.'
  },
  {
    icon: Zap,
    title: 'Sub-15ms Latency',
    description: 'Edge-deployed policy engine adds minimal overhead. Policy evaluation completes in under 15ms for seamless integration.'
  },
  {
    icon: Server,
    title: 'Universal Proxy',
    description: 'Single integration point for OpenAI, Anthropic, Google, and more. Switch providers without changing application code.'
  },
  {
    icon: AlertTriangle,
    title: 'Keyword Blocking',
    description: 'Block prompts containing sensitive terms like "password", "internal docs", or custom keywords specific to your organization.'
  },
  {
    icon: BarChart3,
    title: 'Usage Analytics',
    description: 'Understand AI usage patterns, identify heavy users, and optimize costs with detailed breakdowns by model, team, and time.'
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Everything You Need to Govern AI
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for security teams, platform engineers, and compliance officers who need 
            enterprise-grade control over LLM deployments.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div 
              key={i}
              className="group p-6 bg-background rounded-xl border border-border hover:border-primary/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
