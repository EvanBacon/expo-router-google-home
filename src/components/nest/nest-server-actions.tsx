"use server";

import React from "react";

import { Image, Text, View } from "react-native";
import NestDeviceList from "./nest-device-cards";
import CameraDetailScreen from "./nest-camera-detail";
import ThermostatDetailScreen from "./thermostat-detail";
import { MaterialCommunityIcons } from "@expo/vector-icons";

async function nestFetchJson(auth: { access_token: string }, url: string) {
  const res = await fetch(
    `https://smartdevicemanagement.googleapis.com/v1/enterprises/${
      process.env.EXPO_PUBLIC_NEST_PROJECT_ID
    }/${url.replace(/^\//, "")}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.access_token}`,
      },
    }
  );

  if (res.status !== 200) {
    throw new Error(await res.text());
  }

  return res.json();
}

export const getDeviceInfoJsonAsync = async (
  auth: { access_token: string },
  props: { deviceId: string }
) => {
  // console.log("getDeviceInfoAsync", props);

  return await nestFetchJson(auth, `devices/${props.deviceId}`);
};
export const getDeviceInfoAsync = async (
  auth: { access_token: string },
  props: { deviceId: string }
) => {
  // console.log("getDeviceInfoAsync", props);

  const data: Device = await nestFetchJson(auth, `devices/${props.deviceId}`);
  // console.log("nest.device:", JSON.stringify(data));

  // const dataFixture = {
  //   name: "enterprises/0fe1e2fa-6f3d-4def-8dcd-0d865762ca22/devices/AVPHwEtDbjwxaw0KicmC6YA_jmWBNOgfgqGSPQk_HJcJUNbOfkpu-_tTwKQcqJdSj6xDgave-qkNO16mC2Wk1DYmPdowqw",
  //   type: "sdm.devices.types.CAMERA",
  //   assignee:
  //     "enterprises/0fe1e2fa-6f3d-4def-8dcd-0d865762ca22/structures/AVPHwEuCQo--bj0J52VoxE2GaQBypuhBLxBE2N4jbD2XsDnugexucqiE-x7tVqCl0BHmCQ9WLGKHitUht8DG8xeLbiLqPw/rooms/AVPHwEuM39_kxV7uCBR3JGq61ZYWKIAAWg_cUxT8eWyLiBem8PFEmbPfGBMXGOKTUFP9H5XetbREeHC2xW19ZSTgu2tPEEkICB9oCRR2R-mX-1E4-xHHsKY4rqW0nwWQ_pwja0Yrprp1Fks",
  //   traits: {
  //     "sdm.devices.traits.Info": { customName: "Backyard camera" },
  //     "sdm.devices.traits.CameraLiveStream": {
  //       videoCodecs: ["H264"],
  //       audioCodecs: ["OPUS"],
  //       supportedProtocols: ["WEB_RTC"],
  //     },
  //     "sdm.devices.traits.CameraPerson": {},
  //     "sdm.devices.traits.CameraMotion": {},
  //   },
  //   parentRelations: [
  //     {
  //       parent:
  //         "enterprises/0fe1e2fa-6f3d-4def-8dcd-0d865762ca22/structures/AVPHwEuCQo--bj0J52VoxE2GaQBypuhBLxBE2N4jbD2XsDnugexucqiE-x7tVqCl0BHmCQ9WLGKHitUht8DG8xeLbiLqPw/rooms/AVPHwEuM39_kxV7uCBR3JGq61ZYWKIAAWg_cUxT8eWyLiBem8PFEmbPfGBMXGOKTUFP9H5XetbREeHC2xW19ZSTgu2tPEEkICB9oCRR2R-mX-1E4-xHHsKY4rqW0nwWQ_pwja0Yrprp1Fks",
  //       displayName: "Backyard",
  //     },
  //   ],
  // };

  const deviceId = data.name.split("/").pop()!;
  // is thermostat
  const isThermostat = data.type === "sdm.devices.types.THERMOSTAT";
  if (isThermostat) {
    return (
      <ThermostatDetailScreen
        device={data}
        updateTemperature={async (props: {
          mode: ThermostatMode;
          heatCelsius?: number;
          coolCelsius?: number;
        }) => {
          "use server";

          let command: string;
          let params: any = {};

          // Convert command based on mode
          switch (props.mode) {
            case "HEAT":
              // https://developers.google.com/nest/device-access/traits/device/thermostat-temperature-setpoint#setheat
              command =
                "sdm.devices.commands.ThermostatTemperatureSetpoint.SetHeat";
              params = { heatCelsius: props.heatCelsius };
              break;
            case "COOL":
              // https://developers.google.com/nest/device-access/traits/device/thermostat-temperature-setpoint#setcool
              command =
                "sdm.devices.commands.ThermostatTemperatureSetpoint.SetCool";
              params = { coolCelsius: props.coolCelsius };
              break;
            case "HEAT_COOL":
              // https://developers.google.com/nest/device-access/traits/device/thermostat-temperature-setpoint#setrange
              command =
                "sdm.devices.commands.ThermostatTemperatureSetpoint.SetRange";
              params = {
                heatCelsius: props.heatCelsius,
                coolCelsius: props.coolCelsius,
              };
              break;
            case "OFF":
              command = "sdm.devices.commands.ThermostatMode.SetMode";
              params = { mode: "OFF" };
              break;
            default:
              throw new Error(`Invalid thermostat mode: ${props.mode}`);
          }

          console.log("data.deviceId", deviceId);
          const res = await sendNestCommandAsync({
            accessToken: auth.access_token,
            deviceId,
            command,
            params,
          });

          console.log("nest.thermostat:", JSON.stringify(res));
          return res;
        }}
        setThermostatMode={async (props: { mode: ThermostatMode }) => {
          "use server";
          const res = await sendNestCommandAsync({
            accessToken: auth.access_token,
            deviceId,
            command: "sdm.devices.commands.ThermostatMode.SetMode",
            params: { mode: props.mode },
          });

          console.log("nest.thermostat:", JSON.stringify(res));
          return res;
        }}
      />
    );
  }

  return (
    <CameraDetailScreen
      device={data}
      renderCameraHistory={async () => {
        "use server";

        const events = await getCameraEvents(deviceId, auth.access_token);

        return (
          <View style={styles.container}>
            {events.map((event) => (
              <View key={event.eventId} style={styles.eventCard}>
                <View style={styles.eventInfo}>
                  <MaterialCommunityIcons
                    name={
                      event.type === "Person"
                        ? "account"
                        : event.type === "Motion"
                        ? "motion-sensor"
                        : event.type === "Sound"
                        ? "volume-high"
                        : "bell"
                    }
                    size={24}
                    color="#fff"
                  />
                  <View>
                    <Text style={styles.eventType}>{event.type}</Text>
                    <Text style={styles.eventTime}>
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
                {event.imageUrl && (
                  <Image
                    source={{ uri: event.imageUrl }}
                    style={styles.eventThumbnail}
                  />
                )}
              </View>
            ))}
          </View>
        );
      }}
    />
  );

  // return (
  //   <View>
  //     <Text>Device Info</Text>
  //     <Text>{JSON.stringify(dataFixture)}</Text>
  //   </View>
  // );
  // return null;
};

const styles = {
  container: {
    padding: 16,
  },
  eventCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
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
} as const;

interface CameraEvent {
  eventId: string;
  timestamp: string;
  type: "Motion" | "Person" | "Sound" | "Chime";
  imageUrl?: string;
}

interface GenerateImageResponse {
  url: string;
  token: string;
}

export async function getCameraEvents(
  deviceId: string,
  accessToken: string
): Promise<CameraEvent[]> {
  // Here you would implement the actual events API call
  // For demonstration, returning mock data that matches the API structure
  const events = [
    {
      eventId: "event1",
      timestamp: new Date().toISOString(),
      type: "Person" as const,
    },
    {
      eventId: "event2",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      type: "Motion" as const,
    },
  ];

  // Fetch images for each event
  const eventsWithImages = await Promise.all(
    events.map(async (event) => {
      try {
        const imageData = await generateEventImage(
          deviceId,
          event.eventId,
          accessToken
        );
        const imageUrl = await fetchEventImage(imageData.url, imageData.token);
        return { ...event, imageUrl };
      } catch (error) {
        console.error(
          `Failed to fetch image for event ${event.eventId}:`,
          error
        );
        return event;
      }
    })
  );

  return eventsWithImages;
}

async function generateEventImage(
  deviceId: string,
  eventId: string,
  accessToken: string
): Promise<GenerateImageResponse> {
  const response = await sendNestCommandAsync({
    accessToken,
    deviceId,
    command: "sdm.devices.commands.CameraEventImage.GenerateImage",
    params: {
      eventId,
    },
  });

  return {
    url: response.results.url,
    token: response.results.token,
  };
}

async function listEvents(deviceId: string, accessToken: string) {
  const response = await fetch(
    `https://smartdevicemanagement.googleapis.com/v1/enterprises/${process.env.EXPO_PUBLIC_NEST_PROJECT_ID}/devices/${deviceId}/events`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to fetch events:", error);
    throw new Error(error);
  }

  return response.json();
}

async function fetchEventImage(url: string, token: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch event image");
  }

  // Convert the image data to base64 or handle it appropriately
  const buffer = await response.arrayBuffer();
  return `data:image/jpeg;base64,${Buffer.from(buffer).toString("base64")}`;
}

export type ThermostatMode = "HEAT" | "COOL" | "HEAT_COOL" | "OFF";

export const renderDevicesAsync = async (auth: { access_token: string }) => {
  // const data = require("./nest-devices-fixture.json") as NestDevices;
  const data = (await fetch(
    `https://smartdevicemanagement.googleapis.com/v1/enterprises/${process.env.EXPO_PUBLIC_NEST_PROJECT_ID}/devices`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.access_token}`,
      },
    }
  ).then((res) => res.json())) as NestDevices;

  console.log("nest devices: ", JSON.stringify(data));

  return (
    <NestDeviceList devices={data.devices} accessToken={auth.access_token} />
  );
};

export async function generateWebRtcStream(
  auth: { access_token: string },
  device: { deviceId: string; offerSdp: string }
): Promise<{
  results: {
    answerSdp: string;
    expiresAt: string;
    mediaSessionId: string;
  };
}> {
  return sendNestCommandAsync({
    accessToken: auth.access_token,
    deviceId: device.deviceId,
    command: "sdm.devices.commands.CameraLiveStream.GenerateWebRtcStream",
    params: {
      offerSdp: device.offerSdp,
    },
  });
}

async function sendNestCommandAsync(props: {
  accessToken: string;
  deviceId: string;
  command: string;
  params: any;
}) {
  const res = await fetch(
    `https://smartdevicemanagement.googleapis.com/v1/enterprises/${process.env.EXPO_PUBLIC_NEST_PROJECT_ID}/devices/${props.deviceId}:executeCommand`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${props.accessToken}`,
      },
      method: "POST",
      body: JSON.stringify({
        command: props.command,
        params: props.params,
      }),
    }
  );

  if ([400, 429].includes(res.status)) {
    const data = await res.json();
    const err = new Error(data.error.message);
    err.status = data.error.status;
    throw err;
  }
  if (res.status !== 200) {
    throw new Error(await res.text());
  }
  const data = await res.json();

  console.log("nest.cmd:", JSON.stringify(data));
  return data;
}

export interface NestDevices {
  devices: Device[];
}

export interface Device {
  name: string;
  type: string;
  assignee: string;
  traits: Traits;
  parentRelations: ParentRelation[];
}

export interface ParentRelation {
  parent: string;
  displayName: string;
}

export interface Traits {
  "sdm.devices.traits.Info": SdmDevicesTraitsInfo;
  "sdm.devices.traits.Humidity"?: SdmDevicesTraitsHumidity;
  "sdm.devices.traits.Connectivity"?: SdmDevicesTraitsConnectivityClass;
  "sdm.devices.traits.Fan"?: SdmDevicesTraitsFan;
  "sdm.devices.traits.ThermostatMode"?: SdmDevicesTraitsThermostatMode;
  "sdm.devices.traits.ThermostatEco"?: SdmDevicesTraitsThermostatEco;
  "sdm.devices.traits.ThermostatHvac"?: SdmDevicesTraitsConnectivityClass;
  "sdm.devices.traits.Settings"?: SdmDevicesTraitsSettings;
  "sdm.devices.traits.ThermostatTemperatureSetpoint"?: SdmDevicesTraitsThermostatTemperatureSetpoint;
  "sdm.devices.traits.Temperature"?: SdmDevicesTraitsTemperature;
  "sdm.devices.traits.CameraLiveStream"?: SdmDevicesTraitsCameraLiveStream;
  "sdm.devices.traits.CameraPerson"?: SdmDevicesTraitsCameraClipPreviewClass;
  "sdm.devices.traits.CameraMotion"?: SdmDevicesTraitsCameraClipPreviewClass;
  "sdm.devices.traits.CameraImage"?: SdmDevicesTraitsCameraImage;
  "sdm.devices.traits.DoorbellChime"?: SdmDevicesTraitsCameraClipPreviewClass;
  "sdm.devices.traits.CameraClipPreview"?: SdmDevicesTraitsCameraClipPreviewClass;
}

export interface SdmDevicesTraitsCameraClipPreviewClass {}

export interface SdmDevicesTraitsCameraImage {
  maxImageResolution: MaxImageResolution;
}

export interface MaxImageResolution {
  width: number;
  height: number;
}

export interface SdmDevicesTraitsCameraLiveStream {
  videoCodecs: string[];
  audioCodecs: string[];
  supportedProtocols: string[];
}

export interface SdmDevicesTraitsConnectivityClass {
  status: string;
}

export interface SdmDevicesTraitsFan {
  timerMode?: string;
}

export interface SdmDevicesTraitsHumidity {
  ambientHumidityPercent: number;
}

export interface SdmDevicesTraitsInfo {
  customName: string;
}

export interface SdmDevicesTraitsSettings {
  temperatureScale: string;
}

export interface SdmDevicesTraitsTemperature {
  ambientTemperatureCelsius: number;
}

export interface SdmDevicesTraitsThermostatEco {
  availableModes: string[];
  mode: string;
  heatCelsius: number;
  coolCelsius: number;
}

export interface SdmDevicesTraitsThermostatMode {
  mode: "HEAT" | "COOL" | "HEATCOOL" | "OFF";
  availableModes: ("HEAT" | "COOL" | "HEATCOOL" | "OFF")[];
}

export interface SdmDevicesTraitsThermostatTemperatureSetpoint {
  coolCelsius?: number;
}
