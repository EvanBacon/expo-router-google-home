"use client";

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Device, ThermostatMode } from "./nest-server-actions";
import { Stack } from "expo-router";

const CIRCLE_SIZE = Dimensions.get("window").width * 0.85;
const CENTER = CIRCLE_SIZE / 2;
const CIRCLE_WIDTH = 4;

const ThermostatDetailScreen = ({
  device,
  updateTemperature,
  setThermostatMode,
}: {
  device: Device;
  updateTemperature: (props: {
    mode: ThermostatMode;
    heatCelsius?: number;
    coolCelsius?: number;
  }) => Promise<number>;
  setThermostatMode: (props: { mode: ThermostatMode }) => Promise<void>;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState(72);
  const [mode, setMode] = useState<ThermostatMode>("COOL");
  const [isAdjusting, setIsAdjusting] = useState(false);

  const {
    traits: {
      "sdm.devices.traits.Info": infoTrait,
      "sdm.devices.traits.Temperature": tempTrait,
    },
    parentRelations,
  } = device;

  const customName = infoTrait?.customName;
  const roomName = parentRelations[0]?.displayName;
  const currentTemp = tempTrait?.ambientTemperatureCelsius;
  const humidity =
    device.traits?.["sdm.devices.traits.Humidity"]?.ambientHumidityPercent;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsAdjusting(true);
    },
    onPanResponderMove: (
      e: GestureResponderEvent,
      gestureState: PanResponderGestureState
    ) => {
      const { moveY } = gestureState;
      const centerY = Dimensions.get("window").height / 2;
      const diff = (centerY - moveY) / 20;
      setTemperature((prev) =>
        Math.round(Math.max(50, Math.min(90, prev + diff)))
      );
    },
    onPanResponderRelease: async () => {
      setIsAdjusting(false);
      try {
        await updateTemperature({
          mode,
          coolCelsius:
            mode === "COOL" ? ((temperature - 32) * 5) / 9 : undefined,
          heatCelsius:
            mode === "HEAT" ? ((temperature - 32) * 5) / 9 : undefined,
        });
      } catch (error) {
        console.error("Failed to update temperature:", error);
      }
    },
  });

  const handleModeChange = async (newMode: ThermostatMode) => {
    setIsLoading(true);
    try {
      await setThermostatMode({ mode: newMode });
      setMode(newMode);
    } catch (error) {
      console.error("Failed to update mode:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: device.parentRelations[0]?.displayName || "Unknown Room",
        }}
      />

      <View style={styles.circleContainer} {...panResponder.panHandlers}>
        <View style={styles.temperatureRing}>
          <View style={styles.temperatureDisplay}>
            <Text style={styles.temperatureText}>{temperature}</Text>
            {currentTemp && (
              <View style={styles.currentTempMarker}>
                <Text style={styles.smallTemp}>
                  {Math.round((currentTemp * 9) / 5 + 32)}°
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>Using scheduled temperatures</Text>
        </View>

        <View style={styles.controlRow}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleModeChange(mode === "COOL" ? "HEAT" : "COOL")}
          >
            <MaterialCommunityIcons
              name={mode === "COOL" ? "snowflake" : "fire"}
              size={24}
              color="#0066FF"
            />
            <Text style={styles.controlText}>
              Mode
              <Text style={styles.controlSubtext}>
                {"\n"}
                {mode}
              </Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <MaterialCommunityIcons
              name="motion-sensor"
              size={24}
              color="#0066FF"
            />
            <Text style={styles.controlText}>
              Sensors
              <Text style={styles.controlSubtext}>{"\n"}1 selected</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.fanButton}>
          <MaterialCommunityIcons name="fan" size={24} color="#000" />
          <Text style={styles.fanText}>Fan</Text>
        </TouchableOpacity>

        <View style={styles.stats}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Indoor temperature</Text>
            <Text style={styles.statValue}>
              {Math.round((currentTemp * 9) / 5 + 32)}°
            </Text>
          </View>
          {humidity && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Humidity</Text>
              <Text style={styles.statValue}>{Math.round(humidity)}%</Text>
            </View>
          )}
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0066FF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerRight: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
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
    borderWidth: CIRCLE_WIDTH,
    borderColor: "#E8E9ED",
    alignItems: "center",
    justifyContent: "center",
  },
  temperatureDisplay: {
    alignItems: "center",
    justifyContent: "center",
  },
  temperatureText: {
    fontSize: 72,
    fontWeight: "300",
  },
  currentTempMarker: {
    position: "absolute",
    top: -60,
  },
  smallTemp: {
    fontSize: 16,
    color: "#757575",
  },
  infoSection: {
    flex: 1,
    padding: 16,
  },
  infoRow: {
    backgroundColor: "#F1F3F4",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    color: "#000",
    fontSize: 16,
  },
  controlRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  controlButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F1F3F4",
    padding: 16,
    borderRadius: 12,
  },
  controlText: {
    fontSize: 16,
    color: "#000",
  },
  controlSubtext: {
    fontSize: 14,
    color: "#757575",
  },
  fanButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F1F3F4",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  fanText: {
    fontSize: 16,
    color: "#000",
  },
  stats: {
    backgroundColor: "#F1F3F4",
    padding: 16,
    borderRadius: 12,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: "#000",
  },
  statValue: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ThermostatDetailScreen;
