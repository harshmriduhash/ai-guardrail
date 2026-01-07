import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDemoSession } from '@/context/DemoSessionContext';

interface Endpoint {
  method: 'POST' | 'GET';
  path: string;
  description: string;
  headers: { name: string; value: string; required: boolean }[];
  body?: Record<string, { type: string; required: boolean; description: string }>;
  response: {
    success: Record<string, unknown>;
    error?: Record<string, unknown>;
  };
}

const endpoints: Endpoint[] = [
  {
    method: 'POST',
    path: '/functions/v1/demo-access',
    description: 'Create a new demo session for accessing the governance platform',
    headers: [
      { name: 'Content-Type', value: 'application/json', required: true },
    ],
    body: {
      name: { type: 'string', required: true, description: 'Full name of the user' },
      email: { type: 'string', required: true, description: 'Work email (no free email providers)' },
      company: { type: 'string', required: true, description: 'Company name' },
      role: { type: 'enum', required: false, description: 'CTO | PLATFORM | ENGINEER | FOUNDER | OTHER' },
      use_case: { type: 'string', required: false, description: 'Brief description of use case' },
    },
    response: {
      success: {
        demo_session_id: 'uuid',
        expires_at: 'ISO 8601 timestamp',
        max_proxy_calls: 50,
        message: 'Demo session created successfully',
      },
      error: {
        error: 'Error message',
      },
    },
  },
  {
    method: 'POST',
    path: '/functions/v1/llm-proxy',
    description: 'Evaluate an LLM request against governance policies',
    headers: [
      { name: 'Content-Type', value: 'application/json', required: true },
      { name: 'X-Demo-Session', value: '<demo_session_id>', required: true },
    ],
    body: {
      model: { type: 'string', required: true, description: 'Target LLM model (e.g., gpt-4, claude-3-opus)' },
      prompt: { type: 'string', required: true, description: 'The prompt to evaluate' },
      max_tokens: { type: 'number', required: false, description: 'Maximum tokens requested (default: 512)' },
      forward_to_llm: { type: 'boolean', required: false, description: 'Actually forward to LLM if allowed' },
    },
    response: {
      success: {
        decision: 'ALLOW | BLOCK',
        reasons: ['PII_DETECTED', 'TOKEN_LIMIT_EXCEEDED'],
        cost_estimate: 0.0025,
        evaluation_time_ms: 12,
        request_id: 'uuid',
        response: 'LLM response (if forward_to_llm=true)',
      },
      error: {
        error: 'Error message',
      },
    },
  },
];

const policyTypes = [
  {
    type: 'MODEL_RESTRICTION',
    description: 'Control which LLM models can be used',
    config: {
      allowedModels: ['gpt-4', 'gpt-3.5-turbo'],
      blockedModels: ['gpt-4-32k'],
    },
  },
  {
    type: 'TOKEN_LIMIT',
    description: 'Limit token usage per request or session',
    config: {
      maxTokensPerRequest: 4096,
      maxTokensPerSession: 100000,
    },
  },
  {
    type: 'PII_BLOCK',
    description: 'Detect and block personally identifiable information',
    config: {
      patterns: ['email', 'phone', 'ssn', 'credit_card'],
    },
  },
  {
    type: 'PROMPT_KEYWORD_BLOCK',
    description: 'Block prompts containing specific keywords',
    config: {
      blockedKeywords: ['password', 'SSN', 'internal docs'],
      caseSensitive: false,
    },
  },
  {
    type: 'COST_LIMIT',
    description: 'Limit estimated cost per request',
    config: {
      maxCostPerRequest: 0.50,
    },
  },
];

const violationReasons = [
  { code: 'PII_DETECTED', description: 'Prompt contains personally identifiable information' },
  { code: 'TOKEN_LIMIT_EXCEEDED', description: 'Request exceeds token limits' },
  { code: 'MODEL_NOT_ALLOWED', description: 'Requested model is not permitted' },
  { code: 'KEYWORD_BLOCKED', description: 'Prompt contains blocked keywords' },
  { code: 'COST_LIMIT_EXCEEDED', description: 'Estimated cost exceeds limit' },
];

export default function ApiDocs() {
  const { session } = useDemoSession();
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const generateCurlExample = (endpoint: Endpoint) => {
    const headers = endpoint.headers
      .map((h) => `-H "${h.name}: ${h.value}"`)
      .join(' \\\n  ');

    const bodyExample = endpoint.body
      ? JSON.stringify(
          Object.fromEntries(
            Object.entries(endpoint.body).map(([key, val]) => [
              key,
              val.type === 'string'
                ? `<${key}>`
                : val.type === 'number'
                ? 0
                : val.type === 'boolean'
                ? false
                : `<${key}>`,
            ])
          ),
          null,
          2
        )
      : '';

    return `curl -X ${endpoint.method} "${baseUrl}${endpoint.path}" \\
  ${headers}${bodyExample ? ` \\
  -d '${bodyExample}'` : ''}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-mono font-bold text-foreground">API Documentation</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Integration guide for the AI Governance Control Plane
        </p>
      </div>

      {/* Quick Start */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-lg">Quick Start</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="font-mono text-sm space-y-2">
            <p className="text-muted-foreground">1. Obtain a demo session ID via the demo gate</p>
            <p className="text-muted-foreground">2. Include the session ID in all proxy requests:</p>
            <div className="bg-muted p-3 rounded border border-border overflow-x-auto">
              <code className="text-primary">X-Demo-Session: {session?.id || '<demo_session_id>'}</code>
            </div>
            <p className="text-muted-foreground">3. Send LLM requests through the proxy endpoint</p>
            <p className="text-muted-foreground">4. Handle ALLOW/BLOCK decisions in your application</p>
          </div>
        </CardContent>
      </Card>

      {/* Base URL */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-lg">Base URL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-3 rounded border border-border font-mono text-sm overflow-x-auto">
            <code className="text-primary">{baseUrl}</code>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="endpoints" className="font-mono text-xs">Endpoints</TabsTrigger>
          <TabsTrigger value="policies" className="font-mono text-xs">Policy Types</TabsTrigger>
          <TabsTrigger value="violations" className="font-mono text-xs">Violation Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4 mt-4">
          {endpoints.map((endpoint, idx) => (
            <Card key={idx} className="border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={endpoint.method === 'POST' ? 'default' : 'secondary'}
                    className="font-mono"
                  >
                    {endpoint.method}
                  </Badge>
                  <code className="font-mono text-sm text-foreground">{endpoint.path}</code>
                </div>
                <p className="text-muted-foreground text-sm mt-2">{endpoint.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Headers */}
                <div>
                  <h4 className="font-mono text-sm font-semibold mb-2">Headers</h4>
                  <div className="bg-muted rounded border border-border overflow-hidden">
                    <table className="w-full text-sm font-mono">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-2 text-muted-foreground">Name</th>
                          <th className="text-left p-2 text-muted-foreground">Value</th>
                          <th className="text-left p-2 text-muted-foreground">Required</th>
                        </tr>
                      </thead>
                      <tbody>
                        {endpoint.headers.map((header, hIdx) => (
                          <tr key={hIdx} className="border-b border-border last:border-0">
                            <td className="p-2 text-primary">{header.name}</td>
                            <td className="p-2 text-foreground">{header.value}</td>
                            <td className="p-2">
                              <Badge variant={header.required ? 'destructive' : 'secondary'} className="text-xs">
                                {header.required ? 'required' : 'optional'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Request Body */}
                {endpoint.body && (
                  <div>
                    <h4 className="font-mono text-sm font-semibold mb-2">Request Body</h4>
                    <div className="bg-muted rounded border border-border overflow-hidden">
                      <table className="w-full text-sm font-mono">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-2 text-muted-foreground">Field</th>
                            <th className="text-left p-2 text-muted-foreground">Type</th>
                            <th className="text-left p-2 text-muted-foreground">Required</th>
                            <th className="text-left p-2 text-muted-foreground">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(endpoint.body).map(([key, val], bIdx) => (
                            <tr key={bIdx} className="border-b border-border last:border-0">
                              <td className="p-2 text-primary">{key}</td>
                              <td className="p-2 text-yellow-500">{val.type}</td>
                              <td className="p-2">
                                <Badge variant={val.required ? 'destructive' : 'secondary'} className="text-xs">
                                  {val.required ? 'required' : 'optional'}
                                </Badge>
                              </td>
                              <td className="p-2 text-muted-foreground">{val.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Response */}
                <div>
                  <h4 className="font-mono text-sm font-semibold mb-2">Response</h4>
                  <div className="bg-muted p-3 rounded border border-border overflow-x-auto">
                    <pre className="text-xs text-foreground">
                      {JSON.stringify(endpoint.response.success, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* cURL Example */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-mono text-sm font-semibold">cURL Example</h4>
                    <button
                      onClick={() => copyToClipboard(generateCurlExample(endpoint), endpoint.path)}
                      className="text-xs text-primary hover:text-primary/80 font-mono"
                    >
                      {copiedEndpoint === endpoint.path ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-muted p-3 rounded border border-border overflow-x-auto">
                    <pre className="text-xs text-foreground whitespace-pre-wrap">
                      {generateCurlExample(endpoint)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="policies" className="space-y-4 mt-4">
          {policyTypes.map((policy, idx) => (
            <Card key={idx} className="border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    {policy.type}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm mt-2">{policy.description}</p>
              </CardHeader>
              <CardContent>
                <h4 className="font-mono text-sm font-semibold mb-2">Config Schema</h4>
                <div className="bg-muted p-3 rounded border border-border overflow-x-auto">
                  <pre className="text-xs text-foreground">
                    {JSON.stringify(policy.config, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="violations" className="mt-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-mono text-lg">Violation Reason Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded border border-border overflow-hidden">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-muted-foreground">Code</th>
                      <th className="text-left p-3 text-muted-foreground">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {violationReasons.map((reason, idx) => (
                      <tr key={idx} className="border-b border-border last:border-0">
                        <td className="p-3">
                          <Badge variant="destructive" className="font-mono text-xs">
                            {reason.code}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{reason.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rate Limits */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-lg">Rate Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded border border-border overflow-hidden">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground">Limit</th>
                  <th className="text-left p-3 text-muted-foreground">Value</th>
                  <th className="text-left p-3 text-muted-foreground">Scope</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-3 text-foreground">Max Proxy Calls</td>
                  <td className="p-3 text-primary">50</td>
                  <td className="p-3 text-muted-foreground">Per demo session</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 text-foreground">Session Duration</td>
                  <td className="p-3 text-primary">48 hours</td>
                  <td className="p-3 text-muted-foreground">From creation</td>
                </tr>
                <tr>
                  <td className="p-3 text-foreground">HTTP 429 Response</td>
                  <td className="p-3 text-primary">Rate limit exceeded</td>
                  <td className="p-3 text-muted-foreground">When limits hit</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Error Codes */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-lg">HTTP Status Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded border border-border overflow-hidden">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground">Code</th>
                  <th className="text-left p-3 text-muted-foreground">Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-3"><Badge className="bg-green-600">200</Badge></td>
                  <td className="p-3 text-muted-foreground">Request allowed, policies passed</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3"><Badge variant="secondary">400</Badge></td>
                  <td className="p-3 text-muted-foreground">Bad request (missing fields, invalid data)</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3"><Badge variant="secondary">401</Badge></td>
                  <td className="p-3 text-muted-foreground">Unauthorized (missing/invalid session)</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3"><Badge variant="destructive">403</Badge></td>
                  <td className="p-3 text-muted-foreground">Request blocked by policy</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3"><Badge variant="destructive">429</Badge></td>
                  <td className="p-3 text-muted-foreground">Rate limit exceeded</td>
                </tr>
                <tr>
                  <td className="p-3"><Badge variant="destructive">500</Badge></td>
                  <td className="p-3 text-muted-foreground">Internal server error</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
