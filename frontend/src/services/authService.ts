import { API_BASE, authHeaders } from './api'

export async function checkUnique(field: 'email' | 'username' | 'phone', value: string): Promise<boolean | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/check_unique/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, value }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.exists as boolean
  } catch (err) {
    console.error('checkUnique error', err)
    return null
  }
}

export async function login(payload: { username: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export async function getCurrentUser() {
  const res = await fetch(`${API_BASE}/auth/me/`, { headers: authHeaders() })
  return res.json()
}

export async function updateProfile(payload: Record<string, any>) {
  const res = await fetch(`${API_BASE}/auth/update_profile/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export async function changePassword(payload: { current_password?: string; new_password: string }) {
  const res = await fetch(`${API_BASE}/auth/change_password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  return { ok: res.ok, data: await res.json() }
}

export async function sendPasswordReset(email: string) {
  const res = await fetch(`${API_BASE}/auth/password-reset/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  return res.json()
}

/** Refresh the access token using a refresh token */
export async function refreshToken(refresh: string) {
  const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
  return res.json()
}

/** Confirm a password reset with uid, token, and new_password */
export async function resetPasswordConfirm(uid: string, token: string, new_password: string) {
  const res = await fetch(`${API_BASE}/auth/password-reset-confirm/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, token, new_password }),
  })
  return { ok: res.ok, data: await res.json() }
}
