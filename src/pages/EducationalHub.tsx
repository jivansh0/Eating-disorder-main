import AppLayout from "../components/AppLayout";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Brain, Utensils, Smile } from "lucide-react";
import { Outlet, NavLink } from "react-router-dom";

const EducationalHub = () => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }): string => 
    `inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
      isActive 
        ? 'bg-background text-foreground shadow-sm' 
        : 'hover:bg-accent hover:text-accent-foreground'
    }`;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-healing-900">Educational Hub</h2>
          <p className="text-muted-foreground">
            Explore evidence-based resources to support your recovery journey
          </p>
        </div>

        {/* Search bar - kept for potential future use across all subpages */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search educational resources..."
            className="pl-10 border-healing-200"
          />
        </div>

        {/* Subpage Navigation Tabs */}
        <nav className="flex space-x-2 border-b border-border p-1 mb-4">
          <NavLink to="/learn/understanding" className={navLinkClasses}>
            <BookOpen className="mr-2 h-4 w-4" /> Understand
          </NavLink>
          <NavLink to="/learn/nutrition" className={navLinkClasses}>
            <Utensils className="mr-2 h-4 w-4" /> Nutrition
          </NavLink>
          <NavLink to="/learn/coping" className={navLinkClasses}>
              <Brain className="mr-2 h-4 w-4" /> Coping
          </NavLink>
          <NavLink to="/learn/body-image" className={navLinkClasses}>
            <Smile className="mr-2 h-4 w-4" /> Body Image
          </NavLink>
        </nav>

        {/* Render the active subpage content */}
        <div className="mt-4">
          <Outlet /> 
        </div>

      </div>
    </AppLayout>
  );
};

export default EducationalHub;
