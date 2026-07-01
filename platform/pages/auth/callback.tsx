'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const role = typeof router.query.role === 'string' ? router.query.role : undefined;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const redirectPath = role ? `/dashboard?role=${encodeURIComponent(role)}` : '/dashboard';
        router.push(redirectPath);
      } else {
        const redirectPath = role ? `/login?role=${encodeURIComponent(role)}` : '/login';
        router.push(redirectPath);
      }
    });
  }, [router, role]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
        <p className="text-white text-lg">Verifying your authentication...</p>
      </div>
    </div>
  );
}
