import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ProjectInput } from "@/components/ProjectInput";
import { ProjectPlanDisplay } from "@/components/ProjectPlanDisplay";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { EmptyState } from "@/components/EmptyState";
import type { ProjectPlan } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);
  const [lastDescription, setLastDescription] = useState<string>("");

  const generatePlanMutation = useMutation({
    mutationFn: async (projectDescription: string) => {
      const response = await apiRequest<ProjectPlan>(
        "POST",
        "/api/plan-project",
        { projectDescription }
      );
      return response;
    },
    onSuccess: (data) => {
      setProjectPlan(data);
    },
  });

  const handleSubmit = (description: string) => {
    setProjectPlan(null);
    setLastDescription(description);
    generatePlanMutation.mutate(description);
  };

  const handleRetry = () => {
    if (lastDescription) {
      generatePlanMutation.reset();
      generatePlanMutation.mutate(lastDescription);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <header className="text-center space-y-3 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            AI Project Planner
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get comprehensive home improvement plans powered by AI. Materials lists, cost breakdowns,
            step-by-step guides, and local disposal information.
          </p>
        </header>

        {/* Project Input */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <ProjectInput
            onSubmit={handleSubmit}
            isLoading={generatePlanMutation.isPending}
          />
        </div>

        {/* Results Area */}
        <div className="animate-in fade-in duration-500 delay-300">
          {generatePlanMutation.isError && (
            <ErrorDisplay
              message={
                generatePlanMutation.error instanceof Error
                  ? generatePlanMutation.error.message
                  : "An unexpected error occurred. Please try again."
              }
              onRetry={handleRetry}
            />
          )}

          {projectPlan && <ProjectPlanDisplay plan={projectPlan} />}

          {!projectPlan && !generatePlanMutation.isError && !generatePlanMutation.isPending && (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
