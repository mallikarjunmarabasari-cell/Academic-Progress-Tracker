import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Shield, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-poppins">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences.</p>
      </div>

      <Card className="clay-card border-none">
        <CardHeader className="border-b border-border/30 pb-4">
          <CardTitle className="font-poppins text-xl">Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold text-3xl clay-button">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <h3 className="text-2xl font-bold font-poppins">{user.firstName} {user.lastName}</h3>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="bg-background">{user.role}</Badge>
                {user.departmentName && (
                  <Badge variant="outline" className="bg-background">{user.departmentName}</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 pt-6 border-t border-border/30">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-white/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Email Address</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-white/50">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium">System Role</p>
                <p className="text-sm text-muted-foreground">{user.role}</p>
              </div>
            </div>

            {user.departmentName && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-white/50">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Department</p>
                  <p className="text-sm text-muted-foreground">{user.departmentName}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}