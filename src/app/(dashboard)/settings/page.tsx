import { Settings } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export default function SettingsPage() {
  return (
    <FeaturePlaceholder
      title="Application settings"
      description="Manage your currency, categories, appearance and account preferences."
      icon={Settings}
    />
  );
}