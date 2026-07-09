export type PublicUser = {
  roomNumber: string;
  name: string;
  isAdmin: boolean;
  mustChangePassword: boolean;
  isAway: boolean;
  awayDelegateRoom: string | null;
};

export type AuthResult = {
  token: string;
  user: PublicUser;
};

export class ApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const REQUEST_TIMEOUT_MS = 15000;
const AUTH_ERROR_CODES = new Set(['TOKEN_EXPIRED', 'TOKEN_INVALID']);

// Set by AuthProvider so any call site that hits an expired/invalid token — not just the
// initial bootstrap check — triggers a sign-out instead of leaving stale "signed in" state.
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export async function callAction<T>(
  action: string,
  payload: Record<string, unknown> = {},
  token: string | null = null
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError('MISSING_CONFIG', 'Some error occurred.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, token, payload }),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError('NETWORK_ERROR', 'Some error occurred.');
  } finally {
    clearTimeout(timeoutId);
  }

  let json: ApiEnvelope<T>;
  try {
    json = await response.json();
  } catch {
    throw new ApiError('UNKNOWN', 'Some error occurred.');
  }

  if (!json.ok) {
    if (token && AUTH_ERROR_CODES.has(json.error.code)) {
      onUnauthorized?.();
    }
    throw new ApiError(json.error.code, json.error.message || 'Some error occurred.');
  }
  return json.data;
}
