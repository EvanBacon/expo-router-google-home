'use client';

import * as React from 'react';

import GoogleAuthButton from './google-auth-button';
import { Button, ScrollView, Text, View } from 'react-native';
import { GoogleAuthContext } from './google-provider';
import { NestDevices } from './nest-card';

export default function NestCard({
  getDevicesAsync,
  requestAccessToken,

  ...props
}: {
  getDevicesAsync: (props: { accessToken: string }) => Promise<NestDevices | { error: any }>;
  requestAccessToken: (props: { code: string; redirectUri: string }) => Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
  }>;
  generateCameraStreamAsync;
}) {
  const auth = React.use(GoogleAuthContext);

  React.useEffect(() => {
    if (auth.accessToken && getDevicesAsync) {
      (async () => {
        const data = await getDevicesAsync({ accessToken: auth.accessToken });
        console.log('nest devices: ', data);

        if ('error' in data) {
          auth.clearAccessToken();
        } else {
          const thermostat = data.devices.find(
            (device) =>
              device.type === 'sdm.devices.types.THERMOSTAT' &&
              device.traits['sdm.devices.traits.Connectivity'].status === 'ONLINE'
          );

          console.log('thermostat:', thermostat);
          // console.log(
          //   'STREAM:',
          //   await toggleThermostateModeAsync({
          //     accessToken: auth.accessToken,
          //     deviceId: thermostat.name.split('/').pop(),
          //     mode: 'OFF',
          //   })
          // );
          // const camera = data.devices.find((device) => device.type === 'sdm.devices.types.CAMERA');

          // console.log('camera:', camera);
          // console.log(
          //   'STREAM:',
          //   await generateCameraStreamAsync({
          //     accessToken: auth.accessToken,
          //     deviceId: camera.name.split('/').pop(),
          //   })
          // );
        }
      })();
    }
  }, [auth.accessToken, getDevicesAsync]);

  if (auth.accessToken) {
    return (
      <View>
        <AsyncDeviceList {...props} />
        <Button title="Sign out" onPress={auth.clearAccessToken} />
      </View>
    );
  }

  return (
    <View>
      <GoogleAuthButton />
    </View>
  );
}

function AsyncDeviceList({ toggleThermostateModeAsync, generateCameraStreamAsync }) {
  const [devices, setDevices] = React.useState<NestDevices['devices']>(null);
  const auth = React.use(GoogleAuthContext);

  React.useEffect(() => {
    if (auth.accessToken) {
      getNestDevicesAsync({ accessToken: auth.accessToken }).then((data) => {
        console.log('nest.device:', JSON.stringify(data));
        setDevices(data.devices);
      });
    }
  }, [auth.accessToken]);

  if (!devices) {
    return <Text>Loading...</Text>;
  }

  return (
    <DeviceList
      devices={devices}
      toggleThermostateModeAsync={toggleThermostateModeAsync}
      generateCameraStreamAsync={generateCameraStreamAsync}
    />
  );
}

function DeviceList({
  devices,
  toggleThermostateModeAsync,
  generateCameraStreamAsync,
}: {
  devices: NestDevices['devices'];
}) {
  const auth = React.use(GoogleAuthContext);

  return (
    <ScrollView>
      {devices.map((device) => {
        const deviceId = device.name.split('/').pop();

        if (device.type === 'sdm.devices.types.THERMOSTAT') {
          const thermoModeInfo = device.traits['sdm.devices.traits.ThermostatMode'];
          const currentMode = thermoModeInfo.mode;
          const availableModes = thermoModeInfo?.['availableModes'] ?? [];

          const humidity = device.traits['sdm.devices.traits.Humidity']?.ambientHumidityPercent;

          return (
            <DeviceMeta device={device}>
              <ThermostatToggle
                value={currentMode !== 'OFF'}
                onPress={() => {
                  toggleThermostateModeAsync({
                    accessToken: auth.accessToken,
                    deviceId: deviceId,
                    mode: currentMode === 'OFF' ? 'HEAT' : 'OFF',
                  });
                }}
              />
              {humidity && <Text>Humidity: {humidity}%</Text>}
            </DeviceMeta>
          );
        }
        if (
          device.type === 'sdm.devices.types.CAMERA' &&
          device.name.includes(
            'AVPHwEtDbjwxaw0KicmC6YA_jmWBNOgfgqGSPQk_HJcJUNbOfkpu-_tTwKQcqJdSj6xDgave-qkNO16mC2Wk1DYmPdowqw'
          )
        ) {
          const thermoModeInfo = device.traits['sdm.devices.traits.ThermostatMode'];

          // generateCameraStreamAsync
          return (
            <DeviceMeta device={device}>
              <CameraPreview
                deviceId={deviceId}
                generateCameraStreamAsync={generateCameraStreamAsync}
              />
            </DeviceMeta>
          );
        }

        return <DeviceMeta key={deviceId} device={device} />;
      })}
    </ScrollView>
  );
}

function CameraPreview({ deviceId, generateCameraStreamAsync }) {
  const auth = React.use(GoogleAuthContext);

  const [streamUrl, setStreamUrl] = React.useState<string | null>(null);
  const [streamToken, setStreamToken] = React.useState<string | null>(null);
  const [expiresAt, setExpiresAt] = React.useState<string | null>(null);
  React.useEffect(() => {
    generateCameraStreamAsync({
      accessToken: auth.accessToken,
      deviceId,
    }).then((data) => {
      setStreamUrl(data.streamUrls.rtspUrl);
      setStreamToken(data.streamToken);
      setExpiresAt(data.expiresAt);
    });
  }, [deviceId]);

  return <Text>{streamUrl}</Text>;
}

function DeviceMeta({
  device,
  children,
}: {
  device: NestDevices['devices'][0];
  children?: React.ReactNode;
}) {
  const isOffline = device.traits['sdm.devices.traits.Connectivity']?.status === 'OFFLINE';

  let name = device.traits['sdm.devices.traits.Info']?.customName;

  if (!name) {
    const type = device.type.split('.').pop().toLowerCase();
    name = [device.parentRelations?.[0].displayName, type].filter(Boolean).join(' ');
  }

  return (
    <View
      style={[
        isOffline && { opacity: 0.3, pointerEvents: 'none' },
        { gap: 8, padding: 8, borderWidth: 1 },
      ]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontWeight: 'bold' }}>{name}</Text>
        {!!isOffline && <Text>Offline</Text>}
      </View>
      {children}
    </View>
  );
}

function ThermostatToggle({ value, onPress }) {
  return <Button title={'Toggle Thermostat: ' + value ? 'Off' : 'On'} onPress={onPress} />;
}

// function getNestCamerasAsync() {
//     // GET `/enterprises/${NEST_PROJECT_ID}/devices/device-id`
//     return fetch('https://nest.com/api/cameras').then((res) => res.json());
// }
function getNestDevicesAsync({ accessToken }) {
  // curl -X GET 'https://smartdevicemanagement.googleapis.com/v1/enterprises/project-id/devices' \
  // -H 'Content-Type: application/json' \
  // -H 'Authorization: Bearer access-token'

  // GET `/enterprises/${NEST_PROJECT_ID}/devices/device-id`
  return fetch(
    `https://smartdevicemanagement.googleapis.com/v1/enterprises/${process.env.EXPO_PUBLIC_NEST_PROJECT_ID}/devices`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  ).then((res) => res.json());
}

function CamerasView({ getDevicesAsync }) {}
