"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Device, ThermostatMode } from "./nest-server-actions";
import { useNestAuth } from "@/lib/nest-auth";

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
  const [mode, setMode] = useState<ThermostatMode>("HEAT"); // HEAT, COOL, HEAT_COOL, OFF

  const {
    traits: {
      "sdm.devices.traits.Info": infoTrait,
      "sdm.devices.traits.ThermostatMode": modeTrait,
      "sdm.devices.traits.ThermostatTemperatureSetpoint": setpointTrait,
      "sdm.devices.traits.Temperature": tempTrait,
    },
    parentRelations,
  } = device;

  const customName = infoTrait?.customName;
  const roomName = parentRelations[0]?.displayName;
  const currentTemp = tempTrait?.ambientTemperatureCelsius;
  const humidity =
    device.traits?.["sdm.devices.traits.Humidity"]?.ambientHumidityPercent;

  const handleTemperatureChange = async (increment: number) => {
    setIsLoading(true);
    try {
      const newTemp = temperature + increment;
      setTemperature(newTemp);
      console.log({
        mode,
        heatCelsius: mode === "HEAT" ? newTemp : undefined,
        coolCelsius: mode === "COOL" ? newTemp : undefined,
      });
      await updateTemperature({
        mode,
        heatCelsius: mode === "HEAT" ? newTemp : undefined,
        coolCelsius: mode === "COOL" ? newTemp : undefined,
      }).then((newTemp) => {
        setTemperature(newTemp);
      });

      // Add your API call here to update the temperature
      // await updateThermostatTemperature(device.name, newTemp);
    } catch (error) {
      console.error("Failed to update temperature:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = async (newMode: ThermostatMode) => {
    setIsLoading(true);
    try {
      setMode(newMode);
      await setThermostatMode({ mode: newMode }).then((mode) => {
        // setMode(mode);
      });
      // Add your API call here to update the mode
      // await updateThermostatMode(device.name, newMode);
    } catch (error) {
      console.error("Failed to update mode:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{customName || roomName}</Text>
        {isLoading && <ActivityIndicator size="small" color="#2196F3" />}
      </View>

      <View style={styles.temperatureContainer}>
        <Text style={styles.currentTemp}>{Math.round(currentTemp)}°</Text>
        <Text style={styles.setTemp}>Set to {temperature}°</Text>

        <View style={styles.tempControls}>
          <TouchableOpacity
            style={styles.tempButton}
            onPress={() => handleTemperatureChange(-1)}
          >
            <MaterialCommunityIcons name="minus" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tempButton}
            onPress={() => handleTemperatureChange(1)}
          >
            <MaterialCommunityIcons name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.modeContainer}>
        <Text style={styles.sectionTitle}>Mode</Text>
        <View style={styles.modeButtons}>
          {["HEAT", "COOL", "HEAT_COOL", "OFF"].map((modeOption) => (
            <TouchableOpacity
              key={modeOption}
              style={[
                styles.modeButton,
                mode === modeOption && styles.modeButtonActive,
              ]}
              onPress={() => handleModeChange(modeOption)}
            >
              <MaterialCommunityIcons
                name={
                  modeOption === "HEAT"
                    ? "fire"
                    : modeOption === "COOL"
                    ? "snowflake"
                    : modeOption === "HEAT_COOL"
                    ? "autorenew"
                    : "power"
                }
                size={20}
                color={mode === modeOption ? "white" : "#757575"}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  mode === modeOption && styles.modeButtonTextActive,
                ]}
              >
                {modeOption.replace("_", " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons
              name="thermometer"
              size={20}
              color="#757575"
            />
            <Text style={styles.featureText}>
              {Math.round(currentTemp)}° Current
            </Text>
          </View>

          {humidity && (
            <View style={styles.featureItem}>
              <MaterialCommunityIcons
                name="water-percent"
                size={20}
                color="#757575"
              />
              <Text style={styles.featureText}>
                {Math.round(humidity)}% Humidity
              </Text>
            </View>
          )}

          <View style={styles.featureItem}>
            <MaterialCommunityIcons
              name={mode === "HEAT" ? "fire" : "snowflake"}
              size={20}
              color="#757575"
            />
            <Text style={styles.featureText}>{mode}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  temperatureContainer: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "white",
    margin: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentTemp: {
    fontSize: 64,
    fontWeight: "700",
    color: "#2196F3",
  },
  setTemp: {
    fontSize: 18,
    color: "#757575",
    marginTop: 8,
  },
  tempControls: {
    flexDirection: "row",
    gap: 16,
    marginTop: 16,
  },
  tempButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
  },
  modeContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  modeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modeButtonActive: {
    backgroundColor: "#2196F3",
  },
  modeButtonText: {
    color: "#757575",
    fontSize: 14,
    fontWeight: "500",
  },
  modeButtonTextActive: {
    color: "white",
  },
  infoContainer: {
    padding: 16,
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

export default ThermostatDetailScreen;
