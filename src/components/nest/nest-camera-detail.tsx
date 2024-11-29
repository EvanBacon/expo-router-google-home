"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Device } from "./nest-server-actions";
import WebRTCPlayer from "./webrtc-dom-view";
import { useNestAuth } from "@/lib/nest-auth";
import { Stack } from "expo-router";
import { CameraHistory } from "./camera-history";

const SCREEN_HEIGHT = Dimensions.get("window").height;

interface Event {
  type: string;
  time: string;
  duration?: string;
  thumbnail?: string;
}

const CameraDetailScreen = ({
  device,
  renderCameraHistory,
}: {
  device: Device;
  renderCameraHistory: () => Promise<React.ReactNode>;
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    traits: {
      "sdm.devices.traits.Info": infoTrait,
      "sdm.devices.traits.CameraLiveStream": streamTrait,
    },
    parentRelations,
  } = device;

  const customName = infoTrait?.customName;
  const roomName = parentRelations[0]?.displayName;
  const hasAudio = streamTrait?.audioCodecs?.includes("OPUS");

  const auth = useNestAuth();

  // Mock events data - replace with actual API data
  const events: Event[] = [
    {
      type: "Person",
      time: "9:57 PM",
      duration: "12 sec",
      thumbnail: "/api/placeholder/120/80",
    },
    {
      type: "Person",
      time: "9:56 PM",
      duration: "16 sec",
      thumbnail: "/api/placeholder/120/80",
    },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: device.parentRelations[0]?.displayName ?? "Camera",
        }}
      />

      <View
        style={[styles.videoSection, isFullscreen && styles.fullscreenVideo]}
      >
        <WebRTCPlayer
          deviceId={device.name.split("/").pop()}
          accessToken={auth.accessToken}
          dom={{
            matchContents: true,
            scrollEnabled: false,
            allowsFullscreenVideo: true,
            mediaPlaybackRequiresUserAction: false,
            allowsInlineMediaPlayback: true,
            domStorageEnabled: true,
          }}
        />

        <View style={styles.videoControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setIsMuted(!isMuted)}
          >
            <MaterialCommunityIcons
              name={isMuted ? "volume-off" : "volume-high"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setIsFullscreen(!isFullscreen)}
          >
            <MaterialCommunityIcons
              name={isFullscreen ? "fullscreen-exit" : "fullscreen"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>

      <CameraHistory renderCameraHistory={renderCameraHistory} />
      {!isFullscreen && (
        <ScrollView style={styles.eventsSection}>
          <View style={styles.daySection}>
            <Text style={styles.daySectionTitle}>Today</Text>
            {events.map((event, index) => (
              <View key={index} style={styles.eventCard}>
                <View style={styles.eventInfo}>
                  <MaterialCommunityIcons
                    name="account"
                    size={24}
                    color="#fff"
                  />
                  <View>
                    <Text style={styles.eventType}>{event.type}</Text>
                    <Text style={styles.eventTime}>
                      {event.time} • {event.duration}
                    </Text>
                  </View>
                </View>
                <Image
                  source={{ uri: event.thumbnail }}
                  style={styles.eventThumbnail}
                />
              </View>
            ))}
          </View>

          <View style={styles.daySection}>
            <Text style={styles.daySectionTitle}>Yesterday</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.bottomButton}>
              <MaterialCommunityIcons name="cast" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.muteButton}>
              <MaterialCommunityIcons
                name="volume-off"
                size={24}
                color="white"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomButton}>
              <MaterialCommunityIcons name="menu" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  videoSection: {
    height: SCREEN_HEIGHT * 0.25,
    backgroundColor: "#000",
  },
  fullscreenVideo: {
    height: "100%",
  },
  header: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 6,
  },
  liveText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  videoControls: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    gap: 16,
    zIndex: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  eventsSection: {
    flex: 1,
  },
  daySection: {
    padding: 16,
  },
  daySectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#2a2a2a",
    padding: 12,
    borderRadius: 12,
  },
  eventInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  eventType: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  eventTime: {
    color: "#999",
    fontSize: 14,
  },
  eventThumbnail: {
    width: 60,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#333",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 32,
  },
  bottomButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  muteButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CameraDetailScreen;
