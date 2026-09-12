import { ReceiptText } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export default function TransactionsPage() {
  return (
    <FeaturePlaceholder
      title="Transaction management"
      description="Add, edit, delete, search and filter your income and expense transactions."
      icon={ReceiptText}
    />
  );
}