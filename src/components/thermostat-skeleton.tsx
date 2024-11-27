"use client";

import React, { useEffect } from "react";
import { View, Animated, StyleSheet, Dimensions, Easing } from "react-native";

const CIRCLE_SIZE = Dimensions.get("window").width * 0.85;

const ThermostatSkeleton = () => {
  const pulseAnim = new Animated.Value(0);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, []);

  const opacityStyle = {
    opacity: pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  const SkeletonBlock = ({ style }) => (
    <Animated.View style={[styles.skeleton, opacityStyle, style]} />
  );

  return (
    <View style={styles.container}>
      {/* Temperature Circle */}
      <View style={styles.circleContainer}>
        <View style={styles.temperatureRing}>
          <SkeletonBlock style={styles.temperatureBlock} />
          <SkeletonBlock style={styles.currentTempMarker} />
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        {/* Schedule Info */}
        <SkeletonBlock style={styles.infoBlock} />

        {/* Mode and Sensors Controls */}
        <View style={styles.controlRow}>
          <SkeletonBlock style={styles.controlBlock} />
          <SkeletonBlock style={styles.controlBlock} />
        </View>

        {/* Fan Control */}
        <SkeletonBlock style={styles.fanBlock} />

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <SkeletonBlock style={styles.statLabelBlock} />
            <SkeletonBlock style={styles.statValueBlock} />
          </View>
          <View style={styles.statRow}>
            <SkeletonBlock style={styles.statLabelBlock} />
            <SkeletonBlock style={styles.statValueBlock} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  skeleton: {
    backgroundColor: "#E1E9EE",
    borderRadius: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerRight: {
    flexDirection: "row",
    gap: 16,
  },
  iconBlock: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  titleBlock: {
    width: 120,
    height: 24,
    borderRadius: 6,
  },
  circleContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: CIRCLE_SIZE,
    marginVertical: 20,
  },
  temperatureRing: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 4,
    borderColor: "#E8E9ED",
    alignItems: "center",
    justifyContent: "center",
  },
  temperatureBlock: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  currentTempMarker: {
    position: "absolute",
    top: 40,
    width: 32,
    height: 16,
    borderRadius: 4,
  },
  infoSection: {
    flex: 1,
    padding: 16,
  },
  infoBlock: {
    height: 56,
    borderRadius: 12,
    marginBottom: 16,
  },
  controlRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  controlBlock: {
    flex: 1,
    height: 80,
    borderRadius: 12,
  },
  fanBlock: {
    height: 56,
    borderRadius: 12,
    marginBottom: 16,
  },
  statsContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F1F3F4",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statLabelBlock: {
    width: 120,
    height: 16,
    borderRadius: 4,
  },
  statValueBlock: {
    width: 32,
    height: 16,
    borderRadius: 4,
  },
});

export default ThermostatSkeleton;
