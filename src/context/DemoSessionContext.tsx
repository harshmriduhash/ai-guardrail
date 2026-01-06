import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DemoSession, DemoAccessForm } from '@/types/governance';

interface DemoSessionContextType {
  session: DemoSession | null;
  createSession: (form: DemoAccessForm) => void;
  clearSession: () => void;
  incrementProxyCount: () => void;
  isSessionValid: boolean;
  remainingCalls: number;
}

const DemoSessionContext = createContext<DemoSessionContextType | undefined>(undefined);

const SESSION_KEY = 'governance_demo_session';

export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DemoSession | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const sessionData: DemoSession = {
          ...parsed,
          expiresAt: new Date(parsed.expiresAt),
          createdAt: new Date(parsed.createdAt)
        };
        
        if (new Date() < sessionData.expiresAt) {
          setSession(sessionData);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  const createSession = (form: DemoAccessForm) => {
    const newSession: DemoSession = {
      id: crypto.randomUUID(),
      name: form.name,
      email: form.email,
      company: form.company,
      role: form.role,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
      createdAt: new Date(),
      proxyCallCount: 0
    };
    
    setSession(newSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
  };

  const clearSession = () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const incrementProxyCount = () => {
    if (session) {
      const updated = {
        ...session,
        proxyCallCount: session.proxyCallCount + 1
      };
      setSession(updated);
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    }
  };

  const isSessionValid = session !== null && 
    new Date() < session.expiresAt && 
    session.proxyCallCount < 50;

  const remainingCalls = session ? 50 - session.proxyCallCount : 0;

  return (
    <DemoSessionContext.Provider value={{
      session,
      createSession,
      clearSession,
      incrementProxyCount,
      isSessionValid,
      remainingCalls
    }}>
      {children}
    </DemoSessionContext.Provider>
  );
}

export function useDemoSession() {
  const context = useContext(DemoSessionContext);
  if (context === undefined) {
    throw new Error('useDemoSession must be used within a DemoSessionProvider');
  }
  return context;
}
