'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Jangan lacak akses ke halaman admin atau API
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
      return;
    }

    const logPageView = async () => {
      try {
        // Ambil atau buat visitor_id unik di localStorage
        let visitorId = localStorage.getItem('tailorcraft_visitor_id');
        if (!visitorId) {
          visitorId = 'visitor_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
          localStorage.setItem('tailorcraft_visitor_id', visitorId);
        }

        // Simpan ke Supabase
        await supabase.from('page_views').insert({
          path: pathname,
          visitor_id: visitorId
        });
      } catch (err) {
        // Gagal silent agar tidak mengganggu performa dan kenyamanan pengguna
        console.error('Error logging page view:', err);
      }
    };

    logPageView();
  }, [pathname]);

  return null;
}
