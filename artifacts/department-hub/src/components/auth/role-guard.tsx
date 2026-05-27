import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { UserRole } from "@workspace/api-client-react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) return <>{fallback}</>;

  if (!allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
