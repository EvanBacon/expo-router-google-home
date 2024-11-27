/// <reference types="react/canary" />

import { useNestActions } from "@/components/api";
import { BodyScrollView } from "@/components/ui/body";
import { useLocalSearchParams } from "expo-router";
import { Suspense } from "react";
import { ActivityIndicator, Text } from "react-native";

export { ErrorBoundary } from "expo-router";

export default function PlaylistScreen() {
  const { device } = useLocalSearchParams<{ device: string }>();

  const actions = useNestActions();

  return (
    <>
      <BodyScrollView>
        <Suspense fallback={<ActivityIndicator />}>
          {actions.getDeviceInfoAsync({ deviceId: device })}
        </Suspense>
      </BodyScrollView>
    </>
  );
}
