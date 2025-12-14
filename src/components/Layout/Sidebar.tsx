import { Link, useLocation } from 'react-router-dom';
import { UserButton, useClerk } from '@clerk/clerk-react';
import { Database, LayoutDashboard, LogOut } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Button } from '@/shared/ui';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
];

export function Sidebar() {
  const location = useLocation();
  const { signOut } = useClerk();
  
  return (
    <aside className="w-16 bg-card border-r border-border flex flex-col items-center py-4">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <Database className="h-5 w-5 text-primary-foreground" />
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                size="icon"
                className={cn(
                  'w-10 h-10',
                  isActive && 'bg-secondary text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Profile and Logout */}
      <div className="mt-auto pt-4 flex flex-col items-center gap-3">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-10 h-10',
            },
          }}
        />
        
        {/* Logout Button */}
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => signOut()}
          title="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </aside>
  );
}
