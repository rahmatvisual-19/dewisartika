'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, Home, Shirt, Scissors, Phone } from 'lucide-react';

const navLinks = [
  { title: 'Beranda',  href: '/',        scrollTo: null       },
  { title: 'Katalog',  href: '/katalog', scrollTo: null       },
  { title: 'Layanan',  href: '/',        scrollTo: 'layanan'  },
  { title: 'Kontak',   href: '/kontak',  scrollTo: null       },
];

const mobileItems = [
  { title: 'Beranda',   href: '/',         scrollTo: null,      icon: Home     },
  { title: 'Katalog',   href: '/katalog',  scrollTo: null,      icon: Shirt    },
  { title: 'Layanan',   href: '/',         scrollTo: 'layanan', icon: Scissors },
  { title: 'Kontak',    href: '/kontak',   scrollTo: null,      icon: Phone    },
  { title: 'Keranjang', href: '/keranjang',scrollTo: null,      icon: ShoppingBag },
];

const CART_COUNT = 0;

function smoothScrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export default function Navbar() {
  const pathname = usePathname();

  // Sembunyikan Navbar di semua halaman admin
  if (pathname.startsWith('/admin')) return null;
  const router   = useRouter();

  const handleNavClick = (
    e: React.MouseEvent,
    href: string,
    scrollTo: string | null
  ) => {
    if (!scrollTo) return; // navigasi biasa, biarkan Link bekerja

    e.preventDefault();

    if (pathname === '/') {
      // Sudah di beranda — langsung scroll
      smoothScrollTo(scrollTo);
    } else {
      // Dari halaman lain — navigate dulu, lalu scroll setelah mount
      router.push(`/#${scrollTo}`);
      // Scroll setelah halaman selesai render
      setTimeout(() => smoothScrollTo(scrollTo), 300);
    }
  };

  return (
    <>
      {/* =============================================
          DESKTOP NAVBAR
          ============================================= */}
      <nav
        className="hidden md:flex fixed top-0 inset-x-0 z-50 h-[68px]
                   bg-white/70 backdrop-blur-[16px] saturate-[1.8]
                   border-b border-black/[0.05]"
      >
        <div className="w-full max-w-7xl mx-auto px-8 flex items-center justify-between">

          <Link
            href="/"
            className="text-[1.4rem] font-[family-name:var(--font-instrument-serif)]
                       font-normal tracking-tight text-slate-800 select-none
                       hover:opacity-75 transition-opacity duration-200"
          >
            TailorCraft
          </Link>

          <div className="flex items-center gap-8">
            {navLinks.map(({ title, href, scrollTo }) => {
              const isActive = scrollTo
                ? pathname === '/'   // "Layanan" aktif saat di beranda
                  ? false            // jangan highlight kecuali di-scroll
                  : false
                : pathname === href;
              return (
                <Link
                  key={title}
                  href={scrollTo ? `/#${scrollTo}` : href}
                  onClick={(e) => handleNavClick(e, href, scrollTo)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`font-[family-name:var(--font-inter)] text-[13.5px] font-semibold
                              tracking-[0.015em] transition-all duration-200 active:scale-95
                              ${isActive
                                ? 'text-[#E89B7E]'
                                : 'text-slate-600 hover:opacity-60'
                              }`}
                >
                  {title}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-1 text-slate-700">
            <button
              aria-label="Cari"
              suppressHydrationWarning
              className="p-2 rounded-full hover:bg-black/[0.05] active:scale-90 transition-all duration-150"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>

            <Link
              href="/keranjang"
              aria-label="Keranjang"
              className="relative p-2 rounded-full hover:bg-black/[0.05] active:scale-90 transition-all duration-150"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {CART_COUNT >= 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center
                                 min-w-[8px] h-[8px] rounded-full bg-[#E89B7E] ring-[1.5px] ring-white" />
              )}
            </Link>
          </div>

        </div>
      </nav>

      {/* =============================================
          MOBILE NAVBAR — Bottom pill
          ============================================= */}
      <nav className="md:hidden fixed bottom-5 inset-x-0 z-50 flex justify-center pointer-events-none">
        <div
          className="pointer-events-auto flex items-center gap-1 px-4 py-2
                     bg-white/75 backdrop-blur-[16px] saturate-[1.8]
                     rounded-[28px] border border-black/[0.06]
                     shadow-[0_8px_32px_rgba(0,0,0,0.10)]"
        >
          {mobileItems.map(({ title, href, scrollTo, icon: Icon }) => {
            const isActive = !scrollTo && pathname === href;
            return (
              <Link
                key={title}
                href={scrollTo ? `/#${scrollTo}` : href}
                onClick={(e) => handleNavClick(e, href, scrollTo)}
                className={`relative flex flex-col items-center justify-center gap-[3px]
                            w-12 h-12 rounded-2xl
                            transition-all duration-200 active:scale-90
                            ${isActive
                              ? 'text-[#E89B7E]'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-black/[0.04]'
                            }`}
              >
                <Icon size={20} strokeWidth={1.5} />
                <span className="font-[family-name:var(--font-inter)] text-[9px] font-medium leading-none tracking-tight">
                  {title}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 h-[3px] w-[3px] rounded-full bg-[#E89B7E]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
