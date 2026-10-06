import { Image } from "expo-image";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LanguagePicker } from "@/components/language-picker";
import { StudentColors as colors } from "@/constants/student-theme";
import { useTranslation } from "@/localization/translations";
import { Student, useStudentStore } from "@/students/student-store";

export default function StudentListScreen() {
  const { t } = useTranslation();
  const { students, isLoading, hasLoadError } = useStudentStore();
  const openStudent = (student: Student) => {
    router.push({
      pathname: "/student/[id]",
      params: { id: student.studentId },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.topLine}>
          <Text style={styles.eyebrow}>{t("eyebrow")}</Text>
          <View style={styles.topActions}>
            <LanguagePicker />
            <View style={styles.countPill}>
              <Text style={styles.countNumber}>{students.length}</Text>
              <Text style={styles.countLabel}>{t("studentCount")}</Text>
            </View>
          </View>
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{t("title")}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/student-form")}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.addMark}>+</Text>
            <Text style={styles.addLabel}>{t("addStudent")}</Text>
          </Pressable>
        </View>
        {hasLoadError ? (
          <Text style={styles.errorText}>{t("loadError")}</Text>
        ) : isLoading ? (
          <Text style={styles.statusText}>...</Text>
        ) : students.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyGlyph}>
              <Text style={styles.emptyGlyphText}>S</Text>
            </View>
            <Text style={styles.emptyTitle}>{t("emptyTitle")}</Text>
            <Text style={styles.emptyDescription}>{t("emptyDescription")}</Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={students}
            keyExtractor={(student) => student.studentId}
            renderItem={({ item }) => (
              <StudentRow student={item} onPress={openStudent} />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function StudentRow({
  student,
  onPress,
}: {
  student: Student;
  onPress: (student: Student) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(student)}
      style={({ pressed }) => [styles.studentRow, pressed && styles.pressed]}
    >
      {student.avatarUri ? (
        <Image
          contentFit="cover"
          source={{ uri: student.avatarUri }}
          style={styles.avatar}
        />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarInitial}>
            {student.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.studentCopy}>
        <Text numberOfLines={1} style={styles.studentName}>
          {student.name}
        </Text>
        <Text numberOfLines={1} style={styles.studentMeta}>
          {student.studentId} · {student.email}
        </Text>
      </View>
      <Text accessibilityElementsHidden style={styles.chevron}>
        ›
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    alignSelf: "center",
    width: "100%",
    maxWidth: 760,
    paddingHorizontal: 22,
    paddingTop: 16,
  },
  topLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyebrow: {
    color: colors.green,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  countPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.paleGreen,
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  countNumber: { color: colors.greenDark, fontSize: 12, fontWeight: "800" },
  countLabel: { color: colors.secondary, fontSize: 11 },
  titleRow: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    color: colors.text,
    fontFamily: "Georgia",
    fontSize: 34,
    flexShrink: 1,
  },
  addButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.green,
    borderRadius: 8,
    paddingHorizontal: 13,
  },
  addMark: { color: colors.lime, fontSize: 22, lineHeight: 24 },
  addLabel: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  listContent: { gap: 9, paddingBottom: 28 },
  studentRow: {
    minHeight: 80,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    backgroundColor: colors.surface,
    padding: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.paleGreen,
  },
  avatarFallback: { alignItems: "center", justifyContent: "center" },
  avatarInitial: { color: colors.green, fontFamily: "Georgia", fontSize: 22 },
  studentCopy: { flex: 1, gap: 5 },
  studentName: { color: colors.text, fontSize: 15, fontWeight: "700" },
  studentMeta: { color: colors.secondary, fontSize: 12 },
  chevron: { color: colors.green, fontSize: 26, paddingHorizontal: 2 },
  emptyState: {
    flex: 1,
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 42,
  },
  emptyGlyph: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lime,
    borderRadius: 18,
    transform: [{ rotate: "-7deg" }],
    marginBottom: 20,
  },
  emptyGlyphText: {
    color: colors.greenDark,
    fontFamily: "Georgia",
    fontSize: 30,
    transform: [{ rotate: "7deg" }],
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: "Georgia",
    fontSize: 23,
    textAlign: "center",
  },
  emptyDescription: {
    maxWidth: 290,
    color: colors.secondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 9,
  },
  statusText: { color: colors.secondary, textAlign: "center", padding: 24 },
  errorText: { color: colors.coral, textAlign: "center", padding: 24 },
  pressed: { opacity: 0.76 },
});
