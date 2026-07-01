'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const role = typeof router.query.role === 'string' ? router.query.role : undefined;

  useEffect(() => {
    setMounted(true);

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const redirectPath = role ? `/dashboard?role=${encodeURIComponent(role)}` : '/dashboard';
        router.push(redirectPath);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const redirectPath = role ? `/dashboard?role=${encodeURIComponent(role)}` : '/dashboard';
        router.push(redirectPath);
      }
    });

    return () => subscription?.unsubscribe();
  }, [router, role]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">ADPAIS</h1>
          <p className="text-slate-400">AI-Powered Department Performance & Accreditation Intelligence System</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-2xl">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google']}
            theme="dark"
            redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
          />
        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          Sign in with your Google account to get started
        </p>
      </div>
    </div>
  );
}
