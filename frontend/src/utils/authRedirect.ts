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

export const buildLoginRedirectUrl = (redirectPath: string): string => {
  const path = normalizeRedirectPath(redirectPath);
  return `/login?redirect=${encodeURIComponent(path)}`;
};

export const buildRegisterRedirectUrl = (redirectPath: string): string => {
  const path = normalizeRedirectPath(redirectPath);
  return `/register?redirect=${encodeURIComponent(path)}`;
};

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
