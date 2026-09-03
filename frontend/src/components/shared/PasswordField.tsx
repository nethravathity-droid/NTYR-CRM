import { useState } from "react";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "One number", test: (v: string) => /[0-9]/.test(v) },
  { label: "One special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PasswordField({ id, label, value, onChange, placeholder }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          onClick={() => setVisible((prev) => !prev)}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <div className="grid gap-1">
        {RULES.map((rule) => {
          const passed = rule.test(value);
          return (
            <div key={rule.label} className="flex items-center gap-2 text-xs">
              {passed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className={passed ? "text-emerald-600" : "text-muted-foreground"}>
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
