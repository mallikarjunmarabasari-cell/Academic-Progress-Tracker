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
import { BrainCircuit, Sparkles, TrendingUp, TrendingDown, Minus, ArrowRight, Zap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

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
    generateMutation.mutate({ data: { type: AiSummaryInputType.PROGRESS } }, {
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
    <div className="space-y-7 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span>AI <span className="gradient-text">Insights</span></span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm ml-14">Intelligent analysis powered by GPT-4.</p>
        </div>
        <RoleGuard allowedRoles={["ADMIN", "FACULTY", "MANAGEMENT"]}>
          <Button
            className="gap-2 h-10 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-semibold border-0 shadow-lg shadow-violet-500/30"
            onClick={handleGenerate}
            disabled={isGenerating || generateMutation.isPending}
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Summary
              </>
            )}
          </Button>
        </RoleGuard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Analysis */}
          <div className="relative rounded-2xl overflow-hidden">
            {/* Gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute top-6 right-8">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full bg-white/40 ${i === 1 ? "bg-white/70" : ""}`} />
                ))}
              </div>
            </div>

            <div className="relative z-10 p-7">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base font-bold text-white">Current Analysis</h2>
                <span className="ml-auto text-xs font-semibold text-white/50 bg-white/10 px-2.5 py-1 rounded-full">GPT-4</span>
              </div>

              {isInsightsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-3.5 rounded-full bg-white/20 animate-pulse" style={{ width: `${[100, 90, 70][i - 1]}%` }} />
                  ))}
                </div>
              ) : insights ? (
                <p className="text-white/80 leading-relaxed text-sm">{insights.summary}</p>
              ) : (
                <p className="text-white/50 text-sm">No insights available. Generate a summary to begin.</p>
              )}

              {insights?.recommendations?.length ? (
                <div className="mt-6 pt-5 border-t border-white/15">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Recommendations</p>
                  <div className="space-y-2">
                    {insights.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <ArrowRight className="w-3.5 h-3.5 text-white/40 mt-0.5 shrink-0" />
                        <p className="text-sm text-white/70">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Summaries */}
          <div className="space-y-4">
            <h3 className="font-bold text-base">Recent Summaries</h3>
            {isSummariesLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
              </div>
            ) : summaries?.length ? (
              <div className="space-y-4">
                {summaries.map((summary, i) => (
                  <motion.div
                    key={summary.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <div className="bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all p-5">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                          summary.type === "WEEKLY"
                            ? "bg-violet-100 text-violet-700 border border-violet-200"
                            : "bg-sky-100 text-sky-700 border border-sky-200"
                        }`}>
                          {summary.type}
                        </span>
                        <span className="text-xs text-muted-foreground font-semibold">{format(new Date(summary.generatedAt), "MMM d, yyyy")}</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed line-clamp-3 mb-3">{summary.content}</p>
                      {summary.insights && (
                        <div className="bg-violet-50 border border-violet-100 rounded-xl p-3.5 text-xs">
                          <span className="font-bold text-violet-700 block mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />Key Insight
                          </span>
                          <p className="text-violet-600/80 leading-relaxed">{summary.insights}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-border/50">
                <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <BrainCircuit className="w-6 h-6 text-violet-600" />
                </div>
                <p className="font-semibold text-sm">No summaries yet</p>
                <p className="text-xs text-muted-foreground mt-1">Generate your first AI summary above.</p>
              </div>
            )}
          </div>
        </div>

        {/* Trends sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-base">Identified Trends</h3>
          {isInsightsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
            </div>
          ) : insights?.trends?.length ? (
            <div className="space-y-3">
              {insights.trends.map((trend, i) => {
                const isUp = trend.direction === "UP";
                const isDown = trend.direction === "DOWN";
                const styles = isUp
                  ? { icon: TrendingUp, bg: "bg-emerald-100", text: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" }
                  : isDown
                    ? { icon: TrendingDown, bg: "bg-red-100", text: "text-red-600", badge: "bg-red-50 text-red-700 border-red-200" }
                    : { icon: Minus, bg: "bg-amber-100", text: "text-amber-600", badge: "bg-amber-50 text-amber-700 border-amber-200" };

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-4 flex items-start gap-3 hover:shadow-md transition-all">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${styles.bg}`}>
                        <styles.icon className={`w-4.5 h-4.5 ${styles.text}`} style={{ width: '1.1rem', height: '1.1rem' }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sm leading-tight">{trend.label}</h4>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wide ${styles.badge}`}>
                            {trend.direction}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{trend.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border/50 p-8 text-center shadow-sm">
              <div className="w-10 h-10 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-semibold">No trends yet</p>
              <p className="text-xs text-muted-foreground mt-1">Trends appear once enough data is analyzed.</p>
            </div>
          )}

          {/* AI Feature info */}
          <div className="mt-4 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-bold text-violet-700">How AI Insights work</span>
            </div>
            <p className="text-xs text-violet-600/70 leading-relaxed">
              GPT-4 analyzes your department's events, progress logs, and activity patterns to surface actionable insights and trend predictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
