"use client";

import "@/lib/local-storage";

import React, { use } from "react";

import {
  NestCodeExchangeResponse,
  NestCodeExchangeResponseSchema,
} from "./nest-validation";
import * as WebBrowser from "expo-web-browser";
import {
  exchangeAuthCodeAsync,
  refreshTokenAsync,
} from "./auth-server-actions";
import { useNestAuthRequest } from "./nest-auth-session-provider";
import { AuthRequestConfig } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export const NestAuthContext = React.createContext<{
  accessToken: string | null;
  auth: NestCodeExchangeResponse | null;
  setAccessToken: (access: NestCodeExchangeResponse) => void;
  clearAccessToken: () => void;
  getFreshAccessToken: () => Promise<NestCodeExchangeResponse>;
  exchangeAuthCodeAsync: (props: {
    code: string;
    codeVerifier: string;
  }) => Promise<any>;
  useNestAuthRequest: (
    config?: Partial<AuthRequestConfig>
  ) => ReturnType<typeof useNestAuthRequest>;
} | null>(null);

export function useNestAuth() {
  const ctx = use(NestAuthContext);
  if (!ctx) {
    throw new Error("NestAuthContext is null");
  }
  return ctx;
}

export function NestClientAuthProvider({
  config,
  children,
  cacheKey = "nest-access-token",
}: {
  config: AuthRequestConfig;
  children: React.ReactNode;
  cacheKey?: string;
}) {
  const [accessObjectString, setAccessToken] = React.useState<string | null>(
    localStorage.getItem(cacheKey)
  );

  const accessObject = React.useMemo(() => {
    if (!accessObjectString) {
      return null;
    }
    try {
      const obj = JSON.parse(accessObjectString);
      return NestCodeExchangeResponseSchema.parse(obj);
    } catch (error) {
      console.error("Failed to parse Nest access token", error);
      localStorage.removeItem(cacheKey);
      return null;
    }
  }, [accessObjectString]);

  const storeAccessToken = (token: NestCodeExchangeResponse) => {
    const str = JSON.stringify(token);
    setAccessToken(str);
    localStorage.setItem(cacheKey, str);
  };

  const exchangeAuthCodeAndCacheAsync = async (props: {
    code: string;
    codeVerifier: string;
  }) => {
    const res = await exchangeAuthCodeAsync({
      code: props.code,
      codeVerifier: props.codeVerifier,
      redirectUri: config.redirectUri,
    });
    storeAccessToken(res);
    return res;
  };

  return (
    <NestAuthContext.Provider
      value={{
        useNestAuthRequest: (innerConfig) =>
          useNestAuthRequest(
            { exchangeAuthCodeAsync: exchangeAuthCodeAndCacheAsync },
            {
              ...config,
              ...innerConfig,
            }
          ),
        exchangeAuthCodeAsync: exchangeAuthCodeAndCacheAsync,
        async getFreshAccessToken() {
          if (!accessObject) {
            throw new Error("Cannot refresh token without an access object");
          }
          if (accessObject.expires_in >= Date.now()) {
            console.log(
              "[SPOTIFY]: Token still valid. Refreshing in: ",
              accessObject.expires_in - Date.now()
            );
            return accessObject;
          }
          if (!accessObject.refresh_token) {
            throw new Error(
              "Cannot refresh access because the access object does not contain a refresh token"
            );
          }

          console.log(
            "[SPOTIFY]: Token expired. Refreshing:",
            accessObject.refresh_token
          );
          const nextAccessObject = await refreshTokenAsync(
            accessObject.refresh_token
          );
          storeAccessToken(nextAccessObject);
          return nextAccessObject;
        },
        accessToken: accessObject?.access_token ?? null,
        auth: accessObject ?? null,
        setAccessToken: storeAccessToken,
        clearAccessToken() {
          setAccessToken(null);
          localStorage.removeItem(cacheKey);
        },
      }}
    >
      {children}
    </NestAuthContext.Provider>
  );
}
