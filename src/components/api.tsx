"use client";

import { createSpotifyAPI } from "@/components/spotify/spotify-actions";
import { renderDevicesAsync } from "@/components/spotify/spotify-server-actions";

export const {
  Provider: SpotifyActionsProvider,
  useSpotify: useSpotifyActions,
} = createSpotifyAPI({
  renderDevicesAsync,
});
