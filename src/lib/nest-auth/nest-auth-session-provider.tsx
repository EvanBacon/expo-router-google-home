"use client";

import {
  AuthRequest,
  AuthRequestConfig,
  AuthRequestPromptOptions,
  AuthSessionResult,
  useAuthRequest,
} from "expo-auth-session";
import { NestCodeExchangeResponse } from "./nest-validation";
import { discovery } from "./discovery";

export function useNestAuthRequest(
  {
    exchangeAuthCodeAsync,
  }: {
    exchangeAuthCodeAsync: (props: {
      code: string;
      codeVerifier: string;
    }) => Promise<NestCodeExchangeResponse>;
  },
  config: AuthRequestConfig
): [
  AuthRequest | null,
  AuthSessionResult | null,
  (
    options?: AuthRequestPromptOptions
  ) => Promise<NestCodeExchangeResponse | AuthSessionResult>
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
        return exchangeAuthCodeAsync({
          code: response.params.code,
          codeVerifier: request?.codeVerifier ?? "",
        });
      } else {
        return response;
      }
    },
  ];
}
