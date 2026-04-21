import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/app-shell';
import { ProtectedRoute } from '@/components/protected-route';
import LoginPage from '@/pages/login-page';
import NoteDetailPage from '@/pages/note-detail-page';
import NotFoundPage from '@/pages/not-found-page';
import NotesPage from '@/pages/notes-page';
import SettingsPage from '@/pages/settings-page';
import SignupPage from '@/pages/signup-page';
import TrashDetailPage from '@/pages/trash-detail-page';
import TrashPage from '@/pages/trash-page';
import { useAuthStore } from '@/stores/auth-store';

export default function App(): JSX.Element {
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    useAuthStore.getState().loadSession().catch(() => {
      // handled inside store
    });
  }, []);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/app" element={<NotesPage />} />
          <Route path="/app/notes/:noteId" element={<NoteDetailPage />} />
          <Route path="/trash" element={<TrashPage />} />
          <Route path="/trash/:noteId" element={<TrashDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}