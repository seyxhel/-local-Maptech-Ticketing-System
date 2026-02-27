const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  access: string;
  refresh?: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    suffix?: string;
    phone?: string;
    is_active?: boolean;
    [key: string]: unknown;
  };
  redirect_path?: string;
}

export async function loginWithCredentials(creds: LoginCredentials): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: creds.email,
      password: creds.password,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Login failed');
  }
  return data as LoginResponse;
}

export async function fetchCurrentUser(accessToken: string): Promise<LoginResponse['user']> {
  const res = await fetch(`${API_BASE}/auth/me/`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to fetch user profile');
  }
  return data as LoginResponse['user'];
}

export async function refreshAccessToken(refreshToken: string): Promise<{ access: string }> {
  const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || 'Token refresh failed');
  }
  return data as { access: string };
}


