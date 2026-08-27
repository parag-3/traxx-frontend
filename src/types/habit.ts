export type HabitType = 'NUMERICAL' | 'STATUS';
export type AggregationType = 'SUM' | 'AVERAGE' | 'MAX' | 'MIN';

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
