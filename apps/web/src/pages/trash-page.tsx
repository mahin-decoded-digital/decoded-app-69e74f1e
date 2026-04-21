import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotesLayout } from '@/components/notes-layout';
import { useNoteViews } from '@/hooks/use-note-views';
import { useAuthStore } from '@/stores/auth-store';
import { useNotesStore } from '@/stores/notes-store';

export default function TrashPage(): JSX.Element {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const emptyTrash = useNotesStore((state) => state.emptyTrash);
  const { trashedNotes } = useNoteViews();

  useEffect(() => {
    useNotesStore.getState().fetchAll().catch(() => {
      // handled in store
    });
  }, []);

  useEffect(() => {
    if (trashedNotes.length > 0) {
      navigate(`/trash/${trashedNotes[0].id}`, { replace: true });
    }
  }, [navigate, trashedNotes]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (trashedNotes.length === 0) {
    return (
      <Card className="border-[#d7e1ea] shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-[#35526f]">Trash is empty</CardTitle>
          <CardDescription>
            When you delete a note, it lands here first so you can review and recover it before it is permanently removed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/40 p-5">
              <h2 className="text-lg font-semibold">Soft-delete by default</h2>
              <p className="mt-2 text-sm text-muted-foreground">Mistakes are recoverable within your configured retention window.</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-5">
              <h2 className="text-lg font-semibold">Manual clearing</h2>
              <p className="mt-2 text-sm text-muted-foreground">You can still clear trash completely whenever you need a clean slate.</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => { void emptyTrash(); }}>Confirm trash is clear</Button>
        </CardContent>
      </Card>
    );
  }

  return <NotesLayout mode="trash" />;
}