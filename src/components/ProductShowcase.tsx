'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import SoftGradient from '@/components/SoftGradient';
// ─── Data Produk ────────────────────────────────────────────────────────────
const ALL_PRODUCTS = [
  { id: 1,  name: 'Kain Sutra Premium',       category: 'Material Kain',   price: 'Rp 150.000', unit: '/meter', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop' },
  { id: 2,  name: 'Kancing Jas Eksklusif',    category: 'Aksesoris',       price: 'Rp 85.000',  unit: '/lusin', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?q=80&w=800&auto=format&fit=crop' },
  { id: 3,  name: 'Custom Blazer Linen',      category: 'Jasa Tailoring',  price: 'Rp 1.850.000', unit: '/biji', image: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?q=80&w=800&auto=format&fit=crop' },
  { id: 4,  name: 'Kemeja Katun Polos',       category: 'Ready to Wear',   price: 'Rp 450.000', unit: '/biji', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop' },
  { id: 5,  name: 'Kain Batik Tulis Solo',    category: 'Material Kain',   price: 'Rp 320.000', unit: '/meter', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop' },
  { id: 6,  name: 'Celana Chino Slim Fit',    category: 'Ready to Wear',   price: 'Rp 380.000', unit: '/biji', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop' },
  { id: 7,  name: 'Benang Sulam Premium',     category: 'Aksesoris',       price: 'Rp 45.000',  unit: '/set',  image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=800&auto=format&fit=crop' },
  { id: 8,  name: 'Jas Formal Wol Italia',    category: 'Jasa Tailoring',  price: 'Rp 3.200.000', unit: '/biji', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop' },
  { id: 9,  name: 'Kain Denim Premium',       category: 'Material Kain',   price: 'Rp 95.000',  unit: '/meter', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop' },
  { id: 10, name: 'Dress Kebaya Modern',      category: 'Jasa Tailoring',  price: 'Rp 2.100.000', unit: '/biji', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=800&auto=format&fit=crop' },
  { id: 11, name: 'Kancing Mutiara Set',      category: 'Aksesoris',       price: 'Rp 120.000', unit: '/set',  image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=800&auto=format&fit=crop' },
  { id: 12, name: 'Polo Shirt Pique',         category: 'Ready to Wear',   price: 'Rp 290.000', unit: '/biji', image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?q=80&w=800&auto=format&fit=crop' },
  { id: 13, name: 'Kain Velvet Mewah',        category: 'Material Kain',   price: 'Rp 210.000', unit: '/meter', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop' },
  { id: 14, name: 'Jaket Kulit Sintetis',     category: 'Ready to Wear',   price: 'Rp 890.000', unit: '/biji', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop' },
  { id: 15, name: 'Gaun Pesta Custom',        category: 'Jasa Tailoring',  price: 'Rp 2.750.000', unit: '/biji', image: 'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?q=80&w=800&auto=format&fit=crop' },
  { id: 16, name: 'Resleting YKK Premium',    category: 'Aksesoris',       price: 'Rp 25.000',  unit: '/pcs',  image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop' },
];

// ─── Konstanta ───────────────────────────────────────────────────────────────
const DESKTOP_PAGE_SIZE   = 12; // produk per batch infinite scroll
const DESKTOP_AUTO_LOADS  = 3;  // berapa kali auto-load sebelum muncul tombol
const TABLET_PAGE_SIZE    = 8;  // produk per halaman pagination
const MOBILE_INITIAL      = 6;  // produk awal di mobile
const MOBILE_LOAD_MORE    = 4;  // tambahan produk per klik "Lihat Lainnya"

// ─── Animasi ─────────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col">
      <div className="w-full aspect-square md:aspect-[4/5] rounded-xl bg-slate-100 mb-4 overflow-hidden">
        <div className="w-full h-full animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%]"
             style={{ animation: 'shimmer 1.5s infinite linear' }} />
      </div>
      <div className="px-1 space-y-2">
        <div className="h-3.5 w-3/4 rounded-full bg-slate-100 animate-pulse" />
        <div className="h-3 w-1/2 rounded-full bg-slate-100 animate-pulse" />
        <div className="h-8 w-full rounded-xl bg-slate-100 animate-pulse mt-4" />
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: typeof ALL_PRODUCTS[0] }) {
  return (
    <motion.div
      variants={cardVariants}
      layout
      className="bg-white rounded-2xl border border-gray-100 p-3
                 shadow-[0_4px_20px_rgba(0,0,0,0.03)]
                 hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)]
                 transition-shadow duration-300 flex flex-col group h-full"
    >
      {/* Gambar */}
      <Link href={`/katalog/${product.id}`} className="block">
        <div className="relative w-full aspect-square md:aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 mb-4">
          <img
            src={product.image}
            alt={`${product.name} - ${product.category}`}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="px-1 flex flex-col flex-grow">
        <Link href={`/katalog/${product.id}`} className="hover:text-[#A47251] transition-colors">
          <h3 className="font-[family-name:var(--font-inter)] text-[14px] font-semibold text-slate-800 leading-snug mb-1">
            {product.name}
          </h3>
        </Link>
        <p className="font-[family-name:var(--font-inter)] text-[12px] text-slate-400 mb-4">
          {product.category}
        </p>

        <div className="mt-auto pt-2">
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-inter)] font-bold text-[#A47251] text-base leading-tight break-all">
              {product.price}
            </span>
            <span className="font-[family-name:var(--font-inter)] text-[11px] font-medium text-slate-400 mt-0.5">
              {product.unit}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── DESKTOP: Infinite Scroll dengan Stop Point ───────────────────────────────
function DesktopView() {
  const [visibleCount, setVisibleCount]   = useState(DESKTOP_PAGE_SIZE);
  const [autoLoadCount, setAutoLoadCount] = useState(0);
  const [isLoading, setIsLoading]         = useState(false);
  const sentinelRef                       = useRef<HTMLDivElement>(null);
  const debounceRef                       = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visibleProducts = ALL_PRODUCTS.slice(0, visibleCount);
  const hasMore         = visibleCount < ALL_PRODUCTS.length;
  const showManualBtn   = hasMore && autoLoadCount >= DESKTOP_AUTO_LOADS;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    // Simulasi network delay
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + DESKTOP_PAGE_SIZE, ALL_PRODUCTS.length));
      setAutoLoadCount(prev => prev + 1);
      setIsLoading(false);
    }, 600);
  }, [isLoading, hasMore]);

  // Debounced Intersection Observer untuk infinite scroll
  useEffect(() => {
    if (showManualBtn) return; // stop auto-load, pakai tombol manual

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Debounce: tunggu 200ms sebelum trigger load
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => loadMore(), 200);
        }
      },
      { rootMargin: '0px' }
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [loadMore, showManualBtn]);

  return (
    <>
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="popLayout">
          {visibleProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </AnimatePresence>

        {/* Skeleton saat loading */}
        {isLoading && Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={`sk-${i}`} />
        ))}
      </motion.div>

      {/* Sentinel untuk auto-load */}
      {!showManualBtn && hasMore && <div ref={sentinelRef} className="h-1" />}

      {/* Tombol manual setelah 3x auto-load */}
      {showManualBtn && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mt-10"
        >
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="inline-flex items-center gap-2.5
                       font-[family-name:var(--font-inter)] text-[13.5px] font-semibold
                       px-8 py-3 rounded-2xl
                       bg-white border border-[#A47251]/30 text-[#A47251]
                       hover:bg-[#A47251] hover:text-white hover:border-[#A47251]
                       disabled:opacity-60 disabled:cursor-not-allowed
                       transition-all duration-300 active:scale-95
                       shadow-[0_2px_12px_rgba(164,114,81,0.12)]"
          >
            {isLoading
              ? <><Loader2 size={15} className="animate-spin" /> Memuat...</>
              : <>Lihat Lebih Banyak <ArrowRight size={15} strokeWidth={1.5} /></>
            }
          </button>
        </motion.div>
      )}
    </>
  );
}

// ─── TABLET: Pagination Angka (iOS Style) ────────────────────────────────────
function TabletView() {
  const totalPages    = Math.ceil(ALL_PRODUCTS.length / TABLET_PAGE_SIZE);
  const [page, setPage] = useState(1);

  const start    = (page - 1) * TABLET_PAGE_SIZE;
  const products = ALL_PRODUCTS.slice(start, start + TABLET_PAGE_SIZE);

  const goTo = (p: number) => {
    setPage(p);
    // Scroll halus ke atas section
    document.getElementById('product-showcase')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Buat array nomor halaman dengan ellipsis
  const pageNumbers = (): (number | '…')[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, '…', totalPages];
    if (page >= totalPages - 2) return [1, '…', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', page - 1, page, page + 1, '…', totalPages];
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          className="grid grid-cols-2 md:grid-cols-4 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </motion.div>
      </AnimatePresence>

      {/* Pagination iOS Style */}
      <div className="flex items-center justify-center gap-2 mt-10">
        {/* Prev */}
        <button
          onClick={() => goTo(page - 1)}
          disabled={page === 1}
          aria-label="Halaman sebelumnya"
          className="w-9 h-9 flex items-center justify-center rounded-xl
                     border border-slate-200 text-slate-500
                     hover:border-[#A47251] hover:text-[#A47251]
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-all duration-200 active:scale-90"
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>

        {pageNumbers().map((n, i) =>
          n === '…' ? (
            <span key={`ellipsis-${i}`}
                  className="font-[family-name:var(--font-inter)] text-[13px] text-slate-400 w-9 text-center">
              …
            </span>
          ) : (
            <button
              key={n}
              onClick={() => goTo(n as number)}
              aria-label={`Halaman ${n}`}
              aria-current={page === n ? 'page' : undefined}
              className={`w-9 h-9 flex items-center justify-center rounded-xl
                          font-[family-name:var(--font-inter)] text-[13px] font-semibold
                          transition-all duration-200 active:scale-90
                          ${page === n
                            ? 'bg-[#A47251] text-white shadow-[0_2px_8px_rgba(164,114,81,0.35)]'
                            : 'border border-slate-200 text-slate-600 hover:border-[#A47251] hover:text-[#A47251]'
                          }`}
            >
              {n}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => goTo(page + 1)}
          disabled={page === totalPages}
          aria-label="Halaman berikutnya"
          className="w-9 h-9 flex items-center justify-center rounded-xl
                     border border-slate-200 text-slate-500
                     hover:border-[#A47251] hover:text-[#A47251]
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-all duration-200 active:scale-90"
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>
    </>
  );
}

// ─── MOBILE: View More Button ─────────────────────────────────────────────────
function MobileView() {
  const products = ALL_PRODUCTS.slice(0, MOBILE_INITIAL);

  return (
    <>
      <motion.div
        className="grid grid-cols-2 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="popLayout">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </AnimatePresence>
      </motion.div>

      {/* Tombol menuju katalog lengkap */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center mt-8"
      >
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2.5
                     font-[family-name:var(--font-inter)] text-[13.5px] font-semibold
                     px-7 py-3 rounded-2xl
                     bg-[#A47251] text-white
                     hover:bg-[#DD9E59]
                     transition-all duration-300 active:scale-95
                     shadow-[0_4px_16px_rgba(164,114,81,0.30)]"
        >
          Lihat Koleksi Lainnya
          <ArrowRight size={15} strokeWidth={1.5} />
        </Link>
      </motion.div>
    </>
  );
}

// ─── Responsive Wrapper ───────────────────────────────────────────────────────
export default function ProductShowcase() {
  const [view, setView] = useState<'mobile' | 'tablet' | 'desktop' | null>(null);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 768)        setView('mobile');
      else if (w < 1024)  setView('tablet');
      else                setView('desktop');
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <section id="product-showcase" className="py-12 bg-slate-50/50 relative">
      <SoftGradient variant="showcase" />
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h2
              className="font-[family-name:var(--font-instrument-serif)] text-4xl md:text-5xl font-normal leading-tight mb-4"
              style={{ letterSpacing: '-0.02em', color: '#1A1A1A' }}
            >
              Katalog <em className="not-italic italic">Pilihan</em>
            </h2>
            <p className="font-[family-name:var(--font-inter)] text-slate-500 text-[15px] leading-relaxed">
              Temukan material terbaik dan layanan pembuatan busana custom dengan kualitas jahitan tingkat tinggi.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-6 md:mt-0"
          >
            <Link
              href="/katalog"
              className="font-[family-name:var(--font-inter)] inline-flex items-center gap-2
                         text-[13.5px] font-semibold text-[#A47251]
                         hover:text-[#E89B7E] transition-colors duration-200"
            >
              Lihat Semua Katalog <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </motion.div>
        </div>

        {/* Render hanya view yang sesuai — tidak ada hidden div yang memakan ruang */}
        {view === 'mobile'  && <MobileView />}
        {view === 'tablet'  && <TabletView />}
        {view === 'desktop' && <DesktopView />}
        {/* Skeleton awal sebelum JS hydration */}
        {view === null && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" aria-busy="true" aria-label="Memuat produk">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

      </div>
    </section>
  );
}
