"use client";

export function FilterChips({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            value === option
              ? "bg-brand-700 text-white"
              : "border border-border bg-card text-foreground hover:border-brand-200 hover:bg-brand-50"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
