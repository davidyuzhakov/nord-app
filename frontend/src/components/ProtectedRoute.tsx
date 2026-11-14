import { matchPath, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { Loading } from './Loading';

export function ProtectedRoute() {
  const { current, initialized } = useAppSelector((state) => state.user);
  const location = useLocation();

  if (!initialized) return <Loading />;

  if (!current) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  }

  const isOnboarding =
    location.pathname === '/welcome' ||
    matchPath('/connect/:inviteToken', location.pathname);

  if (!current.activeChurchId && !isOnboarding) {
    return <Navigate to="/welcome" replace />;
  }

  return <Outlet />;
}
