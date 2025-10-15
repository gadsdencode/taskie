import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";

interface ProjectInputProps {
  onSubmit: (description: string) => void;
  isLoading: boolean;
}

export function ProjectInput({ onSubmit, isLoading }: ProjectInputProps) {
  const [description, setDescription] = useState("");
  const [charCount, setCharCount] = useState(0);

  const handleChange = (value: string) => {
    setDescription(value);
    setCharCount(value.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length >= 10) {
      onSubmit(description);
    }
  };

  const exampleProjects = [
    "Install new kitchen cabinets in a 10x12 foot kitchen",
    "Build a backyard deck (12x16 feet) with composite materials",
    "Replace asphalt shingle roof on a 1,500 sq ft ranch home",
    "Install hardwood flooring in living room and hallway (400 sq ft)",
  ];

  return (
    <Card className="shadow-lg border-card-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Describe Your Project
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Provide details about your home improvement project. The more specific you are, the better the plan will be.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-description" className="text-sm font-medium">
              Project Description
            </Label>
            <Textarea
              id="project-description"
              data-testid="input-project-description"
              value={description}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="e.g., I want to install new kitchen cabinets in a 10x12 foot kitchen with quartz countertops..."
              className="min-h-32 resize-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
              disabled={isLoading}
              maxLength={2000}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters
              </p>
              <p className={`text-xs ${charCount > 1900 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {charCount}/2000
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Example Projects:</Label>
            <div className="flex flex-wrap gap-2">
              {exampleProjects.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleChange(example)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover-elevate active-elevate-2 transition-all disabled:opacity-50"
                  data-testid={`button-example-${index}`}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading || description.trim().length < 10}
            data-testid="button-generate-plan"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Your Project...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Project Plan
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
