'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { EmptyCart, CartItem, OrderSummary } from '@/components/CartItem';

const initialCart = [
  { id: 1, name: 'Kain Sutra Premium',  category: 'Material Kain',  price: 150000,   quantity: 2, unit: '/meter', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=400&auto=format&fit=crop' },
  { id: 3, name: 'Custom Blazer Linen', category: 'Jasa Tailoring', price: 1850000,  quantity: 1, unit: '/biji',  image: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?q=80&w=400&auto=format&fit=crop' },
];

export default function KeranjangPage() {
  const [cartItems, setCartItems] = useState(initialCart);

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(items =>
      items.map(item => item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  if (cartItems.length === 0) return <EmptyCart />;

  const subTotal   = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax        = subTotal * 0.11;
  const grandTotal = subTotal + tax;

  return (
    <main className="min-h-screen pt-20 pb-16 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/katalog"
            className="inline-flex items-center gap-1.5 font-[family-name:var(--font-inter)] text-[13px] text-slate-500 hover:text-[#A47251] transition-colors mb-4"
          >
            <ArrowLeft size={15} strokeWidth={1.5} /> Kembali ke Katalog
          </Link>
          <h1
            className="font-[family-name:var(--font-instrument-serif)] text-4xl md:text-5xl font-normal text-[#A47251]"
            style={{ letterSpacing: '-0.02em' }}
          >
            Keranjang <em className="not-italic italic">Belanja</em>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Daftar Item */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cartItems.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              itemCount={cartItems.length}
              subTotal={subTotal}
              tax={tax}
              grandTotal={grandTotal}
            />
          </div>

        </div>
      </div>
    </main>
  );
}
