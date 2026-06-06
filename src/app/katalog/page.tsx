'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Frown, ChevronLeft, ChevronRight, Loader2, X, Check, ShoppingBag } from 'lucide-react';
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
  products, topRef, perPage, onAddToCartClick, onPesanClick,
}: {
  products: Product[];
  topRef: React.RefObject<HTMLDivElement | null>;
  perPage: number;
  onAddToCartClick: (product: Product) => void;
  onPesanClick: (product: Product) => void;
}) {
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
            {visible.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCartClick={onAddToCartClick}
                onPesanClick={onPesanClick}
              />
            ))}
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
  const router = useRouter();

  const [products, setProducts]                 = useState<Product[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isMobile, setIsMobile]                 = useState<boolean | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Bottom drawer states
  const [selectedDrawerProduct, setSelectedDrawerProduct] = useState<Product | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [drawerImage, setDrawerImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customQtyText, setCustomQtyText] = useState('1');
  const [catatan, setCatatan] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  // Checkout modal states
  const [selectedCheckoutProduct, setSelectedCheckoutProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custNotes, setCustNotes] = useState('');
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [adminPhone, setAdminPhone] = useState('6281362989136'); // fallback

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

  // Fetch Admin Phone
  useEffect(() => {
    const fetchAdminCta = async () => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('value')
          .eq('type', 'admin_cta');
        if (!error && data && data.length > 0) {
          setAdminPhone(data[0].value);
        }
      } catch (err) {
        console.error('Error fetching admin CTA number:', err);
      }
    };
    fetchAdminCta();
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
            desc: p.desc || '',
            colors: p.colors || [],
            sizes: p.sizes || [],
            details: p.details || [],
            images: p.images || []
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

  const handleOpenDrawer = (product: Product) => {
    setSelectedDrawerProduct(product);
    setSelectedColor(null);
    setSelectedSize(null);
    const unitOptions = product.unit ? product.unit.split(',').map(u => u.trim()) : [];
    setSelectedUnit(unitOptions[0] || '');
    setDrawerImage(product.image);
    setIsAdded(false);
    setQuantity(1);
    setCustomQtyText('1');
    setCatatan('');
    setIsDrawerOpen(true);
  };

  const handleAddToCart = () => {
    if (!selectedDrawerProduct) return;
    const existingCartRaw = localStorage.getItem('cart');
    const cart = existingCartRaw ? JSON.parse(existingCartRaw) : [];

    const priceNum = Number(selectedDrawerProduct.price.replace(/[^\d]/g, ''));
    const trimmedCatatan = catatan.trim();
    const cartId = `${selectedDrawerProduct.id}-${selectedColor || ''}-${selectedSize || ''}-${selectedUnit || ''}-${trimmedCatatan}`;
    const existingIndex = cart.findIndex((item: any) => item.cartId === cartId);

    const newItem = {
      cartId,
      id: selectedDrawerProduct.id,
      name: selectedDrawerProduct.name,
      category: selectedDrawerProduct.category,
      price: priceNum,
      unit: selectedUnit || selectedDrawerProduct.unit,
      image: drawerImage || selectedDrawerProduct.image,
      quantity,
      color: selectedColor,
      size: selectedSize,
      catatan: trimmedCatatan,
    };

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push(newItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    setIsAdded(true);
  };

  const handleOpenCheckout = (product: Product) => {
    setSelectedCheckoutProduct(product);
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setCustNotes('');
    setIsCheckoutOpen(true);
    setIsCheckoutSuccess(false);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCheckoutProduct) return;
    if (!custName.trim() || !custPhone.trim()) {
      alert('Nama lengkap dan nomor WhatsApp wajib diisi.');
      return;
    }

    setCheckoutLoading(true);

    const priceNum = Number(selectedCheckoutProduct.price.replace(/[^\d]/g, ''));
    const subTotal = priceNum;
    const grandTotal = subTotal;
    const defaultUnit = selectedCheckoutProduct.unit ? selectedCheckoutProduct.unit.split(',')[0].trim() : '';

    try {
      // 1. Simpan pesanan utama ke tabel `orders` Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: custName.trim(),
          customer_phone: custPhone.trim(),
          customer_address: custAddress.trim() || null,
          catatan: custNotes.trim() || null,
          subtotal: subTotal,
          tax: 0,
          grand_total: grandTotal,
          status: 'pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Simpan rincian produk pesanan ke tabel `order_items` Supabase
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert([{
          order_id: orderData.id,
          product_id: selectedCheckoutProduct.id,
          name: selectedCheckoutProduct.name,
          category: selectedCheckoutProduct.category,
          price: priceNum,
          quantity: 1,
          unit: defaultUnit,
          color: null,
          size: null,
          catatan: null
        }]);

      if (itemsError) throw itemsError;

      // 3. Format pesan WhatsApp
      const orderDateStr = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const orderIdShort = orderData.id.split('-')[0].toUpperCase();
      
      const formatRupiah = (val: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

      const messageLines = [
        `*🧾 DETAIL PESANAN - TAILORCRAFT*`,
        `==================================`,
        `*Order ID:* \`#TC-${orderIdShort}\``,
        `*Tanggal:* ${orderDateStr}`,
        `*Penerima:* ${custName.trim()}`,
        `*No. WhatsApp:* ${custPhone.trim()}`,
        custAddress.trim() ? `*Alamat:* ${custAddress.trim()}` : null,
        custNotes.trim() ? `*Catatan:* ${custNotes.trim()}` : null,
        `==================================`,
        `*Rincian Barang:*`,
        `1. *${selectedCheckoutProduct.name}*\n    Qty: 1 ${defaultUnit} x ${formatRupiah(priceNum)}`,
        `==================================`,
        `*Total Tagihan:* *${formatRupiah(grandTotal)}*`,
        ``,
        `Mohon dibantu untuk mengecek ketersediaan bahan/layanan di atas. Terima kasih!`,
      ].filter(line => line !== null);

      const waText = encodeURIComponent(messageLines.join('\n'));
      const waUrl = `https://wa.me/${adminPhone}?text=${waText}`;

      window.open(waUrl, '_blank');
      setCreatedOrderId(`#TC-${orderIdShort}`);
      setIsCheckoutSuccess(true);
      setIsCheckoutOpen(false);
    } catch (err: any) {
      console.error('Checkout failed:', err);
      alert(`Gagal mengirimkan pesanan: ${err.message || String(err)}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

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
          <PaginatedView
            products={filtered}
            topRef={topRef}
            perPage={MOBILE_PER_PAGE}
            onAddToCartClick={handleOpenDrawer}
            onPesanClick={handleOpenCheckout}
          />
        ) : (
          <PaginatedView
            products={filtered}
            topRef={topRef}
            perPage={DESKTOP_PER_PAGE}
            onAddToCartClick={handleOpenDrawer}
            onPesanClick={handleOpenCheckout}
          />
        )}
      </div>

      {/* ─── Bottom Sheet Drawer ─── */}
      <AnimatePresence>
        {isDrawerOpen && selectedDrawerProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end justify-center"
          >
            {/* Bottom Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-[2rem] border-t border-slate-100 shadow-2xl p-5 sm:p-6 max-h-[85vh] overflow-y-auto w-full md:max-w-md mx-auto"
            >
              {!isAdded ? (
                <div className="flex flex-col">
                  {/* Header: Thumbnail + Price + Info */}
                  <div className="flex gap-4 items-start pb-4 border-b border-slate-100 relative">
                    <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                      <img
                        src={drawerImage || selectedDrawerProduct.image}
                        alt={selectedDrawerProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-grow pr-8">
                      <div className="text-xl font-bold text-[#8B5E3C] font-[family-name:var(--font-inter)] mb-1">
                        {selectedDrawerProduct.price}
                      </div>
                      <div className="inline-block px-2.5 py-0.5 bg-amber-500/10 text-amber-600 rounded-md text-[10px] font-bold tracking-wide uppercase mb-1">
                        {selectedDrawerProduct.category}
                      </div>
                      <div className="text-slate-400 text-xs font-[family-name:var(--font-inter)]">
                        Satuan: {selectedUnit || selectedDrawerProduct.unit}
                      </div>
                    </div>

                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      className="absolute top-0 right-0 p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                    >
                      <X size={18} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Body: Selections */}
                  <div className="flex-grow pb-4">
                    {/* Opsi Satuan (jika lebih dari satu) */}
                    {selectedDrawerProduct.unit && selectedDrawerProduct.unit.split(',').length > 1 && (
                      <div className="py-4 border-b border-slate-100">
                        <label className="block font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-800 mb-3">
                          Satuan Pembelian
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedDrawerProduct.unit.split(',').map((u: string) => u.trim()).map((unitOpt: string, idx: number) => {
                            const isSelected = selectedUnit === unitOpt;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedUnit(unitOpt)}
                                className={`px-4 py-2 rounded-xl font-[family-name:var(--font-inter)] text-[12px] font-semibold transition-all cursor-pointer active:scale-95 border
                                            ${isSelected
                                              ? 'border-[#8B5E3C] bg-[#8B5E3C]/5 text-[#8B5E3C] font-semibold'
                                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                                            }`}
                              >
                                {unitOpt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Opsi Warna */}
                    {selectedDrawerProduct.colors && selectedDrawerProduct.colors.length > 0 && (
                      <div className="py-4 border-b border-slate-100">
                        <label className="block font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-800 mb-3">
                          Warna
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedDrawerProduct.colors.map((c: any, idx: number) => {
                            const isSelected = selectedColor === c.color;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  const nextColor = isSelected ? null : c.color;
                                  setSelectedColor(nextColor);
                                  if (nextColor && c.image) {
                                    setDrawerImage(c.image);
                                  } else if (!nextColor) {
                                    const sizeObj = selectedDrawerProduct.sizes?.find((s: any) => s.size === selectedSize);
                                    setDrawerImage(sizeObj?.image || selectedDrawerProduct.image);
                                  }
                                }}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-[family-name:var(--font-inter)] text-[12px] font-medium transition-all cursor-pointer active:scale-95 border
                                            ${isSelected
                                              ? 'border-[#8B5E3C] bg-[#8B5E3C]/5 text-[#8B5E3C] font-semibold'
                                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                                            }`}
                              >
                                {c.image && (
                                  <div className="w-5 h-5 rounded-md overflow-hidden bg-white shrink-0 border border-slate-200">
                                    <img src={c.image} alt={c.color} className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <span>{c.color}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Opsi Ukuran */}
                    {selectedDrawerProduct.sizes && selectedDrawerProduct.sizes.length > 0 && (
                      <div className="py-4 border-b border-slate-100">
                        <div className="flex justify-between items-center mb-3">
                          <label className="font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-800">
                            Ukuran
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedDrawerProduct.sizes.map((s: any, idx: number) => {
                            const isSelected = selectedSize === s.size;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  const nextSize = isSelected ? null : s.size;
                                  setSelectedSize(nextSize);
                                  if (nextSize && s.image) {
                                    setDrawerImage(s.image);
                                  } else if (!nextSize) {
                                    const colorObj = selectedDrawerProduct.colors?.find((col: any) => col.color === selectedColor);
                                    setDrawerImage(colorObj?.image || selectedDrawerProduct.image);
                                  }
                                }}
                                className={`min-w-[44px] h-9 flex items-center justify-center px-3 rounded-xl font-[family-name:var(--font-inter)] text-[12px] font-semibold transition-all cursor-pointer active:scale-95 border
                                            ${isSelected
                                              ? 'border-[#8B5E3C] bg-[#8B5E3C]/5 text-[#8B5E3C]'
                                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                                            }`}
                              >
                                <span>{s.size}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Jumlah Kuantitas */}
                    <div className="py-4 flex items-center justify-between">
                      <label className="font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-800">
                        Jumlah
                      </label>
                      <div className="flex items-center border border-slate-200 rounded-xl h-9 bg-white overflow-hidden w-28 shadow-sm shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const nextQty = Math.max(0.1, quantity - 1);
                            const rounded = Math.round(nextQty * 100) / 100;
                            setQuantity(rounded);
                            setCustomQtyText(rounded.toString().replace(/\./g, ','));
                          }}
                          className="w-8 h-full text-slate-500 hover:bg-slate-50 transition-colors text-base cursor-pointer flex items-center justify-center font-light animate-none"
                        >
                          −
                        </button>
                        <span className="font-[family-name:var(--font-inter)] font-semibold text-slate-800 flex-1 text-center text-sm">
                          {quantity.toString().replace(/\./g, ',')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const nextQty = quantity + 1;
                            const rounded = Math.round(nextQty * 100) / 100;
                            setQuantity(rounded);
                            setCustomQtyText(rounded.toString().replace(/\./g, ','));
                          }}
                          className="w-8 h-full text-slate-500 hover:bg-slate-50 transition-colors text-base cursor-pointer flex items-center justify-center font-light animate-none"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Input Jumlah Kustom */}
                    <div className="py-3 border-t border-slate-100">
                      <label className="block font-[family-name:var(--font-inter)] text-xs font-semibold text-slate-500 mb-2">
                        Jumlah Kustom (Bisa desimal, contoh: 1,5)
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Contoh: 1,5"
                        value={customQtyText}
                        onChange={e => {
                          const rawVal = e.target.value;
                          const cleaned = rawVal.replace(/[^0-9.,]/g, '');
                          const separators = (cleaned.match(/[.,]/g) || []).length;
                          if (separators > 1) return;
                          
                          setCustomQtyText(cleaned);
                          const normalized = cleaned.replace(/,/g, '.');
                          const numericValue = parseFloat(normalized);
                          if (!isNaN(numericValue) && numericValue > 0) {
                            setQuantity(numericValue);
                          } else {
                            setQuantity(0);
                          }
                        }}
                        onBlur={() => {
                          if (quantity <= 0 || isNaN(quantity)) {
                            setQuantity(1);
                            setCustomQtyText('1');
                          } else {
                            setCustomQtyText(quantity.toString().replace(/\./g, ','));
                          }
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-[family-name:var(--font-inter)] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C] transition-all bg-slate-50/50"
                      />
                    </div>

                    {/* Catatan Pembelian */}
                    <div className="py-3 border-t border-slate-100">
                      <label className="block font-[family-name:var(--font-inter)] text-xs font-semibold text-slate-500 mb-2">
                        Catatan Tambahan (Opsional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Cth: Panjang celana 100cm, lingkar pinggang 80cm..."
                        value={catatan}
                        onChange={e => setCatatan(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-[family-name:var(--font-inter)] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C] transition-all bg-slate-50/50 resize-none"
                      />
                    </div>
                  </div>

                  {/* Footer: Subtotal + Action Button */}
                  <div className="pt-4 border-t border-slate-100 mt-2 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium font-[family-name:var(--font-inter)]">Subtotal ({quantity.toString().replace(/\./g, ',')} barang)</span>
                      <span className="text-lg font-bold text-[#8B5E3C] font-[family-name:var(--font-inter)]">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
                          Number(selectedDrawerProduct.price.replace(/[^\d]/g, '')) * quantity
                        )}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="w-full h-12 inline-flex items-center justify-center gap-2
                                 font-[family-name:var(--font-inter)] text-[14px] font-bold
                                 bg-[#8B5E3C] text-white rounded-xl cursor-pointer
                                 hover:bg-[#DD9E59] transition-all duration-300 active:scale-[0.98]
                                 shadow-[0_4px_12px_rgba(164,114,81,0.2)]"
                    >
                      Masukkan Keranjang
                    </button>
                  </div>
                </div>
              ) : (
                /* Tampilan Sukses Ditambahkan */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-10 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                    <Check size={32} strokeWidth={2.5} />
                  </div>
                  <h4 className="font-[family-name:var(--font-inter)] text-lg font-bold text-slate-800 mb-2">
                    Berhasil Ditambahkan!
                  </h4>
                  <p className="font-[family-name:var(--font-inter)] text-slate-500 text-[13.5px] max-w-sm mb-8 leading-relaxed">
                    Produk <strong>{selectedDrawerProduct.name}</strong> dengan kuantitas {quantity.toString().replace(/\./g, ',')}x berhasil ditambahkan ke keranjang belanja Anda.
                  </p>

                  <div className="flex gap-3 w-full max-w-xs">
                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl
                                 font-[family-name:var(--font-inter)] text-[13px] font-semibold
                                 hover:bg-slate-50 transition-all cursor-pointer active:scale-95"
                    >
                      Lanjut Belanja
                    </button>
                    <button
                      onClick={() => {
                        setIsDrawerOpen(false);
                        router.push('/keranjang');
                      }}
                      className="flex-1 py-3 bg-[#8B5E3C] text-white rounded-xl
                                 font-[family-name:var(--font-inter)] text-[13px] font-semibold
                                 hover:bg-[#DD9E59] transition-all cursor-pointer active:scale-95
                                 shadow-[0_2px_8px_rgba(164,114,81,0.25)]"
                    >
                      Lihat Keranjang
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Modal Form Data Diri Checkout Instan ─── */}
      <AnimatePresence>
        {isCheckoutOpen && selectedCheckoutProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCheckoutOpen(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 w-full max-w-md mx-auto relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
              >
                <X size={18} strokeWidth={1.5} />
              </button>

              <h3 className="font-[family-name:var(--font-inter)] text-lg font-bold text-slate-800 mb-2">
                Data Diri Penerima
              </h3>
              <p className="font-[family-name:var(--font-inter)] text-xs text-slate-400 mb-6 leading-relaxed">
                Silakan isi formulir di bawah ini untuk mendaftarkan pesanan dan memproses ketersediaan barang <strong>{selectedCheckoutProduct.name}</strong> langsung melalui WhatsApp Admin.
              </p>

              <form onSubmit={handleSubmitOrder} className="flex flex-col gap-4">
                <div>
                  <label className="block font-[family-name:var(--font-inter)] text-[12px] font-semibold text-slate-700 mb-1.5">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama Anda..."
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-[family-name:var(--font-inter)] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C] transition-all bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block font-[family-name:var(--font-inter)] text-[12px] font-semibold text-slate-700 mb-1.5">
                    No. WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 08123456789..."
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-[family-name:var(--font-inter)] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C] transition-all bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block font-[family-name:var(--font-inter)] text-[12px] font-semibold text-slate-700 mb-1.5">
                    Alamat Pengiriman (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Masukkan alamat pengiriman lengkap..."
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-[family-name:var(--font-inter)] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C] transition-all bg-slate-50/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block font-[family-name:var(--font-inter)] text-[12px] font-semibold text-slate-700 mb-1.5">
                    Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Cth: Kirim sore hari, fitting jam 2 siang..."
                    value={custNotes}
                    onChange={(e) => setCustNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-[family-name:var(--font-inter)] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C] transition-all bg-slate-50/50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full h-12 inline-flex items-center justify-center gap-2 mt-2
                             font-[family-name:var(--font-inter)] text-[14px] font-bold
                             bg-[#8B5E3C] text-white rounded-xl cursor-pointer
                             hover:bg-[#DD9E59] transition-all duration-300 active:scale-[0.98]
                             disabled:opacity-50 disabled:cursor-not-allowed
                             shadow-[0_4px_12px_rgba(164,114,81,0.2)]"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                      Memproses Pesanan...
                    </>
                  ) : (
                    'Kirim ke WhatsApp'
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Modal Sukses Pemesanan ─── */}
      <AnimatePresence>
        {isCheckoutSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 w-full max-w-md mx-auto text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>

              <h3 className="font-[family-name:var(--font-inter)] text-xl font-bold text-slate-800 mb-2">
                Pesanan Berhasil Didaftarkan!
              </h3>
              <p className="font-[family-name:var(--font-inter)] text-sm text-slate-500 mb-6 leading-relaxed">
                Pemesanan Anda dengan kode <strong className="text-[#8B5E3C]">{createdOrderId}</strong> telah tercatat di sistem kami.
                Silakan lanjutkan percakapan di WhatsApp dengan Admin untuk pengecekan ketersediaan stok & penyelesaian pembayaran.
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href={`https://wa.me/${adminPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#25D366] text-white rounded-xl font-[family-name:var(--font-inter)] text-sm font-bold hover:bg-[#1ebe5d] transition-all text-center block shadow-[0_2px_8px_rgba(37,211,102,0.25)]"
                >
                  Buka WhatsApp Lagi
                </a>
                <button
                  type="button"
                  onClick={() => setIsCheckoutSuccess(false)}
                  className="w-full py-3 border border-slate-200 text-slate-600 rounded-xl font-[family-name:var(--font-inter)] text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
