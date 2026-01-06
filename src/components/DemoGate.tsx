import { useState } from 'react';
import { useDemoSession } from '@/context/DemoSessionContext';
import { DemoAccessForm } from '@/types/governance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Lock, Activity, FileText } from 'lucide-react';

export function DemoGate() {
  const { createSession } = useDemoSession();
  const [form, setForm] = useState<DemoAccessForm>({
    name: '',
    email: '',
    company: '',
    role: 'ENGINEER',
    useCase: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const workEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (!workEmailPattern.test(email)) return 'Invalid email format';
    if (freeEmailDomains.includes(domain)) return 'Please use your work email';
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!form.name.trim()) newErrors.name = 'Name is required';
    const emailError = validateEmail(form.email);
    if (emailError) newErrors.email = emailError;
    if (!form.company.trim()) newErrors.company = 'Company is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    createSession(form);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-card border-r border-border p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="font-mono text-lg font-semibold">AI GOVERNANCE</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Control Plane for<br />Enterprise LLM Usage
          </h1>
          
          <p className="text-muted-foreground text-lg mb-12 max-w-md">
            Intercept, evaluate, and enforce governance policies on every LLM request 
            before it reaches the provider.
          </p>
          
          <div className="space-y-6">
            <Feature 
              icon={Lock} 
              title="Policy Enforcement" 
              desc="Block PII, restrict models, limit tokens" 
            />
            <Feature 
              icon={Activity} 
              title="Request Visibility" 
              desc="Every prompt logged and evaluated" 
            />
            <Feature 
              icon={FileText} 
              title="Audit Trail" 
              desc="SOC2-ready immutable logging" 
            />
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground font-mono">
          DEMO SESSION • 48HR ACCESS • 50 PROXY CALLS
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="font-mono text-lg font-semibold">AI GOVERNANCE</span>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Request Demo Access</h2>
          <p className="text-muted-foreground mb-8">
            Get instant access to explore the control plane.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Smith"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@company.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Acme Corp"
                className={errors.company ? 'border-destructive' : ''}
              />
              {errors.company && <p className="text-xs text-destructive">{errors.company}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={form.role} 
                onValueChange={(val) => setForm({ ...form, role: val as DemoAccessForm['role'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CTO">CTO / VP Engineering</SelectItem>
                  <SelectItem value="PLATFORM">Platform Engineer</SelectItem>
                  <SelectItem value="ENGINEER">Software Engineer</SelectItem>
                  <SelectItem value="FOUNDER">Founder</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="useCase">What are you governing? (Optional)</Label>
              <Textarea
                id="useCase"
                value={form.useCase}
                onChange={(e) => setForm({ ...form, useCase: e.target.value })}
                placeholder="Internal chatbots, customer support AI, code assistants..."
                rows={3}
              />
            </div>
            
            <Button type="submit" className="w-full" size="lg">
              Access Demo Dashboard
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Demo sessions expire after 48 hours. No credit card required.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
