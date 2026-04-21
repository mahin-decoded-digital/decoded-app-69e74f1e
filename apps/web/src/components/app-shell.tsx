import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, LogOut, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LOGO_URL } from '@/lib/utils-notes';
import { useAuthStore } from '@/stores/auth-store';

const navItems = [
  { to: '/app', label: 'Notes', icon: Home },
  { to: '/trash', label: 'Trash', icon: Trash2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const AppShell = (): JSX.Element => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/app" className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Logo" className="h-8 w-auto object-contain" />
            <div>
              <p className="text-sm font-semibold tracking-wide text-[#35526f]">ClearNote</p>
              <p className="text-xs text-muted-foreground">Reliable plain-text note capture</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#35526f] text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{user?.name ?? 'Workspace'}</p>
              <p className="text-xs text-muted-foreground">{user?.email ?? 'Signed out'}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
        <div className="border-t border-border md:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-[#35526f] text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};