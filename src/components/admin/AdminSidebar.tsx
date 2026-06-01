'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Image as ImageIcon, Users,
  Shirt, MessageSquare, LogOut, Megaphone, Phone, UserCircle,
} from 'lucide-react';

const menuItems = [
  { title: 'Dashboard',          url: '/admin',          icon: LayoutDashboard },
  { title: 'Gambar Utama (Hero)', url: '/admin/hero',     icon: ImageIcon       },
  { title: 'Klien & Partner',    url: '/admin/client',   icon: Users           },
  { title: 'About Me',           url: '/admin/about',    icon: UserCircle      },
  { title: 'Katalog Produk',     url: '/admin/product',  icon: Shirt           },
  { title: 'Gambar CTA',         url: '/admin/cta',      icon: Megaphone       },
  { title: 'Ulasan Pelanggan',   url: '/admin/ulasan',   icon: MessageSquare   },
  { title: 'Kontak',             url: '/admin/kontak',   icon: Phone           },
];

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const handleClick = () => {
    onClose?.();
  };

  return (
    <aside className="w-64 shrink-0 h-screen bg-white border-r border-slate-100 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <span
          className="font-[family-name:var(--font-instrument-serif)] text-xl font-normal text-[#A47251]"
          style={{ letterSpacing: '-0.02em' }}
        >
          TailorCraft
        </span>
        <span className="ml-2 font-[family-name:var(--font-inter)] text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Admin
        </span>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <p className="font-[family-name:var(--font-inter)] text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
          CMS TailorCraft
        </p>
        <ul className="space-y-1">
          {menuItems.map(({ title, url, icon: Icon }) => {
            const isActive = pathname === url;
            return (
              <li key={url}>
                <Link
                  href={url}
                  onClick={handleClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
                              font-[family-name:var(--font-inter)] text-[13.5px] font-medium
                              transition-all duration-200
                              ${isActive
                                ? 'bg-[#F0D8A1]/40 text-[#A47251]'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                              }`}
                >
                  <Icon size={17} strokeWidth={1.5}
                    className={isActive ? 'text-[#A47251]' : 'text-slate-400'} />
                  {title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 py-3 px-3">
        <Link
          href="/admin/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                     font-[family-name:var(--font-inter)] text-[13.5px] font-medium
                     text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut size={17} strokeWidth={1.5} />
          Keluar
        </Link>
      </div>
    </aside>
  );
}
