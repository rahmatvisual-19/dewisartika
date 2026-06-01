'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Frown, ChevronLeft, ChevronRight } from 'lucide-react';
import CatalogHeader from '@/components/CatalogHeader';
import ProductCard, { Product } from '@/components/ProductCard';

// ─── Data ─────────────────────────────────────────────────────────────────────
const ALL_PRODUCTS: Product[] = [
  { id: 1,  name: 'Kain Sutra Premium',        category: 'Material Kain',  price: 'Rp 150.000',   unit: '/meter', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop' },
  { id: 2,  name: 'Kancing Jas Eksklusif',     category: 'Aksesoris',      price: 'Rp 85.000',    unit: '/lusin', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?q=80&w=800&auto=format&fit=crop' },
  { id: 3,  name: 'Custom Blazer Linen',       category: 'Jasa Tailoring', price: 'Rp 1.850.000', unit: '/biji',  image: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?q=80&w=800&auto=format&fit=crop' },
  { id: 4,  name: 'Kemeja Katun Polos',        category: 'Ready to Wear',  price: 'Rp 450.000',   unit: '/biji',  image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop' },
  { id: 5,  name: 'Kain Wool Italia',          category: 'Material Kain',  price: 'Rp 350.000',   unit: '/meter', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop' },
  { id: 6,  name: 'Setelan Jas Navy Bespoke',  category: 'Jasa Tailoring', price: 'Rp 4.500.000', unit: '/set',   image: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?q=80&w=800&auto=format&fit=crop' },
  { id: 7,  name: 'Benang Jahit Ekstra Kuat',  category: 'Aksesoris',      price: 'Rp 25.000',    unit: '/lusin', image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop' },
  { id: 8,  name: 'Kebaya Payet Modern',       category: 'Jasa Tailoring', price: 'Rp 2.800.000', unit: '/biji',  image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800&auto=format&fit=crop' },
  { id: 9,  name: 'Kain Batik Tulis Solo',     category: 'Material Kain',  price: 'Rp 320.000',   unit: '/meter', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop' },
  { id: 10, name: 'Celana Chino Slim Fit',     category: 'Ready to Wear',  price: 'Rp 380.000',   unit: '/biji',  image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop' },
  { id: 11, name: 'Kancing Mutiara Set',       category: 'Aksesoris',      price: 'Rp 120.000',   unit: '/set',   image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=800&auto=format&fit=crop' },
  { id: 12, name: 'Polo Shirt Pique',          category: 'Ready to Wear',  price: 'Rp 290.000',   unit: '/biji',  image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?q=80&w=800&auto=format&fit=crop' },
  { id: 13, name: 'Kain Velvet Mewah',         category: 'Material Kain',  price: 'Rp 210.000',   unit: '/meter', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop' },
  { id: 14, name: 'Jaket Kulit Sintetis',      category: 'Ready to Wear',  price: 'Rp 890.000',   unit: '/biji',  image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop' },
  { id: 15, name: 'Gaun Pesta Custom',         category: 'Jasa Tailoring', price: 'Rp 2.750.000', unit: '/biji',  image: 'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?q=80&w=800&auto=format&fit=crop' },
  { id: 16, name: 'Resleting YKK Premium',     category: 'Aksesoris',      price: 'Rp 25.000',    unit: '/pcs',   image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop' },
  { id: 17, name: 'Jas Formal Wol Italia',     category: 'Jasa Tailoring', price: 'Rp 3.200.000', unit: '/biji',  image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop' },
  { id: 18, name: 'Kain Denim Premium',        category: 'Material Kain',  price: 'Rp 95.000',    unit: '/meter', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop' },
  { id: 19, name: 'Dress Kebaya Modern',       category: 'Jasa Tailoring', price: 'Rp 2.100.000', unit: '/biji',  image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=800&auto=format&fit=crop' },
  { id: 20, name: 'Kemeja Flannel Kotak',      category: 'Ready to Wear',  price: 'Rp 320.000',   unit: '/biji',  image: 'https://images.unsplash.com/photo-1602810316693-3667c854239a?q=80&w=800&auto=format&fit=crop' },
];

const CATEGORIES = ['Semua', 'Material Kain', 'Jasa Tailoring', 'Ready to Wear', 'Aksesoris'];
const DESKTOP_PER_PAGE = 12;
const MOBILE_PER_PAGE  = 6;

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col">
      <div className="w-full aspect-square md:aspect-[4/5] rounded-xl bg-slate-100 mb-4 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%]"
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

// ─── Pagination Numbers ────────────────────────────────────────────────────────
function PaginationBar({
  page, totalPages, onGo,
}: { page: number; totalPages: number; onGo: (p: number) => void }) {
  const pages = (): (number | '…')[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3)               return [1, 2, 3, 4, '…', totalPages];
    if (page >= totalPages - 2)  return [1, '…', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', page - 1, page, page + 1, '…', totalPages];
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onGo(page - 1)} disabled={page === 1}
        aria-label="Sebelumnya"
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500
                   hover:border-[#A47251] hover:text-[#A47251] disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-200 active:scale-90"
      >
        <ChevronLeft size={16} strokeWidth={2} />
      </button>

      {pages().map((n, i) =>
        n === '…' ? (
          <span key={`e-${i}`} className="font-[family-name:var(--font-inter)] text-[13px] text-slate-400 w-9 text-center">…</span>
        ) : (
          <button
            key={n}
            onClick={() => onGo(n as number)}
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

      <button
        onClick={() => onGo(page + 1)} disabled={page === totalPages}
        aria-label="Berikutnya"
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500
                   hover:border-[#A47251] hover:text-[#A47251] disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-200 active:scale-90"
      >
        <ChevronRight size={16} strokeWidth={2} />
      </button>
    </div>
  );
}

// ─── Desktop/Tablet & Mobile View (Numeric Pagination) ────────────────────────
function PaginatedView({
  products, topRef, perPage,
}: { products: Product[]; topRef: React.RefObject<HTMLDivElement | null>; perPage: number }) {
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setPage(1); }, [products]);

  const totalPages = Math.max(1, Math.ceil(products.length / perPage));
  const start      = (page - 1) * perPage;
  const visible    = products.slice(start, start + perPage);

  const goTo = useCallback((p: number) => {
    setLoading(true);
    setTimeout(() => {
      setPage(p);
      setLoading(false);
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
  }, [topRef]);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {Array.from({ length: perPage }).map((_, i) => <SkeletonCard key={i} />)}
          </motion.div>
        ) : (
          <motion.div
            key={`page-${page}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {visible.map(p => <ProductCard key={p.id} product={p} />)}
          </motion.div>
        )}
      </AnimatePresence>

      {totalPages > 1 && !loading && (
        <PaginationBar page={page} totalPages={totalPages} onGo={goTo} />
      )}
    </>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
        <Frown size={40} strokeWidth={1.5} />
      </div>
      <h3 className="font-[family-name:var(--font-instrument-serif)] text-3xl font-normal text-slate-700 mb-2"
          style={{ letterSpacing: '-0.02em' }}>
        Tidak Ditemukan
      </h3>
      <p className="font-[family-name:var(--font-inter)] text-slate-500 text-[15px] max-w-md mb-6">
        Tidak ada produk yang cocok dengan &ldquo;{query}&rdquo;. Coba kata kunci lain atau kurangi filter.
      </p>
      <button
        onClick={onReset}
        className="px-7 py-3 rounded-2xl bg-[#A47251] text-white
                   font-[family-name:var(--font-inter)] text-[13.5px] font-semibold
                   hover:bg-[#DD9E59] transition-all duration-300 active:scale-95"
      >
        Reset Pencarian
      </button>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function KatalogPage() {
  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isMobile, setIsMobile]                 = useState<boolean | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const filtered = ALL_PRODUCTS.filter(p => {
    const matchCat    = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const reset = () => { setSearchQuery(''); setSelectedCategory('Semua'); };

  return (
    <main className="min-h-screen pt-20 pb-16 bg-slate-50/50">
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Anchor untuk scroll-to-top pagination */}
        <div ref={topRef} className="-mt-4 pt-4" />

        <CatalogHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {filtered.length === 0 ? (
          <EmptyState query={searchQuery} onReset={reset} />
        ) : isMobile === null ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : isMobile ? (
          <PaginatedView products={filtered} topRef={topRef} perPage={MOBILE_PER_PAGE} />
        ) : (
          <PaginatedView products={filtered} topRef={topRef} perPage={DESKTOP_PER_PAGE} />
        )}
      </div>
    </main>
  );
}
