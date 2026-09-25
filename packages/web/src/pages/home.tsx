import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-text-primary">اصفهان چالاک</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary">
            {user?.fullName || user?.username || 'کاربر'}
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            خروج
          </Button>
        </div>
      </header>

      <main className="p-6">
        <h2 className="text-lg font-medium text-text-primary">داشبورد</h2>
        <p className="mt-2 text-sm text-text-secondary">
          اینجا داشبوردهای شما نمایش داده خواهند شد.
        </p>
      </main>
    </div>
  );
}
