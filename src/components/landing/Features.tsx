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
import { useEffect, useRef } from 'react';

const features = [
  {
    icon: Shield,
    title: 'Policy Enforcement',
    description: 'Define and enforce granular policies across all LLM requests. Block risky models, limit tokens, and control costs in real-time.',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    icon: Lock,
    title: 'PII Protection',
    description: 'Automatically detect and block prompts containing emails, phone numbers, SSNs, credit cards, and other sensitive data patterns.',
    gradient: 'from-purple-500/20 to-pink-500/20'
  },
  {
    icon: Eye,
    title: 'Full Visibility',
    description: 'See every LLM request across your organization. Real-time dashboards, request logs, and detailed analytics.',
    gradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    icon: FileCheck,
    title: 'Audit-Ready Logs',
    description: 'Immutable, append-only audit trail for SOC 2, ISO 27001, and GDPR compliance. Export anytime for security reviews.',
    gradient: 'from-orange-500/20 to-amber-500/20'
  },
  {
    icon: DollarSign,
    title: 'Cost Control',
    description: 'Set budget limits per request, user, or department. Get cost estimates before execution and prevent runaway AI spending.',
    gradient: 'from-teal-500/20 to-green-500/20'
  },
  {
    icon: Zap,
    title: 'Sub-15ms Latency',
    description: 'Edge-deployed policy engine adds minimal overhead. Policy evaluation completes in under 15ms for seamless integration.',
    gradient: 'from-yellow-500/20 to-orange-500/20'
  },
  {
    icon: Server,
    title: 'Universal Proxy',
    description: 'Single integration point for OpenAI, Anthropic, Google, and more. Switch providers without changing code.',
    gradient: 'from-indigo-500/20 to-purple-500/20'
  },
  {
    icon: AlertTriangle,
    title: 'Keyword Blocking',
    description: 'Block prompts containing sensitive terms like "password", "internal docs", or custom keywords.',
    gradient: 'from-red-500/20 to-pink-500/20'
  },
  {
    icon: BarChart3,
    title: 'Usage Analytics',
    description: 'Understand AI usage patterns, identify heavy users, and optimize costs with detailed breakdowns.',
    gradient: 'from-cyan-500/20 to-blue-500/20'
  }
];

export function Features() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const cards = container.querySelectorAll('.feature-card');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
        (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section id="features" className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">Features</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Everything You Need to
            <br />
            <span className="gradient-text">Govern AI</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for security teams, platform engineers, and compliance officers who need 
            enterprise-grade control over LLM deployments.
          </p>
        </div>

        <div ref={containerRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <div 
              key={i}
              className="feature-card group p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-foreground" />
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