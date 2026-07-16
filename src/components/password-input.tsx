import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * A password `<input>` with a show/hide toggle. Accepts and forwards any
 * native input props (including react-hook-form's `register()` spread), so
 * it drops into both controlled (`value`/`onChange`) and RHF-registered
 * fields without extra wiring — `type` is the only prop it owns.
 */
export function PasswordInput({ className, ...inputProps }: ComponentProps<"input">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input {...inputProps} type={visible ? "text" : "password"} className={className} />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
