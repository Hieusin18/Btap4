import { File, Paths } from "expo-file-system";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LanguagePicker } from "@/components/language-picker";
import { StudentColors as colors } from "@/constants/student-theme";
import { useTranslation } from "@/localization/translations";
import { Student, useStudentStore } from "@/students/student-store";

export default function StudentFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const { t } = useTranslation();
  const { students, isLoading, saveStudent } = useStudentStore();
  const existingStudent = students.find((student) => student.studentId === id);
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUri, setAvatarUri] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!existingStudent) return;
    setStudentId(existingStudent.studentId);
    setName(existingStudent.name);
    setEmail(existingStudent.email);
    setAvatarUri(existingStudent.avatarUri);
  }, [existingStudent]);

  const notify = (message: string) => {
    if (Platform.OS === "web") globalThis.alert(message);
    else Alert.alert(t("appName"), message);
  };

  const pickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const extension =
          asset.fileName
            ?.split(".")
            .pop()
            ?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
        if (Platform.OS === "web") {
          const response = await fetch(asset.uri);
          const imageBlob = await response.blob();
          const dataUri = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () =>
              reject(new Error("Unable to read selected image"));
            reader.readAsDataURL(imageBlob);
          });
          setAvatarUri(dataUri);
        } else {
          const destination = new File(
            Paths.document,
            `student-${Date.now()}.${extension}`,
          );
          await new File(asset.uri).copy(destination);
          setAvatarUri(destination.uri);
        }
      }
    } catch {
      notify(t("photoError"));
    }
  };

  const save = async () => {
    const trimmedId = studentId.trim();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedAvatar = avatarUri.trim();

    if (!trimmedId || !trimmedName || !trimmedEmail || !trimmedAvatar) {
      notify(t("requiredFields"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      notify(t("invalidEmail"));
      return;
    }
    const duplicate = students.some(
      (student) =>
        student.studentId.toLocaleLowerCase() ===
          trimmedId.toLocaleLowerCase() && student.studentId !== id,
    );
    if (duplicate) {
      notify(t("duplicateId"));
      return;
    }

    const student: Student = {
      studentId: trimmedId,
      name: trimmedName,
      email: trimmedEmail,
      avatarUri: trimmedAvatar,
    };
    const saveConfirmed = async () => {
      setIsSaving(true);
      try {
        await saveStudent(student, !isEditing, id);
        router.replace({
          pathname: "/student/[id]",
          params: { id: trimmedId },
        });
      } catch {
        notify(t("storageError"));
      } finally {
        setIsSaving(false);
      }
    };

    if (!isEditing) {
      await saveConfirmed();
      return;
    }
    if (Platform.OS === "web") {
      if (globalThis.confirm(t("confirmEdit"))) await saveConfirmed();
      return;
    }
    Alert.alert(t("appName"), t("confirmEdit"), [
      { text: t("no"), style: "cancel" },
      { text: t("confirm"), onPress: () => void saveConfirmed() },
    ]);
  };

  if (isLoading) return <SafeAreaView style={styles.safeArea} />;
  if (isEditing && !existingStudent) {
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
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
            <Text style={styles.eyebrow}>{t("eyebrow")}</Text>
            <Text style={styles.title}>
              {isEditing ? t("editTitle") : t("createTitle")}
            </Text>

            <View style={styles.avatarSection}>
              {avatarUri ? (
                <Image
                  contentFit="cover"
                  source={{ uri: avatarUri }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarPlaceholderText}>+</Text>
                </View>
              )}
              <Text style={styles.avatarLabel}>{t("avatar")}</Text>
              <Text style={styles.avatarHint}>{t("photoHint")}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => void pickAvatar()}
                style={styles.photoButton}
              >
                <Text style={styles.photoButtonText}>{t("choosePhoto")}</Text>
              </Pressable>
            </View>

            <View style={styles.fields}>
              <FormField
                label={t("fullName")}
                onChangeText={setName}
                value={name}
              />
              <FormField
                label={t("studentId")}
                onChangeText={setStudentId}
                value={studentId}
              />
              <FormField
                autoCapitalize="none"
                keyboardType="email-address"
                label={t("email")}
                onChangeText={setEmail}
                value={email}
              />
            </View>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                disabled={isSaving}
                onPress={() => void save()}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? "..." : t("save")}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.back()}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: {
    flex: 1,
    alignSelf: "center",
    width: "100%",
    maxWidth: 680,
    paddingHorizontal: 22,
    paddingBottom: 28,
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
    marginTop: 9,
  },
  title: {
    color: colors.text,
    fontFamily: "Georgia",
    fontSize: 29,
    marginTop: 5,
  },
  avatarSection: { alignItems: "center", paddingVertical: 18 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.paleGreen,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  avatarPlaceholderText: { color: colors.green, fontSize: 28 },
  avatarLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10,
  },
  avatarHint: {
    color: colors.secondary,
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  photoButton: {
    borderBottomWidth: 1,
    borderBottomColor: colors.green,
    marginTop: 8,
    paddingVertical: 5,
  },
  photoButtonText: { color: colors.green, fontSize: 13, fontWeight: "700" },
  fields: { gap: 14 },
  field: { gap: 6 },
  fieldLabel: { color: colors.text, fontSize: 13, fontWeight: "700" },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: 13,
  },
  actions: { gap: 9, marginTop: 21 },
  saveButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green,
    borderRadius: 8,
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  cancelButton: {
    minHeight: 43,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: "600",
  },
  notFound: { color: colors.secondary, textAlign: "center", marginTop: 40 },
  pressed: { opacity: 0.76 },
});
