import { LeafIcon } from "./icons";

export function Logo({
  className = "h-16 w-16",
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const tones =
    tone === "light"
      ? "border-brand-600 bg-brand-50 text-brand-700"
      : "border-white/70 bg-white/10 text-white";

  return (
    <div
      className={`grid place-items-center rounded-full border-2 ${tones} ${className}`}
      aria-label="EcoCycle"
      role="img"
    >
      <LeafIcon className="h-1/2 w-1/2" />
    </div>
  );
}
