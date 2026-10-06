import { Pressable, StyleSheet, Text, View } from "react-native";

import { StudentColors as colors } from "@/constants/student-theme";
import { Language, useTranslation } from "@/localization/translations";

const options: { code: Language; label: string; accessibilityLabel: string }[] =
  [
    { code: "vi", label: "VI", accessibilityLabel: "Vietnamese" },
    { code: "en", label: "EN", accessibilityLabel: "English" },
  ];

export function LanguagePicker() {
  const { language, setLanguage } = useTranslation();

  return (
    <View accessibilityRole="radiogroup" style={styles.container}>
      {options.map((option) => {
        const selected = language === option.code;
        return (
          <Pressable
            key={option.code}
            accessibilityLabel={option.accessibilityLabel}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => setLanguage(option.code)}
            style={[styles.option, selected && styles.selectedOption]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 3,
    borderRadius: 8,
    backgroundColor: colors.paleGreen,
  },
  option: {
    minWidth: 37,
    minHeight: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    paddingHorizontal: 7,
  },
  selectedOption: { backgroundColor: colors.green },
  label: { color: colors.secondary, fontSize: 11, fontWeight: "800" },
  selectedLabel: { color: "#FFFFFF" },
});
