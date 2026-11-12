import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { Loading } from './Loading';

export function ProtectedRoute() {
  const { current, initialized } = useAppSelector((state) => state.user);

  if (!initialized) return <Loading />;

  return current ? <Outlet /> : <Navigate to="/login" replace />;
}
