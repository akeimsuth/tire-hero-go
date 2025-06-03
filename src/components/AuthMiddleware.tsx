// src/middleware/AuthMiddleware.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AuthMiddlewareProps {
  children: React.ReactNode;
}

const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
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
  //    e.g. if a logged-in customer tries to go to '/login', send them to '/dashboard'.
  //    That logic is unchanged, just spelled out here for clarity.
  useEffect(() => {
    if (!isLoading && user && publicPaths.includes(location.pathname)) {
      switch (user.accountType) {
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

  // 3) Define which roles may access which “protected” routes.
  //    You can use exact matches or `startsWith` for nested routes:
  const roleAccessMap: { [pathPrefix: string]: string[] } = {
    '/dashboard':       ['customer'], 
    '/provider':        ['provider'], // any route that starts with "/provider"
    '/admin':           ['admin'],    // any route that starts with "/admin"
    // Add more if you have subpages, e.g. "/store" → ['customer']
  };

  // 4) Enforce:
  //    - If not logged in and path is not public → redirect to '/login'
  //    - If logged in but role is not allowed on this path → redirect to home
  useEffect(() => {
    if (isLoading) return;

    const pathname = location.pathname;

    // 4a) If user is NOT authenticated AND path is not public, send to /login
    if (!user && !publicPaths.includes(pathname)) {
      navigate('/login', { replace: true });
      return;
    }

    // 4b) If user IS authenticated, check if they are allowed here.
    if (user) {
      // Check each prefix in roleAccessMap to see if pathname starts with it
      for (const [prefix, allowedRoles] of Object.entries(roleAccessMap)) {
        if (pathname === prefix || pathname.startsWith(prefix + '/')) {
          // This route is protected by role. If user's role not in allowedRoles, redirect.
          if (!allowedRoles.includes(user.accountType)) {
            // Send them to their own “home” based on their accountType:
            switch (user.accountType) {
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
          // If their role IS allowed, simply let them stay.
          return;
        }
      }
      // If we reach here, the path did not match any protected prefix.
      // It must be a public path (handled above) or some other page that’s fine for everyone.
    }
  }, [user, isLoading, location.pathname, navigate]);

  // 5) While loading auth state, show a spinner:
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
