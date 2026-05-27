import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/role-guard";
import { 
  LayoutDashboard, 
  Calendar, 
  LineChart, 
  BrainCircuit, 
  Users, 
  Building2, 
  Settings,
  LogOut,
  Menu
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "FACULTY", "STUDENT", "MANAGEMENT"] },
  { href: "/events", label: "Events", icon: Calendar, roles: ["ADMIN", "FACULTY", "STUDENT", "MANAGEMENT"] },
  { href: "/progress", label: "Progress Logs", icon: LineChart, roles: ["ADMIN", "FACULTY", "STUDENT", "MANAGEMENT"] },
  { href: "/ai-insights", label: "AI Insights", icon: BrainCircuit, roles: ["ADMIN", "FACULTY", "MANAGEMENT"] },
  { href: "/users", label: "Users", icon: Users, roles: ["ADMIN"] },
  { href: "/departments", label: "Departments", icon: Building2, roles: ["ADMIN"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["ADMIN", "FACULTY", "STUDENT", "MANAGEMENT"] },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  if (!user) return <>{children}</>;

  const NavLinks = () => (
    <>
      {NAV_ITEMS.map((item) => {
        if (!item.roles.includes(user.role)) return null;
        
        const isActive = location === item.href || location.startsWith(`${item.href}/`);
        const Icon = item.icon;
        
        return (
          <Link key={item.href} href={item.href}>
            <span className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
              ${isActive 
                ? 'bg-primary/20 text-primary font-medium shadow-[inset_1px_1px_3px_rgba(255,255,255,0.5),inset_-1px_-1px_3px_rgba(0,0,0,0.02)]' 
                : 'text-muted-foreground hover:bg-black/5 hover:text-foreground'
              }
            `}>
              <Icon className="w-5 h-5" />
              {item.label}
            </span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border/50 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
            <span className="font-bold text-primary text-sm">DH</span>
          </div>
          <span className="font-bold text-lg font-poppins">DepartmentHub</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-6 flex flex-col bg-background/95 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-8 px-2">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center clay-button">
                <span className="font-bold text-primary">DH</span>
              </div>
              <div>
                <h2 className="font-bold text-lg font-poppins leading-tight">DepartmentHub</h2>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
            </div>
            
            <nav className="flex-1 space-y-1">
              <NavLinks />
            </nav>
            
            <div className="mt-auto pt-6 border-t border-border/50">
              <div className="px-4 py-3 mb-4 rounded-xl bg-card border border-border/50 clay-card">
                <p className="font-medium text-sm truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" 
                onClick={() => logout()}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-72 flex-col bg-card border-r border-border/50 p-6 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center clay-button">
            <span className="font-bold text-primary text-lg">DH</span>
          </div>
          <div>
            <h2 className="font-bold text-xl font-poppins leading-tight tracking-tight">DepartmentHub</h2>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{user.role}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavLinks />
        </nav>

        <div className="mt-auto pt-6 border-t border-border/50">
          <div className="px-4 py-3 mb-4 rounded-xl bg-background/50 border border-border/50">
            <p className="font-medium text-sm truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors" 
            onClick={() => logout()}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
