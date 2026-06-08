import { SLOW_SERVER_SESSION_WARMED_KEY } from '../constants/slowServerNotice';

export const isSlowServerSessionWarmed = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return sessionStorage.getItem(SLOW_SERVER_SESSION_WARMED_KEY) === '1';
};

export const markSlowServerSessionWarmed = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.setItem(SLOW_SERVER_SESSION_WARMED_KEY, '1');
};

export const clearSlowServerSessionWarmed = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.removeItem(SLOW_SERVER_SESSION_WARMED_KEY);
};
