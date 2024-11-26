import { useNestActions } from "@/components/api";
import { BodyScrollView } from "@/components/ui/body";
import { Stack, useLocalSearchParams } from "expo-router";
import { Suspense, useEffect } from "react";
import { Button, Text, View } from "react-native";

export { ErrorBoundary } from "expo-router";

export default function PlaylistScreen() {
  const { device } = useLocalSearchParams<{ device: string }>();

  const actions = useNestActions();

  // useEffect(() => {
  //   // actions.generateWebRtcStream({ deviceName: device });
  // }, []);

  return (
    <>
      <BodyScrollView>
        <Suspense fallback={<Text>Loading...</Text>}>
          {actions.getDeviceInfoAsync({ deviceId: device })}
        </Suspense>
      </BodyScrollView>
    </>
  );
}
