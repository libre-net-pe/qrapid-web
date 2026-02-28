import { useEffect, useState } from 'react';
import type { components } from '@libre-net-pe/qrapid-sdk';
import { useAuth } from '@/contexts/useAuth';
import { createQRapidClient } from '@/lib/qrapidClient';

type UserProfile = components['schemas']['User'];

export function useCurrentUser() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const currentUser = user;

    async function fetchProfile() {
      setLoading(true);
      try {
        const token = await currentUser.getIdToken();
        const api = createQRapidClient(token);
        const res = await api.GET('/me');
        if (!cancelled && res.data) {
          setProfile(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProfile();
    return () => { cancelled = true; };
  }, [user]);

  return { profile, loading };
}
