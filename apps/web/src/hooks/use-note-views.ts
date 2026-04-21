import { useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useNotesStore } from '@/stores/notes-store';
import { getAllTags, matchesSearch, sortNotes } from '@/lib/utils-notes';
import { Note } from '@/types/note';

interface NoteViewsResult {
  activeNotes: Note[];
  trashedNotes: Note[];
  filteredNotes: Note[];
  availableTags: string[];
  selectedNote: Note | null;
}

export const useNoteViews = (): NoteViewsResult => {
  const user = useAuthStore((state) => state.user);
  const notes = useNotesStore((state) => state.notes);
  const filters = useNotesStore((state) => state.filters);
  const selectedNoteId = useNotesStore((state) => state.selectedNoteId);

  return useMemo(() => {
    const ownedNotes = user
      ? notes.filter((note) => note.userId === user.id || note.userId === 'demo-account')
      : [];

    const migratedNotes = ownedNotes.map((note) => (
      note.userId === 'demo-account' && user
        ? { ...note, userId: user.id }
        : note
    ));

    const activeNotes = sortNotes(
      migratedNotes.filter((note) => note.deletedAt === null),
      filters.sortBy,
    );

    const trashedNotes = sortNotes(
      migratedNotes.filter((note) => note.deletedAt !== null),
      filters.sortBy,
    );

    const notePool = filters.showTrash ? trashedNotes : activeNotes;
    const filteredNotes = notePool.filter((note) => {
      const matchesTag = filters.selectedTag ? note.tags.includes(filters.selectedTag) : true;
      return matchesTag && matchesSearch(note, filters.search);
    });

    const availableTags = getAllTags(activeNotes);
    const selectedNote = migratedNotes.find((note) => note.id === selectedNoteId) ?? null;

    return {
      activeNotes,
      trashedNotes,
      filteredNotes,
      availableTags,
      selectedNote,
    };
  }, [filters, notes, selectedNoteId, user]);
};