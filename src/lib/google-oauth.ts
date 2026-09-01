import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const PREF_TOKENS = 'zue.googleOAuthTokens';
const OAUTH_MESSAGE = 'zue-google-oauth';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const APP_DEEP_LINK = 'br.com.zue.vitrine://oauth';

export interface GoogleOAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope?: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  token_type: string;
}

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export function getGoogleClientId(): string | null {
  const id = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID?.trim();
  return id || null;
}

export function isGoogleDriveConfigured(): boolean {
  return Boolean(getGoogleClientId());
}

/** Redirect URI registrado no Google Cloud (web ou Pages para o deep link nativo). */
export function getOAuthRedirectUri(): string {
  const override = import.meta.env.VITE_GOOGLE_OAUTH_REDIRECT_URI?.trim();
  if (override) return override;

  if (isNative()) {
    // Página HTTPS intermediária (ex.: GitHub Pages) que redireciona ao deep link.
    return (
      import.meta.env.VITE_GOOGLE_OAUTH_NATIVE_REDIRECT_URI?.trim() ||
      'https://guilhermeroesler.github.io/Zue/oauth-callback.html'
    );
  }

  return `${window.location.origin}/oauth-callback.html`;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomString(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

async function sha256Base64Url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toBase64Url(new Uint8Array(digest));
}

async function saveTokens(tokens: GoogleOAuthTokens): Promise<void> {
  await Preferences.set({ key: PREF_TOKENS, value: JSON.stringify(tokens) });
}

export async function loadGoogleTokens(): Promise<GoogleOAuthTokens | null> {
  const { value } = await Preferences.get({ key: PREF_TOKENS });
  if (!value) return null;
  try {
    return JSON.parse(value) as GoogleOAuthTokens;
  } catch {
    return null;
  }
}

export async function clearGoogleTokens(): Promise<void> {
  await Preferences.remove({ key: PREF_TOKENS });
}

export async function isGoogleSignedIn(): Promise<boolean> {
  const tokens = await loadGoogleTokens();
  return Boolean(tokens?.accessToken || tokens?.refreshToken);
}

async function refreshAccessToken(
  refreshToken: string,
  clientId: string
): Promise<GoogleOAuthTokens> {
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha ao renovar sessão Google (${res.status}): ${text}`);
  }

  const data = (await res.json()) as TokenResponse;
  const next: GoogleOAuthTokens = {
    accessToken: data.access_token,
    refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  };
  await saveTokens(next);
  return next;
}

async function exchangeCode(
  code: string,
  codeVerifier: string,
  redirectUri: string,
  clientId: string
): Promise<GoogleOAuthTokens> {
  const body = new URLSearchParams({
    client_id: clientId,
    code,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha na autenticação Google (${res.status}): ${text}`);
  }

  const data = (await res.json()) as TokenResponse;
  const prev = await loadGoogleTokens();
  const next: GoogleOAuthTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? prev?.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  };
  await saveTokens(next);
  return next;
}

function parseOAuthCallbackUrl(url: string): {
  code?: string | null;
  error?: string | null;
  state?: string | null;
} {
  try {
    const parsed = new URL(url);
    const params = parsed.searchParams;
    const hash = new URLSearchParams(parsed.hash.replace(/^#/, ''));
    return {
      code: params.get('code') ?? hash.get('code'),
      error: params.get('error') ?? hash.get('error'),
      state: params.get('state') ?? hash.get('state'),
    };
  } catch {
    return {};
  }
}

async function waitForOAuthRedirect(
  expectedState: string,
  timeoutMs = 5 * 60 * 1000
): Promise<{ code: string }> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('Tempo esgotado na autenticação Google.'));
    }, timeoutMs);

    const finish = (result: { code: string } | Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (result instanceof Error) reject(result);
      else resolve(result);
    };

    const handlePayload = (payload: {
      code?: string | null;
      error?: string | null;
      state?: string | null;
    }) => {
      if (payload.state && payload.state !== expectedState) return;
      if (payload.error) {
        finish(new Error(`Google OAuth: ${payload.error}`));
        return;
      }
      if (payload.code) {
        finish({ code: payload.code });
      }
    };

    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string } | null;
      if (!data || data.type !== OAUTH_MESSAGE) return;
      handlePayload(data as {
        code?: string | null;
        error?: string | null;
        state?: string | null;
      });
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'zue.googleOAuthResult' || !event.newValue) return;
      try {
        handlePayload(JSON.parse(event.newValue));
      } catch {
        /* ignore */
      }
    };

    let appListener: { remove: () => Promise<void> } | null = null;
    let browserListener: { remove: () => Promise<void> } | null = null;

    const cleanup = () => {
      window.clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      window.removeEventListener('storage', onStorage);
      void appListener?.remove();
      void browserListener?.remove();
      if (isNative()) {
        void Browser.close().catch(() => undefined);
      }
    };

    window.addEventListener('message', onMessage);
    window.addEventListener('storage', onStorage);

    if (isNative()) {
      void App.addListener('appUrlOpen', (event) => {
        if (!event.url.startsWith(APP_DEEP_LINK) && !event.url.includes('oauth')) {
          return;
        }
        handlePayload(parseOAuthCallbackUrl(event.url));
      }).then((handle) => {
        appListener = handle;
      });

      void Browser.addListener('browserFinished', () => {
        try {
          const raw = localStorage.getItem('zue.googleOAuthResult');
          if (raw) handlePayload(JSON.parse(raw));
        } catch {
          /* ignore */
        }
      }).then((handle) => {
        browserListener = handle;
      });
    }
  });
}

/**
 * Abre o consentimento Google (Drive readonly) e persiste tokens.
 * Requer VITE_GOOGLE_OAUTH_CLIENT_ID (tipo Web) e redirect URIs no Cloud Console.
 */
export async function signInWithGoogle(): Promise<GoogleOAuthTokens> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error(
      'Google Drive não configurado. Defina VITE_GOOGLE_OAUTH_CLIENT_ID.'
    );
  }

  const redirectUri = getOAuthRedirectUri();
  const state = randomString(16);
  const codeVerifier = randomString(32);
  const codeChallenge = await sha256Base64Url(codeVerifier);

  try {
    sessionStorage.setItem(
      'zue.googleOAuthPending',
      JSON.stringify({ state, codeVerifier, redirectUri })
    );
  } catch {
    /* ignore */
  }

  const authUrl = new URL(AUTH_ENDPOINT);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', DRIVE_SCOPE);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('include_granted_scopes', 'true');

  const waitPromise = waitForOAuthRedirect(state);

  if (isNative()) {
    await Browser.open({ url: authUrl.toString(), presentationStyle: 'popover' });
  } else {
    const popup = window.open(
      authUrl.toString(),
      'zue-google-oauth',
      'width=480,height=720'
    );
    if (!popup) {
      window.location.assign(authUrl.toString());
      throw new Error('Redirecionando para o Google…');
    }
  }

  const { code } = await waitPromise;
  try {
    localStorage.removeItem('zue.googleOAuthResult');
    sessionStorage.removeItem('zue.googleOAuthPending');
  } catch {
    /* ignore */
  }

  return exchangeCode(code, codeVerifier, redirectUri, clientId);
}

/** Access token válido (renova com refresh_token se necessário). */
export async function getValidAccessToken(): Promise<string> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error(
      'Google Drive não configurado. Defina VITE_GOOGLE_OAUTH_CLIENT_ID.'
    );
  }

  let tokens = await loadGoogleTokens();
  if (!tokens) {
    throw new Error('Conta Google não conectada.');
  }

  const skewMs = 60_000;
  if (tokens.expiresAt - skewMs > Date.now() && tokens.accessToken) {
    return tokens.accessToken;
  }

  if (!tokens.refreshToken) {
    throw new Error('Sessão Google expirada. Conecte novamente.');
  }

  tokens = await refreshAccessToken(tokens.refreshToken, clientId);
  return tokens.accessToken;
}

export async function signOutGoogle(): Promise<void> {
  await clearGoogleTokens();
}

/**
 * Completa OAuth após redirect na mesma aba (popup bloqueado / callback HTML).
 * Retorna tokens se havia um resultado pendente; senão null.
 */
export async function completePendingGoogleOAuth(): Promise<GoogleOAuthTokens | null> {
  const clientId = getGoogleClientId();
  if (!clientId) return null;

  let resultRaw: string | null = null;
  let pendingRaw: string | null = null;
  try {
    resultRaw = localStorage.getItem('zue.googleOAuthResult');
    pendingRaw = sessionStorage.getItem('zue.googleOAuthPending');
  } catch {
    return null;
  }
  if (!resultRaw || !pendingRaw) return null;

  try {
    const result = JSON.parse(resultRaw) as {
      code?: string | null;
      error?: string | null;
      state?: string | null;
    };
    const pending = JSON.parse(pendingRaw) as {
      state: string;
      codeVerifier: string;
      redirectUri: string;
    };

    localStorage.removeItem('zue.googleOAuthResult');
    sessionStorage.removeItem('zue.googleOAuthPending');

    if (result.error) {
      throw new Error(`Google OAuth: ${result.error}`);
    }
    if (!result.code || result.state !== pending.state) {
      return null;
    }

    return exchangeCode(
      result.code,
      pending.codeVerifier,
      pending.redirectUri,
      clientId
    );
  } catch (error) {
    console.warn('[google-oauth] completePending:', error);
    throw error;
  }
}
