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
    <View style={{ flex: 1, padding: 16, alignItems: "stretch", gap: 8 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={String(i)}
          style={{
            minHeight: 200,
            backgroundColor: "white",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            elevation: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        />
      ))}
    </View>
  );
}
