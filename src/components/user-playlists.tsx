import React from "react";
import { useNestActions } from "./api";
import { View } from "react-native";
import { SkeletonBox } from "@/lib/skeleton";

export function UserPlaylists() {
  const actions = useNestActions();

  return (
    <React.Suspense fallback={<SongItemSkeleton />}>
      {actions.renderDevicesAsync()}
    </React.Suspense>
  );
}

function SongItemSkeleton() {
  const SIZE = 150;
  return (
    <View style={{ alignItems: "center", gap: 8, maxWidth: SIZE }}>
      <SkeletonBox width={SIZE} height={SIZE} borderRadius={8} />
      <View style={{ alignItems: "center", gap: 4 }}>
        <SkeletonBox width={"100%"} height={16} />
        <SkeletonBox width={"75%"} height={16} />
      </View>
    </View>
  );
}
