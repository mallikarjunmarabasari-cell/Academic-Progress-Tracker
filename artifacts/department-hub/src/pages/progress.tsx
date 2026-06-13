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
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Target, Plus, TrendingUp, Users, BookOpen, CalendarCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";

const progressSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  metrics: z.string().optional(),
  weekNumber: z.coerce.number().min(1).max(53),
  year: z.coerce.number().min(2000).max(2100),
});

export default function Progress() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const { data: logs, isLoading: isLogsLoading } = useListProgressLogs(
    { year: currentYear },
    { query: { queryKey: ["progressLogs", currentYear] } }
  );
  const { data: stats, isLoading: isStatsLoading } = useGetProgressStats({
    query: { queryKey: ["progressStats"] }
  });

  const getMetric = (log: any, key: string) => {
    if (!log.metrics) return null;
    try {
      const m = typeof log.metrics === "string" ? JSON.parse(log.metrics) : log.metrics;
      return m[key] ?? null;
    } catch { return null; }
  };

  return (
    <div className="space-y-7 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Progress <span className="gradient-text">Tracker</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Monitor departmental achievements week by week.</p>
        </div>
        <RoleGuard allowedRoles={["ADMIN", "FACULTY"]}>
          <Button
            className="gap-2 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 border-0 font-semibold"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Log Progress
          </Button>
        </RoleGuard>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Logs", value: stats?.totalLogs ?? 0, icon: Target, color: "text-violet-600 bg-violet-100" },
          { label: "Avg Attendance", value: "90%", icon: Users, color: "text-emerald-600 bg-emerald-100" },
          { label: "Papers Published", value: "23", icon: BookOpen, color: "text-sky-600 bg-sky-100" },
          { label: "Events Held", value: "26", icon: CalendarCheck, color: "text-amber-600 bg-amber-100" },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-border/50 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              {isStatsLoading && i === 0 ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <p className="text-2xl font-extrabold leading-tight">{item.value}</p>
              )}
              <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart + Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Area Chart */}
          <Card className="clay-card border-none">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                Progress Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 h-[260px]">
              {isStatsLoading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : stats?.weeklyTrend?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.weeklyTrend} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }} tickFormatter={(v) => `W${v}`} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 28px rgba(0,0,0,0.12)', fontSize: '13px', fontWeight: 600 }} />
                    <Area type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ r: 4, fill: "#7c3aed", stroke: "white", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No trend data available yet.</div>
              )}
            </CardContent>
          </Card>

          {/* Logs */}
          <div className="space-y-3">
            <h3 className="font-bold text-base">Recent Logs</h3>
            {isLogsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-36 w-full rounded-2xl" />)}
              </div>
            ) : logs?.length ? (
              <div className="space-y-3">
                {logs.map((log, i) => {
                  const attendance = getMetric(log, "studentAttendance");
                  const papers = getMetric(log, "researchPapers");
                  const events = getMetric(log, "eventsHeld");
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, type: "spring", stiffness: 400, damping: 30 }}
                    >
                      <div className="bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full uppercase tracking-wider border border-violet-200">
                              W{log.weekNumber} · {log.year}
                            </span>
                            <span className="text-xs text-muted-foreground">{format(new Date(log.createdAt), "MMM d, yyyy")}</span>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <Target className="w-4 h-4 text-emerald-600" />
                          </div>
                        </div>
                        <h4 className="font-bold text-sm mb-1">{log.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{log.description}</p>

                        {/* Metric chips */}
                        {(attendance !== null || papers !== null || events !== null) && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {attendance !== null && (
                              <span className="flex items-center gap-1.5 text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-full">
                                <Users className="w-3 h-3" />{attendance}% attendance
                              </span>
                            )}
                            {papers !== null && (
                              <span className="flex items-center gap-1.5 text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full">
                                <BookOpen className="w-3 h-3" />{papers} papers
                              </span>
                            )}
                            {events !== null && (
                              <span className="flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                                <CalendarCheck className="w-3 h-3" />{events} events
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-14 bg-white rounded-2xl border border-border/50 shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="font-semibold text-sm">No progress logs yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start tracking your weekly achievements.</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="lg:col-span-1">
          <Card className="clay-card border-none sticky top-8">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-bold">Weekly Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">Total Logs</p>
                {isStatsLoading ? (
                  <Skeleton className="h-12 w-20" />
                ) : (
                  <p className="text-5xl font-extrabold tracking-tight gradient-text">{stats?.totalLogs ?? 0}</p>
                )}
              </div>

              <div className="pt-4 border-t border-border/40">
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Keep a consistent cadence of weekly updates to enable accurate AI-generated summaries and trend analysis for your department.
                </p>
                <RoleGuard allowedRoles={["ADMIN", "FACULTY"]}>
                  <Button
                    className="w-full h-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold border-0 shadow-md shadow-emerald-500/20"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Log This Week
                  </Button>
                </RoleGuard>
              </div>

              {logs && logs.length > 0 && (
                <div className="pt-4 border-t border-border/40">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Recent Weeks</p>
                  <div className="space-y-2">
                    {logs.slice(0, 5).map(log => (
                      <div key={log.id} className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">W{log.weekNumber}</span>
                        <div className="flex-1 mx-3 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                            style={{ width: `${Math.min(100, (getMetric(log, "studentAttendance") ?? 75))}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-foreground">{getMetric(log, "studentAttendance") ?? "—"}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog */}
      <CreateProgressDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}

function CreateProgressDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateProgressLog();
  const currentYear = new Date().getFullYear();

  const form = useForm<z.infer<typeof progressSchema>>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      title: "",
      description: "",
      metrics: "",
      weekNumber: Math.ceil((new Date().getTime() - new Date(currentYear, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
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
      <DialogContent className="sm:max-w-[480px] bg-white border-border/60 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">Log Weekly Progress</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-sm">Title</FormLabel>
                <FormControl><Input className="bg-muted/30 border-border/60" placeholder="e.g. Week 20 Academic Progress" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-sm">Description</FormLabel>
                <FormControl><Input className="bg-muted/30 border-border/60" placeholder="What happened this week?" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="metrics" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-sm">Key Metrics <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                <FormControl><Input className="bg-muted/30 border-border/60" placeholder="e.g. 5 papers, 92% attendance" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="weekNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-sm">Week #</FormLabel>
                  <FormControl><Input type="number" className="bg-muted/30 border-border/60" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="year" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-sm">Year</FormLabel>
                  <FormControl><Input type="number" className="bg-muted/30 border-border/60" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <Button type="submit" className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold border-0 shadow-md shadow-emerald-500/20 mt-2" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Save Progress"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
