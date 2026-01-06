import { useDemoSession } from '@/context/DemoSessionContext';
import { DemoGate } from '@/components/DemoGate';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const { isSessionValid } = useDemoSession();
  
  if (isSessionValid) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <DemoGate />;
};

export default Index;
