import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";

import { LanguageProvider } from "@/localization/translations";
import { StudentStoreProvider } from "@/students/student-store";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <LanguageProvider>
        <StudentStoreProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="student/[id]" />
            <Stack.Screen name="student-form" />
          </Stack>
        </StudentStoreProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
