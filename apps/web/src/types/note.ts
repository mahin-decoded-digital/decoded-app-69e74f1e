export type NoteSort = 'modified-desc' | 'created-desc' | 'title-asc';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface NotesFilters {
  search: string;
  selectedTag: string | null;
  sortBy: NoteSort;
  showTrash: boolean;
}

export interface SaveStatus {
  state: 'idle' | 'typing' | 'saving' | 'saved' | 'error';
  message: string;
}

export interface NotesState {
  notes: Note[];
  filters: NotesFilters;
  selectedNoteId: string | null;
  retentionDays: number;
  isHydrated: boolean;
  isLoading: boolean;
  loaded: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  createNote: (userId: string) => Promise<Note | null>;
  updateNote: (noteId: string, updates: Partial<Pick<Note, 'title' | 'content' | 'tags'>>) => Promise<void>;
  softDeleteNote: (noteId: string) => Promise<void>;
  restoreNote: (noteId: string) => Promise<void>;
  permanentlyDeleteNote: (noteId: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  setFilters: (filters: Partial<NotesFilters>) => void;
  selectNote: (noteId: string | null) => void;
  setRetentionDays: (days: number) => Promise<void>;
  cleanupExpiredTrash: () => Promise<void>;
  clearError: () => void;
  markHydrated: () => void;
}