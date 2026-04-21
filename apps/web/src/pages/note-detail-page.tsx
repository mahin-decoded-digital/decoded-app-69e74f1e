import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, File, Tag, Trash2 } from 'lucide-react';
import { NoteEditor } from '@/components/note-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDateTime, getNoteTitle } from '@/lib/utils-notes';
import { useAuthStore } from '@/stores/auth-store';
import { useNotesStore } from '@/stores/notes-store';

export default function NoteDetailPage(): JSX.Element {
  const { noteId } = useParams();
  const user = useAuthStore((state) => state.user);
  const notes = useNotesStore((state) => state.notes);

  if (!noteId) {
    return <Navigate to="/app" replace />;
  }

  const note = notes.find((item) => item.id === noteId && user && (item.userId === user.id || item.userId === 'demo-account'));

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Link to="/app" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to all notes
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Note details</h1>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
                Review your note metadata, manage tags, and continue editing in the autosaving plain-text workspace below.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="px-3 py-1">Autosave enabled</Badge>
            <Badge variant="secondary" className="px-3 py-1">Plain-text editor</Badge>
          </div>
        </div>

        {note ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card className="border-border shadow-sm">
              <CardContent className="flex items-start gap-3 p-5">
                <File className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Current note</p>
                  <p className="font-semibold text-foreground">{getNoteTitle(note)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm">
              <CardContent className="flex items-start gap-3 p-5">
                <Tag className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Attached tags</p>
                  <p className="font-semibold text-foreground">{note.tags.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm">
              <CardContent className="flex items-start gap-3 p-5">
                <Calendar className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Last updated</p>
                  <p className="font-semibold text-foreground">{formatDateTime(note.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="mt-6 border-border shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">If the selected note was deleted or is no longer accessible, the editor below will show a clear not-found state instead of a blank page.</p>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <NoteEditor />
        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Editing tips</CardTitle>
              <CardDescription>Get the most out of the note detail view.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Pause typing briefly to let autosave write title, content, and tags back into the notes store.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Use lowercase tags for clean filtering across the main notes list and search experience.</p>
              </div>
              <div className="flex items-start gap-3">
                <Trash2 className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Moving a note to trash keeps it recoverable before permanent deletion, so accidental removals are safer.</p>
              </div>
            </CardContent>
          </Card>

          {note && (
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Note summary</CardTitle>
                <CardDescription>Quick context for the note you are editing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium text-foreground">{formatDateTime(note.createdAt)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium text-foreground">{note.deletedAt ? 'In trash' : 'Active note'}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Tag preview</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {note.tags.length === 0 ? (
                      <span className="text-sm text-muted-foreground">No tags added yet.</span>
                    ) : (
                      note.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))
                    )}
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link to="/app">Return to notes list</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}