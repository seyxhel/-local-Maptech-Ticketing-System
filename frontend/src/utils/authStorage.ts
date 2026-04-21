const ACCESS_TOKEN_KEY = 'maptech_access';
const REFRESH_TOKEN_KEY = 'maptech_refresh';
const LEGACY_USER_KEY = 'maptech_user';

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function storeAccessToken(token: string, rememberInLocalStorage: boolean) {
  if (!token) return;

  if (rememberInLocalStorage) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } else {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export function replaceStoredAccessToken(token: string) {
  if (!token) return;

  const hasLocalToken = Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
  storeAccessToken(token, hasLocalToken);
}

export function clearLegacyAuthStorage() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(LEGACY_USER_KEY);
}

export function migrateLegacyAuthStorageToCookies() {
  // HttpOnly cookies cannot be written from JS; we only remove legacy storage.
  clearLegacyAuthStorage();
}
