import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar as CalendarIcon, Image, User, Loader2 } from "lucide-react";
import MedicationTracker from "./MedicationTracker";
import { format, isToday, isBefore, startOfDay } from "date-fns";
import { useMedications } from "@/hooks/useMedications";
import supabase from "@/helpers/supabaseClient";
import { useToast } from "@/hooks/use-toast";

const PatientDashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    medications,
    medicationLogs,
    isLoading,
    markMedicationTaken,
    getDashboardStats,
  } = useMedications(userId || '');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const isTodaySelected = isToday(selectedDate);

  // Create a map of date -> medication IDs that were taken
  const medicationTakenMap = medicationLogs?.reduce((map, log) => {
    const dateStr = log.date;
    if (!map.has(dateStr)) {
      map.set(dateStr, new Set());
    }
    map.get(dateStr)?.add(log.medication_id);
    return map;
  }, new Map<string, Set<string>>());

  // Check which medications were taken on the selected date
  const takenMedications = medications?.filter(med => 
    medicationTakenMap?.get(selectedDateStr)?.has(med.id)
  ) || [];
  const allMedicationsTaken = takenMedications.length === medications?.length;
  const someMedicationsTaken = takenMedications.length > 0;

  const handleMarkTaken = async (date: string, imageFile?: File) => {
    if (!medications?.length) {
      toast({
        title: "No medications",
        description: "Please add medications first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Only mark medications that haven't been taken yet
      const medicationsToMark = medications.filter(med => 
        !medicationTakenMap?.get(date)?.has(med.id)
      );

      if (medicationsToMark.length === 0) {
        toast({
          title: "Already taken",
          description: "All medications have already been marked as taken for today",
        });
        return;
      }

      await Promise.all(
        medicationsToMark.map(med => 
          markMedicationTaken.mutateAsync({
            medicationId: med.id,
            date,
            image: imageFile,
          })
        )
      );

      toast({
        title: "Success",
        description: medicationsToMark.length === medications.length
          ? "All medications marked as taken"
          : `${medicationsToMark.length} medication(s) marked as taken`,
      });
    } catch (error) {
      console.error('Error marking medications as taken:', error);
      toast({
        title: "Error",
        description: "Failed to mark medications as taken",
        variant: "destructive",
      });
    }
  };

  const stats = getDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!</h2>
            <p className="text-white/90 text-lg">Ready to stay on track with your medication?</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{stats?.currentStreak || 0}</div>
            <div className="text-white/80">Day Streak</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">
              {medicationTakenMap?.has(todayStr) 
                ? medications?.length === medicationTakenMap?.get(todayStr)?.size
                  ? "✓" 
                  : "○"
                : "○"}
            </div>
            <div className="text-white/80">Today's Status</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{stats?.adherenceRate || 0}%</div>
            <div className="text-white/80">Monthly Rate</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Medication */}
        <div className="lg:col-span-2">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                {isTodaySelected ? "Today's Medication" : `Medication for ${format(selectedDate, 'MMMM d, yyyy')}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medications?.length ? (
                <MedicationTracker 
                  date={selectedDateStr}
                  isTaken={allMedicationsTaken}
                  partialTaken={someMedicationsTaken && !allMedicationsTaken}
                  takenMedications={takenMedications}
                  onMarkTaken={handleMarkTaken}
                  isToday={isTodaySelected}
                  medications={medications}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No medications added yet. Add your medications to start tracking.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Medication Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="w-full"
                modifiersClassNames={{
                  selected: "bg-blue-600 text-white hover:bg-blue-700",
                }}
                components={{
                  DayContent: ({ date }) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const medsTaken = medications?.filter(med => 
                      medicationTakenMap?.get(dateStr)?.has(med.id)
                    ) || [];
                    const allTaken = medsTaken.length === medications?.length;
                    const someTaken = medsTaken.length > 0;
                    const isPast = isBefore(date, startOfDay(today));
                    const isCurrentDay = isToday(date);
                    
                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <span>{date.getDate()}</span>
                        {allTaken && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        )}
                        {someTaken && !allTaken && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full"></div>
                        )}
                        {!someTaken && isPast && !isCurrentDay && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full"></div>
                        )}
                      </div>
                    );
                  }
                }}
              />
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>All medications taken</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Some medications taken</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span>Missed medication</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;