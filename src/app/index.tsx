/// <reference types="react/canary" />

"use client";

import * as React from "react";
import { Text, Button, ScrollView, View } from "react-native";

import NestButton from "@/components/nest/nest-auth-button";
import { SongItemSkeleton } from "@/components/songs";
import { useNestAuth } from "@/lib/nest-auth";
import { Try } from "expo-router/build/views/Try";
import { useHeaderSearch } from "@/hooks/useHeaderSearch";
import { useNestActions } from "@/components/api";
import { BodyScrollView } from "@/components/ui/body";
import { Stack } from "expo-router";
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
  const text = useHeaderSearch();

  if (!text) {
    // return <Text>Hey</Text>;
    return <UserPlaylists />;
  }

  return (
    <>
      <SongsScroller query={text} />
    </>
  );
}

export { NestError as ErrorBoundary };

function SongsScroller({ query }: { query: string }) {
  const actions = useNestActions();

  return (
    <>
      <ScrollView
        horizontal
        contentContainerStyle={{
          gap: 8,
          padding: 16,
        }}
      >
        <Try catch={NestError}>
          <React.Suspense
            fallback={
              <>
                <SongItemSkeleton />
                <SongItemSkeleton />
                <SongItemSkeleton />
                <SongItemSkeleton />
                <SongItemSkeleton />
                <SongItemSkeleton />
              </>
            }
          >
            {actions!.renderSongsAsync({ query, limit: 15 })}
          </React.Suspense>
        </Try>
      </ScrollView>
    </>
  );
}

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
