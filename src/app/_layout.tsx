import { Stack } from "expo-router";
import {
  SpotifyClientAuthProvider,
  useSpotifyAuth,
} from "@/lib/spotify-auth/spotify-client-provider";
import { makeRedirectUri } from "expo-auth-session";
import { SpotifyActionsProvider } from "@/components/api";

import "@/global.css";

const redirectUri = makeRedirectUri({
  scheme: 'com.googleusercontent.apps.549323343471-esl81iea3g398omh5e5nmadnda5700p7',
});

export default function Page() {
  return (
    <SpotifyClientAuthProvider
      config={{
        clientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS!,
        scopes: [
         // 'openid',
        // 'https://www.googleapis.com/auth/userinfo.profile',
        // 'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/sdm.service',
        ],
        redirectUri,
      }}
    >
      <InnerAuth />
    </SpotifyClientAuthProvider>
  );
}

function InnerAuth() {
  return (
    <SpotifyActionsProvider useAuth={useSpotifyAuth}>
      <Stack />
    </SpotifyActionsProvider>
  );
}
