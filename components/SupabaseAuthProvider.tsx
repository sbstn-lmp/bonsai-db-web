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
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
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

  const authData = React.useMemo(
    () => ({
      isAuthenticated: !!session?.user,
      isLoading,
      user: session?.user ?? null,
      accessToken: session?.access_token ?? null,
    }),
    [session, isLoading]
  );

  const actions = React.useMemo(
    () => ({
      login,
      logout,
    }),
    [login, logout]
  );

  return (
    <GlobalActionsProvider contextName="auth" actions={actions}>
      <DataProvider name="auth" data={authData}>
        {children}
      </DataProvider>
    </GlobalActionsProvider>
  );
}