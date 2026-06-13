import { useAuth } from "@/lib/auth";
import {
  useGetDashboardStats,
  useListUpcomingEvents,
  useGetRecentActivity,
  useGetEventStats,
  ActivityItemType
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users, Target, BookOpen, Clock, FileText, CheckCircle2, TrendingUp, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from "recharts";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

const ACTIVITY_ICONS: Record<ActivityItemType, React.ElementType> = {
  EVENT_CREATED: Calendar,
  EVENT_UPDATED: Clock,
  PROGRESS_LOGGED: Target,
  AI_SUMMARY_GENERATED: FileText,
  USER_REGISTERED: Users,
};

const ACTIVITY_COLORS: Record<ActivityItemType, string> = {
  EVENT_CREATED: "bg-violet-100 text-violet-600",
  EVENT_UPDATED: "bg-sky-100 text-sky-600",
  PROGRESS_LOGGED: "bg-emerald-100 text-emerald-600",
  AI_SUMMARY_GENERATED: "bg-amber-100 text-amber-600",
  USER_REGISTERED: "bg-pink-100 text-pink-600",
};

const CATEGORY_BADGE: Record<string, string> = {
  ACADEMIC: "bg-violet-100 text-violet-700",
  EXTRACURRICULAR: "bg-emerald-100 text-emerald-700",
  ADMINISTRATIVE: "bg-sky-100 text-sky-700",
};

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: isStatsLoading } = useGetDashboardStats({
    query: { queryKey: ["dashboardStats"] }
  });
  const { data: upcomingEvents, isLoading: isEventsLoading } = useListUpcomingEvents({
    query: { queryKey: ["upcomingEvents"] }
  });
  const { data: activities, isLoading: isActivitiesLoading } = useGetRecentActivity({
    query: { queryKey: ["recentActivity"] }
  });
  const { data: eventStats, isLoading: isEventStatsLoading } = useGetEventStats({
    query: { queryKey: ["eventStats"] }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 28 } }
  };

  const STAT_CARDS = [
    {
      title: "Total Events", value: stats?.totalEvents, icon: Calendar,
      gradient: "stat-card-violet", glow: "shadow-violet-500/25",
      change: "+12% this month"
    },
    {
      title: "Active Students", value: stats?.activeStudents, icon: Users,
      gradient: "stat-card-emerald", glow: "shadow-emerald-500/25",
      change: "+5% this week"
    },
    {
      title: "Progress Logs", value: stats?.totalProgressLogs, icon: BookOpen,
      gradient: "stat-card-sky", glow: "shadow-sky-500/25",
      change: "8 weeks tracked"
    },
    {
      title: "Completion Rate", value: `${stats?.completionRate || 0}%`, icon: Target,
      gradient: "stat-card-amber", glow: "shadow-amber-500/25",
      change: "Above target"
    },
  ];

  const PIE_COLORS = ['#7c3aed', '#059669', '#0284c7', '#d97706', '#e11d48'];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Good morning, <span className="gradient-text">{user?.firstName}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening in your department today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-border shadow-sm">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">{format(new Date(), "EEEE, MMMM d, yyyy")}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {STAT_CARDS.map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <div className={`rounded-2xl p-5 text-white shadow-lg ${stat.gradient} ${stat.glow} relative overflow-hidden cursor-default`}>
              <div className="absolute inset-0 bg-white/5" />
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -right-1 -bottom-1 w-16 h-16 rounded-full bg-white/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-white/80">{stat.title}</p>
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <stat.icon className="w-4.5 h-4.5 text-white" style={{ width: '1.1rem', height: '1.1rem' }} />
                  </div>
                </div>
                {isStatsLoading ? (
                  <div className="h-9 w-20 rounded-lg bg-white/20 animate-pulse" />
                ) : (
                  <h3 className="text-4xl font-extrabold tracking-tight text-white">{stat.value ?? 0}</h3>
                )}
                <div className="mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-white/60" />
                  <span className="text-xs text-white/60 font-medium">{stat.change}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upcoming Events + Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Events */}
          <Card className="clay-card border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-violet-600" />
                </div>
                Upcoming Events
              </CardTitle>
              <Link href="/events">
                <span className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-0.5">
                  View all <ArrowUpRight className="w-3 h-3" />
                </span>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {isEventsLoading ? (
                <div className="p-5 space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                </div>
              ) : upcomingEvents?.length ? (
                <div className="divide-y divide-border/30">
                  {upcomingEvents.slice(0, 4).map(event => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div className="p-4 hover:bg-muted/40 transition-colors cursor-pointer group flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-200/50 flex flex-col items-center justify-center overflow-hidden">
                          <span className="text-[9px] font-bold text-violet-600 uppercase tracking-wide">{format(new Date(event.startDate), "MMM")}</span>
                          <span className="text-lg font-extrabold text-violet-700 leading-tight">{format(new Date(event.startDate), "d")}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{event.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{format(new Date(event.startDate), "h:mm a")}</span>
                            {event.location && <span className="truncate max-w-[120px]">· {event.location}</span>}
                          </div>
                        </div>
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${CATEGORY_BADGE[event.category] || "bg-muted text-muted-foreground"}`}>
                          {event.category.charAt(0) + event.category.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center text-muted-foreground flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="font-semibold text-sm">No upcoming events</p>
                  <p className="text-xs mt-1">Your schedule is clear.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Distribution Chart */}
          <Card className="clay-card border-none">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                Event Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex items-center justify-center">
              {isEventStatsLoading ? (
                <Skeleton className="w-48 h-48 rounded-full" />
              ) : eventStats?.byCategory?.length ? (
                <div className="w-full">
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={eventStats.byCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="count"
                          nameKey="category"
                        >
                          {eventStats.byCategory.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} strokeWidth={0} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 28px rgba(0,0,0,0.12)', fontSize: '13px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4">
                    {eventStats.byCategory.map((cat, i) => (
                      <div key={cat.category} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span>{cat.category.charAt(0) + cat.category.slice(1).toLowerCase()}</span>
                        <span className="font-bold text-foreground">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">Not enough data to display chart.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Activity Feed */}
        <div className="lg:col-span-1">
          <Card className="clay-card border-none h-full max-h-[700px] flex flex-col">
            <CardHeader className="pb-3 border-b border-border/40 sticky top-0 bg-card rounded-t-[inherit] z-10">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-sky-600" />
                </div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto flex-1 space-y-1">
              {isActivitiesLoading ? (
                <div className="space-y-4 p-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities?.length ? (
                activities.map((activity) => {
                  const Icon = ACTIVITY_ICONS[activity.type] || Clock;
                  const colorClass = ACTIVITY_COLORS[activity.type] || "bg-muted text-muted-foreground";
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-xs font-semibold text-foreground leading-snug">
                          {activity.userName && <span className="text-primary">{activity.userName} </span>}
                          {activity.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-1">{activity.description}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium">
                          {format(new Date(activity.createdAt), "MMM d · h:mm a")}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">No recent activity yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
