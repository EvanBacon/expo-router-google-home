//
'use client';

import * as React from 'react';

// import * as Google from 'expo-auth-session/providers/google';
import { Button } from 'react-native';
import { GoogleAuthContext } from './google-provider';
import { AccessTokenRequest, makeRedirectUri, useAuthRequest } from 'expo-auth-session';

const redirectUri = makeRedirectUri({
  scheme: 'com.googleusercontent.apps.549323343471-esl81iea3g398omh5e5nmadnda5700p7',
});

export default function GoogleAuthButton({}) {
  const { setAccessToken } = React.use(GoogleAuthContext);
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS,
      scopes: [
        // 'openid',
        // 'https://www.googleapis.com/auth/userinfo.profile',
        // 'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/sdm.service',
      ],
      // To follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      // usePKCE: true,
      responseType: 'code',
      // responseType: 'code',
      redirectUri,
      // redirectUri: new URL('/auth', window.location.href).toString(),
      extraParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
    {
      authorizationEndpoint: `https://nestservices.google.com/partnerconnections/${process.env.EXPO_PUBLIC_NEST_PROJECT_ID}/auth`,
    }
  );

  console.log('nest.request', request);

  React.useEffect(() => {
    if (response?.type === 'success') {
      console.log('Nest auth:', response, response.authentication);

      const exchangeRequest = new AccessTokenRequest({
        clientId: request.clientId,
        // clientSecret: config.clientSecret,
        redirectUri,
        scopes: request.scopes,
        code: response.params.code,
        extraParams: {
          code_verifier: request?.codeVerifier || '',
        },
      });

      console.log('exchangeRequest::', exchangeRequest);

      exchangeRequest
        .performAsync({
          tokenEndpoint: 'https://www.googleapis.com/oauth2/v4/token',
        })
        .then((authentication) => {
          console.log('Nest EXCHANGE:', authentication);
          setAccessToken(authentication.accessToken);
        });
    }
  }, [response, setAccessToken]);

  return (
    <Button
      disabled={!request}
      title="Login with Google"
      onPress={() => {
        promptAsync();
      }}
    />
  );
}
