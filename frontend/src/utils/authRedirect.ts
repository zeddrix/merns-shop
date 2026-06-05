export const normalizeRedirectPath = (path: string): string => {
  return path.startsWith('/') ? path : `/${path}`;
};

export const getRedirectPath = (search: string): string => {
  const redirect = new URLSearchParams(search).get('redirect');
  if (!redirect) {
    return '/';
  }

  return normalizeRedirectPath(redirect);
};

export { buildLoginRedirectUrl, buildRegisterRedirectUrl } from './authModalUrl';

export interface RegisterWelcomeLocationState {
  registerWelcome: string;
}

export const isRegisterWelcomeState = (state: unknown): state is RegisterWelcomeLocationState => {
  return (
    typeof state === 'object' &&
    state !== null &&
    'registerWelcome' in state &&
    typeof (state as RegisterWelcomeLocationState).registerWelcome === 'string' &&
    (state as RegisterWelcomeLocationState).registerWelcome.length > 0
  );
};
