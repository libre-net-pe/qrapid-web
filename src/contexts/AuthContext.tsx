import { useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { createQRapidClient } from '@/lib/qrapidClient';
import { AuthContext } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [provisioning, setProvisioning] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        setProvisioning(true);
        try {
          const token = await firebaseUser.getIdToken();
          const api = createQRapidClient(token);
          await api.GET('/me');
        } catch (error) {
          // interceptor handles user_not_provisioned; other errors are non-fatal here
          console.error('Initial user provisioning failed:', error);
        } finally {
          setProvisioning(false);
        }
      }
    });
    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, provisioning, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
