import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepItemProps {
  step: {
    id: number;
    name: string;
    description: string;
  };
  isComplete: boolean;
  isActive: boolean;
  compact?: boolean;
}

export const StepItem = ({ step, isComplete, isActive, compact = false }: StepItemProps) => {
  if (compact) {
    return (
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-medium transition-colors",
          isComplete
            ? "border-success bg-success text-success-foreground"
            : isActive
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30 bg-background text-muted-foreground"
        )}
        aria-current={isActive ? "step" : undefined}
      >
        {isComplete ? (
          <Check className="h-3 w-3" aria-label="Completed" />
        ) : (
          <span aria-label={`Step ${step.id}`}>{step.id}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
          isComplete
            ? "border-success bg-success text-success-foreground"
            : isActive
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30 bg-background text-muted-foreground"
        )}
        aria-current={isActive ? "step" : undefined}
        role="button"
        tabIndex={0}
      >
        {isComplete ? (
          <Check className="h-4 w-4" aria-label="Completed" />
        ) : (
          <span aria-label={`Step ${step.id}`}>{step.id}</span>
        )}
      </div>
      <div className="ml-2 flex flex-col">
        <span
          className={cn(
            "text-xs font-medium transition-colors",
            isActive || isComplete
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          {step.name}
        </span>
      </div>
    </div>
  );
};