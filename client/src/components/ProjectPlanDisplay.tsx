import type { ProjectPlan } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Wrench,
  DollarSign,
  Users,
  Calculator,
  ClipboardList,
  Trash2,
  MapPin,
  Package,
  CheckCircle2,
} from "lucide-react";

interface ProjectPlanDisplayProps {
  plan: ProjectPlan;
}

export function ProjectPlanDisplay({ plan }: ProjectPlanDisplayProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Project Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-lg">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold tracking-tight" data-testid="text-project-name">
                {plan.projectName}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                AI-Generated Plan for Chesterfield County, Virginia
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Generated
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Cost Analysis Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-chart-1/30 hover-elevate transition-all" data-testid="card-cost-materials">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-chart-1/10">
                <Package className="h-5 w-5 text-chart-1" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Materials Cost
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-mono font-semibold" data-testid="text-materials-cost">
              ${plan.costAnalysis.totalMaterialsCost.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-chart-3/30 hover-elevate transition-all" data-testid="card-cost-labor">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-chart-3/10">
                <Users className="h-5 w-5 text-chart-3" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Labor Cost
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-mono font-semibold" data-testid="text-labor-cost">
              ${plan.costAnalysis.estimatedLaborCost.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-chart-2/30 hover-elevate transition-all" data-testid="card-cost-total">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-chart-2/10">
                <Calculator className="h-5 w-5 text-chart-2" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Project Cost
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-mono font-semibold text-chart-2" data-testid="text-total-cost">
              ${plan.costAnalysis.totalProjectCost.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Materials Section */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-semibold">Materials & Tools</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plan.materials.map((material, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-4 rounded-md border border-border bg-card hover-elevate transition-all"
                data-testid={`card-material-${index}`}
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground" data-testid={`text-material-item-${index}`}>
                    {material.item}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5" data-testid={`text-material-quantity-${index}`}>
                    Quantity: {material.quantity}
                  </p>
                </div>
                <Badge variant="secondary" className="font-mono ml-2" data-testid={`text-material-cost-${index}`}>
                  ${material.estimatedCost.toLocaleString()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Execution Steps Timeline */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-semibold">Step-by-Step Execution Guide</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plan.executionSteps.map((step, index) => (
              <div key={index} className="flex gap-4" data-testid={`step-${index}`}>
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                    {index + 1}
                  </div>
                  {index < plan.executionSteps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <p className="text-foreground leading-relaxed" data-testid={`text-step-${index}`}>
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disposal Information */}
      <Card className="shadow-md border-chart-4/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-chart-4" />
            <CardTitle className="text-xl font-semibold">Disposal Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-md bg-chart-4/5 border border-chart-4/20">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <span className="text-chart-4">⚠️</span> Regulations Summary
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-disposal-regulations">
              {plan.disposalInfo.regulationsSummary}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Landfill & Disposal Facilities</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {plan.disposalInfo.landfillOptions.map((option, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-4 rounded-md border border-border bg-card hover-elevate transition-all"
                  data-testid={`card-landfill-${index}`}
                >
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold" data-testid={`text-landfill-name-${index}`}>
                      {option.name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1" data-testid={`text-landfill-address-${index}`}>
                      {option.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4">
        <Sparkles className="h-3 w-3" />
        <p>Powered by Google Gemini AI</p>
      </div>
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}
