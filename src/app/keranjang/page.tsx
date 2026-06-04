'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import { EmptyCart, CartItem, OrderSummary } from '@/components/CartItem';
import { supabase } from '@/lib/supabase';

export default function KeranjangPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Edit Modal States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [productDetails, setProductDetails] = useState<any | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  // Edit Form Fields
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [editQty, setEditQty] = useState(1);
  const [editQtyText, setEditQtyText] = useState('1');
  const [editCatatan, setEditCatatan] = useState('');
  const [editDrawerImage, setEditDrawerImage] = useState('');

  // Checkout Modal & Success States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Form Fields Penerima
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custNotes, setCustNotes] = useState('');

  // Admin Phone State
  const [adminPhone, setAdminPhone] = useState('6281362989136'); // default fallback
  const [createdOrderId, setCreatedOrderId] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('cart');
    if (raw) {
      try {
        setCartItems(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to parse cart items:', e);
      }
    }
    setIsLoaded(true);

    // Fetch Admin Phone from contacts table
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

  const updateQuantity = (cartId: string, delta: number) => {
    const updated = cartItems.map(item => item.cartId === cartId
      ? { ...item, quantity: Math.max(1, item.quantity + delta) }
      : item
    );
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const removeItem = (cartId: string) => {
    const updated = cartItems.filter(item => item.cartId !== cartId);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleEditClick = async (item: any) => {
    setEditingItem(item);
    setIsEditOpen(true);
    setLoadingProduct(true);
    setProductDetails(null);

    // Inisialisasi input dengan nilai saat ini
    setSelectedColor(item.color);
    setSelectedSize(item.size);
    setSelectedUnit(item.unit);
    setEditQty(item.quantity);
    setEditQtyText(item.quantity.toString().replace(/\./g, ','));
    setEditCatatan(item.catatan || '');
    setEditDrawerImage(item.image);

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.id)
        .single();

      if (!error && data) {
        setProductDetails(data);
        if (!item.image) {
          setEditDrawerImage(data.images?.[0] || '');
        }
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    const trimmedCatatan = editCatatan.trim();
    // Formula Cart ID Baru
    const newCartId = `${editingItem.id}-${selectedColor || ''}-${selectedSize || ''}-${selectedUnit || ''}-${trimmedCatatan}`;

    setCartItems(prevItems => {
      const oldIndex = prevItems.findIndex(item => item.cartId === editingItem.cartId);
      if (oldIndex === -1) return prevItems;

      const updated = [...prevItems];

      // Membuat data item ter-update
      const updatedItem = {
        ...editingItem,
        cartId: newCartId,
        color: selectedColor,
        size: selectedSize,
        unit: selectedUnit,
        quantity: editQty,
        catatan: trimmedCatatan,
        image: editDrawerImage || editingItem.image,
      };

      // Cek apakah ada item sejenis yang memiliki newCartId yang sama (selain item yang sedang di-edit)
      const duplicateIndex = updated.findIndex((item, idx) => item.cartId === newCartId && idx !== oldIndex);

      if (duplicateIndex !== -1) {
        // Gabungkan kuantitas dan hapus data lama yang diedit
        updated[duplicateIndex].quantity += editQty;
        updated.splice(oldIndex, 1);
      } else {
        // Tumpuk item lama dengan item baru
        updated[oldIndex] = updatedItem;
      }

      localStorage.setItem('cart', JSON.stringify(updated));
      window.dispatchEvent(new Event('cart-updated'));
      return updated;
    });

    setIsEditOpen(false);
    setEditingItem(null);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim()) {
      alert('Nama lengkap dan nomor WhatsApp wajib diisi.');
      return;
    }

    setCheckoutLoading(true);

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
      const orderItemsPayload = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        color: item.color,
        size: item.size,
        catatan: item.catatan || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsPayload);

      if (itemsError) throw itemsError;

      // 3. Format pesan WhatsApp Model Bon Resi yang terstruktur dan rapi
      const orderDateStr = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const orderIdShort = orderData.id.split('-')[0].toUpperCase(); // Mengambil potongan pertama UUID sebagai Order ID pendek
      
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
        ...cartItems.map((item, idx) => {
          const variantDetails = [];
          if (item.color) variantDetails.push(`Warna: ${item.color}`);
          if (item.size) variantDetails.push(`Ukuran: ${item.size}`);
          const vars = variantDetails.length > 0 ? ` (${variantDetails.join(', ')})` : '';
          const noteText = item.catatan ? `\n    _Catatan: "${item.catatan}"_` : '';
          return `${idx + 1}. *${item.name}*${vars}\n    Qty: ${item.quantity.toString().replace(/\./g, ',')} ${item.unit} x ${formatRupiah(item.price)}${noteText}`;
        }),
        `==================================`,
        `*Total Tagihan:* *${formatRupiah(grandTotal)}*`,
        ``,
        `Mohon dibantu untuk mengecek ketersediaan bahan/layanan di atas. Terima kasih!`,
      ].filter(line => line !== null);

      const waText = encodeURIComponent(messageLines.join('\n'));
      const waUrl = `https://wa.me/${adminPhone}?text=${waText}`;

      // Membuka tab WhatsApp
      window.open(waUrl, '_blank');

      // Mengeset Order ID pendek untuk modal sukses
      setCreatedOrderId(`#TC-${orderIdShort}`);

      // 4. Kosongkan keranjang belanja
      localStorage.removeItem('cart');
      setCartItems([]);
      window.dispatchEvent(new Event('cart-updated'));

      setIsCheckoutSuccess(true);
      setIsCheckoutOpen(false);
    } catch (err: any) {
      console.error('Checkout failed raw:', err);
      let errStr = '';
      try {
        errStr = JSON.stringify(err, Object.getOwnPropertyNames(err));
      } catch (e) {
        errStr = String(err);
      }
      console.error('Checkout failed stringified:', errStr);
      
      const errDetail = err.details ? `\nDetail: ${err.details}` : '';
      const errHint = err.hint ? `\nHint: ${err.hint}` : '';
      alert(`Gagal mengirimkan pesanan: ${err.message || err.error_description || errStr}${errDetail}${errHint}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen pt-20 pb-16 bg-slate-50/50 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#8B5E3C] w-8 h-8" />
      </main>
    );
  }

  if (cartItems.length === 0 && !isCheckoutSuccess) return <EmptyCart />;

  const subTotal   = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const grandTotal = subTotal;

  return (
    <main className="min-h-screen pt-6 md:pt-20 pb-16 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/katalog"
            className="inline-flex items-center gap-1.5 font-[family-name:var(--font-inter)] text-[13px] text-slate-500 hover:text-[#8B5E3C] transition-colors mb-4"
          >
            <ArrowLeft size={15} strokeWidth={1.5} /> Kembali ke Katalog
          </Link>
          <h1
            className="font-[family-name:var(--font-instrument-serif)] text-4xl md:text-5xl font-normal text-[#8B5E3C]"
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
                  key={item.cartId}
                  item={item}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                  onEdit={handleEditClick}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              itemCount={cartItems.length}
              subTotal={subTotal}
              grandTotal={grandTotal}
              onCheckout={() => setIsCheckoutOpen(true)}
            />
          </div>

        </div>
      </div>

      {/* ─── Bottom Sheet Edit Drawer ─── */}
      <AnimatePresence>
        {isEditOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditOpen(false)}
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
              {loadingProduct ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="animate-spin text-[#8B5E3C] w-8 h-8 mb-4" />
                  <p className="font-[family-name:var(--font-inter)] text-sm text-slate-500">
                    Memuat data produk...
                  </p>
                </div>
              ) : productDetails ? (
                <div className="flex flex-col">
                  {/* Header: Thumbnail + Price + Info */}
                  <div className="flex gap-4 items-start pb-4 border-b border-slate-100 relative">
                    <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                      <img
                        src={editDrawerImage || editingItem?.image}
                        alt={editingItem?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-grow pr-8">
                      <div className="text-[15px] font-bold text-slate-800 font-[family-name:var(--font-inter)] mb-1">
                        {editingItem?.name}
                      </div>
                      <div className="text-lg font-bold text-[#8B5E3C] font-[family-name:var(--font-inter)] mb-1">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(editingItem?.price)}
                      </div>
                      <div className="text-slate-400 text-xs font-[family-name:var(--font-inter)]">
                        Satuan: {selectedUnit || editingItem?.unit}
                      </div>
                    </div>

                    <button
                      onClick={() => setIsEditOpen(false)}
                      className="absolute top-0 right-0 p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                    >
                      <X size={18} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Body: Selections */}
                  <div className="flex-grow pb-4">
                    {/* Opsi Satuan (jika lebih dari satu) */}
                    {productDetails.unit && productDetails.unit.split(',').length > 1 && (
                      <div className="py-4 border-b border-slate-100">
                        <label className="block font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-800 mb-3">
                          Satuan Pembelian
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {productDetails.unit.split(',').map((u: string) => u.trim()).map((unitOpt: string, idx: number) => {
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
                    {productDetails.colors && productDetails.colors.length > 0 && (
                      <div className="py-4 border-b border-slate-100">
                        <label className="block font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-800 mb-3">
                          Warna
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {productDetails.colors.map((c: any, idx: number) => {
                            const isSelected = selectedColor === c.color;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  const nextColor = isSelected ? null : c.color;
                                  setSelectedColor(nextColor);
                                  if (nextColor && c.image) {
                                    setEditDrawerImage(c.image);
                                  } else if (!nextColor) {
                                    const sizeObj = productDetails.sizes?.find((s: any) => s.size === selectedSize);
                                    setEditDrawerImage(sizeObj?.image || productDetails.images?.[0] || '');
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
                    {productDetails.sizes && productDetails.sizes.length > 0 && (
                      <div className="py-4 border-b border-slate-100">
                        <div className="flex justify-between items-center mb-3">
                          <label className="font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-800">
                            Ukuran
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {productDetails.sizes.map((s: any, idx: number) => {
                            const isSelected = selectedSize === s.size;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  const nextSize = isSelected ? null : s.size;
                                  setSelectedSize(nextSize);
                                  if (nextSize && s.image) {
                                    setEditDrawerImage(s.image);
                                  } else if (!nextSize) {
                                    const colorObj = productDetails.colors?.find((col: any) => col.color === selectedColor);
                                    setEditDrawerImage(colorObj?.image || productDetails.images?.[0] || '');
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
                            const nextQty = Math.max(0.1, editQty - 1);
                            const rounded = Math.round(nextQty * 100) / 100;
                            setEditQty(rounded);
                            setEditQtyText(rounded.toString().replace(/\./g, ','));
                          }}
                          className="w-8 h-full text-slate-500 hover:bg-slate-50 transition-colors text-base cursor-pointer flex items-center justify-center font-light animate-none"
                        >
                          −
                        </button>
                        <span className="font-[family-name:var(--font-inter)] font-semibold text-slate-800 flex-1 text-center text-sm">
                          {editQty.toString().replace(/\./g, ',')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const nextQty = editQty + 1;
                            const rounded = Math.round(nextQty * 100) / 100;
                            setEditQty(rounded);
                            setEditQtyText(rounded.toString().replace(/\./g, ','));
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
                        value={editQtyText}
                        onChange={e => {
                          const rawVal = e.target.value;
                          const cleaned = rawVal.replace(/[^0-9.,]/g, '');
                          const separators = (cleaned.match(/[.,]/g) || []).length;
                          if (separators > 1) return;
                          
                          setEditQtyText(cleaned);
                          const normalized = cleaned.replace(/,/g, '.');
                          const numericValue = parseFloat(normalized);
                          if (!isNaN(numericValue) && numericValue > 0) {
                            setEditQty(numericValue);
                          } else {
                            setEditQty(0);
                          }
                        }}
                        onBlur={() => {
                          if (editQty <= 0 || isNaN(editQty)) {
                            setEditQty(1);
                            setEditQtyText('1');
                          } else {
                            setEditQtyText(editQty.toString().replace(/\./g, ','));
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
                        value={editCatatan}
                        onChange={e => setEditCatatan(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-[family-name:var(--font-inter)] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C] transition-all bg-slate-50/50 resize-none"
                      />
                    </div>
                  </div>

                  {/* Footer: Subtotal + Action Button */}
                  <div className="pt-4 border-t border-slate-100 mt-2 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium font-[family-name:var(--font-inter)]">Subtotal ({editQty.toString().replace(/\./g, ',')} barang)</span>
                      <span className="text-lg font-bold text-[#8B5E3C] font-[family-name:var(--font-inter)]">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(editingItem?.price * editQty)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="w-full h-12 inline-flex items-center justify-center gap-2
                                 font-[family-name:var(--font-inter)] text-[14px] font-bold
                                 bg-[#8B5E3C] text-white rounded-xl cursor-pointer
                                 hover:bg-[#DD9E59] transition-all duration-300 active:scale-[0.98]
                                 shadow-[0_4px_12px_rgba(164,114,81,0.2)]"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="font-[family-name:var(--font-inter)] text-sm text-red-500 font-semibold mb-2">
                    Gagal Memuat Produk
                  </p>
                  <p className="font-[family-name:var(--font-inter)] text-xs text-slate-400 mb-6">
                    Terjadi kesalahan saat memproses data produk dari Supabase.
                  </p>
                  <button
                    onClick={() => setIsEditOpen(false)}
                    className="px-6 py-2 bg-[#8B5E3C] text-white rounded-xl text-xs font-semibold hover:bg-[#DD9E59] transition-all"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Modal Form Data Diri Checkout ─── */}
      <AnimatePresence>
        {isCheckoutOpen && (
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
                Silakan isi formulir di bawah ini untuk mendaftarkan pesanan dan memproses ketersediaan barang melalui WhatsApp Admin.
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
                  onClick={() => {
                    setIsCheckoutSuccess(false);
                    setCustName('');
                    setCustPhone('');
                    setCustAddress('');
                    setCustNotes('');
                  }}
                  className="w-full py-3 border border-slate-200 text-slate-600 rounded-xl font-[family-name:var(--font-inter)] text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Kembali ke Toko
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
