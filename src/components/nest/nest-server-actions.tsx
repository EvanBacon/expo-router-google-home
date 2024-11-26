"use server";

import React from "react";

import { Button, ScrollView, Text, View } from "react-native";
import { Stack } from "expo-router";
import NestDeviceList from "./nest-device-cards";

async function nestFetchJson(auth: { access_token: string }, url: string) {
  return await fetch(
    `https://smartdevicemanagement.googleapis.com/v1/enterprises/${
      process.env.EXPO_PUBLIC_NEST_PROJECT_ID
    }/${url.replace(/^\//, "")}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.access_token}`,
      },
    }
  ).then((res) => res.json());
}

export const getDeviceInfoAsync = async (
  auth: { access_token: string },
  props: { deviceId: string }
): Promise<unknown> => {
  const data = await nestFetchJson(auth, `devices/${props.deviceId}`);

  console.log("nest.device:", JSON.stringify(data));

  return null;
};

export const renderDevicesAsync = async (auth: { access_token: string }) => {
  const data = require("./nest-devices-fixture.json") as NestDevices;
  // const data = (await fetch(
  //   `https://smartdevicemanagement.googleapis.com/v1/enterprises/${process.env.EXPO_PUBLIC_NEST_PROJECT_ID}/devices`,
  //   {
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${auth.access_token}`,
  //     },
  //   }
  // ).then((res) => res.json())) as NestDevices;

  console.log("nest devices: ", JSON.stringify(data));

  return <NestDeviceList devices={data.devices} />;
};

async function sendNestCommandAsync(props: {
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
