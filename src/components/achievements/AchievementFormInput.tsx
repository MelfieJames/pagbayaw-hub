import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ReactNode } from "react";

interface AchievementFormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  isTextarea?: boolean;
  required?: boolean;
  icon?: ReactNode;
}

export const AchievementFormInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  isTextarea = false,
  required = false,
  icon
}: AchievementFormInputProps) => (
  <div>
    <label className="text-sm font-medium flex items-center gap-2 mb-2">
      {icon}
      {label}
    </label>
    {isTextarea ? (
      <Textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="min-h-[100px]"
      />
    ) : (
      <Input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      />
    )}
  </div>
);