/// <reference types="react/canary" />
"use client";

import React from "react";

// Helper type to extract the parameters excluding the first one (auth)
type ExcludeFirstParameter<T extends (...args: any[]) => any> = T extends (
  first: any,
  ...rest: infer R
) => any
  ? (...args: R) => ReturnType<T>
  : never;

// Helper type to transform all server actions to client actions
type TransformServerActions<T extends Record<string, Function>> = {
  [K in keyof T]: ExcludeFirstParameter<T[K]>;
};

// Type for the auth context
type AuthContext = {
  auth: { accessToken: string } | null;
  getFreshAccessToken: () => Promise<{ access_token: string }>;
};

export function createNestAPI<
  T extends Record<
    string,
    (auth: { access_token: string }, ...args: any[]) => any
  >
>(serverActions: T) {
  // Create a new context with the transformed server actions
  const NestContext = React.createContext<TransformServerActions<T> | null>(
    null
  );

  // Create the provider component
  function NestProvider({
    children,
    useAuth,
  }: {
    children: React.ReactNode;
    useAuth: () => AuthContext;
  }) {
    const authContext = useAuth();

    // Transform server actions to inject auth
    const transformedActions = React.useMemo(() => {
      const actions: Record<string, Function> = {};

      for (const [key, serverAction] of Object.entries(serverActions)) {
        actions[key] = async (...args: any[]) => {
          if (!authContext.auth) {
            return null;
          }
          return serverAction(await authContext.getFreshAccessToken(), ...args);
        };
      }

      return actions as TransformServerActions<T>;
    }, [authContext]);

    return (
      <NestContext.Provider value={transformedActions}>
        {children}
      </NestContext.Provider>
    );
  }

  // Create a custom hook to use the context
  function useNest() {
    const context = React.useContext(NestContext);
    if (context === null) {
      throw new Error("useNest must be used within a NestProvider");
    }
    return context;
  }

  return {
    Provider: NestProvider,
    useNest,
  };
}
