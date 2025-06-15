import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Image, Camera, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Medication } from "@/lib/types";

interface MedicationTrackerProps {
  date: string;
  isTaken: boolean;
  onMarkTaken: (date: string, imageFile?: File) => void;
  isToday: boolean;
  medications: Medication[];
}

const MedicationTracker = ({ date, isTaken, onMarkTaken, isToday, medications }: MedicationTrackerProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMarkTaken = async () => {
    setIsSubmitting(true);
    try {
      await onMarkTaken(date, selectedImage || undefined);
      setSelectedImage(null);
      setImagePreview(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isTaken) {
    return (
      <div className="p-6 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">Medications Taken</h3>
            <p className="text-sm text-green-600">All medications have been marked as taken for this day</p>
          </div>
        </div>
        {medications.map((med) => (
          <div key={med.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100 mb-2">
            <div>
              <p className="font-medium">{med.name}</p>
              <p className="text-sm text-muted-foreground">{med.dosage} - {med.frequency}</p>
            </div>
            <Badge variant="secondary">Taken</Badge>
          </div>
        ))}
      </div>
    );
  }

  if (!isToday) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <p className="text-muted-foreground">
          {isBefore(new Date(date), new Date()) 
            ? "This day has passed. You cannot mark medications as taken for past dates."
            : "You can mark medications as taken when this day arrives."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {medications.map((med) => (
          <div key={med.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
            <div>
              <h4 className="font-medium">{med.name}</h4>
              <p className="text-sm text-muted-foreground">{med.dosage} - {med.frequency}</p>
            </div>
            <Badge variant="outline">Pending</Badge>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Image className="w-4 h-4 mr-2" />
            {selectedImage ? "Change Photo" : "Add Photo (Optional)"}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <Button
            onClick={handleMarkTaken}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:shadow-lg transition-colors duration-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Marking as Taken...
              </>
            ) : (
              "Mark All as Taken"
            )}
          </Button>
        </div>

        {imagePreview && (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Medication proof"
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}
            >
              Remove
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationTracker;
