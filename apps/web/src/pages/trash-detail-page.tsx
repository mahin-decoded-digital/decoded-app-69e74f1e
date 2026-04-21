import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, RotateCcw, Trash2, Clock3 } from 'lucide-react';
import { NoteEditor } from '@/components/note-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDateTime, formatRelativeDays, getNoteTitle, getTrashExpiry } from '@/lib/utils-notes';
import { useNotesStore } from '@/stores/notes-store';

export default function TrashDetailPage(): JSX.Element {
  const { noteId } = useParams();
  const notes = useNotesStore((state) => state.notes);
  const retentionDays = useNotesStore((state) => state.retentionDays);

  if (!noteId) {
    return <Navigate to="/trash" replace />;
  }

  const note = notes.find((item) => item.id === noteId && item.deletedAt !== null);
  const expiry = note?.deletedAt ? getTrashExpiry(note.deletedAt, retentionDays) : null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Link to="/trash" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to trash
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Trash note details</h1>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
                Review deleted note details, check its expiration window, and either restore or permanently remove it using the controls in the editor panel below.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="destructive" className="px-3 py-1">Read only</Badge>
            <Badge variant="outline" className="px-3 py-1">Recoverable before expiry</Badge>
          </div>
        </div>

        {note ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card className="border-border shadow-sm">
              <CardContent className="flex items-start gap-3 p-5">
                <Trash2 className="mt-0.5 h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">Deleted note</p>
                  <p className="font-semibold text-foreground">{getNoteTitle(note)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm">
              <CardContent className="flex items-start gap-3 p-5">
                <Calendar className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Moved to trash</p>
                  <p className="font-semibold text-foreground">{note.deletedAt ? formatDateTime(note.deletedAt) : 'Unknown'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm">
              <CardContent className="flex items-start gap-3 p-5">
                <Clock3 className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Time remaining</p>
                  <p className="font-semibold text-foreground">{expiry ? formatRelativeDays(expiry) : 'Expired soon'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="mt-6 border-border shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">If this trashed note no longer exists, the detail editor below will show a complete not-found state instead of leaving the route blank.</p>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <NoteEditor />
        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Trash retention rules</CardTitle>
              <CardDescription>Deleted notes remain recoverable for a limited time.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <RotateCcw className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Restore a note to send it back into your active workspace with editing enabled again.</p>
              </div>
              <div className="flex items-start gap-3">
                <Trash2 className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Permanent deletion removes the note immediately and cannot be undone.</p>
              </div>
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Current retention setting: {retentionDays} day{retentionDays === 1 ? '' : 's'} before automatic cleanup.</p>
              </div>
            </CardContent>
          </Card>

          {note && (
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Deleted note summary</CardTitle>
                <CardDescription>Context before you decide what to do with this note.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium text-foreground">{formatDateTime(note.createdAt)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Last updated</p>
                  <p className="font-medium text-foreground">{formatDateTime(note.updatedAt)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Tags</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {note.tags.length === 0 ? (
                      <span className="text-sm text-muted-foreground">No tags were attached.</span>
                    ) : (
                      note.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))
                    )}
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/trash">Back to trash list</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}