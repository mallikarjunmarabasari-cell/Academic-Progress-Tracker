import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Sparkles, GraduationCap, Shield, BookOpen, BarChart3 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const DEMO_CREDENTIALS = [
  { role: "Admin", email: "admin@department.edu", password: "admin123", color: "from-violet-500 to-purple-600", light: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100", icon: Shield },
  { role: "Faculty", email: "faculty@department.edu", password: "faculty123", color: "from-emerald-500 to-teal-600", light: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100", icon: BookOpen },
  { role: "Student", email: "student@department.edu", password: "student123", color: "from-sky-500 to-blue-600", light: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100", icon: GraduationCap },
  { role: "Management", email: "dean@department.edu", password: "dean123", color: "from-amber-500 to-orange-600", light: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100", icon: BarChart3 },
];

export default function Login() {
  const loginMutation = useLogin();
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        login(res.user, res.token);
        setLocation("/dashboard");
      },
      onError: (error: any) => {
        toast({
          title: "Login failed",
          description: error.message || "Invalid email or password.",
          variant: "destructive",
        });
      },
    });
  };

  const fillCredentials = (email: string, password: string) => {
    form.setValue("email", email);
    form.setValue("password", password);
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left panel — hero */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col items-center justify-center p-12 overflow-hidden sidebar-bg">
        {/* Animated blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="float-1 absolute top-[10%] left-[10%] w-72 h-72 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="float-2 absolute bottom-[15%] right-[5%] w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="float-3 absolute top-[50%] left-[40%] w-48 h-48 rounded-full bg-purple-400/15 blur-2xl" />
        </div>

        {/* Floating decorative shapes */}
        <div className="float-1 absolute top-[18%] right-[12%] w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center">
          <GraduationCap className="w-7 h-7 text-violet-300" />
        </div>
        <div className="float-2 absolute bottom-[22%] left-[8%] w-14 h-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-indigo-300" />
        </div>
        <div className="float-3 absolute top-[38%] right-[6%] w-12 h-12 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-purple-300" />
        </div>

        <div className="relative z-10 max-w-md text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-8 shadow-2xl pulse-glow"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-4xl font-extrabold text-white mb-4 tracking-tight"
          >
            DepartmentHub
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-lg text-white/50 mb-12 leading-relaxed"
          >
            Your university's all-in-one portal for events, progress tracking, and AI-powered academic insights.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {["Event Management", "Progress Logs", "AI Insights", "Role-Based Access"].map((feat) => (
              <span key={feat} className="px-3 py-1.5 rounded-full glass-dark text-white/60 text-xs font-medium border border-white/10">
                {feat}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Bottom stat chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="relative z-10 mt-16 flex gap-6"
        >
          {[["10+", "Events"], ["8", "Weeks Tracked"], ["4", "Roles"]].map(([num, label]) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-extrabold text-white">{num}</p>
              <p className="text-xs text-white/40 font-medium">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-violet-100/50 blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-sky-100/50 blur-3xl -ml-24 -mb-24 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">DepartmentHub</h1>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to access your academic portal.</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-semibold text-sm">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="you@department.edu"
                      className="h-12 border-border/80 bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-semibold text-sm">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-12 border-border/80 bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-base shadow-lg shadow-violet-500/30 border-0 transition-all"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : "Sign In"}
              </Button>
            </form>
          </Form>

          {/* Demo credentials */}
          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">
              Quick access — click to fill
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_CREDENTIALS.map(({ role, email, password, light, icon: Icon }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillCredentials(email, password)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${light}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{role}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
