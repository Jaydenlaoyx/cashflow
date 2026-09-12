import { ChartNoAxesCombined } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export default function AnalyticsPage() {
  return (
    <FeaturePlaceholder
      title="Financial analytics"
      description="Compare monthly and yearly income, expenses and category trends."
      icon={ChartNoAxesCombined}
    />
  );
}