import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useDemoSession } from '@/context/DemoSessionContext';
import { User, Key, Bell, Shield, Copy, Eye, EyeOff, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { session } = useDemoSession();
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const demoApiKey = 'ps_live_demo_xxxxxxxxxxxxxxxxxx';

  const copyApiKey = () => {
    navigator.clipboard.writeText(demoApiKey);
    setCopied(true);
    toast({ title: 'API key copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <div className="governance-card">
          <div className="governance-card-header">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Profile</h2>
                <p className="text-sm text-muted-foreground">Your account information</p>
              </div>
            </div>
          </div>
          <div className="governance-card-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input defaultValue={session?.name} className="bg-muted/30" />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input defaultValue={session?.company} className="bg-muted/30" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={session?.email} className="bg-muted/30" disabled />
            </div>
            <Button className="bg-gradient-primary hover:opacity-90 border-0">Save Changes</Button>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="governance-card">
          <div className="governance-card-header">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h2 className="font-semibold">API Keys</h2>
                <p className="text-sm text-muted-foreground">Manage your API access</p>
              </div>
            </div>
          </div>
          <div className="governance-card-body">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Production API Key</p>
                  <code className="text-sm font-mono text-muted-foreground">
                    {showApiKey ? demoApiKey : '•'.repeat(32)}
                  </code>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={copyApiKey}>
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Button variant="outline">Generate New Key</Button>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="governance-card">
          <div className="governance-card-header">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-success" />
              </div>
              <div>
                <h2 className="font-semibold">Notifications</h2>
                <p className="text-sm text-muted-foreground">Configure alerts</p>
              </div>
            </div>
          </div>
          <div className="governance-card-body space-y-4">
            {[
              { label: 'Policy violations', description: 'Get notified when requests are blocked' },
              { label: 'Usage alerts', description: 'Alert when approaching API limits' },
              { label: 'Weekly reports', description: 'Receive weekly usage summaries' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch defaultChecked={i < 2} />
              </div>
            ))}
          </div>
        </div>

        {/* Security Section */}
        <div className="governance-card">
          <div className="governance-card-header">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h2 className="font-semibold">Security</h2>
                <p className="text-sm text-muted-foreground">Protect your account</p>
              </div>
            </div>
          </div>
          <div className="governance-card-body space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Two-factor authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Button variant="outline">Enable</Button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Active sessions</p>
                <p className="text-sm text-muted-foreground">Manage your active sessions</p>
              </div>
              <Button variant="outline">View Sessions</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}