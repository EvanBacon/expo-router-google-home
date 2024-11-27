/// <reference types="react/canary" />

import { useNestActions } from "@/components/api";
import ThermostatSkeleton from "@/components/thermostat-skeleton";
import { BodyScrollView } from "@/components/ui/body";
import { useLocalSearchParams } from "expo-router";
import { Suspense, useMemo } from "react";
import { ActivityIndicator, Text } from "react-native";

export { ErrorBoundary } from "expo-router";

export default function PlaylistScreen() {
  const { device } = useLocalSearchParams<{ device: string }>();

  const actions = useNestActions();

  const view = useMemo(
    () => actions.getDeviceInfoAsync({ deviceId: device }),
    [device]
  );

  return (
    <>
      <BodyScrollView>
        <Suspense fallback={<ThermostatSkeleton />}>{view}</Suspense>
      </BodyScrollView>
    </>
  );
}
