'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, Printer, Search, Trash2, Pencil, 
  ChevronDown, ChevronUp, X, MessageCircle, RefreshCw, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'day' | 'week' | 'month' | 'year'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Custom Filter Input States
  const [filterDay, setFilterDay] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterWeekStart, setFilterWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [filterWeekEnd, setFilterWeekEnd] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(() => new Date().getMonth());
  const [filterYear, setFilterYear] = useState(() => new Date().getFullYear());
  const [filterYearOnly, setFilterYearOnly] = useState(() => new Date().getFullYear());

  // Edit Modal States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [editCustName, setEditCustName] = useState('');
  const [editCustPhone, setEditCustPhone] = useState('');
  const [editCustAddress, setEditCustAddress] = useState('');
  const [editCustNotes, setEditCustNotes] = useState('');
  const [editStatus, setEditStatus] = useState('pending');
  const [editItems, setEditItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      alert(`Gagal mengambil data pesanan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pesanan ini secara permanen?')) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(prev => prev.filter(o => o.id !== orderId));
      if (expandedOrderId === orderId) setExpandedOrderId(null);
      alert('Pesanan berhasil dihapus.');
    } catch (err: any) {
      console.error('Error deleting order:', err);
      alert(`Gagal menghapus pesanan: ${err.message}`);
    }
  };

  const handleEditClick = (order: any) => {
    setEditingOrder(order);
    setEditCustName(order.customer_name || '');
    setEditCustPhone(order.customer_phone || '');
    setEditCustAddress(order.customer_address || '');
    setEditCustNotes(order.catatan || '');
    setEditStatus(order.status || 'pending');
    setEditItems(order.order_items ? JSON.parse(JSON.stringify(order.order_items)) : []);
    setIsEditOpen(true);
  };

  const handleItemQtyChange = (idx: number, delta: number) => {
    const next = [...editItems];
    const newQty = Math.max(0.1, Number(next[idx].quantity || 0) + delta);
    next[idx].quantity = Math.round(newQty * 100) / 100;
    setEditItems(next);
  };

  const handleItemPriceChange = (idx: number, priceVal: string) => {
    const next = [...editItems];
    const numeric = parseFloat(priceVal.replace(/[^0-9]/g, '')) || 0;
    next[idx].price = numeric;
    setEditItems(next);
  };

  const handleSaveEdit = async () => {
    if (!editingOrder) return;
    if (!editCustName.trim()) {
      alert('Nama pelanggan wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      // Hitung subtotal dan grandtotal baru
      const newSubtotal = editItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const newGrandtotal = newSubtotal; // Estimasi pajak ditiadakan

      // 1. Update data orders utama
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          customer_name: editCustName.trim(),
          customer_phone: editCustPhone.trim(),
          customer_address: editCustAddress.trim() || null,
          catatan: editCustNotes.trim() || null,
          status: editStatus,
          subtotal: newSubtotal,
          grand_total: newGrandtotal
        })
        .eq('id', editingOrder.id);

      if (orderError) throw orderError;

      // 2. Hapus detail item lama dan re-insert detail item baru
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', editingOrder.id);

      if (deleteError) throw deleteError;

      if (editItems.length > 0) {
        const insertPayload = editItems.map(item => ({
          order_id: editingOrder.id,
          product_id: item.product_id || null,
          name: item.name,
          category: item.category || null,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit || 'barang',
          color: item.color || null,
          size: item.size || null,
          catatan: item.catatan || null
        }));

        const { error: insertError } = await supabase
          .from('order_items')
          .insert(insertPayload);

        if (insertError) throw insertError;
      }

      alert('Pesanan berhasil diperbarui!');
      setIsEditOpen(false);
      setEditingOrder(null);
      fetchOrders();
    } catch (err: any) {
      console.error('Error updating order:', err);
      alert(`Gagal memperbarui pesanan: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const getTimeSearchFilteredOrders = () => {
    return orders.filter(order => {
      // 1. Time Filter
      let matchTime = true;
      const orderDate = new Date(order.created_at);

      if (filter === 'day') {
        const orderDayStr = orderDate.getFullYear() + '-' +
          String(orderDate.getMonth() + 1).padStart(2, '0') + '-' +
          String(orderDate.getDate()).padStart(2, '0');
        matchTime = orderDayStr === filterDay;
      } else if (filter === 'week') {
        const startMs = new Date(filterWeekStart + 'T00:00:00').getTime();
        const endMs = new Date(filterWeekEnd + 'T23:59:59').getTime();
        const isRangeValid = (endMs - startMs) >= 6.9 * 24 * 60 * 60 * 1000;
        
        if (isRangeValid) {
          const orderTime = orderDate.getTime();
          matchTime = orderTime >= startMs && orderTime <= endMs;
        } else {
          matchTime = false;
        }
      } else if (filter === 'month') {
        matchTime = orderDate.getMonth() === Number(filterMonth) && orderDate.getFullYear() === Number(filterYear);
      } else if (filter === 'year') {
        matchTime = orderDate.getFullYear() === Number(filterYearOnly);
      }

      // 2. Search Filter
      let matchSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const shortId = order.id.split('-')[0].toUpperCase();
        matchSearch = 
          order.customer_name.toLowerCase().includes(q) ||
          (order.customer_phone && order.customer_phone.includes(q)) ||
          shortId.includes(q) ||
          (order.customer_address && order.customer_address.toLowerCase().includes(q));
      }

      return matchTime && matchSearch;
    });
  };

  const timeSearchFilteredOrders = getTimeSearchFilteredOrders();

  const getFilteredOrders = () => {
    if (statusFilter === 'all') return timeSearchFilteredOrders;
    return timeSearchFilteredOrders.filter(order => order.status === statusFilter);
  };

  const filteredOrders = getFilteredOrders();

  // Pendapatan dari pesanan hasil filter akhir (jika statusFilter 'all', kita kecualikan pesanan batal. Jika disaring ke status tertentu, kita tampilkan nominal status tersebut).
  const totalRevenue = filteredOrders.reduce((acc, order) => {
    if (statusFilter === 'all') {
      return order.status !== 'cancelled' ? acc + order.grand_total : acc;
    }
    return acc + order.grand_total;
  }, 0);

  // Subtitle deskripsi jumlah pesanan pada total pendapatan
  const getRevenueSubtitle = () => {
    if (statusFilter === 'all') {
      const nonCancelledCount = filteredOrders.filter(o => o.status !== 'cancelled').length;
      return `Dari ${nonCancelledCount} pesanan (di luar pesanan batal)`;
    }
    const statusLabelMap: Record<string, string> = {
      pending: 'pending',
      processing: 'dalam proses',
      completed: 'selesai',
      cancelled: 'dibatalkan'
    };
    return `Dari ${filteredOrders.length} pesanan ${statusLabelMap[statusFilter] || ''}`;
  };

  // Statistik dihitung dari data waktu & pencarian saja (sebelum filter status) agar filter status tidak mematikan angka kartu lainnya
  const pendingCount = timeSearchFilteredOrders.filter(o => o.status === 'pending').length;
  const processingCount = timeSearchFilteredOrders.filter(o => o.status === 'processing').length;
  const completedCount = timeSearchFilteredOrders.filter(o => o.status === 'completed').length;
  const cancelledCount = timeSearchFilteredOrders.filter(o => o.status === 'cancelled').length;

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const MONTHS_INDO = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const getFilterText = () => {
    let periodText = '';
    if (filter === 'day') periodText = `Hari/Tanggal: ${formatDateIndo(filterDay)}`;
    else if (filter === 'week') {
      const startMs = new Date(filterWeekStart + 'T00:00:00').getTime();
      const endMs = new Date(filterWeekEnd + 'T23:59:59').getTime();
      const isRangeValid = (endMs - startMs) >= 6.9 * 24 * 60 * 60 * 1000;
      if (!isRangeValid) periodText = 'Rentang Mingguan (Tidak Valid - Jarak Min. 7 Hari)';
      else periodText = `Mingguan: ${formatDateIndo(filterWeekStart)} s.d. ${formatDateIndo(filterWeekEnd)}`;
    }
    else if (filter === 'month') periodText = `Bulanan: ${MONTHS_INDO[filterMonth]} ${filterYear}`;
    else if (filter === 'year') periodText = `Tahunan: Tahun ${filterYearOnly}`;
    else periodText = 'Semua Periode';

    if (statusFilter !== 'all') {
      const statusLabelMap: Record<string, string> = {
        pending: 'Pending (Menunggu)',
        processing: 'Processing (Proses)',
        completed: 'Completed (Selesai)',
        cancelled: 'Cancelled (Batal)'
      };
      return `${periodText} | Status: ${statusLabelMap[statusFilter]}`;
    }
    return periodText;
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    const s = status ? status.toLowerCase() : 'pending';
    if (s === 'completed') {
      return <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">Selesai</span>;
    }
    if (s === 'processing') {
      return <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-100 uppercase">Proses</span>;
    }
    if (s === 'cancelled') {
      return <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-100 uppercase">Batal</span>;
    }
    return <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-100 uppercase">Pending</span>;
  };

  return (
    <div className="space-y-6">
      {/* CSS Cetak Khusus agar Laporan PDF Rapi */}
      <style jsx global>{`
        @media print {
          /* Reset root layout untuk mode cetak */
          html, body {
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }
          /* Sembunyikan sidebar desktop, mobile sidebar, dan header admin */
          div.hidden.lg\:block,
          .lg\:hidden,
          header,
          .no-print {
            display: none !important;
          }
          /* Matikan flexbox height/scroll pada layout pembungkus utama admin */
          .flex.h-screen {
            display: block !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            background: transparent !important;
          }
          main {
            display: block !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Hapus padding pembungkus utama di layout */
          .p-4.sm\:p-6.md\:p-8 {
            padding: 0 !important;
            margin: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          /* Sembunyikan elemen dashboard UI utama secara umum */
          body * {
            visibility: hidden;
          }
          /* Hanya tampilkan area laporan rekap */
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: relative !important;
            display: block !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #fff !important;
            color: #000 !important;
          }
        }
      `}</style>

      {/* ── Header Dashboard (no-print) ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1
            className="font-[family-name:var(--font-instrument-serif)] text-4xl md:text-5xl font-normal text-[#8B5E3C]"
            style={{ letterSpacing: '-0.02em' }}
          >
            Kelola <em className="not-italic italic">Pesanan</em>
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-slate-500 text-[14px] mt-1">
            Lihat, saring, ubah rincian belanjaan, dan rekap pesanan pelanggan secara online.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchOrders}
            className="h-10 px-4 inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl font-[family-name:var(--font-inter)] text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-xs"
          >
            <RefreshCw size={13} /> Segarkan
          </button>
          <button
            onClick={handlePrint}
            disabled={filteredOrders.length === 0}
            className="h-10 px-4 inline-flex items-center gap-2 bg-[#8B5E3C] hover:bg-[#DD9E59] text-white rounded-xl font-[family-name:var(--font-inter)] text-xs font-semibold cursor-pointer active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Printer size={13} /> Cetak PDF Rekap
          </button>
        </div>
      </div>

      {/* ── Kartu Statistik (no-print) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 no-print">
        {/* Card 1: Total Pendapatan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between min-h-[110px] col-span-2">
          <div>
            <p className="font-[family-name:var(--font-inter)] text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              Total Pendapatan Terfilter
            </p>
            <p className="font-[family-name:var(--font-inter)] text-2xl font-bold text-[#8B5E3C]">
              {formatRupiah(totalRevenue)}
            </p>
          </div>
          <p className="font-[family-name:var(--font-inter)] text-[11px] text-slate-400 mt-2">
            {getRevenueSubtitle()}
          </p>
        </div>

        {/* Card 2: Pending */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          className={`p-4 rounded-2xl border flex flex-col justify-between min-h-[110px] border-l-4 border-l-amber-400 cursor-pointer transition-all active:scale-98 hover:shadow-md hover:-translate-y-0.5
            ${statusFilter === 'pending'
              ? 'bg-amber-50/25 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
              : 'bg-white border-slate-100 shadow-xs'
            }`}
          title="Klik untuk memfilter status Pending"
        >
          <div>
            <p className="font-[family-name:var(--font-inter)] text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              Pending
            </p>
            <p className="font-[family-name:var(--font-inter)] text-2xl font-bold text-amber-600">
              {pendingCount}
            </p>
          </div>
          <p className="font-[family-name:var(--font-inter)] text-[11px] text-slate-400 mt-2">
            Menunggu konfirmasi
          </p>
        </div>

        {/* Card 3: Proses */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'processing' ? 'all' : 'processing')}
          className={`p-4 rounded-2xl border flex flex-col justify-between min-h-[110px] border-l-4 border-l-blue-400 cursor-pointer transition-all active:scale-98 hover:shadow-md hover:-translate-y-0.5
            ${statusFilter === 'processing'
              ? 'bg-blue-50/25 border-blue-300 ring-2 ring-blue-400/20 shadow-xs'
              : 'bg-white border-slate-100 shadow-xs'
            }`}
          title="Klik untuk memfilter status Proses"
        >
          <div>
            <p className="font-[family-name:var(--font-inter)] text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              Proses
            </p>
            <p className="font-[family-name:var(--font-inter)] text-2xl font-bold text-blue-600">
              {processingCount}
            </p>
          </div>
          <p className="font-[family-name:var(--font-inter)] text-[11px] text-slate-400 mt-2">
            Sedang dikerjakan
          </p>
        </div>

        {/* Card 4: Selesai */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
          className={`p-4 rounded-2xl border flex flex-col justify-between min-h-[110px] border-l-4 border-l-emerald-400 cursor-pointer transition-all active:scale-98 hover:shadow-md hover:-translate-y-0.5
            ${statusFilter === 'completed'
              ? 'bg-emerald-50/25 border-emerald-300 ring-2 ring-emerald-400/20 shadow-xs'
              : 'bg-white border-slate-100 shadow-xs'
            }`}
          title="Klik untuk memfilter status Selesai"
        >
          <div>
            <p className="font-[family-name:var(--font-inter)] text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              Selesai
            </p>
            <p className="font-[family-name:var(--font-inter)] text-2xl font-bold text-emerald-600">
              {completedCount}
            </p>
          </div>
          <p className="font-[family-name:var(--font-inter)] text-[11px] text-slate-400 mt-2">
            Pesanan rampung
          </p>
        </div>

        {/* Card 5: Batal */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'cancelled' ? 'all' : 'cancelled')}
          className={`p-4 rounded-2xl border flex flex-col justify-between min-h-[110px] border-l-4 border-l-rose-400 cursor-pointer transition-all active:scale-98 hover:shadow-md hover:-translate-y-0.5
            ${statusFilter === 'cancelled'
              ? 'bg-rose-50/25 border-rose-300 ring-2 ring-rose-400/20 shadow-xs'
              : 'bg-white border-slate-100 shadow-xs'
            }`}
          title="Klik untuk memfilter status Batal"
        >
          <div>
            <p className="font-[family-name:var(--font-inter)] text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              Batal
            </p>
            <p className="font-[family-name:var(--font-inter)] text-2xl font-bold text-rose-600">
              {cancelledCount}
            </p>
          </div>
          <p className="font-[family-name:var(--font-inter)] text-[11px] text-slate-400 mt-2">
            Pesanan dibatalkan
          </p>
        </div>
      </div>

      {/* ── Penyaringan & Pencarian (no-print) ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between no-print">
        {/* Left Side: Time and Status Filters */}
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Buttons Filter Waktu */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Semua', val: 'all' },
              { label: 'Per Hari', val: 'day' },
              { label: 'Per Minggu', val: 'week' },
              { label: 'Per Bulan', val: 'month' },
              { label: 'Per Tahun', val: 'year' },
            ].map(btn => (
              <button
                key={btn.val}
                onClick={() => setFilter(btn.val as any)}
                className={`px-3 py-1.5 rounded-lg font-[family-name:var(--font-inter)] text-[12px] font-semibold transition-all cursor-pointer
                           ${filter === btn.val
                             ? 'bg-[#8B5E3C]/10 text-[#8B5E3C] border border-[#8B5E3C]/20'
                             : 'bg-transparent text-slate-500 hover:bg-slate-50 border border-transparent'
                           }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-medium font-[family-name:var(--font-inter)]">Status:</span>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="h-9 pl-3 pr-8 rounded-xl border border-slate-200 font-[family-name:var(--font-inter)] text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] bg-slate-50/50 transition-all cursor-pointer font-semibold appearance-none"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Proses</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Batal</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
            </div>
          </div>
        </div>

        {/* Input Pencarian */}
        <div className="relative w-full lg:w-80 shrink-0">
          <input
            type="text"
            placeholder="Cari ID, nama, no. WA, alamat..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-[family-name:var(--font-inter)] text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C] transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        </div>
      </div>

      {/* ── Penyaringan Kustom Input Panel (no-print) ── */}
      <AnimatePresence>
        {filter !== 'all' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs no-print overflow-hidden -mt-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 text-xs">
              {filter === 'day' && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Pilih Tanggal
                  </label>
                  <input
                    type="date"
                    value={filterDay}
                    onChange={e => setFilterDay(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 font-[family-name:var(--font-inter)] text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] bg-slate-50/50"
                  />
                </div>
              )}

              {filter === 'week' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 w-full">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={filterWeekStart}
                      onChange={e => setFilterWeekStart(e.target.value)}
                      className="h-9 px-3 rounded-lg border border-slate-200 font-[family-name:var(--font-inter)] text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] bg-slate-50/50"
                    />
                  </div>
                  <span className="h-9 flex items-center text-slate-400 hidden sm:inline-block pt-5">—</span>
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      Tanggal Selesai
                    </label>
                    <input
                      type="date"
                      value={filterWeekEnd}
                      onChange={e => setFilterWeekEnd(e.target.value)}
                      className="h-9 px-3 rounded-lg border border-slate-200 font-[family-name:var(--font-inter)] text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] bg-slate-50/50"
                    />
                  </div>

                  {/* Warning range validator */}
                  {(() => {
                    const startMs = new Date(filterWeekStart + 'T00:00:00').getTime();
                    const endMs = new Date(filterWeekEnd + 'T23:59:59').getTime();
                    const isRangeValid = (endMs - startMs) >= 6.9 * 24 * 60 * 60 * 1000;
                    if (!isRangeValid) {
                      return (
                        <div className="h-9 flex items-center text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-1 font-semibold text-[11px] mt-2 sm:mt-0 animate-pulse">
                          ⚠️ Jarak tanggal minimal harus 7 hari!
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              {filter === 'month' && (
                <div className="flex gap-3">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      Bulan
                    </label>
                    <div className="relative">
                      <select
                        value={filterMonth}
                        onChange={e => setFilterMonth(Number(e.target.value))}
                        className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 font-[family-name:var(--font-inter)] text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] bg-slate-50/50 appearance-none cursor-pointer font-medium"
                      >
                        {MONTHS_INDO.map((m, idx) => (
                          <option key={idx} value={idx}>{m}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      Tahun
                    </label>
                    <div className="relative">
                      <select
                        value={filterYear}
                        onChange={e => setFilterYear(Number(e.target.value))}
                        className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 font-[family-name:var(--font-inter)] text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] bg-slate-50/50 appearance-none cursor-pointer font-medium"
                      >
                        {(() => {
                          const years = [];
                          const cy = new Date().getFullYear();
                          for (let y = cy + 1; y >= 2024; y--) years.push(y);
                          return years.map(y => (
                            <option key={y} value={y}>{y}</option>
                          ));
                        })()}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
                    </div>
                  </div>
                </div>
              )}

              {filter === 'year' && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Tahun
                  </label>
                  <div className="relative">
                    <select
                      value={filterYearOnly}
                      onChange={e => setFilterYearOnly(Number(e.target.value))}
                      className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 font-[family-name:var(--font-inter)] text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] bg-slate-50/50 appearance-none cursor-pointer font-medium"
                    >
                      {(() => {
                        const years = [];
                        const cy = new Date().getFullYear();
                        for (let y = cy + 1; y >= 2024; y--) years.push(y);
                        return years.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ));
                      })()}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabel Pesanan Utama (no-print) ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden no-print">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#8B5E3C] w-8 h-8 mb-4" />
            <p className="font-[family-name:var(--font-inter)] text-xs text-slate-400">Memuat data pesanan...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="mx-auto text-slate-300 w-12 h-12 mb-4" strokeWidth={1.5} />
            <p className="font-[family-name:var(--font-inter)] text-sm font-semibold text-slate-600">Tidak Ada Pesanan</p>
            <p className="font-[family-name:var(--font-inter)] text-xs text-slate-400 mt-1">
              Tidak ditemukan pesanan untuk filter "{getFilterText()}"
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-[family-name:var(--font-inter)]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-4 px-6 w-10"></th>
                  <th className="py-4 px-4">Order ID</th>
                  <th className="py-4 px-4">Tanggal</th>
                  <th className="py-4 px-4">Nama Pelanggan</th>
                  <th className="py-4 px-4">No. WA</th>
                  <th className="py-4 px-4 text-right">Total Belanja</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-6 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-[13px] text-slate-700">
                {filteredOrders.map(order => {
                  const shortId = order.id.split('-')[0].toUpperCase();
                  const isExpanded = expandedOrderId === order.id;
                  const orderDateStr = new Date(order.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  });

                  return (
                    <React.Fragment key={order.id}>
                      {/* Baris Utama */}
                      <tr 
                        className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50/20' : ''}`}
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      >
                        <td className="py-4 px-6 text-center text-slate-400" onClick={e => e.stopPropagation()}>
                          <button 
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="p-1 rounded-md hover:bg-slate-200/50 text-slate-400 transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-slate-800 text-[12px]">
                          #{shortId}
                        </td>
                        <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                          {orderDateStr}
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-800">
                          {order.customer_name}
                        </td>
                        <td className="py-4 px-4 font-medium" onClick={e => e.stopPropagation()}>
                          {order.customer_phone ? (
                            <a 
                              href={`https://wa.me/${order.customer_phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#25D366] hover:underline"
                            >
                              <MessageCircle size={14} /> {order.customer_phone}
                            </a>
                          ) : '-'}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-[#8B5E3C]">
                          {formatRupiah(order.grand_total)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="py-4 px-6 text-center" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditClick(order)}
                              className="p-1.5 rounded-lg border border-slate-100 bg-white text-slate-500 hover:text-[#8B5E3C] hover:border-[#8B5E3C]/20 transition-all cursor-pointer shadow-xs active:scale-95"
                              title="Ubah"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="p-1.5 rounded-lg border border-slate-100 bg-white text-slate-500 hover:text-red-600 hover:border-red-100 transition-all cursor-pointer shadow-xs active:scale-95"
                              title="Hapus"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Baris Detail Expandable */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="bg-slate-50/30 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-[family-name:var(--font-inter)] text-slate-600 text-xs">
                              {/* Alamat & Catatan */}
                              <div className="md:col-span-1 space-y-3">
                                <div>
                                  <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-slate-400 mb-1">Alamat Pengiriman</p>
                                  <p className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs text-[12.5px] leading-relaxed">
                                    {order.customer_address || 'Tidak ada alamat pengiriman (Ambil di Toko/Custom Fitting).'}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-slate-400 mb-1">Catatan Tambahan Pesanan</p>
                                  <p className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs text-[12.5px] italic leading-relaxed">
                                    {order.catatan ? `"${order.catatan}"` : 'Tidak ada catatan tambahan.'}
                                  </p>
                                </div>
                              </div>

                              {/* Detail Rincian Barang Belanjaan */}
                              <div className="md:col-span-2 space-y-2">
                                <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-slate-400 mb-1">Daftar Barang Belanjaan</p>
                                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-2xs divide-y divide-slate-50">
                                  {order.order_items && order.order_items.length > 0 ? (
                                    order.order_items.map((item: any, idx: number) => (
                                      <div key={item.id || idx} className="p-3.5 flex justify-between items-center text-[12.5px]">
                                        <div>
                                          <p className="font-semibold text-slate-800">{item.name}</p>
                                          <div className="flex gap-2 text-[10.5px] text-slate-400 mt-1 font-medium">
                                            {item.color && <span>Warna: {item.color}</span>}
                                            {item.size && <span>Ukuran: {item.size}</span>}
                                            {item.unit && <span>Satuan: {item.unit}</span>}
                                          </div>
                                          {item.catatan && (
                                            <p className="text-[11px] text-amber-700 bg-amber-50/50 border border-amber-100/50 rounded-md px-2 py-0.5 mt-1.5 italic">
                                              Note: "{item.catatan}"
                                            </p>
                                          )}
                                        </div>
                                        <div className="text-right shrink-0 ml-4">
                                          <p className="font-bold text-slate-800">{formatRupiah(item.price * item.quantity)}</p>
                                          <p className="text-[11px] text-slate-400 mt-0.5">
                                            {item.quantity.toString().replace(/\./g, ',')} {item.unit} x {formatRupiah(item.price)}
                                          </p>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-4 text-center text-slate-400">Tidak ada detail item pesanan.</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Modal Box Edit Detail Pesanan (no-print) ─── */}
      <AnimatePresence>
        {isEditOpen && editingOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditOpen(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 no-print"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 w-full max-w-2xl mx-auto relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsEditOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
              >
                <X size={18} strokeWidth={1.5} />
              </button>

              <h3 className="font-[family-name:var(--font-inter)] text-lg font-bold text-slate-800 mb-1">
                Edit Detail Pesanan
              </h3>
              <p className="font-[family-name:var(--font-inter)] text-xs text-slate-400 mb-6">
                Ubah informasi kontak pelanggan, status, serta nominal harga dan jumlah belanjaan barang.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                {/* Kolom Kiri: Kontak Pelanggan */}
                <div className="space-y-4">
                  <div>
                    <label className="block font-[family-name:var(--font-inter)] text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Nama Pelanggan
                    </label>
                    <input
                      type="text"
                      value={editCustName}
                      onChange={e => setEditCustName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-[family-name:var(--font-inter)] text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C] transition-all bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block font-[family-name:var(--font-inter)] text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="text"
                      value={editCustPhone}
                      onChange={e => setEditCustPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-[family-name:var(--font-inter)] text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C] transition-all bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block font-[family-name:var(--font-inter)] text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Status Transaksi
                    </label>
                    <div className="relative">
                      <select
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value)}
                        className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 font-[family-name:var(--font-inter)] text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all bg-slate-50/50 appearance-none cursor-pointer font-semibold"
                      >
                        <option value="pending">Pending (Menunggu)</option>
                        <option value="processing">Processing (Proses)</option>
                        <option value="completed">Completed (Selesai)</option>
                        <option value="cancelled">Cancelled (Dibatalkan)</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Alamat & Catatan */}
                <div className="space-y-4">
                  <div>
                    <label className="block font-[family-name:var(--font-inter)] text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Alamat Pengiriman (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={editCustAddress}
                      onChange={e => setEditCustAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-[family-name:var(--font-inter)] text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C] transition-all bg-slate-50/50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-[family-name:var(--font-inter)] text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Catatan Pembelian (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={editCustNotes}
                      onChange={e => setEditCustNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-[family-name:var(--font-inter)] text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C] transition-all bg-slate-50/50 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Rincian Angka Barang */}
              <div className="border-t border-slate-100 pt-5 mb-6">
                <p className="block font-[family-name:var(--font-inter)] text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Detail Nominal & Barang Belanjaan
                </p>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {editItems.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {[item.color && `Warna: ${item.color}`, item.size && `Ukuran: ${item.size}`].filter(Boolean).join(', ')}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        {/* Jumlah Qty */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-400 font-semibold uppercase">Qty ({item.unit})</label>
                          <div className="flex items-center border border-slate-200 rounded-lg h-8 bg-white overflow-hidden w-24">
                            <button
                              type="button"
                              onClick={() => handleItemQtyChange(idx, -1)}
                              className="w-7 h-full text-slate-500 hover:bg-slate-50 transition-colors text-sm cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-[family-name:var(--font-inter)] font-semibold text-slate-700 flex-1 text-center text-xs">
                              {item.quantity.toString().replace(/\./g, ',')}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleItemQtyChange(idx, 1)}
                              className="w-7 h-full text-slate-500 hover:bg-slate-50 transition-colors text-sm cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Harga Satuan */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-400 font-semibold uppercase">Harga Satuan</label>
                          <input
                            type="text"
                            value={item.price}
                            onChange={e => handleItemPriceChange(idx, e.target.value)}
                            className="w-28 px-2.5 h-8 rounded-lg border border-slate-200 font-[family-name:var(--font-inter)] text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] bg-white text-right"
                          />
                        </div>

                        {/* Total per Item */}
                        <div className="flex flex-col gap-1 items-end min-w-[70px]">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">Subtotal</span>
                          <span className="font-bold text-slate-700 h-8 flex items-center">{formatRupiah(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Total */}
              <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <span className="font-[family-name:var(--font-inter)] text-[12px] text-slate-500">Estimasi Total Tagihan Baru:</span>
                  <p className="font-[family-name:var(--font-inter)] text-xl font-bold text-[#8B5E3C]">
                    {formatRupiah(editItems.reduce((acc, item) => acc + (item.price * item.quantity), 0))}
                  </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setIsEditOpen(false)}
                    className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl font-[family-name:var(--font-inter)] text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#8B5E3C] hover:bg-[#DD9E59] text-white rounded-xl font-[family-name:var(--font-inter)] text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <><Loader2 size={13} className="animate-spin" /> Menyimpan...</>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── AREA LAYOUT KHUSUS CETAK PDF REKAP (print-area) ─── */}
      <div id="print-area" className="hidden">
        {/* Kop Surat */}
        <div className="text-center pb-6 border-b-2 border-double border-slate-800 mb-6">
          <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl font-bold text-slate-800">
            TAILORCRAFT CATALOG & CUSTOM TAILOR
          </h2>
          <p className="font-[family-name:var(--font-inter)] text-xs text-slate-500 mt-1">
            Laporan Rekapitulasi Pemesanan Produk & Layanan Online
          </p>
          <p className="font-[family-name:var(--font-inter)] text-[10px] text-slate-400">
            Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Info Filter Laporan */}
        <div className="flex justify-between items-center mb-6 font-[family-name:var(--font-inter)] text-xs">
          <div>
            <p><strong>Periode Rekap:</strong> {getFilterText()}</p>
            <p className="mt-1"><strong>Jumlah Pesanan:</strong> {filteredOrders.length} transaksi</p>
          </div>
          <div className="text-right">
            <p><strong>Total Pendapatan Omzet:</strong></p>
            <p className="text-base font-bold text-[#8B5E3C] mt-0.5">{formatRupiah(totalRevenue)}</p>
          </div>
        </div>

        {/* Tabel Rekap Cetak */}
        <table className="w-full text-left border-collapse border border-slate-300 font-[family-name:var(--font-inter)] text-[11px]">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase">
              <th className="p-2.5 border border-slate-300 w-6 text-center">No</th>
              <th className="p-2.5 border border-slate-300">Order ID</th>
              <th className="p-2.5 border border-slate-300">Tanggal</th>
              <th className="p-2.5 border border-slate-300">Nama Pelanggan</th>
              <th className="p-2.5 border border-slate-300">No. WhatsApp</th>
              <th className="p-2.5 border border-slate-300">Status</th>
              <th className="p-2.5 border border-slate-300 text-right">Total Belanja</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredOrders.map((order, idx) => {
              const shortId = order.id.split('-')[0].toUpperCase();
              const orderDateStr = new Date(order.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric'
              });
              
              return (
                <tr key={order.id}>
                  <td className="p-2 border border-slate-300 text-center">{idx + 1}</td>
                  <td className="p-2 border border-slate-300 font-mono font-bold">#{shortId}</td>
                  <td className="p-2 border border-slate-300 text-slate-600">{orderDateStr}</td>
                  <td className="p-2 border border-slate-300 font-semibold">{order.customer_name}</td>
                  <td className="p-2 border border-slate-300">{order.customer_phone || '-'}</td>
                  <td className="p-2 border border-slate-300 capitalize">{order.status || 'pending'}</td>
                  <td className="p-2 border border-slate-300 text-right font-bold">{formatRupiah(order.grand_total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Tanda Tangan / Lembar Pengesahan */}
        <div className="mt-16 flex justify-end font-[family-name:var(--font-inter)] text-xs">
          <div className="text-center w-52">
            <p>Disahkan oleh,</p>
            <p className="font-bold text-slate-800 mt-16">( Admin TailorCraft )</p>
          </div>
        </div>
      </div>

    </div>
  );
}
