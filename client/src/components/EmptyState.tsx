import { Lightbulb } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-12 space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-center">
        <div className="p-4 rounded-full bg-primary/10">
          <Lightbulb className="h-12 w-12 text-primary" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Ready to Plan Your Project?</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Describe your home improvement project above and let our AI generate a comprehensive plan
          with materials, costs, execution steps, and disposal information.
        </p>
      </div>
    </div>
  );
}
