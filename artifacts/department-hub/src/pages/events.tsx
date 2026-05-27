import { useState } from "react";
import { useLocation, Link } from "wouter";
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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import { Calendar, MapPin, Search, Plus, Filter } from "lucide-react";
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-poppins">Events</h1>
          <p className="text-muted-foreground mt-1">Manage and track departmental events.</p>
        </div>
        
        <RoleGuard allowedRoles={["ADMIN", "FACULTY"]}>
          <CreateEventDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </RoleGuard>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search events..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background/50 border-white/50 focus:bg-white"
          />
        </div>
        <div className="flex gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[160px] bg-background/50 border-white/50">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {Object.values(EventCategory).map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px] bg-background/50 border-white/50">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {Object.values(EventStatus).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredEvents?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setLocation(`/events/${event.id}`)}
              className="cursor-pointer h-full"
            >
              <Card className="clay-card h-full flex flex-col hover:border-primary/50 transition-colors">
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className={`
                      ${event.category === 'ACADEMIC' ? 'bg-primary/20 text-primary border-primary/20' : 
                        event.category === 'EXTRACURRICULAR' ? 'bg-secondary/30 text-secondary-foreground border-secondary/30' : 
                        'bg-accent/30 text-accent-foreground border-accent/30'}
                    `}>
                      {event.category}
                    </Badge>
                    <Badge className={`
                      ${event.status === 'COMPLETED' ? 'bg-chart-2 hover:bg-chart-2' :
                        event.status === 'ONGOING' ? 'bg-chart-4 hover:bg-chart-4 text-chart-4-foreground' :
                        event.status === 'CANCELLED' ? 'bg-destructive hover:bg-destructive' :
                        'bg-muted hover:bg-muted text-muted-foreground'}
                    `}>
                      {event.status}
                    </Badge>
                  </div>
                  
                  <h3 className="font-bold text-lg font-poppins mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {event.description || "No description provided."}
                  </p>
                  
                  <div className="space-y-2 mt-auto pt-4 border-t border-border/30 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{format(new Date(event.startDate), "MMM d, yyyy • h:mm a")}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 text-accent-foreground" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-background/50 rounded-2xl border border-white/50">
          <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-poppins font-medium">No events found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search or filters.</p>
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
        <Button className="clay-button gap-2">
          <Plus className="w-4 h-4" />
          New Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-xl border-white/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-poppins">Create New Event</DialogTitle>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {Object.values(EventCategory).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="priority" render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {Object.values(EventPriority).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl><Input type="datetime-local" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <Button type="submit" className="w-full clay-button mt-4" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Event"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}