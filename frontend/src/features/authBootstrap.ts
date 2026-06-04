import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { loadUserFromSession } from './userSlice';

/** Restores session from httpOnly auth cookie on app load. */
export function useAuthBootstrap(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(loadUserFromSession());
  }, [dispatch]);
}
