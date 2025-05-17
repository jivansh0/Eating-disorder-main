
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Home, 
  MessageCircle, 
  BookOpen, 
  BarChart, 
  AlertTriangle, 
  Menu, 
  X, 
  LogOut 
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const isMobile = useIsMobile();
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Track scroll position for animations
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      if (scrollTop > 50) {
        setScrolling(true);
      } else {
        setScrolling(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "AI Chat", href: "/chat", icon: MessageCircle },
    { name: "Mood Tracker", href: "/mood", icon: BarChart },
    { name: "Learn", href: "/learn", icon: BookOpen },
    { name: "Crisis Resources", href: "/crisis-resources", icon: AlertTriangle },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="app-container">
      {/* Mobile menu button */}
      <div className={`fixed top-4 left-4 z-30 md:hidden transition-all duration-300 ${scrolling ? 'bg-white shadow-md rounded-full p-1' : ''}`}>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white shadow-md"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-20 w-64 transform bg-white p-6 shadow-lg transition-transform duration-300 md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col justify-between">
          <div>
            <div className="mb-8 flex items-center justify-center">
              <h1 className="text-xl font-bold text-healing-700">Recovery Journey</h1>
            </div>
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-healing-100 text-healing-700"
                      : "text-gray-700 hover:bg-healing-50"
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {currentUser && (
            <div className="pt-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
              <div className="mt-4 rounded-lg bg-healing-50 p-3 text-sm text-gray-700">
                <p className="font-medium">Logged in as:</p>
                <p className="truncate">{currentUser.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-10 md:flex md:w-64 md:flex-col md:bg-white md:shadow-md">
        <div className="flex h-full flex-col justify-between p-6">
          <div>
            <div className="mb-8 flex items-center justify-center">
              <h1 className="text-xl font-bold text-healing-700">Recovery Journey</h1>
            </div>
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-healing-100 text-healing-700"
                      : "text-gray-700 hover:bg-healing-50"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {currentUser && (
            <div className="pt-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
              <div className="mt-4 rounded-lg bg-healing-50 p-3 text-sm text-gray-700">
                <p className="font-medium">Logged in as:</p>
                <p className="truncate">{currentUser.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 md:ml-64 transition-all duration-300 ${scrolling ? 'pt-16' : ''}`}>
        <main className="min-h-screen p-4 md:p-8">
          <div className={`space-y-4 ${isMobile ? 'animate-fade-in' : ''}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
