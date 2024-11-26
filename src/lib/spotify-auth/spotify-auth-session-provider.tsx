"use client";

import {
  AuthRequest,
  AuthRequestConfig,
  AuthRequestPromptOptions,
  AuthSessionResult,
  useAuthRequest,
} from "expo-auth-session";
import { SpotifyCodeExchangeResponse } from "./spotify-validation";
import { discovery } from "./discovery";

export function useSpotifyAuthRequest(
  {
    exchangeAuthCodeAsync,
  }: {
    exchangeAuthCodeAsync: (
      code: string
    ) => Promise<SpotifyCodeExchangeResponse>;
  },
  config: AuthRequestConfig
): [
  AuthRequest | null,
  AuthSessionResult | null,
  (
    options?: AuthRequestPromptOptions
  ) => Promise<SpotifyCodeExchangeResponse | AuthSessionResult>
] {
  const [request, response, promptAsync] = useAuthRequest(
    {
      ...config,
    },
    discovery
  );

  return [
    request,
    response,
    async (options?: AuthRequestPromptOptions) => {
      const response = await promptAsync(options);
      if (response.type === "success") {
        return exchangeAuthCodeAsync(response.params.code);
      } else {
        return response;
      }
    },
  ];
}
