import { useState, useMemo, type ChangeEvent } from 'react';
import type { Folder } from '@/types';

export const ALL_FOLDERS = 'All folders';

export function useRecordFilter<T extends { folder: string }>(
  records: T[],
  matchesSearch: (r: T, query: string) => boolean,
  folders: Folder[],
) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [folderFilter, setFolderFilter] = useState(ALL_FOLDERS);

  const allFolders = useMemo(
    () => [ALL_FOLDERS, ...folders.map(f => f.name)],
    [folders],
  );

  const filtered = records.filter(r => {
    const matchFolder = folderFilter === ALL_FOLDERS || r.folder === folderFilter;
    return matchFolder && (!searchQuery || matchesSearch(r, searchQuery));
  });

  const safeIndex = Math.min(selectedIndex, Math.max(0, filtered.length - 1));
  const selectedRecord = filtered[safeIndex] ?? null;

  function handleSearch(e: ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value);
    setSelectedIndex(0);
  }

  function handleFolderChange(e: ChangeEvent<HTMLSelectElement>) {
    setFolderFilter(e.target.value);
    setSelectedIndex(0);
  }

  function reset() {
    setSearchQuery('');
    setFolderFilter(ALL_FOLDERS);
    setSelectedIndex(0);
  }

  return {
    searchQuery,
    folderFilter,
    allFolders,
    filtered,
    safeIndex,
    selectedRecord,
    setSelectedIndex,
    handleSearch,
    handleFolderChange,
    reset,
  };
}
