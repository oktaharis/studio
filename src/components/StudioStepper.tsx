import { cn } from "@/lib/utils";
import { useStudioSteps } from "@/hooks/useStudioSteps";
import { StepItem } from "./stepper/StepItem";

const steps = [
  { id: 1, name: "Choose Frame", description: "Select your frame style" },
  { id: 2, name: "Take Photo", description: "Capture your photo" },
  { id: 3, name: "Preview & Save", description: "Edit and download" },
];

interface StudioStepperProps {
  compact?: boolean;
}

export const StudioStepper = ({ compact = false }: StudioStepperProps) => {
  const { currentStep, isStepComplete, isStepActive } = useStudioSteps();

  if (compact) {
    return (
      <nav 
        className="w-full py-2" 
        role="progressbar" 
        aria-valuenow={currentStep} 
        aria-valuemin={1} 
        aria-valuemax={3}
        aria-label="Photo creation progress"
      >
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <StepItem
                step={step}
                isComplete={isStepComplete(step.id)}
                isActive={isStepActive(step.id)}
                compact
              />
              
              {/* Connector Line - Mobile responsive */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-px w-4 transition-colors",
                    isStepComplete(step.id)
                      ? "bg-success"
                      : "bg-muted-foreground/30"
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className="w-full py-4" 
      role="progressbar" 
      aria-valuenow={currentStep} 
      aria-valuemin={1} 
      aria-valuemax={3}
      aria-label="Photo creation progress"
    >
      {/* Mobile-first: stack vertically on small screens, horizontal on larger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between max-w-md mx-auto gap-4 sm:gap-0">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center w-full sm:w-auto">
            <StepItem
              step={step}
              isComplete={isStepComplete(step.id)}
              isActive={isStepActive(step.id)}
            />
            
            {/* Connector Line - Responsive: vertical on mobile, horizontal on desktop */}
            {index < steps.length - 1 && (
              <>
                {/* Mobile: vertical connector */}
                <div
                  className={cn(
                    "sm:hidden ml-4 w-px h-6 transition-colors",
                    isStepComplete(step.id)
                      ? "bg-success"
                      : "bg-muted-foreground/30"
                  )}
                  aria-hidden="true"
                />
                {/* Desktop: horizontal connector */}
                <div
                  className={cn(
                    "hidden sm:block mx-2 md:mx-4 h-px w-6 md:w-8 transition-colors",
                    isStepComplete(step.id)
                      ? "bg-success"
                      : "bg-muted-foreground/30"
                  )}
                  aria-hidden="true"
                />
              </>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};