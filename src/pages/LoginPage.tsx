import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleIcon } from '@/components/icons/GoogleIcon';

export function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-brand-q">Q</span>
          <span className="login-brand-text">Rapid</span>
        </div>
        <p className="login-tagline">QR code management, beautifully simple.</p>

        <button className="login-google-btn" onClick={signInWithGoogle}>
          <GoogleIcon />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
