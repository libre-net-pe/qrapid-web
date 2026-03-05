import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/useAuth';

/**
 * Generic hook for authenticated API fetches.
 * `loader` must be a stable (module-level) function — it is not included in
 * the effect deps to avoid re-fetching on every render.
 */
export function useApiData<T>(loader: (token: string) => Promise<T>, initial: T) {
  const { user } = useAuth();
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setData(initial);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const currentUser = user;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const token = await currentUser.getIdToken();
        const result = await loader(token);
        if (!cancelled) setData(result);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  // loader is a module-level stable function — intentionally omitted from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { data, loading, error };
}
