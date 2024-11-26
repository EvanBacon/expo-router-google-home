'use client';

import { useState } from 'react';
import { Button, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { mediaDevices, RTCView } from 'react-native-webrtc';

export function NestLiveStream({ streamUrl }: { streamUrl: string }) {
  const [stream, setStream] = useState(null);
  const start = async () => {
    console.log('start');
    if (!stream) {
      try {
        const s = await mediaDevices.getUserMedia({ video: true });

        setStream(s);
      } catch (e) {
        console.error(e);
      }
    }
  };
  const stop = () => {
    console.log('stop');
    if (stream) {
      stream.release();
      setStream(null);
    }
  };
  return (
    <>
      {stream && <RTCView streamURL={stream.toURL()} style={styles.stream} />}
      <View style={styles.footer}>
        <Button title="Start" onPress={start} />
        <Button title="Stop" onPress={stop} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    ...StyleSheet.absoluteFillObject,
  },
  stream: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
