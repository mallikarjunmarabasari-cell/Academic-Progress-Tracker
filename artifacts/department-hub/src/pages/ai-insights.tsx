import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  useListAiSummaries,
  useGenerateAiSummary,
  useGetAiInsights,
  AiSummaryInputType,
} from "@workspace/api-client-react";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { BrainCircuit, Sparkles, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

export default function AiInsights() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: insights, isLoading: isInsightsLoading } = useGetAiInsights({
    query: { queryKey: ["aiInsights"] }
  });

  const { data: summaries, isLoading: isSummariesLoading } = useListAiSummaries(undefined, {
    query: { queryKey: ["aiSummaries"] }
  });

  const generateMutation = useGenerateAiSummary();

  const handleGenerate = () => {
    setIsGenerating(true);
    generateMutation.mutate({
      data: {
        type: AiSummaryInputType.PROGRESS,
      }
    }, {
      onSuccess: () => {
        toast({ title: "Summary generated successfully" });
        queryClient.invalidateQueries({ queryKey: ["aiSummaries"] });
        queryClient.invalidateQueries({ queryKey: ["aiInsights"] });
        setIsGenerating(false);
      },
      onError: (err: any) => {
        toast({ title: "Generation failed", description: err.message, variant: "destructive" });
        setIsGenerating(false);
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-poppins flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-primary" />
            </div>
            AI Insights
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Intelligent analysis of your department's activity.</p>
        </div>
        
        <RoleGuard allowedRoles={["ADMIN", "FACULTY", "MANAGEMENT"]}>
          <Button 
            className="clay-button gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 border-0"
            onClick={handleGenerate}
            disabled={isGenerating || generateMutation.isPending}
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? "Analyzing Data..." : "Generate Fresh Summary"}
          </Button>
        </RoleGuard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="clay-card border-none bg-gradient-to-br from-card to-background overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <CardContent className="p-8">
              <h2 className="text-xl font-bold font-poppins mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-foreground" />
                Current Analysis
              </h2>
              {isInsightsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : insights ? (
                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                  <p className="text-base">{insights.summary}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No insights available. Generate a summary to begin.</p>
              )}

              {insights?.recommendations?.length ? (
                <div className="mt-8 pt-6 border-t border-border/50">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Strategic Recommendations</h3>
                  <div className="flex flex-wrap gap-2">
                    {insights.recommendations.map((rec, i) => (
                      <Badge key={i} variant="secondary" className="bg-white/60 hover:bg-white text-foreground py-1.5 px-3 border border-white">
                        {rec}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="font-bold text-xl font-poppins">Recent Summaries</h3>
            {isSummariesLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
              </div>
            ) : summaries?.length ? (
              <div className="space-y-6">
                {summaries.map((summary, i) => (
                  <motion.div
                    key={summary.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="clay-card border-none hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <Badge className="bg-primary/20 text-primary hover:bg-primary/20">{summary.type}</Badge>
                          <span className="text-sm text-muted-foreground font-medium">{format(new Date(summary.generatedAt), "MMM d, yyyy")}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed line-clamp-3 mb-4">
                          {summary.content}
                        </p>
                        {summary.insights && (
                          <div className="bg-background/50 p-4 rounded-xl text-sm border border-white/50">
                            <span className="font-bold font-poppins text-accent-foreground block mb-1">Key Insight</span>
                            {summary.insights}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-background/50 rounded-xl">
                <p className="text-muted-foreground">No historical summaries found.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-bold text-xl font-poppins">Identified Trends</h3>
          {isInsightsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          ) : insights?.trends?.length ? (
            <div className="space-y-4">
              {insights.trends.map((trend, i) => {
                const isUp = trend.direction === 'UP';
                const isDown = trend.direction === 'DOWN';
                const colorClass = isUp ? 'text-chart-2 bg-chart-2/20' : isDown ? 'text-destructive bg-destructive/20' : 'text-chart-4 bg-chart-4/20';
                const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="clay-card border-none">
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{trend.label}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{trend.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card className="clay-card border-none bg-transparent shadow-none">
              <CardContent className="p-8 text-center text-muted-foreground">
                Trends will appear here once enough data is analyzed.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}