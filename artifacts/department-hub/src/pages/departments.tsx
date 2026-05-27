import { useState } from "react";
import {
  useListDepartments,
  useCreateDepartment,
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Building2, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

const deptSchema = z.object({
  name: z.string().min(1, "Name required"),
  code: z.string().min(1, "Code required").max(10),
});

export default function Departments() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: departments, isLoading } = useListDepartments({ query: { queryKey: ["departments"] } });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-poppins">Departments</h1>
          <p className="text-muted-foreground mt-1">Manage organizational units and structures.</p>
        </div>
        
        <RoleGuard allowedRoles={["ADMIN"]}>
          <CreateDeptDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </RoleGuard>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
      ) : departments?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, i) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="clay-card h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center clay-button">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="font-mono">{dept.code}</Badge>
                  </div>
                  
                  <h3 className="font-bold text-xl font-poppins mb-1">{dept.name}</h3>
                  
                  <div className="mt-auto pt-6 flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Members</span>
                    <span className="font-bold bg-background px-3 py-1 rounded-full border border-border/50">{dept.memberCount || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-background/50 rounded-2xl border border-white/50">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-poppins font-medium">No departments found</h3>
        </div>
      )}
    </div>
  );
}

function CreateDeptDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateDepartment();
  
  const form = useForm<z.infer<typeof deptSchema>>({
    resolver: zodResolver(deptSchema),
    defaultValues: { name: "", code: "" },
  });

  const onSubmit = (data: z.infer<typeof deptSchema>) => {
    createMutation.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Department created" });
        queryClient.invalidateQueries({ queryKey: ["departments"] });
        onOpenChange(false);
        form.reset();
      },
      onError: (err: any) => {
        toast({ title: "Failed", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="clay-button gap-2">
          <Plus className="w-4 h-4" />
          Add Department
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-background/95 backdrop-blur-xl border-white/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-poppins">Create Department</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="code" render={({ field }) => (
              <FormItem><FormLabel>Code (e.g. CS, MATH)</FormLabel><FormControl><Input {...field} uppercase /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" className="w-full clay-button mt-4" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}