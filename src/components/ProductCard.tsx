'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
  desc?: string;
  colors?: any[];
  sizes?: any[];
  details?: any[];
  images?: string[];
}

interface ProductCardProps {
  product: Product;
  onAddToCartClick?: (product: Product) => void;
  onPesanClick?: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCartClick,
  onPesanClick,
}: ProductCardProps) {
  // Direct details URL
  const detailUrl = `/katalog/${product.id}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-[24px] border border-slate-100 p-3
                 shadow-[0_4px_20px_rgba(0,0,0,0.02)]
                 hover:shadow-[0_6px_25px_rgba(0,0,0,0.06)]
                 transition-all duration-300 flex flex-col group h-full"
    >
      {/* Gambar — klik menuju detail */}
      <Link href={detailUrl} className="block">
        <div className="relative w-full aspect-[4/3] rounded-[18px] overflow-hidden bg-slate-50 mb-3.5">
          <img
            src={product.image}
            alt={`${product.name} - ${product.category}`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="px-1 flex flex-col flex-grow">
        {/* Judul */}
        <Link href={detailUrl} className="hover:text-[#8B5E3C] transition-colors">
          <h3 className="font-[family-name:var(--font-inter)] text-[15px] font-bold text-slate-800 leading-snug tracking-tight">
            {product.name}
          </h3>
        </Link>

        {/* Harga & Satuan */}
        <div className="flex items-baseline mt-1 mb-1.5">
          <span className="font-[family-name:var(--font-inter)] font-bold text-[#8B5E3C] text-[15px] leading-none">
            {product.price}
          </span>
          <span className="font-[family-name:var(--font-inter)] text-[11px] font-medium text-slate-400 ml-1 leading-none">
            {product.unit}
          </span>
        </div>

        {/* Deskripsi */}
        <p className="font-[family-name:var(--font-inter)] text-[12.5px] text-slate-500 font-normal leading-relaxed line-clamp-2 mb-4">
          {product.desc || 'Tidak ada deskripsi produk.'}
        </p>

        {/* Tombol Aksi di bagian bawah */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          {/* Tombol Tambah Keranjang */}
          <button
            type="button"
            aria-label="Tambah ke keranjang"
            onClick={() => {
              if (onAddToCartClick) {
                onAddToCartClick(product);
              } else {
                // Fallback jika tidak ada handler (misal di halaman detail rekomendasi)
                window.location.href = detailUrl;
              }
            }}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors active:scale-95 cursor-pointer shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              <path d="M16 5h6"/>
              <path d="M19 2v6"/>
            </svg>
          </button>

          {/* Tombol Pesan */}
          <button
            type="button"
            onClick={() => {
              if (onPesanClick) {
                onPesanClick(product);
              } else {
                // Fallback jika tidak ada handler
                window.location.href = detailUrl;
              }
            }}
            className="flex-1 h-11 bg-[#A65D43] text-white rounded-xl font-[family-name:var(--font-inter)] font-semibold text-[13.5px] hover:bg-[#8D4A32] transition-colors active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
          >
            <ShoppingBag size={15} strokeWidth={1.8} />
            <span>Pesan</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
