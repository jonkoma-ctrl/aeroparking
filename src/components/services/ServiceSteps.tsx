interface Step {
  title: string;
  description: string;
}

interface ServiceStepsProps {
  steps: readonly Step[];
}

export function ServiceSteps({ steps }: ServiceStepsProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {steps.map((step, index) => (
        <div key={step.title} className="flex gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-900 text-sm font-bold text-white">
            {index + 1}
          </div>
          <div>
            <h4 className="font-semibold text-brand-900">{step.title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-brand-500">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
