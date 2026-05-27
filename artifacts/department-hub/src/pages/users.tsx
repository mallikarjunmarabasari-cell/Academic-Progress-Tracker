import { useState } from "react";
import { format } from "date-fns";
import {
  useListUsers,
  useCreateUser,
  UserInputRole,
} from "@workspace/api-client-react";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Users as UsersIcon, Plus, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const userSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
  role: z.nativeEnum(UserInputRole),
  departmentId: z.coerce.number().optional(),
});

export default function Users() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: users, isLoading } = useListUsers({ query: { queryKey: ["users"] } });

  const filteredUsers = users?.filter(u => 
    u.firstName.toLowerCase().includes(search.toLowerCase()) || 
    u.lastName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-poppins">Users</h1>
          <p className="text-muted-foreground mt-1">Manage platform access and roles.</p>
        </div>
        
        <RoleGuard allowedRoles={["ADMIN"]}>
          <CreateUserDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </RoleGuard>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search users..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-background/50 border-white/50"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : filteredUsers?.length ? (
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden clay-card">
          <div className="divide-y divide-border/30">
            {filteredUsers.map(user => (
              <div key={user.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-black/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{user.firstName} {user.lastName}</h4>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:w-1/3 justify-between sm:justify-end">
                  <div className="text-sm text-muted-foreground hidden md:block">
                    {user.departmentName || "No Department"}
                  </div>
                  <Badge variant="outline" className={`
                    ${user.role === 'ADMIN' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                      user.role === 'FACULTY' ? 'bg-primary/10 text-primary border-primary/20' : 
                      'bg-muted text-muted-foreground'}
                  `}>
                    {user.role}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-background/50 rounded-2xl border border-white/50">
          <UsersIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-poppins font-medium">No users found</h3>
        </div>
      )}
    </div>
  );
}

function CreateUserDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateUser();
  
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: UserInputRole.STUDENT,
    },
  });

  const onSubmit = (data: z.infer<typeof userSchema>) => {
    createMutation.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "User created successfully" });
        queryClient.invalidateQueries({ queryKey: ["users"] });
        onOpenChange(false);
        form.reset();
      },
      onError: (err: any) => {
        toast({ title: "Failed to create user", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="clay-button gap-2">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-xl border-white/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-poppins">Create New User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {Object.values(UserInputRole).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full clay-button mt-4" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}