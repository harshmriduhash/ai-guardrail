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
import { motion } from 'framer-motion';

const features = [
  {
    icon: Shield,
    title: 'Policy Enforcement',
    description: 'Define and enforce granular policies across all LLM requests. Block risky models, limit tokens, and control costs in real-time.',
    color: 'from-primary/20 to-amber-500/10',
    iconColor: 'text-primary'
  },
  {
    icon: Lock,
    title: 'PII Protection',
    description: 'Automatically detect and block prompts containing emails, phone numbers, SSNs, credit cards, and other sensitive data patterns.',
    color: 'from-purple-500/20 to-pink-500/10',
    iconColor: 'text-purple-400'
  },
  {
    icon: Eye,
    title: 'Full Visibility',
    description: 'See every LLM request across your organization. Real-time dashboards, request logs, and detailed analytics.',
    color: 'from-emerald-500/20 to-teal-500/10',
    iconColor: 'text-emerald-400'
  },
  {
    icon: FileCheck,
    title: 'Audit-Ready Logs',
    description: 'Immutable, append-only audit trail for SOC 2, ISO 27001, and GDPR compliance. Export anytime for security reviews.',
    color: 'from-orange-500/20 to-amber-500/10',
    iconColor: 'text-orange-400'
  },
  {
    icon: DollarSign,
    title: 'Cost Control',
    description: 'Set budget limits per request, user, or department. Get cost estimates before execution and prevent runaway AI spending.',
    color: 'from-green-500/20 to-emerald-500/10',
    iconColor: 'text-green-400'
  },
  {
    icon: Zap,
    title: 'Sub-15ms Latency',
    description: 'Edge-deployed policy engine adds minimal overhead. Policy evaluation completes in under 15ms for seamless integration.',
    color: 'from-yellow-500/20 to-orange-500/10',
    iconColor: 'text-yellow-400'
  },
  {
    icon: Server,
    title: 'Universal Proxy',
    description: 'Single integration point for OpenAI, Anthropic, Google, and more. Switch providers without changing code.',
    color: 'from-blue-500/20 to-indigo-500/10',
    iconColor: 'text-blue-400'
  },
  {
    icon: AlertTriangle,
    title: 'Keyword Blocking',
    description: 'Block prompts containing sensitive terms like "password", "internal docs", or custom keywords.',
    color: 'from-red-500/20 to-rose-500/10',
    iconColor: 'text-red-400'
  },
  {
    icon: BarChart3,
    title: 'Usage Analytics',
    description: 'Understand AI usage patterns, identify heavy users, and optimize costs with detailed breakdowns.',
    color: 'from-cyan-500/20 to-sky-500/10',
    iconColor: 'text-cyan-400'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  },
};

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
    <section id="features" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 pill-button mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span>Powerful Features</span>
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Everything You Need to
            <br />
            <span className="gradient-text">Govern AI</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for security teams, platform engineers, and compliance officers who need 
            enterprise-grade control over LLM deployments.
          </p>
        </motion.div>

        <motion.div 
          ref={containerRef} 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              variants={itemVariants}
              className="feature-card group p-7"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
