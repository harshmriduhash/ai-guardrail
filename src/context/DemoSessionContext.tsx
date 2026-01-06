import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DemoAccessForm } from '@/types/governance';
import { createDemoSession, fetchDemoSession, logAuditEvent } from '@/lib/api';
import { toast } from 'sonner';

interface DemoSessionData {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  expiresAt: Date;
  createdAt: Date;
  proxyCallCount: number;
}

interface DemoSessionContextType {
  session: DemoSessionData | null;
  createSession: (form: DemoAccessForm) => Promise<void>;
  clearSession: () => void;
  refreshSession: () => Promise<void>;
  isSessionValid: boolean;
  remainingCalls: number;
  isLoading: boolean;
}

const DemoSessionContext = createContext<DemoSessionContextType | undefined>(undefined);

const SESSION_KEY = 'governance_demo_session_id';

export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DemoSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = async (sessionId: string) => {
    try {
      const data = await fetchDemoSession(sessionId);
      
      const sessionData: DemoSessionData = {
        id: data.id,
        name: data.name,
        email: data.email,
        company: data.company,
        role: data.role,
        expiresAt: new Date(data.expires_at),
        createdAt: new Date(data.created_at),
        proxyCallCount: data.proxy_call_count
      };

      if (new Date() < sessionData.expiresAt) {
        setSession(sessionData);
        return true;
      } else {
        localStorage.removeItem(SESSION_KEY);
        return false;
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      localStorage.removeItem(SESSION_KEY);
      return false;
    }
  };

  useEffect(() => {
    const initSession = async () => {
      const storedId = localStorage.getItem(SESSION_KEY);
      if (storedId) {
        await loadSession(storedId);
      }
      setIsLoading(false);
    };

    initSession();
  }, []);

  const createSession = async (form: DemoAccessForm) => {
    try {
      setIsLoading(true);
      const response = await createDemoSession(form);
      
      localStorage.setItem(SESSION_KEY, response.demo_session_id);
      await loadSession(response.demo_session_id);
      
      toast.success('Demo session created', {
        description: 'You have 48 hours and 50 proxy calls to explore.'
      });
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('Failed to create session', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = () => {
    if (session) {
      logAuditEvent(session.id, 'demo_session', session.id, 'SESSION_ENDED', {});
    }
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
    toast.info('Demo session ended');
  };

  const refreshSession = async () => {
    const storedId = localStorage.getItem(SESSION_KEY);
    if (storedId) {
      await loadSession(storedId);
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
      refreshSession,
      isSessionValid,
      remainingCalls,
      isLoading
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
