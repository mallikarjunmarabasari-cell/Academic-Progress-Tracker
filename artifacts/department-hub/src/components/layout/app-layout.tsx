import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  LineChart,
  BrainCircuit,
  Users,
  Building2,
  Settings,
  LogOut,
  Menu,
  Sparkles,
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

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  FACULTY: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  STUDENT: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  MANAGEMENT: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  if (!user) return <>{children}</>;

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {NAV_ITEMS.map((item) => {
        if (!item.roles.includes(user.role)) return null;

        const isActive = location === item.href || location.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link key={item.href} href={item.href} onClick={onNavigate}>
            <span className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer text-sm font-medium
              ${isActive
                ? "nav-active"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }
            `}>
              <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-violet-300" : ""}`} style={{ width: '1.1rem', height: '1.1rem' }} />
              {item.label}
              {item.href === "/ai-insights" && (
                <span className="ml-auto flex h-4 items-center gap-0.5 rounded-full bg-violet-500/20 px-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                  AI
                </span>
              )}
            </span>
          </Link>
        );
      })}
    </>
  );

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg pulse-glow">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-white text-base leading-tight tracking-tight">DepartmentHub</h2>
          <p className="text-xs text-white/40 font-medium">Academic Portal</p>
        </div>
      </div>

      {/* Nav section label */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 px-4 mb-3">Navigation</p>

      <nav className="flex-1 space-y-1">
        <NavLinks onNavigate={onNavigate} />
      </nav>

      {/* User section */}
      <div className="mt-auto pt-4 border-t border-white/8">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
            {getInitials(user.firstName, user.lastName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-white/40 truncate">{user.email}</p>
          </div>
        </div>
        <div className="px-2 mb-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${ROLE_COLORS[user.role] || ROLE_COLORS.STUDENT}`}>
            {user.role}
          </span>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#1a0e3d] sticky top-0 z-50 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-base">DepartmentHub</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-6 sidebar-bg border-r border-white/10">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col sidebar-bg p-5 sticky top-0 h-screen overflow-y-auto border-r border-white/8 shrink-0">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
