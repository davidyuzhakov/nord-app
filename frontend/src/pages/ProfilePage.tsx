import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/store/reducers/userSlice';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  return (
    <div>
      <Button onClick={() => dispatch(logoutUser())}>Logout</Button>
    </div>
  );
}
