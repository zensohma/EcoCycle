import { InboxIcon } from "@/features/shell/components/icons";

export function AdminEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <InboxIcon className="h-10 w-10 text-muted-foreground/40" />
      <p className="text-sm font-semibold text-muted-foreground">{message}</p>
    </div>
  );
}
