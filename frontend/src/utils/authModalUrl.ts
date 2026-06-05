import { normalizeRedirectPath } from './authRedirect';

export type AuthModalMode = 'login' | 'register';

export const AUTH_QUERY_KEY = 'auth';
export const REDIRECT_QUERY_KEY = 'redirect';

export const parseAuthModalSearch = (
  search: string
): { mode: AuthModalMode | null; redirect: string } => {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const auth = params.get(AUTH_QUERY_KEY);
  const redirect = params.get(REDIRECT_QUERY_KEY);
  const mode = auth === 'login' || auth === 'register' ? auth : null;

  return {
    mode,
    redirect: redirect ? normalizeRedirectPath(redirect) : '/'
  };
};

export const stripAuthSearch = (search: string): string => {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  params.delete(AUTH_QUERY_KEY);
  params.delete(REDIRECT_QUERY_KEY);
  const value = params.toString();
  return value ? `?${value}` : '';
};

export const buildAuthSearch = (
  mode: AuthModalMode,
  redirectPath?: string,
  existingSearch = ''
): string => {
  const params = new URLSearchParams(
    existingSearch.startsWith('?') ? existingSearch.slice(1) : existingSearch
  );
  params.set(AUTH_QUERY_KEY, mode);
  if (redirectPath && redirectPath !== '/') {
    params.set(REDIRECT_QUERY_KEY, normalizeRedirectPath(redirectPath));
  } else {
    params.delete(REDIRECT_QUERY_KEY);
  }
  const value = params.toString();
  return value ? `?${value}` : '';
};

export const buildAuthUrl = (
  pathname: string,
  mode: AuthModalMode,
  redirectPath?: string,
  existingSearch = ''
): string => {
  const cleanSearch = stripAuthSearch(existingSearch);
  const authSearch = buildAuthSearch(mode, redirectPath, cleanSearch);
  return `${pathname}${authSearch}`;
};

export const buildLoginRedirectUrl = (redirectPath: string, pathname = '/'): string => {
  return buildAuthUrl(pathname, 'login', redirectPath);
};

export const buildRegisterRedirectUrl = (redirectPath: string, pathname = '/'): string => {
  return buildAuthUrl(pathname, 'register', redirectPath);
};

export const getAuthRedirectTarget = (pathname: string, search: string): string => {
  const { redirect } = parseAuthModalSearch(search);
  if (redirect !== '/') {
    return redirect;
  }
  return pathname;
};

/** Catalog/filter query string with auth modal params removed. */
export const getCatalogSearchString = (search: string): string => {
  return stripAuthSearch(search).replace(/^\?/, '');
};
