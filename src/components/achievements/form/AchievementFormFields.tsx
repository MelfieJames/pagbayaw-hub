
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadSection } from "@/components/achievements/ImageUploadSection";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AchievementFormFieldsProps {
  values: {
    achievement_name: string;
    description: string;
    about_text?: string;
    date: Date;
    venue: string;
  };
  imageFile: File | null;
  imagePreview: string | null;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange: (date: Date | undefined) => void;
}

export const AchievementFormFields = ({
  values,
  imageFile,
  imagePreview,
  errors,
  onChange,
  onFileChange,
  onDateChange,
}: AchievementFormFieldsProps) => {
  const [date, setDate] = useState<Date | undefined>(values.date);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onDateChange(selectedDate);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label htmlFor="achievement_name">Achievement Name</Label>
          <Input
            id="achievement_name"
            name="achievement_name"
            placeholder="Enter achievement name"
            value={values.achievement_name}
            onChange={onChange}
          />
          {errors.achievement_name && (
            <p className="text-red-500 text-sm">{errors.achievement_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Enter brief description"
            value={values.description}
            onChange={onChange}
            className="h-24"
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="about_text">About This Event</Label>
          <Textarea
            id="about_text"
            name="about_text"
            placeholder="Provide detailed information about this event"
            value={values.about_text || ""}
            onChange={onChange}
            className="h-40"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="venue">Venue</Label>
          <Input
            id="venue"
            name="venue"
            placeholder="Enter venue"
            value={values.venue}
            onChange={onChange}
          />
          {errors.venue && (
            <p className="text-red-500 text-sm">{errors.venue}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.date && (
            <p className="text-red-500 text-sm">{errors.date}</p>
          )}
        </div>

        <ImageUploadSection
          imagePreview={imagePreview}
          onFileChange={onFileChange}
        />
      </div>
    </div>
  );
};
