import React from "react";
import { useNestActions } from "./api";
import { SongItemSkeleton } from "./songs";

export function UserPlaylists() {
  const actions = useNestActions();

  return (
    <React.Suspense fallback={<SongItemSkeleton />}>
      {actions.renderDevicesAsync()}
    </React.Suspense>
  );
}
