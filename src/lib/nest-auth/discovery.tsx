// Endpoint
export const discovery = {
  tokenEndpoint: "https://www.googleapis.com/oauth2/v4/token",
  authorizationEndpoint: `https://nestservices.google.com/partnerconnections/${process.env.EXPO_PUBLIC_NEST_PROJECT_ID}/auth`,
};
