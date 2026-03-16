const ACCESS_TOKEN_KEY = 'maptech_access';
const REFRESH_TOKEN_KEY = 'maptech_refresh';
const LEGACY_USER_KEY = 'maptech_user';

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
