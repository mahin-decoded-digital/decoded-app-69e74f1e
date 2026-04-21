import { FormEvent, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LOGO_URL } from '@/lib/utils-notes';
import { useAuthStore } from '@/stores/auth-store';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

interface FormState {
  name: string;
  email: string;
  password: string;
}

export const AuthForm = ({ mode }: AuthFormProps): JSX.Element => {
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const authError = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
  const signup = useAuthStore((state) => state.signup);
  const clearError = useAuthStore((state) => state.clearError);
  const navigate = useNavigate();
  const location = useLocation();

  const copy = useMemo(() => {
    return mode === 'login'
      ? {
          title: 'Welcome back',
          description: 'Sign in to access your notes, tags, trash recovery, and autosaved writing space.',
          submit: 'Sign in',
          switchText: 'Need an account?',
          switchTo: '/signup',
          switchLabel: 'Create one',
          icon: LogIn,
        }
      : {
          title: 'Create your account',
          description: 'Set up a secure ClearNote workspace for simple note capture with recoverable trash and server-style persistence.',
          submit: 'Create account',
          switchText: 'Already have an account?',
          switchTo: '/login',
          switchLabel: 'Sign in',
          icon: UserPlus,
        };
  }, [mode]);

  const validate = (): boolean => {
    const nextErrors: Partial<FormState> = {};
    if (mode === 'signup' && form.name.trim().length < 2) {
      nextErrors.name = 'Enter your full name.';
    }
    if (!form.email.includes('@') || form.email.trim().length < 5) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    clearError();
    if (!validate()) {
      return;
    }

    const result = mode === 'login'
      ? await login({ email: form.email, password: form.password })
      : await signup({ name: form.name, email: form.email, password: form.password });

    if (result.success) {
      const fromState = location.state as { from?: string } | null;
      navigate(fromState?.from ?? '/app');
    }
  };

  const Icon = copy.icon;

  return (
    <Card className="border-border/80 bg-card shadow-sm">
      <CardHeader className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <img src={LOGO_URL} alt="ClearNote logo" className="h-8 w-auto" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-foreground">ClearNote</p>
            <p className="text-xs text-muted-foreground">Plain-text note workspace</p>
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl">{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Alex Morgan"
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@company.com"
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="At least 8 characters"
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          {authError && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <span>{authError}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            <Icon className="mr-2 h-4 w-4" />
            {isLoading ? 'Please wait…' : copy.submit}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t border-border pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="text-muted-foreground">{copy.switchText}</span>
        <Link to={copy.switchTo} className="font-medium text-primary hover:underline">
          {copy.switchLabel}
        </Link>
      </CardFooter>
    </Card>
  );
};