import type { components } from '@libre-net-pe/qrapid-sdk';
import type { Folder } from '@/types';
import { createQRapidClient } from '@/lib/qrapidClient';
import { useApiData } from './useApiData';

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
  if (res.error) throw new Error('Failed to load folders');
  return (res.data?.data ?? []).map(mapFolder);
}

export function useFolders() {
  const { data: folders, loading, error } = useApiData(loadFolders, [] as Folder[]);
  return { folders, loading, error };
}
