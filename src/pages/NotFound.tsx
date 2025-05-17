
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="app-container">
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-healing-100 flex items-center justify-center">
                <Search className="h-12 w-12 text-healing-600" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-2 text-healing-900">Page Not Found</h1>
          <p className="text-xl text-gray-600 mb-6">
            We couldn't find the page you were looking for.
          </p>
          
          <div className="space-y-4">
            <Button asChild className="bg-healing-600 hover:bg-healing-700 w-full">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Home
              </Link>
            </Button>
            
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
