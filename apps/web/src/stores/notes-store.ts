import { create } from 'zustand';
import { apiUrl } from '@/lib/api';
import { Note, NotesFilters, NotesState } from '@/types/note';
import { useAuthStore } from '@/stores/auth-store';

const defaultFilters: NotesFilters = {
  search: '',
  selectedTag: null,
  sortBy: 'modified-desc',
  showTrash: false,
};

const getAuthHeaders = (): HeadersInit => {
  const token = useAuthStore.getState().token;
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const useNotesStore = create<NotesState>()((set, get) => ({
  notes: [],
  filters: defaultFilters,
  selectedNoteId: null,
  retentionDays: 14,
  isHydrated: true,
  isLoading: false,
  loaded: false,
  error: null,
  fetchAll: async () => {
    if (get().isLoading || get().loaded) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const [notesRes, settingsRes] = await Promise.all([
        fetch(apiUrl('/api/notes'), { headers: { ...getAuthHeaders() } }),
        fetch(apiUrl('/api/notes/settings'), { headers: { ...getAuthHeaders() } }),
      ]);

      const notesData = (await notesRes.json()) as Note[] | { error?: string };
      const settingsData = (await settingsRes.json()) as { retentionDays?: number; error?: string };

      if (!notesRes.ok) {
        throw new Error('error' in notesData ? (notesData.error ?? `HTTP ${notesRes.status}`) : `HTTP ${notesRes.status}`);
      }
      if (!settingsRes.ok) {
        throw new Error(settingsData.error ?? `HTTP ${settingsRes.status}`);
      }

      set({
        notes: Array.isArray(notesData) ? notesData : [],
        retentionDays: Number(settingsData.retentionDays ?? 14),
        isLoading: false,
        loaded: true,
        isHydrated: true,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        isHydrated: true,
        error: error instanceof Error ? error.message : 'Failed to load notes.',
      });
    }
  },
  createNote: async (_userId: string) => {
    set({ error: null });
    try {
      const res = await fetch(apiUrl('/api/notes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ title: '', content: '', tags: [] }),
      });

      const data = (await res.json()) as Note | { error?: string };
      if (!res.ok || !('id' in data)) {
        throw new Error('error' in data ? (data.error ?? `HTTP ${res.status}`) : `HTTP ${res.status}`);
      }

      const note = data as Note;
      set((state) => ({
        notes: [note, ...state.notes],
        selectedNoteId: note.id,
        filters: state.filters.showTrash ? { ...state.filters, showTrash: false } : state.filters,
      }));
      return note;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create note.' });
      return null;
    }
  },
  updateNote: async (noteId, updates) => {
    set({ error: null });
    try {
      const res = await fetch(apiUrl(`/api/notes/${noteId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(updates),
      });

      const data = (await res.json()) as Note | { error?: string };
      if (!res.ok || !('id' in data)) {
        throw new Error('error' in data ? (data.error ?? `HTTP ${res.status}`) : `HTTP ${res.status}`);
      }

      const updated = data as Note;
      set((state) => ({
        notes: state.notes.map((note) => (note.id === updated.id ? updated : note)),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update note.' });
    }
  },
  softDeleteNote: async (noteId) => {
    set({ error: null });
    try {
      const res = await fetch(apiUrl(`/api/notes/${noteId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ deletedAt: new Date().toISOString() }),
      });

      const data = (await res.json()) as Note | { error?: string };
      if (!res.ok || !('id' in data)) {
        throw new Error('error' in data ? (data.error ?? `HTTP ${res.status}`) : `HTTP ${res.status}`);
      }

      const updated = data as Note;
      set((state) => ({
        notes: state.notes.map((note) => (note.id === updated.id ? updated : note)),
        selectedNoteId: state.selectedNoteId === noteId ? null : state.selectedNoteId,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to move note to trash.' });
    }
  },
  restoreNote: async (noteId) => {
    set({ error: null });
    try {
      const res = await fetch(apiUrl(`/api/notes/${noteId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ deletedAt: null }),
      });

      const data = (await res.json()) as Note | { error?: string };
      if (!res.ok || !('id' in data)) {
        throw new Error('error' in data ? (data.error ?? `HTTP ${res.status}`) : `HTTP ${res.status}`);
      }

      const updated = data as Note;
      set((state) => ({
        notes: state.notes.map((note) => (note.id === updated.id ? updated : note)),
        selectedNoteId: noteId,
        filters: state.filters.showTrash ? { ...state.filters, showTrash: false } : state.filters,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to restore note.' });
    }
  },
  permanentlyDeleteNote: async (noteId) => {
    set({ error: null });
    try {
      const res = await fetch(apiUrl(`/api/notes/${noteId}`), {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      set((state) => ({
        notes: state.notes.filter((note) => note.id !== noteId),
        selectedNoteId: state.selectedNoteId === noteId ? null : state.selectedNoteId,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to permanently delete note.' });
    }
  },
  emptyTrash: async () => {
    set({ error: null });
    try {
      const res = await fetch(apiUrl('/api/notes/trash/all'), {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      set((state) => ({
        notes: state.notes.filter((note) => note.deletedAt === null),
        selectedNoteId: state.filters.showTrash ? null : state.selectedNoteId,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to empty trash.' });
    }
  },
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  selectNote: (noteId) => set({ selectedNoteId: noteId }),
  setRetentionDays: async (days) => {
    set({ error: null });
    try {
      const res = await fetch(apiUrl('/api/notes/settings'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ retentionDays: days }),
      });

      const data = (await res.json()) as { retentionDays?: number; error?: string };
      if (!res.ok || typeof data.retentionDays !== 'number') {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      set({ retentionDays: data.retentionDays });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update retention window.' });
    }
  },
  cleanupExpiredTrash: async () => {
    try {
      const res = await fetch(apiUrl('/api/notes/cleanup-expired-trash'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = (await res.json()) as { notes?: Note[]; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      set((state) => ({
        notes: Array.isArray(data.notes) ? data.notes : state.notes,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to clean up expired trash.' });
    }
  },
  clearError: () => set({ error: null }),
  markHydrated: () => set({ isHydrated: true }),
}));