import { ReactNode, useEffect } from 'react';
import { useLocation, Route } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

interface AdminRouteProps {
  path: string;
  component: React.ComponentType;
}

// کامپوننت برای مسیرهای محافظت شده (نیاز به ورود به سیستم)
export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && location.startsWith(path)) {
      // اگر کاربر وارد سیستم نشده باشد، او را به صفحه ورود هدایت می‌کنیم
      setLocation(`/auth?redirect=${encodeURIComponent(location)}`);
    }
  }, [isAuthenticated, isLoading, location, path, setLocation]);

  return (
    <Route
      path={path}
      component={() => {
        // نمایش لودینگ در حال بارگذاری
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full border-primary border-t-transparent h-8 w-8 border-3" />
            </div>
          );
        }

        // اگر کاربر وارد سیستم شده باشد، کامپوننت را نمایش می‌دهیم
        return isAuthenticated ? <Component /> : null;
      }}
    />
  );
}

// کامپوننت برای مسیرهای مدیریت (نیاز به دسترسی ادمین)
export function AdminRoute({ path, component: Component }: AdminRouteProps) {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && location.startsWith(path)) {
      // اگر کاربر وارد سیستم نشده باشد، او را به صفحه ورود هدایت می‌کنیم
      setLocation(`/auth?redirect=${encodeURIComponent(location)}`);
    } else if (!isLoading && isAuthenticated && !isAdmin && location.startsWith(path)) {
      // اگر کاربر وارد سیستم شده باشد اما ادمین نباشد، او را به صفحه اصلی هدایت می‌کنیم
      setLocation('/');
    }
  }, [isAuthenticated, isAdmin, isLoading, location, path, setLocation]);

  return (
    <Route
      path={path}
      component={() => {
        // نمایش لودینگ در حال بارگذاری
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full border-primary border-t-transparent h-8 w-8 border-3" />
            </div>
          );
        }

        // اگر کاربر ادمین باشد، کامپوننت را نمایش می‌دهیم
        return isAuthenticated && isAdmin ? <Component /> : null;
      }}
    />
  );
}