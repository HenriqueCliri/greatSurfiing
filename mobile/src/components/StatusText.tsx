import { StyleSheet, Text } from "react-native";
import React from "react";
import { BeachStatus } from "../types/beach";

interface StatusTextProps {
  status: BeachStatus;
}

function getStatusColor(status: BeachStatus): string {
  if (status === "GOOD") {
    return "#16a34a";
  }

  if (status === "MEDIUM") {
    return "#ca8a04";
  }

  return "#dc2626";
}

export default function StatusText({ status }: StatusTextProps): React.ReactElement {
  return <Text style={[styles.status, { color: getStatusColor(status) }]}>{status}</Text>;
}

const styles = StyleSheet.create({
  status: {
    marginTop: 4,
    marginBottom: 16,
    textAlign: "center",
    fontSize: 56,
    fontWeight: "900",
  },
});
