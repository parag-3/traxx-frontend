export type HabitType = 'NUMERICAL' | 'STATUS';
export type AggregationType = 'SUM' | 'AVERAGE' | 'MAX' | 'MIN';
export type FrequencyType = 'DAILY' | 'WEEKDAYS' | 'WEEKENDS' | 'CUSTOM_DAYS' | 'TIMES_PER_WEEK';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface HabitStatusOption {
  id?: string;
  label: string;
  value: string;
  color: string;
  order: number;
  isCompleted: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  numericValue: number | null;
  statusValue: string | null;
  isCompleted: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DayHistory {
  date: string;
  isCompleted: boolean;
  isScheduled?: boolean;
  numericValue: number | null;
  statusValue: string | null;
  color: string | null;
}

export interface Habit {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  color: string;
  icon: string;
  type: HabitType;
  unit: string | null;
  targetValue: number | null;
  aggregationType: AggregationType | null;
  startDate: string;
  frequencyType: FrequencyType;
  frequencyDays: string | null;
  frequencyTarget: number | null;
  reminderEnabled: boolean;
  reminderTime: string | null;
  isScheduledToday?: boolean;
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
  statusOptions: HabitStatusOption[];
  todayLog: HabitLog | null;
  history7Days: DayHistory[];
}

export interface NumericalStats {
  totalSum: number;
  dailyAverage: number;
  maxValue: number;
  unit: string | null;
  targetValue: number | null;
  aggregationType: string | null;
}

export interface StatusDistributionItem {
  label: string;
  value: string;
  color: string;
  count: number;
  percentage: number;
  isCompleted: boolean;
}

export interface HabitStats {
  habitId: string;
  title: string;
  type: HabitType;
  currentStreak: number;
  bestStreak: number;
  totalLoggedDays: number;
  completedDays: number;
  completionRate: string;
  numericalStats: NumericalStats | null;
  statusDistribution: StatusDistributionItem[];
}

// ----------------------------------------------------
// TASK & DAILY PLANNER TYPES
// ----------------------------------------------------

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  date: string;
  isCompleted: boolean;
  priority: TaskPriority;
  category: string | null;
  time: string | null;
  reminderTime: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyPlanItem {
  id: string;
  originalId: string;
  itemType: 'HABIT' | 'TASK';
  title: string;
  description: string | null;
  category: string;
  color: string;
  icon: string;
  isCompleted: boolean;
  time: string | null;
  reminderTime: string | null;
  priority: string;
  habitData?: Habit;
  taskData?: Task;
}

export interface DailyPlanSummary {
  totalCount: number;
  completedCount: number;
  completionPercentage: number;
  habitsTotal: number;
  habitsCompleted: number;
  tasksTotal: number;
  tasksCompleted: number;
}

export interface DailyPlanResponse {
  date: string;
  summary: DailyPlanSummary;
  habits: Habit[];
  tasks: Task[];
  allItems: DailyPlanItem[];
}

export interface ReminderItem {
  id: string;
  sourceId: string;
  sourceType: 'HABIT' | 'TASK';
  title: string;
  category: string | null;
  color: string;
  icon: string;
  reminderTime: string;
  isCompleted: boolean;
}
