import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/useAuth';

/**
 * Generic hook for authenticated API fetches.
 * `loader` and `initial` are captured via refs so the effect
 * depends only on `user`, avoiding stale-closure issues while
 * keeping callers free from useMemo/useCallback boilerplate.
 */
export function useApiData<T>(loader: (token: string) => Promise<T>, initial: T) {
  const { user } = useAuth();
  const loaderRef = useRef(loader);
  const initialRef = useRef(initial);
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setData(initialRef.current);
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
        const result = await loaderRef.current(token);
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
  }, [user]);

  return { data, loading, error };
}
