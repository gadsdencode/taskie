import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ArrowLeft, Loader2, Download } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ProjectPlanRecord } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";

export default function Projects() {
  const { toast } = useToast();
  const [match, params] = useRoute("/projects/:id");
  
  const { data: projects, isLoading } = useQuery<ProjectPlanRecord[]>({
    queryKey: ["/api/projects"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/projects/${id}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully.",
      });
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
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    },
  });

  // If viewing specific project
  if (match && params.id) {
    return <ProjectDetail id={params.id} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your saved project plans
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" data-testid="button-new-project">
              Create New Project
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && projects && projects.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <p className="text-lg text-muted-foreground">No projects yet</p>
              <Link href="/">
                <Button>Create Your First Project</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {projects && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="hover-elevate transition-all cursor-pointer"
                data-testid={`card-project-${project.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/projects/${project.id}`}>
                        <CardTitle className="truncate hover:text-primary transition-colors">
                          {project.projectName}
                        </CardTitle>
                      </Link>
                      <CardDescription className="mt-1 line-clamp-2">
                        {project.projectDescription}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(project.id)}
                      disabled={deleteMutation.isPending}
                      className="shrink-0"
                      data-testid={`button-delete-${project.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">
                      ${(project.planData as any).costAnalysis?.totalProjectCost?.toLocaleString() || '0'}
                    </Badge>
                    <span>•</span>
                    <span>{format(new Date(project.createdAt), "MMM d, yyyy")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectDetail({ id }: { id: string }) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  
  const { data: project, isLoading } = useQuery<ProjectPlanRecord>({
    queryKey: ["/api/projects", id],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) throw new Error("Failed to fetch project");
      return response.json();
    },
  });

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const response = await fetch(`/api/projects/${id}/export`);
      
      if (!response.ok) {
        throw new Error("Failed to export PDF");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project?.projectName.replace(/[^a-z0-9]/gi, '_')}.pdf` || 'project.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Downloaded",
        description: "Your project plan has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-lg">Project not found</p>
            <Link href="/projects">
              <Button>Back to Projects</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const planData = project.planData as any;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{project.projectName}</h1>
            <p className="text-muted-foreground mt-1">
              Created {format(new Date(project.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            variant="default"
            data-testid="button-export-pdf"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
        </div>

        {/* Reuse ProjectPlanDisplay component */}
        <div className="space-y-6">
          {/* Cost Analysis Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-chart-1/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Materials Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-mono font-semibold">
                  ${planData.costAnalysis?.totalMaterialsCost?.toLocaleString() || '0'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-chart-3/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Labor Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-mono font-semibold">
                  ${planData.costAnalysis?.estimatedLaborCost?.toLocaleString() || '0'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-chart-2/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Total Project Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-mono font-semibold text-chart-2">
                  ${planData.costAnalysis?.totalProjectCost?.toLocaleString() || '0'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Materials */}
          {planData.materials && planData.materials.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Materials & Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {planData.materials.map((material: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-4 rounded-md border bg-card"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{material.item}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Quantity: {material.quantity}
                        </p>
                      </div>
                      <Badge variant="secondary" className="font-mono ml-2">
                        ${material.estimatedCost?.toLocaleString() || '0'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Execution Steps */}
          {planData.executionSteps && planData.executionSteps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Execution Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {planData.executionSteps.map((step: string, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                          {index + 1}
                        </div>
                        {index < planData.executionSteps.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <p className="text-foreground leading-relaxed">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Disposal Info */}
          {planData.disposalInfo && (
            <Card className="border-chart-4/30">
              <CardHeader>
                <CardTitle>Disposal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {planData.disposalInfo.regulationsSummary && (
                  <div className="p-4 rounded-md bg-chart-4/5 border border-chart-4/20">
                    <h4 className="font-semibold text-sm mb-2">Regulations Summary</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {planData.disposalInfo.regulationsSummary}
                    </p>
                  </div>
                )}
                
                {planData.disposalInfo.landfillOptions && planData.disposalInfo.landfillOptions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Landfill Options</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {planData.disposalInfo.landfillOptions.map((option: any, index: number) => (
                        <div
                          key={index}
                          className="flex gap-3 p-4 rounded-md border bg-card"
                        >
                          <div>
                            <p className="font-semibold">{option.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">{option.address}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
