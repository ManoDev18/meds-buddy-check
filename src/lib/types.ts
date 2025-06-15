export type Medication = {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  created_at: string;
};

export type MedicationLog = {
  id: string;
  user_id: string;
  medication_id: string;
  date: string;
  created_at: string;
};

export type UserType = 'patient' | 'caretaker';

export type DashboardStats = {
  adherenceRate: number;
  currentStreak: number;
  missedDoses: number;
  takenThisWeek: number;
};

export type RecentActivity = {
  date: string;
  taken: boolean;
  time: string | null;
  hasPhoto: boolean;
  medication_id: string;
  medication_name: string;
}; 