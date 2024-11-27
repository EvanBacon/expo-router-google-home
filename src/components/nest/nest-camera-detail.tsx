"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Device } from "./nest-server-actions";
import WebRTCPlayer from "./webrtc-dom-view";
import { useNestAuth } from "@/lib/nest-auth";

const CameraDetailScreen = ({ device }: { device: Device }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

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

  return (
    <View style={styles.container}>
      <View style={[styles.videoContainer, isFullscreen && styles.fullscreen]}>
        {/* {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Connecting to stream...</Text>
          </View>
        )} */}

        <WebRTCPlayer
          deviceId={device.name.split("/").pop()}
          accessToken={auth.accessToken}
          dom={{
            mediaPlaybackRequiresUserAction: false,
            allowsInlineMediaPlayback: true,
            domStorageEnabled: true,
          }}
        />

        <View style={styles.controls}>
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

      {!isFullscreen && (
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{customName || roomName}</Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="video" size={20} color="#757575" />
              <Text style={styles.featureText}>H264</Text>
            </View>

            {hasAudio && (
              <View style={styles.featureItem}>
                <MaterialCommunityIcons
                  name="microphone"
                  size={20}
                  color="#757575"
                />
                <Text style={styles.featureText}>OPUS Audio</Text>
              </View>
            )}

            <View style={styles.featureItem}>
              <MaterialCommunityIcons
                name="motion-sensor"
                size={20}
                color="#757575"
              />
              <Text style={styles.featureText}>Motion Detection</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  videoContainer: {
    height: 300,
    backgroundColor: "#000",
    position: "relative",
  },
  fullscreen: {
    height: "100%",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    zIndex: 1,
  },
  loadingText: {
    color: "white",
    marginTop: 10,
  },
  controls: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    gap: 16,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
  },
  featureList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  featureText: {
    color: "#757575",
    fontSize: 14,
  },
});

export default CameraDetailScreen;
