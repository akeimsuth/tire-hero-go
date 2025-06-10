// src/middleware/AuthMiddleware.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

interface AuthMiddlewareProps {
  children: React.ReactNode;
}

const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  // 1) Paths that do NOT require authentication:
  const publicPaths = [
    '/', 
    '/login', 
    '/customer/register', 
    '/provider/register'
  ];

  // 2) For authenticated users, redirect them away from public pages:
  useEffect(() => {
    if (!isLoading && user && publicPaths.includes(location.pathname)) {
      switch (user.role) {
        case 'customer':
          navigate('/dashboard', { replace: true });
          return;
        case 'provider':
          navigate('/provider/dashboard', { replace: true });
          return;
        case 'admin':
          navigate('/admin', { replace: true });
          return;
        default:
          navigate('/dashboard', { replace: true });
          return;
      }
    }
  }, [user, isLoading, location.pathname, navigate]);

  // 3) Define which roles may access which "protected" routes:
  const roleAccessMap: { [pathPrefix: string]: string[] } = {
    '/dashboard': ['customer'],
    '/create-request': ['customer'],
    '/tracking': ['customer'],
    '/payment': ['customer'],
    '/provider': ['provider'], // any route that starts with "/provider"
    '/admin': ['admin'], // any route that starts with "/admin"
    '/bidding': ['customer', 'provider'], // Allow both customers and providers to access bidding
  };

  // 4) Enforce role-based access:
  useEffect(() => {
    if (isLoading) return;

    const pathname = location.pathname;

    // 4a) If user is NOT authenticated AND path is not public, send to /login
    if (!user && !publicPaths.includes(pathname)) {
      navigate('/login', { replace: true });
      return;
    }

    // 4b) If user IS authenticated, check if they are allowed here
    if (user) {
      // Check each prefix in roleAccessMap to see if pathname starts with it
      for (const [prefix, allowedRoles] of Object.entries(roleAccessMap)) {
        if (pathname === prefix || pathname.startsWith(prefix + '/')) {
          // This route is protected by role. If user's role not in allowedRoles, redirect
          if (!allowedRoles.includes(user.role)) {
            // Send them to their own "home" based on their role
            switch (user.role) {
              case 'customer':
                navigate('/dashboard', { replace: true });
                return;
              case 'provider':
                navigate('/provider/dashboard', { replace: true });
                return;
              case 'admin':
                navigate('/admin', { replace: true });
                return;
              default:
                navigate('/dashboard', { replace: true });
                return;
            }
          }
          // If their role IS allowed, simply let them stay
          return;
        }
      }
    }
  }, [user, isLoading, location.pathname, navigate]);

  // 5) While loading auth state, show a spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 6) Otherwise, render children (the rest of the app/routes)
  return <>{children}</>;
};

export default AuthMiddleware;
