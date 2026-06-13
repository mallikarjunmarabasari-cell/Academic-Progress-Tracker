import { useState } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  useListEvents,
  useCreateEvent,
  EventCategory,
  EventStatus,
  EventPriority,
} from "@workspace/api-client-react";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Calendar, MapPin, Search, Plus, SlidersHorizontal } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.nativeEnum(EventCategory),
  status: z.nativeEnum(EventStatus),
  priority: z.nativeEnum(EventPriority),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  location: z.string().optional(),
});

const STATUS_STYLES: Record<string, string> = {
  PLANNED: "bg-slate-100 text-slate-600 border border-slate-200",
  ONGOING: "bg-amber-100 text-amber-700 border border-amber-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  CANCELLED: "bg-red-100 text-red-600 border border-red-200",
};

const CATEGORY_STYLES: Record<string, string> = {
  ACADEMIC: "bg-violet-100 text-violet-700 border border-violet-200",
  EXTRACURRICULAR: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  ADMINISTRATIVE: "bg-sky-100 text-sky-700 border border-sky-200",
};

const PRIORITY_DOT: Record<string, string> = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-amber-500",
  LOW: "bg-emerald-500",
};

const CATEGORY_ACCENT: Record<string, string> = {
  ACADEMIC: "from-violet-500/10 to-indigo-500/5 border-t-violet-400",
  EXTRACURRICULAR: "from-emerald-500/10 to-teal-500/5 border-t-emerald-400",
  ADMINISTRATIVE: "from-sky-500/10 to-blue-500/5 border-t-sky-400",
};

export default function Events() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [, setLocation] = useLocation();

  const { data: events, isLoading } = useListEvents({
    category: category !== "ALL" ? category : undefined,
    status: status !== "ALL" ? status : undefined,
  }, { query: { queryKey: ["events", category, status] } });

  const filteredEvents = events?.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.description && e.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-7 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Events <span className="gradient-text">Calendar</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage and track all departmental events.</p>
        </div>
        <RoleGuard allowedRoles={["ADMIN", "FACULTY"]}>
          <CreateEventDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </RoleGuard>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <Input
            placeholder="Search events by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-white border-border/70 focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[155px] h-10 bg-white border-border/70 gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {Object.values(EventCategory).map((c) => (
                <SelectItem key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[145px] h-10 bg-white border-border/70 gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {Object.values(EventStatus).map((s) => (
                <SelectItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Count */}
      {!isLoading && filteredEvents && (
        <p className="text-xs text-muted-foreground font-medium">
          Showing <span className="font-bold text-foreground">{filteredEvents.length}</span> event{filteredEvents.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-52 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredEvents?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 30 }}
              onClick={() => setLocation(`/events/${event.id}`)}
              className="cursor-pointer"
            >
              <div className={`bg-white rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col overflow-hidden border-t-2 bg-gradient-to-b ${CATEGORY_ACCENT[event.category] || "border-t-slate-300 from-slate-50"}`}>
                {/* Top row */}
                <div className="px-5 pt-5 pb-4 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${CATEGORY_STYLES[event.category] || "bg-muted text-muted-foreground"}`}>
                      {event.category.charAt(0) + event.category.slice(1).toLowerCase()}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[event.priority] || "bg-slate-400"}`} />
                      <span className="text-[11px] font-semibold text-muted-foreground">{event.priority}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-base leading-snug mb-1.5 line-clamp-2">{event.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {event.description || "No description provided."}
                  </p>
                </div>

                {/* Bottom row */}
                <div className="px-5 pb-4 pt-3 border-t border-border/30 space-y-1.5 bg-white/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-primary/70" />
                      <span>{format(new Date(event.startDate), "MMM d, yyyy · h:mm a")}</span>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[event.status] || "bg-muted text-muted-foreground"}`}>
                      {event.status.charAt(0) + event.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-sky-500/70" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-border/50 shadow-sm">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-violet-500" />
          </div>
          <h3 className="text-base font-bold">No events found</h3>
          <p className="text-muted-foreground mt-1 text-sm">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

function CreateEventDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateEvent();

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      category: EventCategory.ACADEMIC,
      status: EventStatus.PLANNED,
      priority: EventPriority.MEDIUM,
      startDate: new Date().toISOString().slice(0, 16),
      location: "",
    },
  });

  const onSubmit = (data: z.infer<typeof eventSchema>) => {
    createMutation.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Event created successfully" });
        queryClient.invalidateQueries({ queryKey: ["events"] });
        onOpenChange(false);
        form.reset();
      },
      onError: (err: any) => {
        toast({ title: "Failed to create event", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25 border-0 font-semibold">
          <Plus className="w-4 h-4" />
          New Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white border-border/60 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">Create New Event</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-sm">Title</FormLabel>
                <FormControl><Input className="bg-muted/30 border-border/60" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-sm">Description</FormLabel>
                <FormControl><Input className="bg-muted/30 border-border/60" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-sm">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="bg-muted/30 border-border/60"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {Object.values(EventCategory).map(c => <SelectItem key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="priority" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-sm">Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="bg-muted/30 border-border/60"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {Object.values(EventPriority).map(p => <SelectItem key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-sm">Start Date</FormLabel>
                  <FormControl><Input type="datetime-local" className="bg-muted/30 border-border/60" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-sm">Location</FormLabel>
                  <FormControl><Input placeholder="Room / Building" className="bg-muted/30 border-border/60" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <Button type="submit" className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold border-0 shadow-lg shadow-violet-500/20 mt-2" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Event"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
