import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Zap, 
  Lock, 
  BarChart3,
  Sparkles,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to PolicyShield',
    description: 'Let\'s get you set up in just a few steps.',
    icon: Sparkles,
  },
  {
    id: 'policies',
    title: 'Set Up Your First Policy',
    description: 'Choose a policy type to protect your AI workloads.',
    icon: Shield,
  },
  {
    id: 'integration',
    title: 'Connect Your Application',
    description: 'Get your API key and integrate in minutes.',
    icon: Zap,
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Start monitoring your AI requests in real-time.',
    icon: Check,
  },
];

const policyTypes = [
  { id: 'pii', name: 'PII Protection', description: 'Block sensitive personal data', icon: Lock },
  { id: 'cost', name: 'Cost Limits', description: 'Set budget caps per request', icon: BarChart3 },
  { id: 'model', name: 'Model Restriction', description: 'Allow only approved models', icon: Shield },
];

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [apiKeyName, setApiKeyName] = useState('');

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-background/95 backdrop-blur-xl"
      />

      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl mx-4 bg-card rounded-3xl border border-border shadow-2xl overflow-hidden"
      >
        {/* Skip button */}
        <button 
          onClick={onSkip}
          className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-border">
          <motion.div 
            className="h-full bg-gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="p-8 pt-12">
          {/* Step indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, i) => (
              <div 
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  i === currentStep 
                    ? 'w-8 bg-primary' 
                    : i < currentStep 
                      ? 'bg-primary/50' 
                      : 'bg-border'
                )}
              />
            ))}
          </div>

          <AnimatePresence mode="wait" custom={currentStep}>
            <motion.div
              key={currentStep}
              custom={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="min-h-[320px]"
            >
              {/* Step 0: Welcome */}
              {currentStep === 0 && (
                <div className="text-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
                    <Sparkles className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground mb-3">
                    {steps[0].title}
                  </h2>
                  <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                    {steps[0].description}
                  </p>
                  <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                    {[
                      { icon: Shield, label: 'Secure' },
                      { icon: Zap, label: 'Fast' },
                      { icon: BarChart3, label: 'Insightful' },
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-accent/50 border border-border">
                        <item.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Policies */}
              {currentStep === 1 && (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
                    <Shield className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-3">
                    {steps[1].title}
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    {steps[1].description}
                  </p>
                  <div className="grid gap-3 max-w-md mx-auto">
                    {policyTypes.map((policy) => (
                      <button
                        key={policy.id}
                        onClick={() => setSelectedPolicy(policy.id)}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-2xl border text-left transition-all',
                          selectedPolicy === policy.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30 bg-accent/30'
                        )}
                      >
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          selectedPolicy === policy.id 
                            ? 'bg-primary/10' 
                            : 'bg-accent'
                        )}>
                          <policy.icon className={cn(
                            'w-6 h-6',
                            selectedPolicy === policy.id ? 'text-primary' : 'text-muted-foreground'
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{policy.name}</p>
                          <p className="text-sm text-muted-foreground">{policy.description}</p>
                        </div>
                        {selectedPolicy === policy.id && (
                          <Check className="w-5 h-5 text-primary ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Integration */}
              {currentStep === 2 && (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
                    <Zap className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-3">
                    {steps[2].title}
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    {steps[2].description}
                  </p>
                  <div className="max-w-sm mx-auto space-y-4">
                    <div className="space-y-2 text-left">
                      <Label>API Key Name</Label>
                      <Input 
                        placeholder="e.g., Production Key"
                        value={apiKeyName}
                        onChange={(e) => setApiKeyName(e.target.value)}
                        className="h-12 bg-accent/30 border-border/50 rounded-xl"
                      />
                    </div>
                    <div className="p-4 rounded-xl bg-accent/30 border border-border">
                      <p className="text-xs text-muted-foreground mb-2">Your API Key</p>
                      <code className="text-sm font-mono text-foreground">
                        ps_live_xxxxxxxxxxxxxxxxxxxx
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Complete */}
              {currentStep === 3 && (
                <div className="text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-20 h-20 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-10 h-10 text-success" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-foreground mb-3">
                    {steps[3].title}
                  </h2>
                  <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                    {steps[3].description}
                  </p>
                  <div className="flex flex-col gap-3 max-w-xs mx-auto">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-success/5 border border-success/20">
                      <Check className="w-5 h-5 text-success" />
                      <span className="text-sm text-foreground">Policy created</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-success/5 border border-success/20">
                      <Check className="w-5 h-5 text-success" />
                      <span className="text-sm text-foreground">API key generated</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-success/5 border border-success/20">
                      <Check className="w-5 h-5 text-success" />
                      <span className="text-sm text-foreground">Ready to monitor</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            disabled={currentStep === 0}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={handleNext}
            className="bg-gradient-primary hover:opacity-90 border-0 rounded-xl shadow-lg shadow-primary/20"
          >
            {currentStep === steps.length - 1 ? 'Go to Dashboard' : 'Continue'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
