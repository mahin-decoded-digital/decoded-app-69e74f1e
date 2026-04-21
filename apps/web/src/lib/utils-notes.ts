import { Note, NoteSort } from '@/types/note';

export const LOGO_URL = 'https://decoded-studios-storage.s3.ap-southeast-2.amazonaws.com/public/buddy-f15d5d8d.png';

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const formatDateTime = (value: string): string => {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const formatRelativeDays = (value: string): string => {
  const diff = new Date(value).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) {
    return 'Expires today';
  }
  if (days === 1) {
    return 'Expires in 1 day';
  }
  return `Expires in ${days} days`;
};

export const getNoteTitle = (note: Note): string => {
  const trimmed = note.title.trim();
  if (trimmed.length > 0) {
    return trimmed;
  }

  const firstLine = note.content
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  return firstLine ?? 'Untitled note';
};

export const getNoteExcerpt = (note: Note): string => {
  const text = note.content.trim();
  if (!text) {
    return 'Start typing to capture your idea, meeting notes, or draft.';
  }
  return text.length > 140 ? `${text.slice(0, 140)}…` : text;
};

export const sortNotes = (notes: Note[], sortBy: NoteSort): Note[] => {
  const sorted = [...notes];

  sorted.sort((a, b) => {
    if (sortBy === 'created-desc') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    if (sortBy === 'title-asc') {
      return getNoteTitle(a).localeCompare(getNoteTitle(b));
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return sorted;
};

export const getAllTags = (notes: Note[]): string[] => {
  return Array.from(new Set(notes.flatMap((note) => note.tags))).sort((a, b) => a.localeCompare(b));
};

export const matchesSearch = (note: Note, search: string): boolean => {
  const query = search.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const haystack = `${note.title} ${note.content} ${note.tags.join(' ')}`.toLowerCase();
  return haystack.includes(query);
};

export const getTrashExpiry = (deletedAt: string, retentionDays: number): string => {
  const date = new Date(deletedAt);
  date.setDate(date.getDate() + retentionDays);
  return date.toISOString();
};