import { StyleSheet, Text, View } from "react-native";

interface InfoCardProps {
  label: string;
  value: string;
}

export default function InfoCard({ label, value }: InfoCardProps): JSX.Element {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    color: "#64748b",
  },
  value: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
  },
});
