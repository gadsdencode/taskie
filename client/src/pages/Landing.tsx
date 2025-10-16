import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Hammer, DollarSign, ClipboardList, Trash2 } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>Powered by Google Gemini AI</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            AI Project Planner
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get comprehensive plans with materials lists, cost breakdowns,
            step-by-step guides, and local disposal information.
          </p>

          <div className="pt-4">
            <Button
              size="lg"
              onClick={handleLogin}
              className="text-lg px-8 py-6"
              data-testid="button-login"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Get Started
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-chart-1/30">
            <CardHeader>
              <div className="p-2 rounded-md bg-chart-1/10 w-fit">
                <Hammer className="h-6 w-6 text-chart-1" />
              </div>
              <CardTitle className="text-lg">Materials List</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Detailed list of all materials and tools needed with quantities and estimated costs
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-chart-2/30">
            <CardHeader>
              <div className="p-2 rounded-md bg-chart-2/10 w-fit">
                <DollarSign className="h-6 w-6 text-chart-2" />
              </div>
              <CardTitle className="text-lg">Cost Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete breakdown of materials and labor costs for your project
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-chart-3/30">
            <CardHeader>
              <div className="p-2 rounded-md bg-chart-3/10 w-fit">
                <ClipboardList className="h-6 w-6 text-chart-3" />
              </div>
              <CardTitle className="text-lg">Step-by-Step Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Logical execution steps to complete your project from start to finish
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-chart-4/30">
            <CardHeader>
              <div className="p-2 rounded-md bg-chart-4/10 w-fit">
                <Trash2 className="h-6 w-6 text-chart-4" />
              </div>
              <CardTitle className="text-lg">Disposal Info</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Local regulations and landfill options for construction debris disposal
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Example Projects */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Example Projects</CardTitle>
            <CardDescription>
              Our AI can help you plan any project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Install new kitchen cabinets in a 10x12 foot kitchen</li>
              <li>• Build a backyard deck (12x16 feet) with composite materials</li>
              <li>• Replace asphalt shingle roof on a 1,500 sq ft ranch home</li>
              <li>• Install hardwood flooring in living room and hallway (400 sq ft)</li>
              <li>• Remodel bathroom with new tile, fixtures, and vanity</li>
              <li>• Build a garden shed (10x12 feet) with foundation</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
