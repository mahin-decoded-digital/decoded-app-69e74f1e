import { Link } from 'react-router-dom';
import { AlertCircle, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFoundPage(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f5f8fc_0%,#eef3f8_100%)] px-4 py-10">
      <Card className="w-full max-w-3xl border-[#d7e1ea] shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto rounded-full bg-[#eef4f9] p-3 text-[#35526f]">
            <AlertCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-bold text-[#35526f]">Page not found</CardTitle>
          <CardDescription>
            The page you tried to open does not exist or may have been moved inside the ClearNote workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Return to your workspace to continue writing, search for notes by keyword, review tags for organization, or recover recently deleted content from trash.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-muted/40 p-5 text-left">
              <Search className="h-5 w-5 text-[#35526f]" />
              <h2 className="mt-3 text-base font-semibold">Search notes fast</h2>
              <p className="mt-2 text-sm text-muted-foreground">Filter by text and tags to find the exact note you meant to open.</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-5 text-left">
              <AlertCircle className="h-5 w-5 text-[#35526f]" />
              <h2 className="mt-3 text-base font-semibold">Check active notes</h2>
              <p className="mt-2 text-sm text-muted-foreground">Browse your current note list with created and modified timestamps.</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-5 text-left">
              <Trash2 className="h-5 w-5 text-[#35526f]" />
              <h2 className="mt-3 text-base font-semibold">Review trash</h2>
              <p className="mt-2 text-sm text-muted-foreground">Accidentally deleted something? Restore it from trash before retention expires.</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="bg-[#35526f] hover:bg-[#2d455c]">
              <Link to="/app">Go to notes</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/trash">Open trash</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}