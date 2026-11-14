import { Route, Routes, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { Layout } from './layout/Layout';
import { SectionLayout } from './layout/SectionLayout';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { clearUserError, fetchCurrentUser } from './store/reducers/userSlice';
import { clearChurchError } from './store/reducers/churchSlice';
import { lazy, Suspense, useEffect } from 'react';
import { Loading } from './components/Loading';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OnboardingLayout } from './layout/OnboardingLayout';

const MutationProgramPage = lazy(() => import('./pages/MutationProgramPage'));
const MutationSongPage = lazy(() => import('./pages/MutationSongPage'));
const SongDetailPage = lazy(() => import('./pages/SongDetailPage'));
const LiveModePage = lazy(() => import('./pages/LiveModePage'));
const SongsPage = lazy(() => import('./pages/SongsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const ConnectPage = lazy(() => import('./pages/ConnectPage'));

function App() {
  const mode = useAppSelector((state) => state.settings.mode);
  const error = useAppSelector((state) => state.user.error);
  const { error: churchError, inviteError } = useAppSelector(
    (state) => state.church,
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (!error) return;

    toast.error(error.messages.join('\n'));
    dispatch(clearUserError());
  }, [dispatch, error]);

  useEffect(() => {
    if (!churchError && !inviteError) return;

    if (churchError) toast.error(churchError);
    if (inviteError) toast.error(inviteError);
    dispatch(clearChurchError());
  }, [dispatch, churchError, inviteError]);

  useEffect(() => {
    if (mode === 'night') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [mode]);

  return (
    <>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="live-mode" element={<LiveModePage />} />
              <Route path="songs" element={<SongsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="song/:id" element={<SongDetailPage />} />
            </Route>
            <Route element={<OnboardingLayout />}>
              <Route path="welcome" element={<WelcomePage />} />
              <Route path="connect/:inviteToken" element={<ConnectPage />} />
            </Route>
            <Route element={<SectionLayout title="Новая программа" />}>
              <Route path="program/create" element={<MutationProgramPage />} />
            </Route>
            <Route element={<SectionLayout title="Редактирование" />}>
              <Route
                path="program/:id/edit"
                element={<MutationProgramPage />}
              />
              <Route path="song/:id/edit" element={<MutationSongPage />} />
            </Route>
            <Route element={<SectionLayout title="Создание хвалы" />}>
              <Route path="song/create" element={<MutationSongPage />} />
            </Route>
          </Route>
          <Route
            path="login"
            element={<AuthPage key="login" variant="login" />}
          />
          <Route
            path="register"
            element={<AuthPage key="register" variant="register" />}
          />
          <Route
            path="*"
            element={
              <div className="h-screen px-8 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center">
                  <img
                    src="/error-404.png"
                    alt="ошибка"
                    className="mx-auto mb-6 object-contain"
                  />
                  <h1 className="font-medium text-xl mb-4">
                    Страница не найдена
                  </h1>
                  <Button
                    className="active:scale-95 select-none text-white"
                    onClick={() => navigate('/')}
                    type="button"
                  >
                    Вернуться на главную
                  </Button>
                </div>
              </div>
            }
          />
        </Routes>
      </Suspense>
      <Toaster
        position="top-center"
        theme={mode === 'night' ? 'dark' : 'light'}
      />
    </>
  );
}

export default App;
