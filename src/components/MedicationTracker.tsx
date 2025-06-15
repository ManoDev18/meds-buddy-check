// MedicationTracker.tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, Clock, Image } from "lucide-react";

export interface MedicationTrackerProps {
  date: string;
  isTaken: boolean;
  partialTaken?: boolean;
  takenMedications?: Medication[];
  onMarkTaken: (date: string, imageFile?: File) => Promise<void>;
  isToday: boolean;
  medications: Medication[];
}

const MedicationTracker = ({
  date,
  isTaken,
  partialTaken = false,
  takenMedications = [],
  onMarkTaken,
  isToday,
  medications
}: MedicationTrackerProps) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onMarkTaken(date, file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Medication List */}
      <div className="space-y-2">
        {medications.map((med) => {
          const isMedTaken = takenMedications.some(m => m.id === med.id);
          return (
            <div key={med.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
              <div>
                <h4 className="font-medium">{med.name}</h4>
                <p className="text-sm text-muted-foreground">{med.dosage} - {med.frequency}</p>
              </div>
              <Badge variant={isMedTaken ? "secondary" : "destructive"}>
                {isMedTaken ? "Taken" : "Pending"}
              </Badge>
            </div>
          );
        })}
      </div>

      {/* Status and Actions */}
      <div className="mt-6">
        {isTaken ? (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="w-5 h-5" />
            <span className="font-medium">All medications taken for this day</span>
          </div>
        ) : partialTaken ? (
          <div className="flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">
              {takenMedications.length} of {medications.length} medications taken
            </span>
          </div>
        ) : isToday ? (
          <div className="flex items-center gap-2 text-blue-600">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Medications pending for today</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Medications not taken</span>
          </div>
        )}

        {!isTaken && isToday && (
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <Button onClick={() => onMarkTaken(date)}>
              Mark All as Taken
            </Button>
            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  capture="environment"
                />
                <Image className="w-4 h-4 mr-2" />
                Upload Photo Proof
              </label>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationTracker;