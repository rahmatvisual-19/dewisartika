'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, MessageCircle, ChevronRight } from 'lucide-react';
import ProductCard, { Product } from '@/components/ProductCard';

export interface ProductData {
  id: number;
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
  desc: string;
}

// Data produk untuk rekomendasi — idealnya dari API/DB
const ALL_PRODUCTS: Product[] = [
  { id: 1,  name: 'Kain Sutra Premium',       category: 'Material Kain',  price: 'Rp 150.000',   unit: '/meter', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop' },
  { id: 2,  name: 'Kancing Jas Eksklusif',    category: 'Aksesoris',      price: 'Rp 85.000',    unit: '/lusin', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?q=80&w=800&auto=format&fit=crop' },
  { id: 3,  name: 'Custom Blazer Linen',      category: 'Jasa Tailoring', price: 'Rp 1.850.000', unit: '/biji',  image: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?q=80&w=800&auto=format&fit=crop' },
  { id: 4,  name: 'Kemeja Katun Polos',       category: 'Ready to Wear',  price: 'Rp 450.000',   unit: '/biji',  image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop' },
  { id: 5,  name: 'Kain Batik Tulis Solo',    category: 'Material Kain',  price: 'Rp 320.000',   unit: '/meter', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop' },
  { id: 6,  name: 'Celana Chino Slim Fit',    category: 'Ready to Wear',  price: 'Rp 380.000',   unit: '/biji',  image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop' },
  { id: 7,  name: 'Benang Sulam Premium',     category: 'Aksesoris',      price: 'Rp 45.000',    unit: '/set',   image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=800&auto=format&fit=crop' },
  { id: 8,  name: 'Jas Formal Wol Italia',    category: 'Jasa Tailoring', price: 'Rp 3.200.000', unit: '/biji',  image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop' },
  { id: 9,  name: 'Kain Denim Premium',       category: 'Material Kain',  price: 'Rp 95.000',    unit: '/meter', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop' },
  { id: 10, name: 'Kebaya Payet Modern',      category: 'Jasa Tailoring', price: 'Rp 2.800.000', unit: '/biji',  image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800&auto=format&fit=crop' },
  { id: 11, name: 'Kancing Mutiara Set',      category: 'Aksesoris',      price: 'Rp 120.000',   unit: '/set',   image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=800&auto=format&fit=crop' },
  { id: 12, name: 'Polo Shirt Pique',         category: 'Ready to Wear',  price: 'Rp 290.000',   unit: '/biji',  image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?q=80&w=800&auto=format&fit=crop' },
];

export default function ProductDetailView({ product }: { product: ProductData }) {
  const [quantity, setQuantity] = useState(1);

  // Produk relevan: kategori sama, exclude produk ini, maks 4
  const related = ALL_PRODUCTS
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Jika kurang dari 4, tambah dari kategori lain
  const related4 = related.length >= 4
    ? related
    : [
        ...related,
        ...ALL_PRODUCTS
          .filter(p => p.category !== product.category && p.id !== product.id)
          .slice(0, 4 - related.length),
      ];

  return (
    <main className="min-h-screen pt-20 pb-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mb-8">
          <Link href="/" className="hover:text-[#A47251] transition-colors">Beranda</Link>
          <ChevronRight size={14} strokeWidth={1.5} />
          <Link href="/katalog" className="hover:text-[#A47251] transition-colors">Katalog</Link>
          <ChevronRight size={14} strokeWidth={1.5} />
          <span className="text-[#A47251] font-medium">{product.name}</span>
        </nav>

        {/* Layout utama */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Gambar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-slate-100
                            shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-5 left-5">
                <span className="font-[family-name:var(--font-inter)] text-[11px] font-semibold
                                 px-4 py-2 bg-white/90 backdrop-blur-md text-[#A47251] rounded-full shadow-sm">
                  {product.category}
                </span>
              </div>
            </div>
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

            <div className="flex items-baseline gap-2 mb-8 border-b border-slate-100 pb-8">
              <span className="font-[family-name:var(--font-inter)] font-bold text-4xl text-[#A47251]">
                {product.price}
              </span>
              <span className="font-[family-name:var(--font-inter)] text-lg font-medium text-slate-400">
                {product.unit}
              </span>
            </div>

            <p className="font-[family-name:var(--font-inter)] text-slate-600 leading-relaxed mb-10 text-[15px]">
              {product.desc}
            </p>

            {/* Detail Produk */}
            <div className="mb-10">
              <h3 className="font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Detail Produk
              </h3>
              <ul className="space-y-2">
                {[
                  ['Kategori',   product.category],
                  ['Satuan',     product.unit],
                  ['Kualitas',   'Premium'],
                  ['Pengerjaan', 'Cepat & Presisi'],
                  ['Garansi',    'Kepuasan 100%'],
                ].map(([label, value]) => (
                  <li key={label} className="flex items-center gap-3 font-[family-name:var(--font-inter)] text-[14px]">
                    <span className="text-slate-400 w-28 shrink-0">{label}</span>
                    <span className="text-slate-700 font-medium">{value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Qty */}
            <div className="flex items-center border border-slate-200 rounded-xl h-14 bg-white overflow-hidden w-full mb-4 mt-auto">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-6 h-full text-slate-500 hover:text-[#A47251] hover:bg-slate-50 transition-colors text-xl font-light flex-1"
              >
                −
              </button>
              <span className="font-[family-name:var(--font-inter)] font-semibold text-slate-800 w-12 text-center text-lg">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-6 h-full text-slate-500 hover:text-[#A47251] hover:bg-slate-50 transition-colors text-xl font-light flex-1"
              >
                +
              </button>
            </div>

            {/* Tombol Keranjang — full width, seimbang dengan Konsultasi */}
            <button
              className="w-full h-14 inline-flex items-center justify-center gap-2 mb-4
                         font-[family-name:var(--font-inter)] text-[14px] font-semibold
                         bg-[#A47251] text-white rounded-xl
                         hover:bg-[#DD9E59] transition-all duration-300 active:scale-[0.98]
                         shadow-[0_4px_16px_rgba(164,114,81,0.25)]"
            >
              <ShoppingCart size={18} strokeWidth={1.5} />
              Tambah ke Keranjang
            </button>

            {/* Konsultasi — full width, sama tinggi */}
            <button
              className="w-full h-14 inline-flex items-center justify-center gap-2
                         font-[family-name:var(--font-inter)] text-[14px] font-semibold
                         border border-[#A47251] text-[#A47251] rounded-xl bg-white
                         hover:bg-[#A47251] hover:text-white
                         transition-all duration-300 active:scale-[0.98]"
            >
              <MessageCircle size={18} strokeWidth={1.5} />
              Konsultasi via WhatsApp
            </button>

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
                className="font-[family-name:var(--font-inter)] text-[13px] font-semibold text-[#A47251]
                           hover:text-[#E89B7E] transition-colors flex items-center gap-1"
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
    </main>
  );
}
