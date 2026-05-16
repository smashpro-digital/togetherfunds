import { StyleSheet, View } from "react-native";
import { colors } from "../theme";
import { clampProgress } from "../utils/format";

export function ProgressBar({ progress }: { progress: number }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clampProgress(progress) * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    backgroundColor: colors.teal,
    borderRadius: 999,
    height: "100%"
  },
  track: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: 999,
    height: 10,
    overflow: "hidden"
  }
});
