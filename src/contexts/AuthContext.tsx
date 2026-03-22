import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, apiUrl, getToken, setToken } from "@/lib/api";

async function readFetchJson<T extends { error?: string }>(r: Response): Promise<T> {
  const raw = await r.text();
  if (!raw) return {} as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return { error: raw.length < 160 ? raw : "Réponse invalide du serveur" } as T;
  }
}

function messageFromAuthFailure(status: number, body: { error?: string }): string {
  if (status === 429) return "Trop de tentatives. Réessayez dans quelques minutes.";
  if (status === 409) return "Cet e-mail est déjà utilisé.";
  if (status === 401) return body.error ?? "E-mail ou mot de passe incorrect.";
  if (status === 400) return body.error ?? "Données invalides. Vérifiez les champs.";
  if (status === 502 || status === 503 || status === 504) {
    return import.meta.env.DEV
      ? "Le serveur API ne répond pas (proxy ou backend arrêté). Lancez l’API dans le dossier server (npm run dev) et gardez VITE_API_URL vide pour utiliser le proxy /api."
      : "Service temporairement indisponible. Réessayez dans quelques minutes.";
  }
  if (status >= 500) {
    if (body.error) return body.error;
    return "Service temporairement indisponible. Réessayez dans quelques minutes.";
  }
  return body.error ?? `Erreur ${status}`;
}

function networkAuthMessage(): string {
  return import.meta.env.DEV
    ? "Impossible de joindre le serveur. Démarrez l’API (dossier server, npm run dev) sur le port attendu par le proxy Vite, ou vérifiez VITE_API_URL."
    : "Connexion impossible. Vérifiez votre réseau ou réessayez plus tard.";
}

export type UserRole = "client" | "admin";

export type User = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  created_at?: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (payload: { name?: string; email?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const t = getToken();
    if (!t) {
      setUser(null);
      return;
    }
    const r = await fetch(apiUrl("/api/auth/me"), {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (!r.ok) {
      setToken(null);
      setUser(null);
      return;
    }
    const u = (await r.json()) as User;
    setUser(u);
  }, []);

  const updateProfile = useCallback(async (payload: { name?: string; email?: string }) => {
    let r: Response;
    try {
      r = await apiFetch("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error(networkAuthMessage());
    }
    const data = await readFetchJson<{ error?: string; token?: string; user?: User }>(r);
    if (!r.ok) throw new Error(messageFromAuthFailure(r.status, data));
    if (data.token) setToken(data.token);
    if (data.user) setUser(data.user);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    let r: Response;
    try {
      r = await apiFetch("/api/auth/me/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    } catch {
      throw new Error(networkAuthMessage());
    }
    const data = await readFetchJson<{ error?: string }>(r);
    if (!r.ok) throw new Error(messageFromAuthFailure(r.status, data));
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    let r: Response;
    try {
      r = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error(networkAuthMessage());
    }
    const data = await readFetchJson<{ error?: string; token?: string; user?: User }>(r);
    if (!r.ok) throw new Error(messageFromAuthFailure(r.status, data));
    if (data.token) setToken(data.token);
    if (data.user) setUser(data.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    let r: Response;
    try {
      r = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
    } catch {
      throw new Error(networkAuthMessage());
    }
    const data = await readFetchJson<{ error?: string; token?: string; user?: User }>(r);
    if (!r.ok) throw new Error(messageFromAuthFailure(r.status, data));
    if (data.token) setToken(data.token);
    if (data.user) setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      updateProfile,
      changePassword,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, updateProfile, changePassword, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
