export type AuthSession = {
  user_id: number;
  username: string;
  email: string | null;
  token: string;
};

export type CurrentUser = {
  user_id: number;
  username: string;
  email: string | null;
};

export type AccountOption = { id: number; name: string };

export type Account = CurrentUser & {
  daily_goal_seconds: number;
  categories: AccountOption[];
  subjects: AccountOption[];
};

export type Task = {
  id: number;
  user_id: number;
  title: string;
  priority: string;
  due_date: string;
  time: string | null;
  category: string | null;
  description: string | null;
  completed: boolean;
};

export type TaskCreate = Omit<Task, "id" | "user_id" | "completed">;

export type Dashboard = {
  today: {
    study_seconds: number;
    sessions: number;
    daily_goal_seconds: number;
    goal_progress_percent: number;
  };
  week: {
    study_seconds_by_day: number[];
    total_seconds: number;
  };
  tasks: { total: number; completed: number; pending: number };
  streak_days: number;
  subjects: {
    subject: string;
    study_seconds: number;
    percentage: number;
  }[];
};

export type FormOptions = {
  subjects: string[];
  categories: string[];
  priorities: string[];
  session_types: string[];
};

export type Preferences = { daily_goal_seconds: number };

export type StudySessionCreate = {
  duration: number;
  subject: string;
  session_type: string | null;
  date?: string;
};
