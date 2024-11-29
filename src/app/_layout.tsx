import { Stack } from "expo-router";
import {
  NestClientAuthProvider,
  useNestAuth,
} from "@/lib/nest-auth/nest-client-provider";
import { makeRedirectUri } from "expo-auth-session";
import { NestActionsProvider } from "@/components/api";

import "@/global.css";
import { Platform } from "react-native";

const redirectUri = makeRedirectUri({
  scheme:
    "com.googleusercontent.apps.549323343471-esl81iea3g398omh5e5nmadnda5700p7",
});

export default function Page() {
  return (
    <NestClientAuthProvider
      config={{
        clientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS!,
        scopes: [
          // 'openid',
          // 'https://www.googleapis.com/auth/userinfo.profile',
          // 'https://www.googleapis.com/auth/userinfo.email',
          "https://www.googleapis.com/auth/sdm.service",
          "https://www.googleapis.com/auth/nest",
          "https://www.googleapis.com/auth/nest-account",
          "https://www.googleapis.com/auth/sdm_fleet.service",
          "https://www.googleapis.com/auth/sdm.device.control.service",
          "https://www.googleapis.com/auth/sdm.security.service",
          "https://www.googleapis.com/auth/sdm.service",
          "https://www.googleapis.com/auth/sdm.subscription.monitor.service",
          "https://www.googleapis.com/auth/sdm.thermostat.service",
        ],
        redirectUri,
        // To follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
        // this must be set to false
        // usePKCE: true,
        responseType: "code",
        // redirectUri: new URL('/auth', window.location.href).toString(),
        extraParams: {
          access_type: "offline",
          prompt: "consent",
        },
      }}
    >
      <InnerAuth />
    </NestClientAuthProvider>
  );
}

function InnerAuth() {
  return (
    <NestActionsProvider useAuth={useNestAuth}>
      <Stack
        screenOptions={Platform.select({
          default: {},
          ios: {
            headerLargeTitle: true,
            headerTransparent: true,
            headerBlurEffect: "systemChromeMaterial",
            headerLargeTitleShadowVisible: false,
            headerShadowVisible: true,
            headerLargeStyle: {
              // NEW: Make the large title transparent to match the background.
              backgroundColor: "transparent",
            },
          },
        })}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="device/[device]"
          options={{
            title: "",
            headerLargeTitle: false,
            presentation: "modal",
          }}
        />
      </Stack>
    </NestActionsProvider>
  );
}
