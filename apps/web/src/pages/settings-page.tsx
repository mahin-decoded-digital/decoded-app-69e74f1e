import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BadgePercent, Clock3, ShieldCheck, SlidersHorizontal, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth-store';
import { useNotesStore } from '@/stores/notes-store';
import { useNoteViews } from '@/hooks/use-note-views';

export default function SettingsPage(): JSX.Element {
  const user = useAuthStore((state) => state.user);
  const retentionDays = useNotesStore((state) => state.retentionDays);
  const setRetentionDays = useNotesStore((state) => state.setRetentionDays);
  const { activeNotes, trashedNotes, availableTags } = useNoteViews();
  const [daysInput, setDaysInput] = useState(String(retentionDays));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    useNotesStore.getState().fetchAll().catch(() => {
      // handled in store
    });
  }, []);

  useEffect(() => {
    setDaysInput(String(retentionDays));
  }, [retentionDays]);

  const stats = useMemo(() => ([
    { label: 'Active notes', value: activeNotes.length, icon: SlidersHorizontal },
    { label: 'Tags in use', value: availableTags.length, icon: BadgePercent },
    { label: 'Items in trash', value: trashedNotes.length, icon: Clock3 },
  ]), [activeNotes.length, availableTags.length, trashedNotes.length]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const parsed = Number(daysInput);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 90) {
      setError('Retention must be a whole number between 1 and 90 days.');
      setSaved(false);
      return;
    }
    await setRetentionDays(parsed);
    setError(null);
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#d7e1ea] bg-card p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#6d849a]">Workspace settings</p>
        <h1 className="mt-3 text-3xl font-bold text-[#35526f]">Account and retention controls</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          ClearNote keeps the experience minimal: one personal account, plain-text editing, tag-based organization, and a configurable trash retention window for safe recovery.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="border-[#d7e1ea] shadow-sm">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-xl bg-[#eef4f9] p-3 text-[#35526f]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold text-foreground">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card className="border-[#d7e1ea] shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><Clock3 className="h-5 w-5 text-[#35526f]" /> Trash retention window</CardTitle>
            <CardDescription>Choose how long deleted notes should remain recoverable before automatic cleanup removes them.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(event) => { void handleSubmit(event); }}>
              <div className="space-y-2">
                <Label htmlFor="retentionDays">Retention days</Label>
                <Input
                  id="retentionDays"
                  type="number"
                  min={1}
                  max={90}
                  value={daysInput}
                  onChange={(event) => {
                    setDaysInput(event.target.value);
                    setSaved(false);
                  }}
                />
                <p className="text-sm text-muted-foreground">Recommended range: 7-30 days for a good balance between recovery and cleanup.</p>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {saved && <p className="text-sm text-emerald-600">Retention window updated successfully.</p>}
              </div>
              <Button type="submit" className="bg-[#35526f] hover:bg-[#2d455c]">Save retention setting</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-[#d7e1ea] shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><User className="h-5 w-5 text-[#35526f]" /> Account profile</CardTitle>
            <CardDescription>Single-user account access keeps ClearNote private, simple, and focused on personal note capture.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Full name</p>
              <p className="mt-1 font-semibold text-foreground">{user?.name ?? 'No active account'}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="mt-1 font-semibold text-foreground">{user?.email ?? 'No active account'}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-2 text-[#35526f]">
                <ShieldCheck className="h-5 w-5" />
                <p className="font-semibold">Current access model</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                One user per account, no sharing permissions, and no cross-device sync in this MVP release.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <h3 className="text-base font-semibold text-foreground">Operational guidelines</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Notes are stored per account and separated from other users.</li>
                <li>Editing remains plain-text only to keep loading and autosave fast.</li>
                <li>Search and tag filters help replace heavy notebook structures.</li>
                <li>Trash cleanup runs automatically after the retention window expires.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}