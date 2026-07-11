const PASSWORD_RULES = [
  { test: (v: string) => v.length >= 8, label: "At least 8 characters" },
  { test: (v: string) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { test: (v: string) => /[a-z]/.test(v), label: "One lowercase letter" },
  { test: (v: string) => /[0-9]/.test(v), label: "One number" },
  { test: (v: string) => /[^A-Za-z0-9]/.test(v), label: "One special character" },
];

export function PasswordRequirements({ password }: { password: string }) {
  return (
    <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password ?? "");
        return (
          <li
            key={rule.label}
            className={`text-xs transition ${met ? "text-emerald-600" : "text-muted-foreground"}`}
          >
            {met ? "✓" : "•"} {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
