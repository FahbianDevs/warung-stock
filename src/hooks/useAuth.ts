import { useEffect, useState } from "react";
import { me } from "@/src/services/auth/authApi";
import { getSession, subscribeSession, type AuthUser } from "@/src/services/auth/session";

type AuthState = {
  isSignedIn: boolean;
  user: AuthUser | null;
  token: string | null;
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isSignedIn: false,
    user: null,
    token: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const session = await getSession();
        if (!session) {
          if (!cancelled) {
            setAuthState({ isSignedIn: false, user: null, token: null });
          }
          return;
        }

        // Optimistic: session exists => signed in; validate token if possible.
        if (!cancelled) {
          setAuthState({ isSignedIn: true, user: session.user, token: session.token });
        }

        const validatedUser = await me(session.token);
        if (!cancelled && validatedUser) {
          setAuthState({ isSignedIn: true, user: validatedUser, token: session.token });
        }
      } catch {
        if (!cancelled) {
          setAuthState({ isSignedIn: false, user: null, token: null });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    const unsubscribe = subscribeSession(() => {
      // Re-bootstrap when session changes (login/logout).
      setIsLoading(true);
      bootstrap();
    });

    bootstrap();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return { authState, isLoading };
};
