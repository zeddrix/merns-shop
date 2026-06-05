import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { rehydrateCart } from './cartSlice';

export const useCartBootstrap = (): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(rehydrateCart());
  }, [dispatch]);
};
