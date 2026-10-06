import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

export type Student = {
  studentId: string;
  name: string;
  email: string;
  avatarUri: string;
};

type StudentStoreValue = {
  students: Student[];
  isLoading: boolean;
  hasLoadError: boolean;
  saveStudent: (
    student: Student,
    isNew: boolean,
    previousId?: string,
  ) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
};

const storageKey = "@student-directory/students";
const StudentStoreContext = createContext<StudentStoreValue | null>(null);

export function StudentStoreProvider({ children }: PropsWithChildren) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(storageKey)
      .then((storedValue) => {
        if (isMounted && storedValue) {
          setStudents(JSON.parse(storedValue) as Student[]);
        }
      })
      .catch(() => {
        if (isMounted) setHasLoadError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const persist = async (nextStudents: Student[]) => {
    await AsyncStorage.setItem(storageKey, JSON.stringify(nextStudents));
    setStudents(nextStudents);
  };

  const saveStudent = async (
    student: Student,
    isNew: boolean,
    previousId?: string,
  ) => {
    const nextStudents = isNew
      ? [...students, student]
      : students.map((record) =>
          record.studentId === previousId ? student : record,
        );
    await persist(nextStudents);
  };

  const deleteStudent = async (studentId: string) => {
    await persist(
      students.filter((student) => student.studentId !== studentId),
    );
  };

  return (
    <StudentStoreContext.Provider
      value={{ students, isLoading, hasLoadError, saveStudent, deleteStudent }}
    >
      {children}
    </StudentStoreContext.Provider>
  );
}

export function useStudentStore() {
  const store = useContext(StudentStoreContext);
  if (!store)
    throw new Error("useStudentStore must be used inside StudentStoreProvider");
  return store;
}
