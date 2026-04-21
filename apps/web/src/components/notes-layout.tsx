import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, SlidersHorizontal, Tag, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDateTime, getNoteExcerpt, getNoteTitle } from '@/lib/utils-notes';
import { useAuthStore } from '@/stores/auth-store';
import { useNotesStore } from '@/stores/notes-store';
import { useNoteViews } from '@/hooks/use-note-views';
import { NoteSort } from '@/types/note';

interface NotesLayoutProps {
  mode: 'notes' | 'trash';
}

const sortOptions: { value: NoteSort; label: string }[] = [
  { value: 'modified-desc', label: 'Last modified' },
  { value: 'created-desc', label: 'Date created' },
  { value: 'title-asc', label: 'Title A–Z' },
];

export const NotesLayout = ({ mode }: NotesLayoutProps): JSX.Element => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const filters = useNotesStore((state) => state.filters);
  const selectedNoteId = useNotesStore((state) => state.selectedNoteId);
  const createNote = useNotesStore((state) => state.createNote);
  const setFilters = useNotesStore((state) => state.setFilters);
  const selectNote = useNotesStore((state) => state.selectNote);
  const { filteredNotes } = useNoteViews();

  useEffect(() => {
    setFilters({ showTrash: mode === 'trash' });
  }, [mode, setFilters]);

  const handleCreate = async (): Promise<void> => {
    if (!user) {
      return;
    }
    const note = await createNote(user.id);
    if (!note) {
      return;
    }
    selectNote(note.id);
    navigate(`/app/notes/${note.id}`);
  };

  const handleOpenNote = (noteId: string): void => {
    selectNote(noteId);
    navigate(mode === 'trash' ? `/trash/${noteId}` : `/app/notes/${noteId}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="space-y-6">
        <Card className="border-[#d7e1ea] shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-[#35526f]">{mode === 'notes' ? 'Your notes' : 'Trash'}</CardTitle>
                <CardDescription>
                  {mode === 'notes'
                    ? 'Search, filter, and sort your active notes.'
                    : 'Recover recent deletions before they expire.'}
                </CardDescription>
              </div>
              {mode === 'notes' && (
                <Button onClick={() => { void handleCreate(); }} className="bg-[#35526f] hover:bg-[#2d455c]">
                  <Plus className="mr-2 h-4 w-4" />
                  New
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search notes</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  value={filters.search}
                  onChange={(event) => setFilters({ search: event.target.value })}
                  placeholder="Search title, content, or tags"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="sortBy">Sort by</Label>
                <div className="relative">
                  <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <select
                    id="sortBy"
                    value={filters.sortBy}
                    onChange={(event) => setFilters({ sortBy: event.target.value as NoteSort })}
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tag filter</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filters.selectedTag === null ? 'default' : 'outline'}
                    size="sm"
                    className={filters.selectedTag === null ? 'bg-[#35526f] hover:bg-[#2d455c]' : ''}
                    onClick={() => setFilters({ selectedTag: null })}
                  >
                    All tags
                  </Button>
                  {filteredNotes.length === 0 && filters.selectedTag === null && (
                    <span className="text-sm text-muted-foreground">Use tags to organize related notes</span>
                  )}
                  {Array.from(new Set(filteredNotes.flatMap((note) => note.tags))).sort((a, b) => a.localeCompare(b)).map((tag) => (
                    <Button
                      key={tag}
                      variant={filters.selectedTag === tag ? 'default' : 'outline'}
                      size="sm"
                      className={filters.selectedTag === tag ? 'bg-[#35526f] hover:bg-[#2d455c]' : ''}
                      onClick={() => setFilters({ selectedTag: tag })}
                    >
                      <Tag className="mr-1 h-3.5 w-3.5" />
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#d7e1ea] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{filteredNotes.length} results</CardTitle>
            <CardDescription>
              {mode === 'notes'
                ? 'Choose a note from the list to edit it on the right.'
                : 'Select a deleted note to restore or clear it permanently.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredNotes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/40 p-5 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">{mode === 'notes' ? 'No matching notes' : 'Trash is empty'}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {mode === 'notes'
                    ? 'Try a different keyword, clear the tag filter, or create a fresh note.'
                    : 'Deleted notes will appear here until they are restored or expire.'}
                </p>
                {mode === 'notes' ? (
                  <Button className="mt-4 bg-[#35526f] hover:bg-[#2d455c]" onClick={() => { void handleCreate(); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create note
                  </Button>
                ) : (
                  <Button className="mt-4" variant="outline" asChild>
                    <Link to="/app">Return to notes</Link>
                  </Button>
                )}
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isActive = selectedNoteId === note.id;
                return (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => handleOpenNote(note.id)}
                    className={cn(
                      'w-full rounded-xl border p-4 text-left transition-colors',
                      isActive
                        ? 'border-[#35526f] bg-[#f0f5fa]'
                        : 'border-border bg-card hover:border-[#9eb5ca] hover:bg-muted/50',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <p className="font-semibold text-foreground">{getNoteTitle(note)}</p>
                        <p className="text-sm text-muted-foreground">{getNoteExcerpt(note)}</p>
                      </div>
                      {mode === 'trash' ? <Trash2 className="h-4 w-4 text-muted-foreground" /> : null}
                    </div>
                    <Separator className="my-3" />
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span>Updated {formatDateTime(note.updatedAt)}</span>
                      <div className="flex flex-wrap gap-1">
                        {note.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>
      </aside>

      <section className="min-h-[70vh] rounded-2xl border border-dashed border-[#d7e1ea] bg-[#f8fbfd] p-8 shadow-sm">
        <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center">
          <div className="rounded-full bg-[#eef4f9] p-4 text-[#35526f]">
            <FileText className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-foreground">Focused writing workspace</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Select any note from the list to open the full editor with autosave, tags, timestamps, and trash controls in the main detail view.
          </p>
          <div className="mt-6 grid w-full gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5 text-left">
              <h3 className="text-base font-semibold">Autosave feedback</h3>
              <p className="mt-2 text-sm text-muted-foreground">Every edit is saved automatically after a short pause so your writing remains current.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 text-left">
              <h3 className="text-base font-semibold">Tag-first organization</h3>
              <p className="mt-2 text-sm text-muted-foreground">Keep the product minimal by organizing notes with tags instead of folders or notebooks.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};