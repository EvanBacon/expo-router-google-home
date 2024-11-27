"use server";

import "server-only";

import {
  NestCodeExchangeResponse,
  NestCodeExchangeResponseSchema,
} from "./nest-validation";
import { discovery } from "./discovery";

const {
  EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS: clientId,
  NEST_GOOGLE_CLIENT_SECRET: clientSecret,
} = process.env;

export async function exchangeAuthCodeAsync(props: {
  code: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<NestCodeExchangeResponse> {
  // curl -L -X POST 'https://www.googleapis.com/oauth2/v4/token?client_id=549323343471-57tgasajtb6s3e02gk6lsj45rdl2n8lp.apps.googleusercontent.com&client_secret=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&code=4/0AeaYSHA3I2SPA9mc1Y3NxIzWl08qq46_25OSWIX8xj4Sxt8l-2GJ1qsJH4UPTAIUVyYQog&grant_type=authorization_code&redirect_uri=https://www.google.com'
  // {
  //   "access_token": "ya29.a0Ad52N38vnZXbKznlNHuUJSDTXfsc_hULxoFbNz9wllqBOTdBTeg0ZrmbNPc0ON2syd-SRBzpE9j2-CVKwwXBVOU_ir5tYiyQTEvv5pzFx6a_Ih-mtJXU20qyR2PLGpi2hv3G5xCc4876PbzaFqFRyh1vIt41g4OmMwxCaCgYKAcMSARISFQHGX2MiTwpiAnx2CnOBMC_ZMCkeaw0171",
  //   "expires_in": 3598,
  //   "refresh_token": "1//0fqneltUusrPvCgYIARAAGA8SNwF-L9IrFfX5ImhtWpytBhsd4r8Hbms-f0U9ZEFEZsbe6nFUcVeWUXPzmhSUbEDGvpEDSPluqw8",
  //   "scope": "https://www.googleapis.com/auth/sdm.service",
  //   "token_type": "Bearer"
  // }

  const body = await fetch(discovery.tokenEndpoint, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      // Authorization:
      //   "Basic " +
      //   Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    body: new URLSearchParams({
      code: props.code,
      client_id: clientId!,
      // client_secret: process.env.EXPO_GOOGLE_OAUTH_CLIENT_SECRET,
      redirect_uri: props.redirectUri,
      grant_type: "authorization_code",
      code_verifier: props.codeVerifier,
    }).toString(),
  }).then((res) => res.json());

  if ("error" in body) {
    if ("error_description" in body) {
      throw new Error(body.error_description);
    } else {
      throw new Error(body.error);
    }
  }

  console.log("[SPOTIFY] requestAccessToken:", body);
  const response = NestCodeExchangeResponseSchema.parse(body);
  if ("expires_in" in response) {
    // Set the expiration time to the current time plus the number of seconds until it expires.
    response.expires_in = Date.now() + response.expires_in * 1000;
  }

  return response;
}

export async function refreshTokenAsync(
  refreshToken: string
): Promise<NestCodeExchangeResponse> {
  // TODO: Check this against nest docs
  const body = await fetch(discovery.tokenEndpoint, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      // Authorization:
      //   "Basic " +
      //   Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId!,
    }),
  }).then((res) => res.json());

  if ("error" in body) {
    if ("error_description" in body) {
      throw new Error(body.error_description);
    } else {
      throw new Error(body.error);
    }
  }

  console.log("[SPOTIFY] refreshToken:", body);
  const response = NestCodeExchangeResponseSchema.parse(body);
  if ("expires_in" in response) {
    // Set the expiration time to the current time plus the number of seconds until it expires.
    response.expires_in = Date.now() + response.expires_in * 1000;
  }
  response.refresh_token ??= refreshToken;

  return response;
}
