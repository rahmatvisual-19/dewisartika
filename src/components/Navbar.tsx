'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, Home, Shirt, Scissors, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

function smoothScrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();

  const [cartCount, setCartCount] = useState(0);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const updateCartCount = () => {
    const raw = localStorage.getItem('cart');
    if (raw) {
      try {
        const items = JSON.parse(raw);
        const total = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        setCartCount(total);
      } catch (e) {
        setCartCount(0);
      }
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('cart-updated', updateCartCount);
    window.addEventListener('storage', updateCartCount);
    return () => {
      window.removeEventListener('cart-updated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  // Sembunyikan Navbar di semua halaman admin
  if (pathname.startsWith('/admin')) return null;

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
                                ? 'text-[#A65D43]'
                                : 'text-slate-600 hover:opacity-60'
                              }`}
                >
                  {title}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-1 text-slate-700">
            <div className="relative flex items-center">
              <AnimatePresence>
                {isSearchExpanded && (
                  <motion.input
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 160, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    type="text"
                    placeholder="Cari produk..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const trimmed = searchVal.trim();
                        if (trimmed) {
                          router.push(`/katalog?q=${encodeURIComponent(trimmed)}`);
                          setIsSearchExpanded(false);
                          setSearchVal('');
                        }
                      }
                    }}
                    className="h-9 px-4 py-1.5 mr-1 rounded-full border border-slate-200 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] bg-white/95"
                  />
                )}
              </AnimatePresence>

              <button
                aria-label="Cari"
                onClick={() => {
                  const trimmed = searchVal.trim();
                  if (isSearchExpanded && trimmed) {
                    router.push(`/katalog?q=${encodeURIComponent(trimmed)}`);
                    setIsSearchExpanded(false);
                    setSearchVal('');
                  } else {
                    setIsSearchExpanded(!isSearchExpanded);
                  }
                }}
                className="p-2 rounded-full hover:bg-black/[0.05] active:scale-90 transition-all duration-150 cursor-pointer"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>
            </div>

            <Link
              href="/keranjang"
              aria-label="Keranjang"
              className="relative p-2 rounded-full hover:bg-black/[0.05] active:scale-90 transition-all duration-150"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center
                                 min-w-[8px] h-[8px] rounded-full bg-[#A65D43] ring-[1.5px] ring-white" />
              )}
            </Link>
          </div>

        </div>
      </nav>

      {/* =============================================
          MOBILE NAVBAR — Bottom pill
          ============================================= */}
      <nav className="md:hidden fixed bottom-8 inset-x-0 z-50 flex justify-center pointer-events-none">
        <div
          className="pointer-events-auto flex items-center gap-1 px-4 py-2 shrink-0
                     bg-white/75 backdrop-blur-[16px] saturate-[1.8]
                     rounded-[28px] border border-black/[0.06]
                     shadow-[0_8px_32px_rgba(0,0,0,0.10)]"
        >
          {mobileItems.map(({ title, href, scrollTo, icon: Icon }) => {
            const isActive = !scrollTo && pathname === href;
            const isCart = title === 'Keranjang';
            return (
              <Link
                key={title}
                href={scrollTo ? `/#${scrollTo}` : href}
                onClick={(e) => handleNavClick(e, href, scrollTo)}
                className={`relative flex flex-col items-center justify-center gap-[3px] shrink-0
                            w-12 h-12 rounded-2xl
                            transition-all duration-200 active:scale-90
                            ${isActive
                              ? 'text-[#A65D43]'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-black/[0.04]'
                            }`}
              >
                <Icon size={20} strokeWidth={1.5} />
                <span className="font-[family-name:var(--font-inter)] text-[9px] font-medium leading-none tracking-tight">
                  {title}
                </span>
                {isCart && cartCount > 0 && (
                  <span className="absolute top-2 right-2 flex items-center justify-center
                                   min-w-[6px] h-[6px] rounded-full bg-[#A65D43]" />
                )}
                {isActive && (
                  <span className="absolute bottom-1 h-[3px] w-[3px] rounded-full bg-[#A65D43]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
