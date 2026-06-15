import React, { createContext, useContext, useState } from "react";

type Session = {
  duration: number;
  date: string;
  subject: string;
};

type StudyContextType = {
  sessions: Session[];
  subjects: string[];
  addSession: (duration: number, subject: string) => void;
};

const StudyContext = createContext<StudyContextType>({} as StudyContextType);

export function StudyProvider({ children }: React.PropsWithChildren) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [subjects] = useState<string[]>([
    "Matemática",
    "Português",
    "História",
    "Inglês",
  ]);

  function addSession(duration: number, subject: string) {
    const today = new Date().toISOString().split("T")[0];

    setSessions((prev) => [...prev, { duration, date: today, subject }]);
  }

  return (
    <StudyContext.Provider value={{ sessions, subjects, addSession }}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  return useContext(StudyContext);
}
