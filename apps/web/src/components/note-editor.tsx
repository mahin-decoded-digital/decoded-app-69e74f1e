import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Save, Tag, Trash2, Undo2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { formatDateTime, formatRelativeDays, getNoteTitle, getTrashExpiry } from '@/lib/utils-notes';
import { useAuthStore } from '@/stores/auth-store';
import { useNotesStore } from '@/stores/notes-store';
import { SaveStatus } from '@/types/note';

interface EditorForm {
  title: string;
  content: string;
  tagInput: string;
  tags: string[];
}

const initialStatus: SaveStatus = {
  state: 'idle',
  message: 'All changes saved',
};

export const NoteEditor = (): JSX.Element => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const notes = useNotesStore((state) => state.notes);
  const retentionDays = useNotesStore((state) => state.retentionDays);
  const updateNote = useNotesStore((state) => state.updateNote);
  const softDeleteNote = useNotesStore((state) => state.softDeleteNote);
  const restoreNote = useNotesStore((state) => state.restoreNote);
  const permanentlyDeleteNote = useNotesStore((state) => state.permanentlyDeleteNote);
  const selectNote = useNotesStore((state) => state.selectNote);

  if (!noteId) {
    return <Navigate to="/app" replace />;
  }

  const note = notes.find((item) => item.id === noteId && user && (item.userId === user.id || item.userId === 'demo-account'));

  const [form, setForm] = useState<EditorForm>({
    title: note?.title ?? '',
    content: note?.content ?? '',
    tagInput: '',
    tags: note?.tags ?? [],
  });
  const [tagError, setTagError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(initialStatus);

  useEffect(() => {
    if (note) {
      setForm({ title: note.title, content: note.content, tagInput: '', tags: note.tags });
      selectNote(note.id);
    }
  }, [note, selectNote]);

  useEffect(() => {
    if (!note || note.deletedAt !== null) {
      return;
    }

    if (form.title === note.title && form.content === note.content && JSON.stringify(form.tags) === JSON.stringify(note.tags)) {
      return;
    }

    setSaveStatus({ state: 'typing', message: 'Unsaved changes…' });
    const timer = window.setTimeout(() => {
      setSaveStatus({ state: 'saving', message: 'Saving…' });
      updateNote(note.id, { title: form.title, content: form.content, tags: form.tags });
      setSaveStatus({ state: 'saved', message: 'Autosaved just now' });
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, [form.content, form.tags, form.title, note, updateNote]);

  const saveTone = useMemo(() => {
    if (saveStatus.state === 'saved' || saveStatus.state === 'idle') {
      return 'text-emerald-600';
    }
    if (saveStatus.state === 'saving' || saveStatus.state === 'typing') {
      return 'text-amber-600';
    }
    return 'text-destructive';
  }, [saveStatus.state]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!note) {
    return (
      <Card className="border-[#d7e1ea] shadow-sm">
        <CardContent className="p-8 text-center">
          <h1 className="text-2xl font-semibold">Note not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">The note may have been deleted or moved out of your current workspace.</p>
          <Button className="mt-4" asChild>
            <Link to="/app">Return to notes</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleAddTag = (event?: FormEvent<HTMLFormElement>): void => {
    event?.preventDefault();
    const normalized = form.tagInput.trim().toLowerCase();
    if (!normalized) {
      setTagError('Enter a tag name before adding it.');
      return;
    }
    if (form.tags.includes(normalized)) {
      setTagError('That tag is already attached to this note.');
      return;
    }
    setForm((current) => ({ ...current, tags: [...current.tags, normalized], tagInput: '' }));
    setTagError(null);
  };

  const handleRemoveTag = (tag: string): void => {
    setForm((current) => ({ ...current, tags: current.tags.filter((item) => item !== tag) }));
  };

  const handleDelete = (): void => {
    softDeleteNote(note.id);
    navigate('/trash');
  };

  const handleRestore = (): void => {
    restoreNote(note.id);
    navigate(`/app/notes/${note.id}`);
  };

  const handlePermanentDelete = (): void => {
    permanentlyDeleteNote(note.id);
    navigate('/trash');
  };

  const trashExpiry = note.deletedAt ? getTrashExpiry(note.deletedAt, retentionDays) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#d7e1ea] bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to={note.deletedAt ? '/trash' : '/app'} className="inline-flex items-center gap-1 hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to {note.deletedAt ? 'trash' : 'notes'}
            </Link>
          </div>
          <h1 className="mt-3 text-3xl font-bold text-[#35526f]">{getNoteTitle(note)}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Created {formatDateTime(note.createdAt)} • Last updated {formatDateTime(note.updatedAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className={`inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm ${saveTone}`}>
            {saveStatus.state === 'saved' || saveStatus.state === 'idle' ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            {note.deletedAt ? 'Read only in trash' : saveStatus.message}
          </div>
          {!note.deletedAt && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Move to trash
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Move note to trash?</DialogTitle>
                  <DialogDescription>
                    The note will remain recoverable for {retentionDays} days before it expires from trash.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="destructive" onClick={handleDelete}>Move to trash</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="border-[#d7e1ea] shadow-sm">
          <CardHeader>
            <CardTitle>{note.deletedAt ? 'Note preview' : 'Plain-text editor'}</CardTitle>
            <CardDescription>
              {note.deletedAt
                ? 'This note is read-only while it is in trash. Restore it to continue editing.'
                : 'Changes save automatically after you pause typing.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Give your note a clear title"
                disabled={note.deletedAt !== null}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                placeholder="Write your note here in plain text..."
                className="min-h-[460px] resize-y"
                disabled={note.deletedAt !== null}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Autosave is enabled. Notes remain plain-text only for speed and reliability.
            </div>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card className="border-[#d7e1ea] shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
              <CardDescription>Add lightweight labels to organize and filter your notes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="space-y-2" onSubmit={handleAddTag}>
                <Label htmlFor="tagInput">Add a tag</Label>
                <div className="flex gap-2">
                  <Input
                    id="tagInput"
                    value={form.tagInput}
                    onChange={(event) => setForm((current) => ({ ...current, tagInput: event.target.value }))}
                    placeholder="project, class, draft"
                    disabled={note.deletedAt !== null}
                  />
                  <Button type="submit" disabled={note.deletedAt !== null}>Add</Button>
                </div>
                {tagError && <p className="text-sm text-destructive">{tagError}</p>}
              </form>
              <Separator />
              <div className="flex flex-wrap gap-2">
                {form.tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tags yet. Add a few to make filtering faster.</p>
                ) : (
                  form.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      <Tag className="h-3.5 w-3.5" />
                      {tag}
                      {!note.deletedAt && (
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 rounded-full hover:text-destructive">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {note.deletedAt ? (
            <Card className="border-[#d7e1ea] shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Trash controls</CardTitle>
                <CardDescription>
                  Deleted {formatDateTime(note.deletedAt)} • {trashExpiry ? formatRelativeDays(trashExpiry) : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-[#35526f] hover:bg-[#2d455c]" onClick={handleRestore}>
                  <Undo2 className="mr-2 h-4 w-4" />
                  Restore note
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete permanently
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Permanently delete this note?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. The note will be removed from your account immediately.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button variant="destructive" onClick={handlePermanentDelete}>Delete permanently</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
};