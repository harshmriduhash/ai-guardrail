import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { ArrowUp, ArrowDown, Activity, Shield, DollarSign, Clock } from 'lucide-react';

const requestsData = [
  { date: 'Mon', requests: 1200, blocked: 45 },
  { date: 'Tue', requests: 1800, blocked: 78 },
  { date: 'Wed', requests: 2100, blocked: 92 },
  { date: 'Thu', requests: 1900, blocked: 65 },
  { date: 'Fri', requests: 2400, blocked: 110 },
  { date: 'Sat', requests: 1100, blocked: 32 },
  { date: 'Sun', requests: 900, blocked: 28 },
];

const modelUsage = [
  { name: 'GPT-4', value: 45, color: 'hsl(210, 100%, 60%)' },
  { name: 'Claude-3', value: 30, color: 'hsl(280, 100%, 65%)' },
  { name: 'GPT-3.5', value: 15, color: 'hsl(142, 71%, 45%)' },
  { name: 'Gemini', value: 10, color: 'hsl(38, 92%, 50%)' },
];

const violationTypes = [
  { type: 'PII Detection', count: 156 },
  { type: 'Keyword Block', count: 89 },
  { type: 'Token Limit', count: 45 },
  { type: 'Cost Limit', count: 23 },
  { type: 'Model Restriction', count: 12 },
];

export default function Analytics() {
  const metrics = useMemo(() => [
    { label: 'Total Requests', value: '11,400', change: '+23%', positive: true, icon: Activity },
    { label: 'Blocked Requests', value: '450', change: '+8%', positive: false, icon: Shield },
    { label: 'Cost Saved', value: '$2,340', change: '+$520', positive: true, icon: DollarSign },
    { label: 'Avg Latency', value: '12ms', change: '-2ms', positive: true, icon: Clock },
  ], []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Monitor your AI usage and governance metrics.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric, i) => (
          <div key={i} className="governance-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <metric.icon className="w-5 h-5 text-primary" />
              </div>
              <span className={`flex items-center gap-1 text-sm font-medium ${metric.positive ? 'text-success' : 'text-destructive'}`}>
                {metric.positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {metric.change}
              </span>
            </div>
            <p className="metric-value">{metric.value}</p>
            <p className="metric-label">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Requests Over Time */}
        <div className="lg:col-span-2 governance-card">
          <div className="governance-card-header">
            <h2 className="font-semibold">Requests Over Time</h2>
            <span className="text-sm text-muted-foreground">Last 7 days</span>
          </div>
          <div className="governance-card-body">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={requestsData}>
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(220, 100%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(220, 100%, 60%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 12%)" />
                  <XAxis dataKey="date" stroke="hsl(0, 0%, 40%)" fontSize={12} />
                  <YAxis stroke="hsl(0, 0%, 40%)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(0, 0%, 6%)', 
                      border: '1px solid hsl(0, 0%, 12%)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="requests" stroke="hsl(220, 100%, 60%)" fill="url(#colorRequests)" strokeWidth={2} />
                  <Area type="monotone" dataKey="blocked" stroke="hsl(0, 72%, 51%)" fill="url(#colorBlocked)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Model Usage */}
        <div className="governance-card">
          <div className="governance-card-header">
            <h2 className="font-semibold">Model Usage</h2>
          </div>
          <div className="governance-card-body">
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {modelUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {modelUsage.map((model, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: model.color }} />
                    <span className="text-muted-foreground">{model.name}</span>
                  </div>
                  <span className="font-mono font-medium">{model.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Violations by Type */}
      <div className="governance-card">
        <div className="governance-card-header">
          <h2 className="font-semibold">Violations by Type</h2>
          <span className="text-sm text-muted-foreground">This week</span>
        </div>
        <div className="governance-card-body">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={violationTypes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 12%)" />
                <XAxis type="number" stroke="hsl(0, 0%, 40%)" fontSize={12} />
                <YAxis dataKey="type" type="category" stroke="hsl(0, 0%, 40%)" fontSize={12} width={120} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 6%)', 
                    border: '1px solid hsl(0, 0%, 12%)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="hsl(0, 72%, 51%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}