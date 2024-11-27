"use dom";

import React, { useEffect, useRef, useState } from "react";
import { generateWebRtcStream } from "./nest-server-actions";

interface WebRTCPlayerProps {
  onOfferCreated: (offerSdp: string) => void;
  answerSdp?: string;
}

import "@/global.css";

export default function WebRTCPlayerWithAuth({
  accessToken,
  deviceId,
}: {
  accessToken: string;
  deviceId: string;
}) {
  const [answerSdp, setAnswerSdp] = useState<string | undefined>(undefined);

  return (
    <WebRTCPlayer
      onOfferCreated={async (offer) => {
        generateWebRtcStream(
          { access_token: accessToken },
          {
            deviceId,
            offerSdp: offer,
          }
        ).then((data) => {
          setAnswerSdp(data.results.answerSdp);
        });
      }}
      answerSdp={answerSdp}
    />
  );
}

interface WebRTCPlayerProps {
  onOfferCreated: (offerSdp: string) => void;
  answerSdp?: string;
}

function WebRTCPlayer({ onOfferCreated, answerSdp }: WebRTCPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [error, setError] = useState<string>("");
  const offerCreatedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function setupWebRTC() {
      try {
        // Only setup if we haven't already
        if (offerCreatedRef.current) return;

        const pc = new RTCPeerConnection({
          iceServers: [],
          sdpSemantics: "unified-plan",
        });
        peerConnectionRef.current = pc;

        // Add transceivers in the required order
        pc.addTransceiver("audio", {
          direction: "recvonly",
          streams: [new MediaStream()],
        });

        pc.addTransceiver("video", {
          direction: "recvonly",
          streams: [new MediaStream()],
        });

        pc.createDataChannel("data");

        // Handle incoming tracks
        pc.ontrack = (event) => {
          if (videoRef.current && event.streams?.[0]) {
            videoRef.current.srcObject = event.streams[0];
          }
        };

        // Create and set local description
        const offer = await pc.createOffer();

        // Ensure the order of m-lines in SDP is correct
        let sdp = offer.sdp;
        if (sdp) {
          const sections = sdp.split("m=");
          const ordered = [
            sections[0],
            sections.find((s) => s.startsWith("audio")),
            sections.find((s) => s.startsWith("video")),
            sections.find((s) => s.startsWith("application")),
          ]
            .filter(Boolean)
            .join("m=");
          offer.sdp = ordered;
        }

        await pc.setLocalDescription(offer);

        // Wait for ICE gathering to complete
        await new Promise<void>((resolve) => {
          if (pc.iceGatheringState === "complete") {
            resolve();
          } else {
            pc.addEventListener("icegatheringstatechange", () => {
              if (pc.iceGatheringState === "complete") {
                resolve();
              }
            });
          }
        });

        if (isMounted && pc.localDescription?.sdp) {
          offerCreatedRef.current = true;
          onOfferCreated(pc.localDescription.sdp);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to setup WebRTC"
          );
          console.error("WebRTC setup error:", err);
        }
      }
    }

    setupWebRTC();

    return () => {
      isMounted = false;
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      offerCreatedRef.current = false;
    };
  }, []); // Remove onOfferCreated from dependencies

  useEffect(() => {
    async function handleAnswer() {
      const pc = peerConnectionRef.current;
      if (!pc || !answerSdp || !offerCreatedRef.current) return;

      try {
        if (pc.signalingState !== "have-local-offer") {
          console.log("Wrong signaling state:", pc.signalingState);
          return;
        }

        console.log("Setting remote description...");
        console.log("Current signaling state:", pc.signalingState);
        console.log("Current connection state:", pc.connectionState);

        await pc.setRemoteDescription(
          new RTCSessionDescription({
            type: "answer",
            sdp: answerSdp,
          })
        );

        console.log("Remote description set successfully");
        console.log("New signaling state:", pc.signalingState);
        console.log("New connection state:", pc.connectionState);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to set remote description"
        );
        console.error("Error setting remote description:", err);
      }
    }

    handleAnswer();
  }, [answerSdp]);

  return (
    <div className="relative w-full aspect-video bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-contain"
      />
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
          {error}
        </div>
      )}
    </div>
  );
}
