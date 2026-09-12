import { Repeat2 } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export default function RecurringPage() {
  return (
    <FeaturePlaceholder
      title="Recurring transactions"
      description="Schedule repeating salary, subscription, bill and transfer entries."
      icon={Repeat2}
    />
  );
}