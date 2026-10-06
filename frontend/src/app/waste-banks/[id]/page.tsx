import { BankDetail } from "@/features/waste-banks/components/bank-detail";
import { PublicLayout } from "@/features/shell/components/public-layout";

export default async function WasteBankDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PublicLayout>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-4 py-10">
        <BankDetail id={id} />
      </div>
    </PublicLayout>
  );
}
