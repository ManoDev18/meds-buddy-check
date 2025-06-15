import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import supabase from '@/helpers/supabaseClient';
import { Medication, MedicationLog } from '@/lib/types';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

export const useMedications = (userId: string) => {
  const queryClient = useQueryClient();

  const { data: medications, isLoading: isLoadingMedications } = useQuery({
    queryKey: ['medications', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Medication[];
    },
    enabled: !!userId,
  });

  const { data: medicationLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['medicationLogs', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medication_logs')
        .select('*, medications(name)')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as (MedicationLog & { medications: { name: string } })[];
    },
    enabled: !!userId,
  });

  const addMedication = useMutation({
    mutationFn: async (medication: Omit<Medication, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('medications')
        .insert(medication)
        .select()
        .single();

      if (error) throw error;
      return data as Medication;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', userId] });
    },
  });

  const markMedicationTaken = useMutation({
    mutationFn: async ({ medicationId, date }: { medicationId: string; date: string }) => {
      const { data, error } = await supabase
        .from('medication_logs')
        .insert({
          user_id: userId,
          medication_id: medicationId,
          date,
        })
        .select()
        .single();

      if (error) throw error;
      return data as MedicationLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicationLogs', userId] });
    },
  });

  const getDashboardStats = () => {
    if (!medications || !medicationLogs) return null;

    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Calculate adherence rate for the current month
    const daysInMonth = monthEnd.getDate();
    const logsThisMonth = medicationLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= monthStart && logDate <= monthEnd;
    });
    const uniqueDatesTaken = new Set(logsThisMonth.map(log => log.date)).size;
    const adherenceRate = Math.round((uniqueDatesTaken / daysInMonth) * 100);

    // Calculate current streak
    let currentStreak = 0;
    let currentDate = today;
    while (medicationLogs.some(log => log.date === format(currentDate, 'yyyy-MM-dd'))) {
      currentStreak++;
      currentDate = subDays(currentDate, 1);
    }

    // Calculate missed doses this month
    const missedDoses = daysInMonth - uniqueDatesTaken;

    // Calculate taken this week
    const takenThisWeek = medicationLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= weekStart && logDate <= weekEnd;
    }).length;

    return {
      adherenceRate,
      currentStreak,
      missedDoses,
      takenThisWeek,
    };
  };

  const getRecentActivity = () => {
    if (!medicationLogs) return [];

    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);

    return medicationLogs
      .filter(log => {
        const logDate = new Date(log.date);
        return logDate >= weekStart && logDate <= weekEnd;
      })
      .map(log => ({
        date: log.date,
        taken: true,
        time: format(new Date(log.created_at), 'h:mm a'),
        hasPhoto: false, // TODO: Implement photo upload
        medication_id: log.medication_id,
        medication_name: log.medications.name,
      }));
  };

  return {
    medications,
    medicationLogs,
    isLoading: isLoadingMedications || isLoadingLogs,
    addMedication,
    markMedicationTaken,
    getDashboardStats,
    getRecentActivity,
  };
}; 