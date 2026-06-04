'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PanelLeft, Loader2 } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/admin/login');
      } else {
        setSession(session);
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && pathname !== '/admin/login') {
        router.replace('/admin/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  // Halaman login tidak pakai sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#8B5E3C]" size={32} />
      </div>
    );
  }

  // Jika tidak ada session, jangan render konten admin untuk mencegah flash content sebelum redirect
  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">

      {/* ── Sidebar Desktop (selalu tampil di ≥ lg) ── */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* ── Sidebar Mobile (drawer overlay) ── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <div className="relative z-50 animate-in slide-in-from-left duration-200">
            <AdminSidebar onClose={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Konten Utama ── */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center px-4 sm:px-6 bg-white border-b border-slate-100 sticky top-0 z-10 shrink-0 gap-3">
          {/* Toggle button — ikon PanelLeft seperti referensi */}
          <button
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle sidebar"
            className="p-2 rounded-lg hover:bg-slate-100 active:scale-90 transition-all duration-150 text-slate-600"
          >
            <PanelLeft size={20} strokeWidth={1.5} />
          </button>

          <span className="font-[family-name:var(--font-inter)] font-semibold text-slate-800 text-[14px]">
            Admin Panel
          </span>
        </header>

        {/* Konten halaman */}
        <div className="p-4 sm:p-6 md:p-8 flex-1">
          {children}
        </div>
      </main>

    </div>
  );
}
