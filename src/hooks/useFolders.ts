import { useEffect, useState } from 'react';
import type { components } from '@libre-net-pe/qrapid-sdk';
import type { Folder } from '@/types';
import { useAuth } from '@/contexts/useAuth';
import { createQRapidClient } from '@/lib/qrapidClient';

type ApiFolder = components['schemas']['Folder'];

function mapFolder(f: ApiFolder): Folder {
  return {
    id: f.id,
    name: f.name,
    description: f.description,
    codeCount: f.codeCount,
  };
}

async function loadFolders(token: string): Promise<Folder[]> {
  const api = createQRapidClient(token);
  // TODO: implement pagination — limit:100 will silently truncate users with >100 folders
  const res = await api.GET('/folders', { params: { query: { limit: 100 } } });
  if (res.error) {
    throw new Error('Failed to load folders');
  }
  return (res.data?.data ?? []).map(mapFolder);
}

export function useFolders() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setFolders([]);
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
        const mapped = await loadFolders(token);
        if (!cancelled) setFolders(mapped);
      } catch (err) {
        console.error('Failed to fetch folders:', err);
        if (!cancelled) setError('Failed to load folders');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [user]);

  return { folders, loading, error };
}
