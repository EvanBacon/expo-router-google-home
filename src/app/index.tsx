/// <reference types="react/canary" />

"use client";

import { Stack } from "expo-router";
import * as React from "react";
import { Text, Button, View } from "react-native";

import NestButton from "@/components/nest/nest-auth-button";
import { useNestAuth } from "@/lib/nest-auth";
import { BodyScrollView } from "@/components/ui/body";
import { UserPlaylists } from "@/components/user-playlists";

export default function NestCard() {
  const nestAuth = useNestAuth();

  if (!nestAuth.accessToken) {
    return <NestButton />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Nest Profile",
          headerRight() {
            return (
              <Button
                title="Logout"
                onPress={() => nestAuth.clearAccessToken()}
              />
            );
          },
        }}
      />
      <BodyScrollView>
        <AuthenticatedPage />
      </BodyScrollView>
    </>
  );
}

function AuthenticatedPage() {
  return <UserPlaylists />;
}

export { NestError as ErrorBoundary };

// NOTE: This won't get called because server action invocation happens at the root :(
function NestError({ error, retry }: { error: Error; retry: () => void }) {
  const nestAuth = useNestAuth();

  console.log("NestError:", error);
  React.useEffect(() => {
    if (error.message.includes("access token expired")) {
      nestAuth?.clearAccessToken();
    }
  }, [error, nestAuth]);

  return (
    <View>
      <Text>{error.toString()}</Text>
      <Button title="Retry" onPress={retry} />
    </View>
  );
}
