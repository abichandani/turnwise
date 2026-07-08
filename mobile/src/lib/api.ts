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

export async function callAction<T>(
  action: string,
  payload: Record<string, unknown> = {},
  token: string | null = null
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(API_BASE_URL as string, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, token, payload }),
    });
  } catch {
    throw new ApiError('NETWORK_ERROR', 'Some error occurred.');
  }

  let json: ApiEnvelope<T>;
  try {
    json = await response.json();
  } catch {
    throw new ApiError('UNKNOWN', 'Some error occurred.');
  }

  if (!json.ok) {
    throw new ApiError(json.error.code, json.error.message || 'Some error occurred.');
  }
  return json.data;
}
