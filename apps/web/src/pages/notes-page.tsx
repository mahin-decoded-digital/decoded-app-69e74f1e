import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotesLayout } from '@/components/notes-layout';
import { useNoteViews } from '@/hooks/use-note-views';
import { useAuthStore } from '@/stores/auth-store';
import { useNotesStore } from '@/stores/notes-store';

export default function NotesPage(): JSX.Element {
  const user = useAuthStore((state) => state.user);
  const loaded = useNotesStore((state) => state.loaded);
  const isLoading = useNotesStore((state) => state.isLoading);
  const createNote = useNotesStore((state) => state.createNote);
  const selectNote = useNotesStore((state) => state.selectNote);
  const navigate = useNavigate();
  const { activeNotes } = useNoteViews();

  useEffect(() => {
    useNotesStore.getState().fetchAll().catch(() => {
      // handled in store
    });
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!loaded && isLoading) {
    return (
      <Card className="border-[#d7e1ea] shadow-sm">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">Loading notes…</CardContent>
      </Card>
    );
  }

  if (activeNotes.length === 0) {
    const handleCreate = async (): Promise<void> => {
      const note = await createNote(user.id);
      if (!note) {
        return;
      }
      selectNote(note.id);
      navigate(`/app/notes/${note.id}`);
    };

    return (
      <Card className="border-[#d7e1ea] shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-[#35526f]">Welcome to your note workspace</CardTitle>
          <CardDescription>
            Create your first plain-text note to start building a searchable archive of drafts, meeting notes, and quick ideas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-muted/40 p-5">
              <h2 className="text-lg font-semibold">Fast capture</h2>
              <p className="mt-2 text-sm text-muted-foreground">Write without formatting controls or notebook clutter.</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-5">
              <h2 className="text-lg font-semibold">Flexible organization</h2>
              <p className="mt-2 text-sm text-muted-foreground">Use tags, search, and date sorting to find what matters quickly.</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-5">
              <h2 className="text-lg font-semibold">Recoverable trash</h2>
              <p className="mt-2 text-sm text-muted-foreground">Undo accidental deletions before the retention window ends.</p>
            </div>
          </div>
          <Button className="bg-[#35526f] hover:bg-[#2d455c]" onClick={() => { void handleCreate(); }}>Create your first note</Button>
        </CardContent>
      </Card>
    );
  }

  return <NotesLayout mode="notes" />;
}