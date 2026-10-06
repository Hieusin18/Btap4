import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LanguagePicker } from "@/components/language-picker";
import { StudentColors as colors } from "@/constants/student-theme";
import { useTranslation } from "@/localization/translations";
import { useStudentStore } from "@/students/student-store";

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { students, isLoading, deleteStudent } = useStudentStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const student = students.find((record) => record.studentId === id);

  const confirmDelete = () => {
    const removeStudent = async () => {
      if (!student) return;
      setIsDeleting(true);
      try {
        await deleteStudent(student.studentId);
        router.replace("/");
      } catch {
        Alert.alert(t("appName"), t("storageError"));
      } finally {
        setIsDeleting(false);
      }
    };

    if (Platform.OS === "web") {
      if (globalThis.confirm(t("confirmDelete"))) void removeStudent();
      return;
    }

    Alert.alert(t("appName"), t("confirmDelete"), [
      { text: t("no"), style: "cancel" },
      {
        text: t("confirm"),
        style: "destructive",
        onPress: () => void removeStudent(),
      },
    ]);
  };

  if (isLoading) return <SafeAreaView style={styles.safeArea} />;
  if (!student) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹ {t("back")}</Text>
        </Pressable>
        <Text style={styles.notFound}>{t("missingStudent")}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.navigationRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹ {t("back")}</Text>
          </Pressable>
          <LanguagePicker />
        </View>
        <Text style={styles.eyebrow}>
          {t("detailTitle").toLocaleUpperCase()}
        </Text>
        <View style={styles.profile}>
          <Image
            contentFit="cover"
            source={{ uri: student.avatarUri }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.studentNumber}>{student.studentId}</Text>
        </View>

        <View style={styles.details}>
          <DetailField label={t("idLabel")} value={student.studentId} />
          <View style={styles.divider} />
          <DetailField label={t("emailLabel")} value={student.email} />
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/student-form",
                params: { id: student.studentId },
              })
            }
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.editButtonText}>{t("edit")}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isDeleting}
            onPress={confirmDelete}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.deleteButtonText}>{t("delete")}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text selectable style={styles.fieldValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    alignSelf: "center",
    width: "100%",
    maxWidth: 680,
    paddingHorizontal: 22,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 13,
    paddingRight: 16,
  },
  navigationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backText: { color: colors.green, fontSize: 14, fontWeight: "700" },
  eyebrow: {
    color: colors.green,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginTop: 15,
    textAlign: "center",
  },
  profile: { alignItems: "center", paddingTop: 25, paddingBottom: 30 },
  avatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: colors.paleGreen,
    borderWidth: 4,
    borderColor: colors.surface,
  },
  name: {
    color: colors.text,
    fontFamily: "Georgia",
    fontSize: 27,
    textAlign: "center",
    marginTop: 18,
  },
  studentNumber: { color: colors.secondary, fontSize: 14, marginTop: 6 },
  details: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingHorizontal: 17,
  },
  detailField: { paddingVertical: 16, gap: 7 },
  fieldLabel: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  fieldValue: { color: colors.text, fontSize: 15 },
  divider: { height: 1, backgroundColor: colors.border },
  actions: { gap: 10, marginTop: 20 },
  editButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green,
    borderRadius: 8,
  },
  editButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  deleteButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E9C7BF",
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  deleteButtonText: { color: colors.coral, fontSize: 14, fontWeight: "700" },
  notFound: { color: colors.secondary, textAlign: "center", marginTop: 40 },
  pressed: { opacity: 0.76 },
});
