import "server-only";

import * as React from "react";

// import { Card } from '../card';
// import GoogleAuthButton from './google-auth-button';
import ClientNestCard from "./client-google-card";
import { View } from "react-native";

// import * as nestStuff from '@googleapis/smartdevicemanagement'

export default function NestCard() {
  return (
    <View>
      <ClientNestCard
        requestAccessToken={async (props) => {
          "use server";
          // curl -L -X POST 'https://www.googleapis.com/oauth2/v4/token?client_id=549323343471-57tgasajtb6s3e02gk6lsj45rdl2n8lp.apps.googleusercontent.com&client_secret=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&code=4/0AeaYSHA3I2SPA9mc1Y3NxIzWl08qq46_25OSWIX8xj4Sxt8l-2GJ1qsJH4UPTAIUVyYQog&grant_type=authorization_code&redirect_uri=https://www.google.com'
          // {
          //   "access_token": "ya29.a0Ad52N38vnZXbKznlNHuUJSDTXfsc_hULxoFbNz9wllqBOTdBTeg0ZrmbNPc0ON2syd-SRBzpE9j2-CVKwwXBVOU_ir5tYiyQTEvv5pzFx6a_Ih-mtJXU20qyR2PLGpi2hv3G5xCc4876PbzaFqFRyh1vIt41g4OmMwxCaCgYKAcMSARISFQHGX2MiTwpiAnx2CnOBMC_ZMCkeaw0171",
          //   "expires_in": 3598,
          //   "refresh_token": "1//0fqneltUusrPvCgYIARAAGA8SNwF-L9IrFfX5ImhtWpytBhsd4r8Hbms-f0U9ZEFEZsbe6nFUcVeWUXPzmhSUbEDGvpEDSPluqw8",
          //   "scope": "https://www.googleapis.com/auth/sdm.service",
          //   "token_type": "Bearer"
          // }
          const response = await fetch(
            "https://www.googleapis.com/oauth2/v4/token",
            {
              method: "POST",
              headers: {
                "content-type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                code: props.code,
                client_id: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS,
                // client_secret: process.env.EXPO_GOOGLE_OAUTH_CLIENT_SECRET,
                redirect_uri: props.redirectUri,
                grant_type: "authorization_code",
              }).toString(),
            }
          ).then((res) => res.json());

          return response;
        }}
        toggleThermostateModeAsync={async (props: {
          accessToken: string;
          deviceId: string;
          mode: "HEAT" | "COOL" | "OFF";
        }): Promise<{}> => {
          "use server";
          const { accessToken } = props;

          const results = await sendCommandAsync({
            accessToken,
            deviceId: props.deviceId,
            command: "sdm.devices.commands.ThermostatMode.SetMode",
            params: {
              mode: props.mode,
            },
          });

          return results.results;
        }}
        generateCameraStreamAsync={async (props: {
          accessToken: string;
          deviceId: string;
        }): Promise<{
          streamUrls: {
            // "rtsps://someurl.com/CjY5Y3VKaTZwR3o4Y19YbTVfMF...?auth=g.0.streamingToken"
            rtspUrl: string;
          };
          // "CjY5Y3VKaTZwR3o4Y19YbTVfMF..."
          streamExtensionToken: string;
          // "g.0.streamingToken"
          streamToken: string;
          // "2018-01-04T18:30:00.000Z"
          expiresAt: string;
        }> => {
          "use server";
          const { accessToken } = props;

          const results = await sendCommandAsync({
            accessToken,
            deviceId: props.deviceId,
            command:
              "sdm.devices.commands.CameraLiveStream.GenerateWebRtcStream",
            params: {
              offerSdp: "offerSdp",
            },
          });

          return results.results;
        }}
        executeCommandAsync={async (props: {
          accessToken: string;
          deviceId: string;
          command: string;
          params: any;
        }): Promise<unknown> => {
          "use server";
          const { accessToken } = props;

          const data = await fetch(
            `https://smartdevicemanagement.googleapis.com/v1/enterprises/${process.env.EXPO_PUBLIC_NEST_PROJECT_ID}/devices/${props.deviceId}:executeCommand`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              method: "POST",
              body: JSON.stringify({
                command: props.command,
                params: props.params,
              }),
            }
          ).then((res) => res.json());

          console.log("nest.device:", JSON.stringify(data));
          return data;
        }}
        getDeviceInfoAsync={async (props: {
          accessToken: string;
          deviceId: string;
        }): Promise<unknown> => {
          "use server";
          const { accessToken } = props;

          const data = await fetch(
            `https://smartdevicemanagement.googleapis.com/v1/enterprises/${process.env.EXPO_PUBLIC_NEST_PROJECT_ID}/devices/${props.deviceId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          ).then((res) => res.json());

          console.log("nest.device:", JSON.stringify(data));
          return data;
        }}
        getDevicesAsync={async (props): Promise<NestDevices> => {
          "use server";

          return require("./nest-devices-fixture.json");
          const { accessToken } = props;

          const data = await fetch(
            `https://smartdevicemanagement.googleapis.com/v1/enterprises/${process.env.EXPO_PUBLIC_NEST_PROJECT_ID}/devices`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          ).then((res) => res.json());

          console.log("nest devices: ", JSON.stringify(data));
          return data;
        }}
      />
    </View>
  );
}

async function sendCommandAsync(props: {
  accessToken: string;
  deviceId: string;
  command: string;
  params: any;
}) {
  const data = await fetch(
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
  ).then((res) => res.json());

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
