const SESSION_KEY = "gmck_admin_session";
const CREDS_KEY = "gmck_admin_credentials";

export interface AdminSession {
  loggedIn: boolean;
  timestamp: number;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminSession;
  } catch {
    return null;
  }
}

export function isAdminLoggedIn(): boolean {
  const session = getAdminSession();
  return session?.loggedIn === true;
}

export function setAdminSession(): void {
  const session: AdminSession = { loggedIn: true, timestamp: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAdminSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getAdminCredentials(): AdminCredentials {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    if (!raw) return { username: "admin", password: "admin123" };
    return JSON.parse(raw) as AdminCredentials;
  } catch {
    return { username: "admin", password: "admin123" };
  }
}

export function setAdminCredentials(creds: AdminCredentials): void {
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
}
