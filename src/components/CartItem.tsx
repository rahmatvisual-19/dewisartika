'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowRight, Pencil } from 'lucide-react';

// ─── Helper ───────────────────────────────────────────────────────────────────
export const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

// ─── Empty Cart ───────────────────────────────────────────────────────────────
export function EmptyCart() {
  return (
    <main className="min-h-screen pt-20 pb-24 bg-slate-50/50 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center flex flex-col items-center px-4"
      >
        <div className="w-24 h-24 bg-[#F0D8A1]/30 text-[#8B5E3C] rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} strokeWidth={1.5} />
        </div>
        <h2
          className="font-[family-name:var(--font-instrument-serif)] text-4xl font-normal text-slate-800 mb-4"
          style={{ letterSpacing: '-0.02em' }}
        >
          Keranjang <em className="not-italic italic">Kosong</em>
        </h2>
        <p className="font-[family-name:var(--font-inter)] text-slate-500 text-[15px] mb-8 max-w-md leading-relaxed">
          Sepertinya Anda belum memilih produk atau layanan apa pun. Mari jelajahi katalog kami untuk menemukan mahakarya impian Anda.
        </p>
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2
                     font-[family-name:var(--font-inter)] text-[14px] font-semibold
                     bg-[#8B5E3C] text-white rounded-full px-8 py-4
                     hover:bg-[#DD9E59] transition-all duration-300 active:scale-95
                     shadow-[0_4px_16px_rgba(164,114,81,0.25)]"
        >
          Mulai Belanja <ArrowRight size={18} strokeWidth={1.5} />
        </Link>
      </motion.div>
    </main>
  );
}

// ─── Cart Item ────────────────────────────────────────────────────────────────
interface CartItemProps {
  item: {
    cartId: string;
    id: number;
    name: string;
    category: string;
    price: number;
    quantity: number;
    unit: string;
    image: string;
    color: string | null;
    size: string | null;
    catatan?: string | null;
  };
  updateQuantity: (cartId: string, delta: number) => void;
  removeItem: (cartId: string) => void;
  onEdit: (item: any) => void;
}

export function CartItem({ item, updateQuantity, removeItem, onEdit }: CartItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100
                 shadow-[0_4px_20px_rgba(0,0,0,0.02)]
                 flex flex-col sm:flex-row gap-6 items-start sm:items-center"
    >
      {/* Gambar */}
      <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-2xl overflow-hidden bg-slate-100">
        <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-grow">
        <p className="font-[family-name:var(--font-inter)] text-[11px] font-semibold text-[#DD9E59] uppercase tracking-wider mb-1">
          {item.category}
        </p>
        <p className="font-[family-name:var(--font-inter)] text-[15px] font-semibold text-slate-800 mb-2 leading-snug">
          {item.name}
        </p>
        <p className="font-[family-name:var(--font-inter)] font-bold text-[#8B5E3C] mb-2">
          {formatRupiah(item.price)}{' '}
          <span className="text-slate-400 text-sm font-normal">{item.unit}</span>
        </p>
        
        {/* Varian Warna & Ukuran & Catatan */}
        {(item.color || item.size || item.catatan) && (
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex flex-wrap gap-2">
              {item.color && (
                <span className="font-[family-name:var(--font-inter)] text-[11px] font-medium px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg">
                  Warna: {item.color}
                </span>
              )}
              {item.size && (
                <span className="font-[family-name:var(--font-inter)] text-[11px] font-medium px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg">
                  Ukuran: {item.size}
                </span>
              )}
            </div>
            {item.catatan && (
              <p className="font-[family-name:var(--font-inter)] text-[12px] text-slate-500 italic mt-0.5 bg-[#8B5E3C]/5 border border-[#8B5E3C]/10 rounded-lg px-2.5 py-1.5 w-full">
                <span className="font-semibold text-[#8B5E3C] not-italic mr-1">Catatan:</span>
                "{item.catatan}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Kontrol qty & hapus */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
        <div className="flex items-center border border-slate-200 rounded-xl h-10 bg-slate-50 overflow-hidden">
          <button
            onClick={() => updateQuantity(item.cartId, -1)}
            className="px-3 h-full text-slate-500 hover:text-[#8B5E3C] hover:bg-slate-100 transition-colors text-lg font-light"
          >
            −
          </button>
          <span className="font-[family-name:var(--font-inter)] font-semibold text-slate-800 w-8 text-center text-sm">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.cartId, 1)}
            className="px-3 h-full text-slate-500 hover:text-[#8B5E3C] hover:bg-slate-100 transition-colors text-lg font-light"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(item)}
            className="text-slate-400 hover:text-[#8B5E3C] transition-colors p-1.5
                       font-[family-name:var(--font-inter)] text-[12px] flex items-center gap-1 cursor-pointer"
          >
            <Pencil size={13} strokeWidth={1.5} />
            <span>Ubah</span>
          </button>

          <button
            onClick={() => removeItem(item.cartId)}
            className="text-slate-400 hover:text-red-500 transition-colors p-1.5
                       font-[family-name:var(--font-inter)] text-[12px] flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={15} strokeWidth={1.5} />
            <span className="sm:hidden">Hapus</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Order Summary ────────────────────────────────────────────────────────────
interface OrderSummaryProps {
  itemCount: number;
  subTotal: number;
  grandTotal: number;
  onCheckout: () => void;
}

export function OrderSummary({ itemCount, subTotal, grandTotal, onCheckout }: OrderSummaryProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100
                    shadow-[0_8px_30px_rgba(0,0,0,0.04)] sticky top-24">
      <h3 className="font-[family-name:var(--font-inter)] text-[16px] font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">
        Ringkasan Belanja
      </h3>

      <div className="space-y-3 font-[family-name:var(--font-inter)] text-[13.5px] text-slate-600 mb-6">
        <div className="flex justify-between">
          <span>Total Harga ({itemCount} barang)</span>
          <span className="font-semibold text-slate-800">{formatRupiah(subTotal)}</span>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-[family-name:var(--font-inter)] text-[15px] font-bold text-slate-800">Total Tagihan</span>
          <span className="font-[family-name:var(--font-inter)] text-xl font-bold text-[#8B5E3C]">{formatRupiah(grandTotal)}</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="w-full h-13 py-3.5 inline-flex items-center justify-center
                   font-[family-name:var(--font-inter)] text-[14px] font-semibold
                   bg-[#8B5E3C] text-white rounded-xl cursor-pointer
                   hover:bg-[#DD9E59] transition-all duration-300 active:scale-[0.98]
                   shadow-[0_4px_16px_rgba(164,114,81,0.25)]"
      >
        Lanjut ke Pembayaran
      </button>

      <p className="font-[family-name:var(--font-inter)] text-[11px] text-center text-slate-400 mt-4">
        Pembayaran dan pengiriman akan diproses melalui sistem yang aman.
      </p>
    </div>
  );
}
