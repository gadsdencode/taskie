import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ProjectInput } from "@/components/ProjectInput";
import { ProjectPlanDisplay } from "@/components/ProjectPlanDisplay";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ProjectPlan } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { FolderOpen, LogOut } from "lucide-react";

export default function Home() {
  const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);
  const [lastDescription, setLastDescription] = useState<string>("");
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const generatePlanMutation = useMutation({
    mutationFn: async (projectDescription: string) => {
      const response = await apiRequest(
        "POST",
        "/api/plan-project",
        { projectDescription }
      );
      return response as unknown as (ProjectPlan & { id: string });
    },
    onSuccess: (data) => {
      toast({
        title: "Project plan created!",
        description: "Redirecting to your project...",
      });
      // Redirect to the project detail page after a brief delay
      setTimeout(() => {
        setLocation(`/projects/${data.id}`);
      }, 800);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
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

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header with User Nav */}
        <div className="flex items-center justify-between">
          <header className="text-left space-y-3 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              AI Project Planner
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Get comprehensive home improvement plans powered by AI. Materials lists, cost breakdowns,
              step-by-step guides, and local disposal information.
            </p>
          </header>

          {user && !authLoading && (
            <div className="flex items-center gap-2">
              <Link href="/projects">
                <Button variant="outline" size="default" data-testid="button-my-projects">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  My Projects
                </Button>
              </Link>
              
              <div className="flex items-center gap-3 px-3 py-2 rounded-md border">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImageUrl || undefined} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

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
