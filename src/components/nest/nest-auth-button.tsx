"use client";

import * as React from "react";

import { NestBrandButton } from "./nest-brand-button";
import { useNestAuth } from "@/lib/nest-auth";

export default function NestAuthButton() {
  const { useNestAuthRequest } = useNestAuth();

  const [request, , promptAsync] = useNestAuthRequest();

  console.log("request", request);

  return (
    <NestBrandButton
      disabled={!request}
      style={{ margin: 16 }}
      title="Login with Google Nest"
      onPress={() => promptAsync()}
    />
  );
}
