import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  useListProgressLogs,
  useCreateProgressLog,
  useGetProgressStats,
} from "@workspace/api-client-react";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Target, Plus, LineChart as LineChartIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";

const progressSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  metrics: z.string().optional(),
  weekNumber: z.coerce.number().min(1).max(53),
  year: z.coerce.number().min(2000).max(2100),
});

export default function Progress() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const currentWeek = 42; // Fallback hardcoded or computed week
  const currentYear = new Date().getFullYear();

  const { data: logs, isLoading: isLogsLoading } = useListProgressLogs({
    year: currentYear
  }, { query: { queryKey: ["progressLogs", currentYear] } });

  const { data: stats, isLoading: isStatsLoading } = useGetProgressStats({
    query: { queryKey: ["progressStats"] }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-poppins">Progress Logs</h1>
          <p className="text-muted-foreground mt-1">Track departmental achievements and metrics.</p>
        </div>
        
        <RoleGuard allowedRoles={["ADMIN", "FACULTY"]}>
          <CreateProgressDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} currentWeek={currentWeek} currentYear={currentYear} />
        </RoleGuard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="clay-card border-none">
            <CardHeader>
              <CardTitle className="font-poppins flex items-center gap-2">
                <LineChartIcon className="w-5 h-5 text-primary" />
                Progress Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isStatsLoading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : stats?.weeklyTrend?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.weeklyTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis 
                      dataKey="week" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                      tickFormatter={(val) => `W${val}`}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "white" }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="font-bold text-xl font-poppins">Recent Logs</h3>
            {isLogsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
              </div>
            ) : logs?.length ? (
              <div className="space-y-4">
                {logs.map((log, i) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="clay-card border-none hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded-md uppercase tracking-wider">
                                W{log.weekNumber} {log.year}
                              </span>
                              <span className="text-xs text-muted-foreground">{format(new Date(log.createdAt), "MMM d, yyyy")}</span>
                            </div>
                            <h4 className="font-bold text-lg font-poppins">{log.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                            {log.metrics && (
                              <div className="mt-3 bg-muted/50 p-3 rounded-lg text-sm">
                                <span className="font-medium">Metrics:</span> {log.metrics}
                              </div>
                            )}
                          </div>
                          <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center text-secondary-foreground shrink-0 clay-button">
                            <Target className="w-5 h-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-background/50 rounded-xl">
                <Target className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No progress logs found.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="clay-card border-none sticky top-24">
            <CardHeader>
              <CardTitle className="font-poppins text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Logs</p>
                {isStatsLoading ? <Skeleton className="h-10 w-20" /> : <p className="text-4xl font-bold font-poppins">{stats?.totalLogs || 0}</p>}
              </div>
              <div className="pt-6 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-3">Maintain a steady cadence of progress updates to ensure the AI summary generates accurate insights for the department.</p>
                <RoleGuard allowedRoles={["ADMIN", "FACULTY"]}>
                  <Button className="w-full clay-button" onClick={() => setIsDialogOpen(true)}>
                    Log Progress
                  </Button>
                </RoleGuard>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CreateProgressDialog({ open, onOpenChange, currentWeek, currentYear }: { open: boolean, onOpenChange: (o: boolean) => void, currentWeek: number, currentYear: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateProgressLog();
  
  const form = useForm<z.infer<typeof progressSchema>>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      title: "",
      description: "",
      metrics: "",
      weekNumber: currentWeek,
      year: currentYear,
    },
  });

  const onSubmit = (data: z.infer<typeof progressSchema>) => {
    createMutation.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Progress logged successfully" });
        queryClient.invalidateQueries({ queryKey: ["progressLogs"] });
        queryClient.invalidateQueries({ queryKey: ["progressStats"] });
        onOpenChange(false);
        form.reset();
      },
      onError: (err: any) => {
        toast({ title: "Failed to log progress", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-xl border-white/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-poppins">Log Progress</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="metrics" render={({ field }) => (
              <FormItem>
                <FormLabel>Key Metrics (optional)</FormLabel>
                <FormControl><Input placeholder="e.g. 5 papers published, 100 students attended" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="weekNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Week</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="year" render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <Button type="submit" className="w-full clay-button mt-4" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Save Progress"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}