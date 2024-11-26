import React from "react";
import { useSpotifyActions } from "./api";
import { SongItemSkeleton } from "./songs";

export function UserPlaylists() {
  const actions = useSpotifyActions();

  return (
    <React.Suspense fallback={<SongItemSkeleton />}>
      {actions.renderDevicesAsync()}
    </React.Suspense>
  );
}
