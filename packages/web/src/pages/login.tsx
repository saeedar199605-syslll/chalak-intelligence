import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(emailOrUsername, password, rememberMe);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-8">
        {/* Company name */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-text-primary">اصفهان چالاک</h1>
          <p className="mt-2 text-sm text-text-secondary">Chalak Intelligence Platform</p>
        </div>

        {/* Login card — soft depth, subtle transparency */}
        <div
          className="space-y-8 rounded-2xl bg-surface p-10 shadow-elevated"
          style={{ backdropFilter: 'blur(10px)' }}
        >
          <div className="space-y-1">
            <h2 className="text-xl font-medium text-text-primary">خوش آمدید</h2>
            <p className="text-sm text-text-secondary">برای ادامه وارد حساب کاربری خود شوید.</p>
          </div>

          {error && (
            <div
              className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="emailOrUsername" className="block text-sm font-medium text-text-primary">
                ایمیل یا نام کاربری
              </label>
              <input
                id="emailOrUsername"
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="name@asfahan-chalak.com"
                required
                autoComplete="username"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                کلمه عبور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 pr-12 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  tabIndex={0}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-text-tertiary hover:text-text-secondary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-text-primary">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span>به یاد بیاور</span>
              </label>
              <button
                type="button"
                className="text-sm text-primary hover:text-primary-hover"
                onClick={() => { /* Forgot password flow — architecture only */ }}
              >
                فراموشی کلمه عبور؟
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-contrast transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>در حال ورود...</span>
                </div>
              ) : (
                'ورود'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-tertiary">
          © {new Date().getFullYear()} اصفهان چالاک. تمامی حقوق محفظه است.
        </p>
      </div>
    </div>
  );
}
