'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, MessageCircle, ChevronRight, ChevronLeft, X, Check, Loader2 } from 'lucide-react';
import ProductCard, { Product } from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';

export interface ProductData {
  id: number;
  name: string;
  category: string;
  price: string; // formatted: Rp 150.000
  unit: string;
  image: string;
  images: string[];
  desc: string;
  details: { label: string; value: string }[];
  colors: { color: string; image: string }[];
  sizes: { size: string; image: string }[];
}

// Fallback jika Supabase kosong
const FALLBACK_PRODUCTS: Product[] = [
  { id: 1,  name: 'Kain Sutra Premium',       category: 'Material Kain',  price: 'Rp 150.000',   unit: '/meter', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop' },
  { id: 2,  name: 'Kancing Jas Eksklusif',    category: 'Aksesoris',      price: 'Rp 85.000',    unit: '/lusin', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?q=80&w=800&auto=format&fit=crop' },
];

export default function ProductDetailView({ product }: { product: ProductData }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [customQtyText, setCustomQtyText] = useState('1');
  const [productsList, setProductsList] = useState<Product[]>([]);
  
  const unitOptions = product.unit ? product.unit.split(',').map(u => u.trim()) : [];
  
  // Drawer & Selection States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [drawerImage, setDrawerImage] = useState(product.image);
  const [isAdded, setIsAdded] = useState(false);
  const [catatan, setCatatan] = useState('');

  const [activeImage, setActiveImage] = useState(product.image);
  const [adminCtaPhone, setAdminCtaPhone] = useState('628123456789');
  const [productUrl, setProductUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setProductUrl(window.location.href);
    }
    const fetchAdminCta = async () => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('value')
          .eq('type', 'admin_cta');
        if (!error && data && data.length > 0) {
          setAdminCtaPhone(data[0].value);
        }
      } catch (err) {
        console.error('Error fetching admin CTA number:', err);
      }
    };
    fetchAdminCta();
  }, []);

  // Collect all unique images (main image + additional images + variant colors/sizes images)
  const allImages = Array.from(
    new Set(
      [
        product.image,
        ...(product.images || []),
        ...(product.colors?.map(c => c.image).filter(Boolean) || []),
        ...(product.sizes?.map(s => s.image).filter(Boolean) || [])
      ].filter(Boolean)
    )
  );

  const handlePrevImage = () => {
    const currentIndex = allImages.indexOf(activeImage);
    if (currentIndex > 0) {
      setActiveImage(allImages[currentIndex - 1]);
    } else {
      setActiveImage(allImages[allImages.length - 1]);
    }
  };

  const handleNextImage = () => {
    const currentIndex = allImages.indexOf(activeImage);
    if (currentIndex < allImages.length - 1) {
      setActiveImage(allImages[currentIndex + 1]);
    } else {
      setActiveImage(allImages[0]);
    }
  };



  // Fetch recommended products from Supabase
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data } = await supabase.from('products').select('*');
        if (data && data.length > 0) {
          setProductsList(data.map((p: any) => ({
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
        } else {
          setProductsList(FALLBACK_PRODUCTS);
        }
      } catch (err) {
        console.error('Error fetching products for recommendation:', err);
        setProductsList(FALLBACK_PRODUCTS);
      }
    };
    fetchAll();
  }, []);

  const activeProductsList = productsList.length > 0 ? productsList : FALLBACK_PRODUCTS;

  // Produk relevan: kategori sama, exclude produk ini, maks 4
  const related = activeProductsList
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Jika kurang dari 4, tambah dari kategori lain
  const related4 = related.length >= 4
    ? related
    : [
        ...related,
        ...activeProductsList
          .filter(p => p.category !== product.category && p.id !== product.id)
          .slice(0, 4 - related.length),
      ];

  // Ekstrak angka harga untuk kalkulasi subtotal
  const priceNum = Number(product.price.replace(/[^\d]/g, ''));
  const subtotal = priceNum * quantity;
  const formatPrice = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  // Fungsi konfirmasi tambah ke keranjang
  const handleAddToCart = () => {
    const existingCartRaw = localStorage.getItem('cart');
    const cart = existingCartRaw ? JSON.parse(existingCartRaw) : [];

    const trimmedCatatan = catatan.trim();
    const cartId = `${product.id}-${selectedColor || ''}-${selectedSize || ''}-${selectedUnit || ''}-${trimmedCatatan}`;
    const existingIndex = cart.findIndex((item: any) => item.cartId === cartId);

    const newItem = {
      cartId,
      id: product.id,
      name: product.name,
      category: product.category,
      price: priceNum,
      unit: selectedUnit || product.unit,
      image: drawerImage || product.image,
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
    
    // Trigger success state
    setIsAdded(true);
  };

  const handleOpenDrawer = () => {
    setSelectedColor(null);
    setSelectedSize(null);
    setSelectedUnit(unitOptions[0] || '');
    setDrawerImage(activeImage);
    setIsAdded(false);
    setQuantity(1);
    setCustomQtyText('1');
    setCatatan('');
    setIsDrawerOpen(true);
  };

  return (
    <main className="min-h-screen pt-6 md:pt-20 pb-28 md:pb-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mb-8">
          <Link href="/" className="hover:text-[#8B5E3C] transition-colors">Beranda</Link>
          <ChevronRight size={14} strokeWidth={1.5} />
          <Link href="/katalog" className="hover:text-[#8B5E3C] transition-colors">Katalog</Link>
          <ChevronRight size={14} strokeWidth={1.5} />
          <span className="text-[#8B5E3C] font-medium">{product.name}</span>
        </nav>

        {/* Layout utama */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Gambar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col gap-5"
          >
            <div className="relative w-full aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden bg-slate-100
                            shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={activeImage}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              
              <div className="absolute top-5 left-5 z-10">
                <span className="font-[family-name:var(--font-inter)] text-[11px] font-semibold
                                 px-4 py-2 bg-white/90 backdrop-blur-md text-[#8B5E3C] rounded-full shadow-sm">
                  {product.category}
                </span>
              </div>

              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    aria-label="Gambar sebelumnya"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/70 hover:bg-white text-slate-800 backdrop-blur-md flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 max-md:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft size={20} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    aria-label="Gambar berikutnya"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/70 hover:bg-white text-slate-800 backdrop-blur-md flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 max-md:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ChevronRight size={20} strokeWidth={2.5} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails Row */}
            {allImages.length > 1 && (
              allImages.length <= 4 ? (
                <div className="grid grid-cols-4 gap-3 w-full">
                  {allImages.map((imgUrl, idx) => {
                    const isActive = activeImage === imgUrl;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(imgUrl)}
                        className={`relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border-2 transition-all duration-300 cursor-pointer hover:scale-102 active:scale-98
                                    ${isActive ? 'border-[#8B5E3C] shadow-md shadow-[#8B5E3C]/10 scale-102' : 'border-slate-100 hover:border-slate-300'}`}
                      >
                        <img src={imgUrl} alt={`${product.name} gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto py-2 px-2 -mx-2 scrollbar-none scroll-smooth w-full">
                  {allImages.map((imgUrl, idx) => {
                    const isActive = activeImage === imgUrl;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(imgUrl)}
                        className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border-2 transition-all duration-300 shrink-0 cursor-pointer hover:scale-102 active:scale-98
                                    ${isActive ? 'border-[#8B5E3C] shadow-md shadow-[#8B5E3C]/10 scale-102' : 'border-slate-100 hover:border-slate-300'}`}
                      >
                        <img src={imgUrl} alt={`${product.name} gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              )
            )}
          </motion.div>

          {/* Detail & Aksi */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            className="flex flex-col"
          >
            <h1
              className="font-[family-name:var(--font-instrument-serif)] text-4xl md:text-5xl font-normal text-slate-800 mb-4 leading-tight"
              style={{ letterSpacing: '-0.02em' }}
            >
              {product.name}
            </h1>

            <div className="flex flex-col gap-1.5 mb-8 border-b border-slate-100 pb-8">
              <span className="font-[family-name:var(--font-inter)] font-bold text-4xl text-[#8B5E3C]">
                {product.price}
              </span>
              <span className="font-[family-name:var(--font-inter)] text-[15px] font-medium text-slate-500">
                {product.unit}
              </span>
            </div>

            <p className="font-[family-name:var(--font-inter)] text-slate-600 leading-relaxed mb-10 text-[15px]">
              {product.desc}
            </p>

            {/* Detail Produk */}
            <div className="mb-10">
              <h2 className="font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Detail Produk
              </h2>
              <ul className="space-y-2">
                <li className="flex items-center gap-3 font-[family-name:var(--font-inter)] text-[14px]">
                  <span className="text-slate-500 w-28 shrink-0">Kategori</span>
                  <span className="text-slate-700 font-medium">{product.category}</span>
                </li>
                <li className="flex items-center gap-3 font-[family-name:var(--font-inter)] text-[14px]">
                  <span className="text-slate-500 w-28 shrink-0">Satuan</span>
                  <span className="text-slate-700 font-medium">{product.unit}</span>
                </li>
                {product.details && product.details.map((det, idx) => (
                  <li key={idx} className="flex items-center gap-3 font-[family-name:var(--font-inter)] text-[14px]">
                    <span className="text-slate-500 w-28 shrink-0">{det.label}</span>
                    <span className="text-slate-700 font-medium">{det.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tombol Keranjang */}
            <button
              onClick={handleOpenDrawer}
              className="w-full h-14 inline-flex items-center justify-center gap-2 mb-4 mt-auto
                         font-[family-name:var(--font-inter)] text-[14px] font-semibold
                         bg-[#8B5E3C] text-white rounded-xl cursor-pointer
                         hover:bg-[#DD9E59] transition-all duration-300 active:scale-[0.98]
                         shadow-[0_4px_16px_rgba(164,114,81,0.25)]"
            >
              <ShoppingCart size={18} strokeWidth={1.5} />
              Tambah ke Keranjang
            </button>

            {/* Konsultasi */}
            <a
              href={`https://wa.me/${adminCtaPhone}?text=${encodeURIComponent(
                `halo saya ingin bertanya mengenai info lebih lanjut tentang produk ini\n\n${productUrl}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14 inline-flex items-center justify-center gap-2
                         font-[family-name:var(--font-inter)] text-[14px] font-semibold
                         border border-[#8B5E3C] text-[#8B5E3C] rounded-xl bg-white
                         hover:bg-[#8B5E3C] hover:text-white
                         transition-all duration-300 active:scale-[0.98]"
            >
              <MessageCircle size={18} strokeWidth={1.5} />
              Konsultasi via WhatsApp
            </a>

          </motion.div>
        </div>

        {/* Produk Relevan */}
        {related4.length > 0 && (
          <section className="mt-20">
            <div className="flex items-end justify-between mb-6">
              <h2
                className="font-[family-name:var(--font-instrument-serif)] text-3xl font-normal text-slate-800"
                style={{ letterSpacing: '-0.02em' }}
              >
                Produk <em className="not-italic italic">Relevan</em>
              </h2>
              <Link
                href="/katalog"
                className="font-[family-name:var(--font-inter)] text-[13px] font-semibold text-[#8B5E3C]
                           hover:text-[#A65D43] transition-colors flex items-center gap-1"
              >
                Lihat Semua <ChevronRight size={14} strokeWidth={2} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {related4.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ─── Bottom Sheet Drawer ─── */}
      <AnimatePresence>
        {isDrawerOpen && (
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
                        src={drawerImage || product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-grow pr-8">
                      <div className="text-xl font-bold text-[#8B5E3C] font-[family-name:var(--font-inter)] mb-1">
                        {formatPrice(priceNum)}
                      </div>
                      <div className="inline-block px-2.5 py-0.5 bg-amber-500/10 text-amber-600 rounded-md text-[10px] font-bold tracking-wide uppercase mb-1">
                        {product.category}
                      </div>
                      <div className="text-slate-400 text-xs font-[family-name:var(--font-inter)]">
                        Satuan: {selectedUnit || product.unit}
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
                    {unitOptions.length > 1 && (
                      <div className="py-4 border-b border-slate-100">
                        <label className="block font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-800 mb-3">
                          Satuan Pembelian
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {unitOptions.map((unitOpt, idx) => {
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
                    {product.colors && product.colors.length > 0 && (
                      <div className="py-4 border-b border-slate-100">
                        <label className="block font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-800 mb-3">
                          Warna
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {product.colors.map((c, idx) => {
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
                                    setActiveImage(c.image);
                                  } else if (!nextColor) {
                                    const sizeObj = product.sizes?.find(s => s.size === selectedSize);
                                    const fallbackImg = sizeObj?.image || product.image;
                                    setDrawerImage(fallbackImg);
                                    setActiveImage(fallbackImg);
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
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="py-4 border-b border-slate-100">
                        <div className="flex justify-between items-center mb-3">
                          <label className="font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-800">
                            Ukuran
                          </label>
                          <button type="button" className="text-slate-400 text-xs font-[family-name:var(--font-inter)] hover:text-[#8B5E3C] transition-colors">
                            Tabel Ukuran
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {product.sizes.map((s, idx) => {
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
                                    setActiveImage(s.image);
                                  } else if (!nextSize) {
                                    const colorObj = product.colors?.find(col => col.color === selectedColor);
                                    const fallbackImg = colorObj?.image || product.image;
                                    setDrawerImage(fallbackImg);
                                    setActiveImage(fallbackImg);
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
                        Jumlah Kustom (Bisa desimal, contoh: 1,5 atau 15.75)
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Contoh: 1,5"
                        value={customQtyText}
                        onChange={e => {
                          const rawVal = e.target.value;
                          const cleaned = rawVal.replace(/[^0-9.,]/g, '');
                          
                          // Ensure at most one decimal separator
                          const separators = (cleaned.match(/[.,]/g) || []).length;
                          if (separators > 1) {
                            return;
                          }
                          
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
                      <span className="text-lg font-bold text-[#8B5E3C] font-[family-name:var(--font-inter)]">{formatPrice(subtotal)}</span>
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
                    Produk <strong>{product.name}</strong> dengan kuantitas {quantity.toString().replace(/\./g, ',')}x berhasil ditambahkan ke keranjang belanja Anda.
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
                      onClick={() => router.push('/keranjang')}
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
    </main>
  );
}
