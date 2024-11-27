import { useNestActions } from "@/components/api";
import { BodyScrollView } from "@/components/ui/body";
import { useLocalSearchParams } from "expo-router";
import { Suspense } from "react";
import { Text } from "react-native";

export { ErrorBoundary } from "expo-router";

export default function PlaylistScreen() {
  const { device } = useLocalSearchParams<{ device: string }>();

  const actions = useNestActions();

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
