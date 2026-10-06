import { BankList } from "@/features/waste-banks/components/bank-list";
import { PublicLayout } from "@/features/shell/components/public-layout";

export default function WasteBanksPage() {
  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <BankList />
      </div>
    </PublicLayout>
  );
}
