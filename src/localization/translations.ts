import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocales } from "expo-localization";
import type { PropsWithChildren } from "react";
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
} from "react";

const translations = {
  en: {
    appName: "Student Directory",
    languageVietnamese: "Vietnamese",
    languageEnglish: "English",
    eyebrow: "CAMPUS RECORDS",
    title: "Students",
    studentCount: "students",
    addStudent: "Add student",
    emptyTitle: "Your directory starts here",
    emptyDescription: "Add a student to keep their details close at hand.",
    detailTitle: "Student details",
    edit: "Edit details",
    delete: "Delete student",
    back: "Back",
    studentId: "Student ID",
    fullName: "Full name",
    email: "Email address",
    avatar: "Student avatar",
    choosePhoto: "Upload from device",
    photoHint: "Choose a photo from your device.",
    createTitle: "New student",
    editTitle: "Edit student",
    save: "Save student",
    cancel: "Cancel",
    confirm: "Yes",
    no: "No",
    confirmEdit: "Do you want to edit this student information?",
    confirmDelete: "Do you want to delete this student information?",
    requiredFields: "Complete all fields and add an avatar before saving.",
    invalidEmail: "Enter a valid email address.",
    duplicateId: "This student ID is already in use.",
    missingStudent: "Student not found.",
    storageError: "Could not save changes. Please try again.",
    loadError: "Could not load student records.",
    photoError: "Could not open the photo library.",
    emailLabel: "EMAIL",
    idLabel: "STUDENT ID",
  },
  vi: {
    appName: "Danh bạ sinh viên",
    languageVietnamese: "Tiếng Việt",
    languageEnglish: "Tiếng Anh",
    eyebrow: "HỒ SƠ SINH VIÊN",
    title: "Sinh viên",
    studentCount: "sinh viên",
    addStudent: "Thêm sinh viên",
    emptyTitle: "Danh bạ của bạn bắt đầu tại đây",
    emptyDescription: "Thêm sinh viên để lưu thông tin và tra cứu dễ dàng.",
    detailTitle: "Thông tin sinh viên",
    edit: "Sửa thông tin",
    delete: "Xóa sinh viên",
    back: "Quay lại",
    studentId: "Mã số sinh viên",
    fullName: "Họ và tên",
    email: "Địa chỉ email",
    avatar: "Ảnh đại diện sinh viên",
    choosePhoto: "Tải ảnh từ thiết bị",
    photoHint: "Chọn ảnh từ thiết bị của bạn.",
    createTitle: "Thêm sinh viên",
    editTitle: "Sửa thông tin sinh viên",
    save: "Lưu sinh viên",
    cancel: "Hủy",
    confirm: "Có",
    no: "Không",
    confirmEdit: "Bạn có muốn sửa thông tin SV không?",
    confirmDelete: "Bạn có muốn xóa thông tin SV không?",
    requiredFields: "Vui lòng nhập đủ thông tin và thêm ảnh đại diện.",
    invalidEmail: "Vui lòng nhập địa chỉ email hợp lệ.",
    duplicateId: "Mã số sinh viên này đã được sử dụng.",
    missingStudent: "Không tìm thấy sinh viên.",
    storageError: "Không thể lưu thay đổi. Vui lòng thử lại.",
    loadError: "Không thể tải danh sách sinh viên.",
    photoError: "Không thể mở thư viện ảnh.",
    emailLabel: "EMAIL",
    idLabel: "MÃ SỐ SV",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
export type Language = keyof typeof translations;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const languageStorageKey = "@student-directory/language";
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const locales = useLocales();
  const deviceLanguage: Language =
    locales[0]?.languageCode === "vi" ? "vi" : "en";
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(languageStorageKey)
      .then((storedLanguage) => {
        if (isMounted && (storedLanguage === "en" || storedLanguage === "vi")) {
          setSelectedLanguage(storedLanguage);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  const language = selectedLanguage ?? deviceLanguage;
  const setLanguage = (nextLanguage: Language) => {
    setSelectedLanguage(nextLanguage);
    void AsyncStorage.setItem(languageStorageKey, nextLanguage).catch(
      () => undefined,
    );
  };

  return createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage } },
    children,
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used inside LanguageProvider");
  }
  const { language, setLanguage } = context;

  return {
    language,
    setLanguage,
    t: (key: TranslationKey) => translations[language][key],
  };
}
