import { Check } from "lucide-react";

interface ServiceFeaturesProps {
  features: readonly string[];
}

export function ServiceFeatures({ features }: ServiceFeaturesProps) {
  return (
    <ul className="space-y-3">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-3">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
            <Check className="h-3 w-3 text-green-700" />
          </div>
          <span className="text-sm text-brand-700">{feature}</span>
        </li>
      ))}
    </ul>
  );
}
