import type { StorageAdapter, TournamentState } from '../types';

const STORAGE_KEY = 'padel-tournament-state-v1';

export const localStorageAdapter: StorageAdapter = {
  async read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as TournamentState) : null;
    } catch (error) {
      return null;
    }
  },
  async write(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
  async clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

export function createSupabaseAdapter(url?: string, anonKey?: string): StorageAdapter {
  if (!url || !anonKey) {
    return localStorageAdapter;
  }

  const baseUrl = `${url.replace(/\/$/, '')}/rest/v1`;

  return {
    async read() {
      const response = await fetch(`${baseUrl}/tournaments?select=*`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const rows = (await response.json()) as Array<{ data?: string }>; 
      const row = rows[0];
      return row?.data ? (JSON.parse(row.data) as TournamentState) : null;
    },
    async write(state) {
      const payload = {
        id: 'default-tournament',
        data: JSON.stringify(state),
        updated_at: new Date().toISOString(),
      };

      await fetch(`${baseUrl}/tournaments`, {
        method: 'POST',
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(payload),
      });
    },
    async clear() {
      await fetch(`${baseUrl}/tournaments?id=eq.default-tournament`, {
        method: 'DELETE',
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          Accept: 'application/json',
        },
      });
    },
  };
}

export function resolveStorageAdapter(): StorageAdapter {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  return createSupabaseAdapter(url, anonKey);
}
