import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AchievementFormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  isTextarea?: boolean;
  required?: boolean;
}

export const AchievementFormInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  isTextarea = false,
  required = false
}: AchievementFormInputProps) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    {isTextarea ? (
      <Textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
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