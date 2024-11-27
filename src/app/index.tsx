/// <reference types="react/canary" />

"use client";

import { Stack } from "expo-router";
import * as React from "react";
import {
  Text,
  Button,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

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
      <AuthenticatedPage />
    </>
  );
}

function AuthenticatedPage() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [key, setKey] = React.useState(0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setKey((prevKey) => prevKey + 1);
    setRefreshing(false);
  }, []);

  return (
    <BodyScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <UserPlaylists key={key} />
    </BodyScrollView>
  );
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
