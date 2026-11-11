import * as React from "react";
import {
  DataProvider,
  GlobalActionsProvider,
} from "@plasmicapp/loader-nextjs";
import type { Session } from "@supabase/supabase-js";

import { createClient } from "../lib/supabase/client";

export function SupabaseAuthProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const supabase = React.useMemo(() => createClient(), []);

  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loginErrorCode, setLoginErrorCode] =
    React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const login = React.useCallback(
    async (
      email: string,
      password: string,
      returnTo?: string
    ) => {
      setLoginErrorCode(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoginErrorCode(error.code ?? "unknown");
        return null;
      }

      if (
        returnTo &&
        returnTo.startsWith("/") &&
        !returnTo.startsWith("//")
      ) {
        window.location.assign(returnTo);
      }

      return data;
    },
    [supabase]
  );

  const logout = React.useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }, [supabase]);

  const clearLoginError = React.useCallback(() => {
    setLoginErrorCode(null);
  }, []);

  const authData = React.useMemo(
    () => ({
      isAuthenticated: !!session?.user,
      isLoading,
      user: session?.user ?? null,
      accessToken: session?.access_token ?? null,
      loginErrorCode,
    }),
    [session, isLoading, loginErrorCode]
  );

  const actions = React.useMemo(
    () => ({
      login,
      logout,
      clearLoginError,
    }),
    [login, logout, clearLoginError]
  );

  return (
    <GlobalActionsProvider
      contextName="SupabaseAuthProvider"
      actions={actions}
    >
      <DataProvider name="auth" data={authData}>
        {children}
      </DataProvider>
    </GlobalActionsProvider>
  );
}