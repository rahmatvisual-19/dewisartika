'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Frown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import CatalogHeader from '@/components/CatalogHeader';
import ProductCard, { Product } from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';

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
                   hover:border-[#8B5E3C] hover:text-[#8B5E3C] disabled:opacity-30 disabled:cursor-not-allowed
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
                          ? 'bg-[#8B5E3C] text-white shadow-[0_2px_8px_rgba(164,114,81,0.35)]'
                          : 'border border-slate-200 text-slate-600 hover:border-[#8B5E3C] hover:text-[#8B5E3C]'
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
                   hover:border-[#8B5E3C] hover:text-[#8B5E3C] disabled:opacity-30 disabled:cursor-not-allowed
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
        className="px-7 py-3 rounded-2xl bg-[#8B5E3C] text-white
                   font-[family-name:var(--font-inter)] text-[13.5px] font-semibold
                   hover:bg-[#DD9E59] transition-all duration-300 active:scale-95"
      >
        Reset Pencarian
      </button>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
function KatalogContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';

  const [products, setProducts]                 = useState<Product[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isMobile, setIsMobile]                 = useState<boolean | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Sinkronisasi kata kunci dari URL (navbar)
  useEffect(() => {
    setSearchQuery(q);
  }, [q]);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setProducts(data.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(p.price)),
            unit: p.unit,
            image: p.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?q=80&w=800&auto=format&fit=crop',
          })));
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = products.filter(p => {
    const matchCat    = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const reset = () => { setSearchQuery(''); setSelectedCategory('Semua'); };

  return (
    <main className="min-h-screen pt-6 md:pt-20 pb-16 bg-slate-50/50">
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

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
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

export default function KatalogPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen pt-6 md:pt-20 pb-16 bg-slate-50/50 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#8B5E3C] w-8 h-8" />
      </main>
    }>
      <KatalogContent />
    </Suspense>
  );
}
