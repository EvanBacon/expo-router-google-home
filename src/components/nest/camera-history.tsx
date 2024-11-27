// CameraHistory.tsx
"use client";

import React, { Suspense } from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export interface CameraEvent {
  id: string;
  type: "Person" | "Motion" | "Sound";
  time: string;
  duration: string;
  thumbnail?: string;
  videoClip?: string;
}

interface DayEvents {
  date: string;
  events: CameraEvent[];
}

interface CameraHistoryProps {
  renderCameraHistory: () => Promise<React.ReactNode>;
}

const HistoryFallback = () => (
  <View style={styles.daySection}>
    <Text style={styles.daySectionTitle}>Today</Text>
    {[1, 2, 3].map((i) => (
      <View key={i} style={styles.eventCard}>
        <View style={styles.eventInfo}>
          <View style={[styles.skeleton, styles.iconSkeleton]} />
          <View>
            <View style={[styles.skeleton, styles.titleSkeleton]} />
            <View style={[styles.skeleton, styles.timeSkeleton]} />
          </View>
        </View>
        <View style={[styles.skeleton, styles.thumbnailSkeleton]} />
      </View>
    ))}
  </View>
);

export function CameraHistory({ renderCameraHistory }: CameraHistoryProps) {
  return (
    <Suspense fallback={<HistoryFallback />}>{renderCameraHistory()}</Suspense>
  );
}

const styles = StyleSheet.create({
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
  skeleton: {
    backgroundColor: "#333",
    borderRadius: 4,
  },
  iconSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  titleSkeleton: {
    width: 80,
    height: 16,
    marginBottom: 4,
  },
  timeSkeleton: {
    width: 120,
    height: 14,
  },
  thumbnailSkeleton: {
    width: 60,
    height: 40,
    borderRadius: 6,
  },
});
