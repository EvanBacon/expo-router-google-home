import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Device, NestDevices } from "./nest-server-actions";
import { Link } from "expo-router";

// Temperature conversion utility
const celsiusToFahrenheit = (celsius) => {
  return ((celsius * 9) / 5 + 32).toFixed(1);
};

// Individual Thermostat Component
const ThermostatCard = ({ device }) => {
  const {
    traits: {
      "sdm.devices.traits.Temperature": tempTrait,
      "sdm.devices.traits.Humidity": humidityTrait,
      "sdm.devices.traits.ThermostatMode": modeTrait,
      "sdm.devices.traits.Connectivity": connectivityTrait,
    },
    parentRelations,
  } = device;

  const roomName = parentRelations[0]?.displayName || "Unknown Room";
  const temperature = tempTrait?.ambientTemperatureCelsius;
  const humidity = humidityTrait?.ambientHumidityPercent;
  const mode = modeTrait?.mode;
  const isOnline = connectivityTrait?.status === "ONLINE";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="thermostat"
          size={24}
          color={isOnline ? "#4CAF50" : "#9E9E9E"}
        />
        <Text style={styles.title}>{roomName} Thermostat</Text>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isOnline ? "#4CAF50" : "#9E9E9E" },
          ]}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.temperature}>
          {temperature ? `${celsiusToFahrenheit(temperature)}°F` : "--°F"}
        </Text>
        {humidity !== undefined && (
          <Text style={styles.humidity}>Humidity: {humidity}%</Text>
        )}
        <Text style={styles.mode}>Mode: {mode || "OFF"}</Text>
      </View>
    </View>
  );
};

// Camera Component
const CameraCard = ({ device }: { device: Device }) => {
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

  const deviceId = device.name.split("/").pop();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="cctv" size={24} color="#2196F3" />
        <Text style={styles.title}>{customName || roomName}</Text>
      </View>

      <View style={styles.content}>
        <Link href={`/device/` + deviceId} asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>View Live Stream</Text>
          </TouchableOpacity>
        </Link>

        <View style={styles.features}>
          <MaterialCommunityIcons
            name={hasAudio ? "microphone" : "microphone-off"}
            size={20}
            color="#757575"
          />
          <MaterialCommunityIcons name="video" size={20} color="#757575" />
        </View>
      </View>
    </View>
  );
};

// Doorbell Component
const DoorbellCard = ({ device }) => {
  const {
    traits: {
      "sdm.devices.traits.Info": infoTrait,
      "sdm.devices.traits.CameraImage": imageTrait,
    },
  } = device;

  const customName = infoTrait?.customName;
  const maxResolution = imageTrait?.maxImageResolution;
  const deviceId = device.name.split("/").pop();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="doorbell" size={24} color="#9C27B0" />
        <Text style={styles.title}>{customName}</Text>
      </View>

      <View style={styles.content}>
        <Link href={`/device/` + deviceId} asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>View Doorbell Camera</Text>
          </TouchableOpacity>
        </Link>

        {maxResolution && (
          <Text style={styles.resolution}>
            Resolution: {maxResolution.width}x{maxResolution.height}
          </Text>
        )}
      </View>
    </View>
  );
};

// Main Device List Component
export const NestDeviceList = ({ devices }: NestDevices) => {
  const renderDevice = (device: Device) => {
    switch (device.type) {
      case "sdm.devices.types.THERMOSTAT":
        return <ThermostatCard key={device.name} device={device} />;
      case "sdm.devices.types.CAMERA":
        return <CameraCard key={device.name} device={device} />;
      case "sdm.devices.types.DOORBELL":
        return <DoorbellCard key={device.name} device={device} />;
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {devices.map(renderDevice)}
    </ScrollView>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  content: {
    alignItems: "center",
  },
  temperature: {
    fontSize: 48,
    fontWeight: "300",
    marginVertical: 8,
  },
  humidity: {
    fontSize: 16,
    color: "#757575",
    marginVertical: 4,
  },
  mode: {
    fontSize: 16,
    color: "#757575",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  features: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
  },
  resolution: {
    fontSize: 14,
    color: "#757575",
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
} as const;

export default NestDeviceList;
