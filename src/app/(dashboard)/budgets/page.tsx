import { WalletCards } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export default function BudgetsPage() {
  return (
    <FeaturePlaceholder
      title="Budget planning"
      description="Create category budgets and see when spending approaches your limits."
      icon={WalletCards}
    />
  );
}