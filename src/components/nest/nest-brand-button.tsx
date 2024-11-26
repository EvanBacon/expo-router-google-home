import NestSvg from "@/components/svg/nest";
import * as React from "react";
import { Text, TouchableHighlight, ViewStyle } from "react-native";

export function NestBrandButton({
  title,
  disabled,
  onPress,
  style,
}: {
  title: string;
  disabled?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}) {
  return (
    <TouchableHighlight
      disabled={disabled}
      onPress={onPress}
      style={[
        {
          backgroundColor: "#4285F4",
          flexDirection: "row",
          borderRadius: 6,
          gap: 12,
          justifyContent: "center",
          alignItems: "center",
          padding: 12,
        },
        style,
      ]}
      underlayColor="#4285F4"
    >
      <>
        <NestSvg style={{ width: 24, height: 24 }} />
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>{title}</Text>
      </>
    </TouchableHighlight>
  );
}
