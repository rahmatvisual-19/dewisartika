'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-2xl border border-gray-100 p-3
                 shadow-[0_4px_20px_rgba(0,0,0,0.03)]
                 hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)]
                 transition-shadow duration-300 flex flex-col group h-full"
    >
      {/* Gambar — klik menuju detail */}
      <Link href={`/katalog/${product.id}`} className="block">
        <div className="relative w-full aspect-square md:aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 mb-4">
          <img
            src={product.image}
            alt={`${product.name} - ${product.category}`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="px-1 flex flex-col flex-grow">
        <Link href={`/katalog/${product.id}`} className="inline-block py-1 min-h-[24px] hover:text-[#8B5E3C] transition-colors">
          <h3 className="font-[family-name:var(--font-inter)] text-[14px] font-semibold text-slate-800 leading-snug">
            {product.name}
          </h3>
        </Link>
        <p className="font-[family-name:var(--font-inter)] text-[12px] text-[#596A80] mt-1 mb-4">
          {product.category}
        </p>

        <div className="mt-auto pt-2">
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-inter)] font-bold text-[#8B5E3C] text-base leading-tight break-all">
              {product.price}
            </span>
            <span className="font-[family-name:var(--font-inter)] text-[11px] font-medium text-[#596A80] mt-0.5">
              {product.unit}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
