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
import { Calendar, Users, Target, BookOpen, Clock, AlertCircle, FileText, CheckCircle2, LineChart } from "lucide-react";
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
  EVENT_CREATED: "text-primary bg-primary/10",
  EVENT_UPDATED: "text-accent-foreground bg-accent/20",
  PROGRESS_LOGGED: "text-secondary-foreground bg-secondary/30",
  AI_SUMMARY_GENERATED: "text-chart-4 bg-chart-4/20",
  USER_REGISTERED: "text-chart-3 bg-chart-3/20",
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
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const STAT_CARDS = [
    { title: "Total Events", value: stats?.totalEvents, icon: Calendar, color: "text-primary", bg: "bg-primary/20" },
    { title: "Active Students", value: stats?.activeStudents, icon: Users, color: "text-accent-foreground", bg: "bg-accent/30" },
    { title: "Progress Logs", value: stats?.totalProgressLogs, icon: BookOpen, color: "text-secondary-foreground", bg: "bg-secondary/40" },
    { title: "Completion Rate", value: `${stats?.completionRate || 0}%`, icon: Target, color: "text-chart-4", bg: "bg-chart-4/30" },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--chart-4))'];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-poppins">Welcome back, {user?.firstName}</h1>
          <p className="text-muted-foreground mt-1 text-lg">Here is what's happening in your department today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl border border-white backdrop-blur-sm shadow-sm">
          <Clock className="w-5 h-5 text-primary" />
          <span className="font-medium text-sm">{format(new Date(), "EEEE, MMMM d, yyyy")}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {STAT_CARDS.map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="clay-card border-none overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-50 ${stat.bg} blur-xl`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                    {isStatsLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <h3 className="text-3xl font-bold font-poppins text-foreground">{stat.value || 0}</h3>
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center clay-button ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upcoming Events & Charts */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Events */}
          <Card className="clay-card border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/30">
              <CardTitle className="text-xl font-poppins flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Events
              </CardTitle>
              <Link href="/events">
                <span className="text-sm text-primary hover:underline cursor-pointer font-medium">View all</span>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {isEventsLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                </div>
              ) : upcomingEvents?.length ? (
                <div className="divide-y divide-border/30">
                  {upcomingEvents.slice(0, 4).map(event => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div className="p-5 hover:bg-black/5 transition-colors cursor-pointer group flex items-start gap-4">
                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-background border border-border/50 flex flex-col items-center justify-center clay-button overflow-hidden">
                          <span className="text-xs font-medium bg-primary/20 text-primary w-full text-center py-0.5 uppercase tracking-wider">{format(new Date(event.startDate), "MMM")}</span>
                          <span className="text-lg font-bold font-poppins leading-none mt-1">{format(new Date(event.startDate), "d")}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">{event.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {format(new Date(event.startDate), "h:mm a")}
                            </span>
                            {event.location && (
                              <span className="truncate max-w-[150px]">• {event.location}</span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-background/50 capitalize">
                          {event.category.toLowerCase()}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="font-medium">No upcoming events</p>
                  <p className="text-sm">Your schedule is clear for now.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mini Chart */}
          <Card className="clay-card border-none">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-xl font-poppins flex items-center gap-2">
                <LineChart className="w-5 h-5 text-secondary-foreground" />
                Event Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex items-center justify-center">
              {isEventStatsLoading ? (
                <Skeleton className="w-[200px] h-[200px] rounded-full" />
              ) : eventStats?.byCategory?.length ? (
                <div className="h-[250px] w-full max-w-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={eventStats.byCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="category"
                      >
                        {eventStats.byCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {eventStats.byCategory.map((cat, i) => (
                      <div key={cat.category} className="flex items-center gap-2 text-sm font-medium">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="capitalize">{cat.category.toLowerCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">Not enough data to display chart.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-1">
          <Card className="clay-card border-none h-full max-h-[800px] flex flex-col">
            <CardHeader className="pb-4 border-b border-border/30 sticky top-0 bg-card z-10 rounded-t-[inherit]">
              <CardTitle className="text-xl font-poppins flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-accent-foreground" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1">
              {isActivitiesLoading ? (
                <div className="p-6 space-y-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities?.length ? (
                <div className="p-6 space-y-8 relative before:absolute before:inset-0 before:ml-11 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/80 before:to-transparent">
                  {activities.map((activity) => {
                    const Icon = ACTIVITY_ICONS[activity.type] || AlertCircle;
                    const colorClass = ACTIVITY_COLORS[activity.type] || "text-muted-foreground bg-muted";
                    
                    return (
                      <div key={activity.id} className="relative flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm border border-background ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <p className="text-sm font-medium text-foreground">
                            {activity.userName ? <span className="font-bold">{activity.userName}</span> : null}
                            {" "}{activity.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                          <p className="text-xs text-muted-foreground/70 mt-1.5 font-medium uppercase tracking-wider">
                            {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
