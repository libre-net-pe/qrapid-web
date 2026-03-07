import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, provisioning } = useAuth();

  if (loading) return <div className="auth-loading" />;
  if (!user) return <Navigate to="/login" replace />;
  if (provisioning) return (
    <div className="account-setup">
      <div className="account-setup-spinner" />
      <p className="account-setup-label">Setting up your account…</p>
    </div>
  );

  return <>{children}</>;
}
