import { useLocation, useParams } from "wouter";
import { format } from "date-fns";
import {
  useGetEvent,
  useDeleteEvent,
} from "@workspace/api-client-react";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, ArrowLeft, Clock, Trash2, Edit } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";

export default function EventDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const eventId = id ? parseInt(id, 10) : 0;
  const { data: event, isLoading } = useGetEvent(eventId, { query: { enabled: !!eventId, queryKey: ["event", eventId] } });
  const deleteMutation = useDeleteEvent();

  const handleDelete = () => {
    deleteMutation.mutate({ id: eventId }, {
      onSuccess: () => {
        toast({ title: "Event deleted" });
        queryClient.invalidateQueries({ queryKey: ["events"] });
        setLocation("/events");
      },
      onError: (err: any) => {
        toast({ title: "Failed to delete", description: err.message, variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!event) {
    return <div>Event not found.</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Button variant="ghost" className="mb-4" onClick={() => setLocation("/events")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Events
      </Button>

      <Card className="clay-card border-none overflow-hidden">
        <div className="h-32 bg-primary/20 relative">
          <div className="absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>
        <CardContent className="p-8 -mt-16 relative z-10">
          <div className="bg-card rounded-2xl p-6 shadow-xl border border-white/50 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex gap-2 mb-3">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{event.category}</Badge>
                <Badge variant="outline">{event.status}</Badge>
                <Badge variant="outline">{event.priority} Priority</Badge>
              </div>
              <h1 className="text-3xl font-bold font-poppins">{event.title}</h1>
              <p className="text-muted-foreground mt-2">{event.departmentName} Department</p>
            </div>
            
            <RoleGuard allowedRoles={["ADMIN", "FACULTY"]}>
              <div className="flex gap-2">
                <Button variant="outline" className="bg-white/50">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="clay-button">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the event.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </RoleGuard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-bold font-poppins mb-2">Description</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p>{event.description || "No description provided."}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-background/50 rounded-xl p-5 border border-white/50 space-y-4">
                <h3 className="font-bold font-poppins text-sm uppercase tracking-wider text-muted-foreground mb-4">Event Details</h3>
                
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(event.startDate), "MMMM d, yyyy")}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center text-secondary-foreground shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(event.startDate), "h:mm a")}</p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center text-accent-foreground shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">Created by {event.createdByName}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
