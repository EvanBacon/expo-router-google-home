'use client';

import React from 'react';

export const GoogleAuthContext = React.createContext<{
  accessToken: string | null;
  setAccessToken: (accessToken: string) => void;
  clearAccessToken: () => void;
} | null>(null);

export function GoogleAuthProvider({
  children,
  cacheKey,
}: {
  children: React.ReactNode;
  cacheKey: string;
}) {
  const [accessToken, setAccessToken] = React.useState<string | null>(
    localStorage.getItem(cacheKey)
  );

  const clearAccessToken = () => {
    setAccessToken(null);
    localStorage.removeItem(cacheKey);
  };

  return (
    <GoogleAuthContext
      value={{
        accessToken,
        setAccessToken(token) {
          setAccessToken(token);
          localStorage.setItem(cacheKey, token);
        },
        clearAccessToken,
      }}>
      {children}
    </GoogleAuthContext>
  );
}
