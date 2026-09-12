import { Target } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export default function GoalsPage() {
  return (
    <FeaturePlaceholder
      title="Savings goals"
      description="Create targets, record contributions and estimate when each goal will be reached."
      icon={Target}
    />
  );
}