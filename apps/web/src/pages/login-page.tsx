import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Lock, Search, ShieldCheck } from 'lucide-react';
import { AuthForm } from '@/components/auth-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { LOGO_URL } from '@/lib/utils-notes';

const loginHighlights = [
  {
    title: 'Return to active work',
    description: 'Open your current notes, continue writing, and pick up exactly where you left off.',
    icon: Lock,
  },
  {
    title: 'Find anything fast',
    description: 'Use search, tags, and smart sorting to surface the note you need in seconds.',
    icon: Search,
  },
  {
    title: 'Protected account data',
    description: 'Your saved account and workspace state stay persisted between sessions in this demo app.',
    icon: ShieldCheck,
  },
];

export default function LoginPage(): JSX.Element {
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (isHydrated && user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 lg:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-8 rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="ClearNote logo" className="h-10 w-auto" />
              <div>
                <p className="text-sm font-semibold tracking-wide text-foreground">ClearNote</p>
                <p className="text-xs text-muted-foreground">Focused plain-text note capture</p>
              </div>
            </div>

            <div className="space-y-3">
              <Badge variant="secondary" className="px-3 py-1 text-sm">Secure sign in</Badge>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Log in to keep writing without distractions</h1>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                Access your notes, autosaved edits, tag organization, and recoverable trash from one focused workspace. Sign in below to continue managing your saved content.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {loginHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-base font-semibold text-foreground">{item.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">Autosave always on</p>
                <p className="mt-2 text-sm text-muted-foreground">Typing pauses trigger a save state so your drafts stay protected.</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">Recoverable trash</p>
                <p className="mt-2 text-sm text-muted-foreground">Restore deleted notes or clear them permanently when you are ready.</p>
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <AuthForm mode="login" />
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">New to ClearNote?</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your account in under a minute and return here anytime to continue your writing.
                  </p>
                </div>
              </div>
              <Button asChild className="mt-4 w-full">
                <Link to="/signup">
                  Create an account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}