'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, Shirt, MessageSquare, Users, ShoppingBag, 
  TrendingUp, BarChart3, PieChart, Eye, Award, Palette,
  ArrowRight, UserCheck, Calendar, RefreshCw
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    products: 0,
    testimonials: 0,
    clients: 0,
    totalOrders: 0,
    totalRevenue: 0,
    repeatRate: 0,
    totalPageViews: 0,
    uniqueVisitors: 0
  });

  // Aggregated data for charts & tables
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [statusChartData, setStatusChartData] = useState<any[]>([]);
  const [trafficChartData, setTrafficChartData] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [fabricTrends, setFabricTrends] = useState<any[]>([]);
  const [colorTrends, setColorTrends] = useState<any[]>([]);

  // Hover Tooltip States for SVG Charts
  const [activeRevenueIdx, setActiveRevenueIdx] = useState<number | null>(null);
  const [activeTrafficIdx, setActiveTrafficIdx] = useState<number | null>(null);
  const [activeStatusIdx, setActiveStatusIdx] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch basic counts in parallel
      const [
        { count: prodCount },
        { count: testCount },
        { count: clientCount }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('testimonials').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true })
      ]);

      // 2. Fetch all orders with items for advanced calculations
      const { data: orders, error: ordersErr } = await supabase
        .from('orders')
        .select('*, order_items(*)');
      
      if (ordersErr) throw ordersErr;
      const orderList = orders || [];

      // 3. Fetch page views from the last 90 days for traffic
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const { data: pageViews, error: viewsErr } = await supabase
        .from('page_views')
        .select('*')
        .gte('created_at', ninetyDaysAgo.toISOString());
      
      if (viewsErr) throw viewsErr;
      const viewList = pageViews || [];

      // --- CALCULATIONS & AGGREGATIONS ---

      // Revenue (excluding canceled orders)
      const totalRevenue = orderList
        .filter(o => o.status !== 'batal')
        .reduce((sum, o) => sum + (o.grand_total || 0), 0);

      // Repeat Order Rate & Top Customers
      // Group by phone number to identify unique customers
      const customerMap = new Map<string, { name: string; phone: string; orders: number; spent: number }>();
      orderList.forEach(order => {
        const phone = order.customer_phone?.trim() || 'Anonim';
        const name = order.customer_name?.trim() || 'Pelanggan Misterius';
        const total = order.grand_total || 0;
        
        const existing = customerMap.get(phone) || { name, phone, orders: 0, spent: 0 };
        existing.orders += 1;
        if (order.status !== 'batal') {
          existing.spent += total;
        }
        customerMap.set(phone, existing);
      });

      const totalCustomers = customerMap.size;
      const returningCustomers = Array.from(customerMap.values()).filter(c => c.orders > 1).length;
      const repeatRate = totalCustomers > 0 ? Math.round((returningCustomers / totalCustomers) * 100) : 0;

      // Top 5 Customers
      const sortedCustomers = Array.from(customerMap.values())
        .sort((a, b) => b.orders - a.orders || b.spent - a.spent)
        .slice(0, 5);
      setTopCustomers(sortedCustomers);

      // Page Views & Unique Visitors
      const totalPageViews = viewList.length;
      const uniqueVisitors = new Set(viewList.map(v => v.visitor_id)).size;

      // Status Lifecycle
      const statusCounts = { pending: 0, proses: 0, selesai: 0, batal: 0 };
      orderList.forEach(o => {
        const st = o.status as keyof typeof statusCounts;
        if (statusCounts[st] !== undefined) {
          statusCounts[st]++;
        } else {
          statusCounts.pending++;
        }
      });
      
      setStatusChartData([
        { name: 'Pending', count: statusCounts.pending, color: '#DD9E59', bg: 'bg-[#DD9E59]' },
        { name: 'Proses', count: statusCounts.proses, color: '#8B5E3C', bg: 'bg-[#8B5E3C]' },
        { name: 'Selesai', count: statusCounts.selesai, color: '#10B981', bg: 'bg-[#10B981]' },
        { name: 'Batal', count: statusCounts.batal, color: '#EF4444', bg: 'bg-[#EF4444]' }
      ]);

      // Chart 1: Revenue & Order Trends (Last 6 Months)
      const monthsData: any[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleString('id-ID', { month: 'short' });
        monthsData.push({ key: monthKey, label, revenue: 0, orders: 0 });
      }

      orderList.forEach(order => {
        if (!order.created_at) return;
        const date = new Date(order.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthBucket = monthsData.find(m => m.key === key);
        if (monthBucket) {
          monthBucket.orders += 1;
          if (order.status !== 'batal') {
            monthBucket.revenue += (order.grand_total || 0);
          }
        }
      });
      setRevenueChartData(monthsData);

      // Chart 3: Website Traffic (Last 7 Days)
      const trafficData: any[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('id-ID', { weekday: 'short' });
        trafficData.push({ key: dateKey, label, views: 0, visitors: new Set<string>() });
      }

      viewList.forEach(view => {
        if (!view.created_at) return;
        const dateKey = view.created_at.split('T')[0];
        const dayBucket = trafficData.find(t => t.key === dateKey);
        if (dayBucket) {
          dayBucket.views += 1;
          dayBucket.visitors.add(view.visitor_id);
        }
      });

      const formattedTraffic = trafficData.map(t => ({
        ...t,
        views: t.views,
        visitors: t.visitors.size
      }));
      setTrafficChartData(formattedTraffic);

      // Chart 5: Fabric & Color Trends
      const fabricsMap = new Map<string, number>();
      const colorsMap = new Map<string, number>();

      orderList.forEach(order => {
        if (order.status === 'batal') return;
        const items = order.order_items || [];
        items.forEach((item: any) => {
          const fabric = item.name?.trim() || 'Kustom Jas/Baju';
          const color = item.color?.trim() || 'Lainnya';
          const qty = Number(item.quantity) || 1;

          fabricsMap.set(fabric, (fabricsMap.get(fabric) || 0) + qty);
          if (item.color) {
            colorsMap.set(color, (colorsMap.get(color) || 0) + qty);
          }
        });
      });

      const sortedFabrics = Array.from(fabricsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      const sortedColors = Array.from(colorsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      setFabricTrends(sortedFabrics);
      setColorTrends(sortedColors);

      // Set global stats state
      setStats({
        products: prodCount || 0,
        testimonials: testCount || 0,
        clients: clientCount || 0,
        totalOrders: orderList.length,
        totalRevenue,
        repeatRate,
        totalPageViews,
        uniqueVisitors
      });

    } catch (err) {
      console.error('Error fetching dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#8B5E3C] w-10 h-10 mb-4" />
        <span className="font-[family-name:var(--font-inter)] text-sm text-slate-500">Memuat visualisasi analitik...</span>
      </div>
    );
  }

  // --- SVG Line/Area Chart calculations ---
  const chartWidth = 500;
  const chartHeight = 220;
  const paddingLeft = 65;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const maxRevenue = Math.max(...revenueChartData.map(d => d.revenue), 100000);
  const maxOrders = Math.max(...revenueChartData.map(d => d.orders), 5);

  const getRevenueY = (val: number) => {
    return chartHeight - paddingBottom - (val / maxRevenue) * (chartHeight - paddingTop - paddingBottom);
  };

  const getOrdersY = (val: number) => {
    return chartHeight - paddingBottom - (val / maxOrders) * (chartHeight - paddingTop - paddingBottom);
  };

  const getX = (index: number) => {
    const usableWidth = chartWidth - paddingLeft - paddingRight;
    return paddingLeft + index * (usableWidth / 5);
  };

  // Generate SVG paths
  const revenuePoints = revenueChartData.map((d, idx) => ({ x: getX(idx), y: getRevenueY(d.revenue) }));
  const orderPoints = revenueChartData.map((d, idx) => ({ x: getX(idx), y: getOrdersY(d.orders) }));

  const revenuePathD = revenuePoints.length > 0 
    ? `M ${revenuePoints[0].x} ${revenuePoints[0].y} ` + revenuePoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const revenueAreaD = revenuePoints.length > 0
    ? `${revenuePathD} L ${revenuePoints[revenuePoints.length - 1].x} ${chartHeight - paddingBottom} L ${revenuePoints[0].x} ${chartHeight - paddingBottom} Z`
    : '';

  const orderPathD = orderPoints.length > 0
    ? `M ${orderPoints[0].x} ${orderPoints[0].y} ` + orderPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  // --- SVG Donut Calculations ---
  const totalStatusCount = statusChartData.reduce((sum, d) => sum + d.count, 0);
  const donutR = 38;
  const donutCx = 50;
  const donutCy = 50;
  const donutCircumference = 2 * Math.PI * donutR; // 238.76

  let accumulatedStatusPercent = 0;
  const donutSegments = statusChartData.map(item => {
    const percent = totalStatusCount > 0 ? (item.count / totalStatusCount) * 100 : 0;
    const strokeDasharray = `${(percent / 100) * donutCircumference} ${donutCircumference}`;
    const strokeDashoffset = -((accumulatedStatusPercent / 100) * donutCircumference);
    accumulatedStatusPercent += percent;
    return { ...item, percent, strokeDasharray, strokeDashoffset };
  });

  // --- SVG Traffic Bar Chart calculations ---
  const trafficMax = Math.max(...trafficChartData.map(d => d.views), 10);
  const getTrafficHeight = (val: number) => {
    const maxHeight = chartHeight - paddingTop - paddingBottom;
    return (val / trafficMax) * maxHeight;
  };

  const trafficBarWidth = 26;
  const getTrafficBarX = (index: number) => {
    const usableWidth = chartWidth - paddingLeft - paddingRight;
    const spacing = usableWidth / 6;
    return paddingLeft + index * spacing - trafficBarWidth / 2;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header section with refresh button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="font-[family-name:var(--font-instrument-serif)] text-4xl font-normal text-[#8B5E3C] mb-1"
            style={{ letterSpacing: '-0.02em' }}
          >
            Dashboard Analitik <em className="not-italic italic">TailorCraft</em>
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-slate-500 text-[14px]">
            Data performa penjualan, loyalitas pelanggan, statistik pengunjung, dan inventaris bahan terpopuler.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw size={14} className="text-[#8B5E3C]" />
          Segarkan Data
        </button>
      </div>

      {/* ── ROW 1: KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Pendapatan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 flex items-start justify-between">
          <div>
            <p className="font-[family-name:var(--font-inter)] text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
              <TrendingUp size={12} className="text-[#8B5E3C]" />
              Total Pendapatan
            </p>
            <p className="font-[family-name:var(--font-inter)] text-2xl font-bold text-slate-800 tracking-tight">
              {formatRupiah(stats.totalRevenue)}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">
              Pesanan aktif
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-amber-100 bg-amber-50 text-amber-600">
            <ShoppingBag size={18} strokeWidth={1.5} />
          </div>
        </div>

        {/* Card 2: Volume Pesanan */}
        <Link href="/admin/orders" className="block">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-[#8B5E3C]/20 transition-all duration-300 flex items-start justify-between h-full">
            <div>
              <p className="font-[family-name:var(--font-inter)] text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                <BarChart3 size={12} className="text-blue-500" />
                Volume Pesanan
              </p>
              <p className="font-[family-name:var(--font-inter)] text-3xl font-bold text-slate-800">
                {stats.totalOrders}
              </p>
              <span className="text-[11px] text-[#8B5E3C] font-medium hover:underline inline-flex items-center gap-0.5 mt-2">
                Lihat daftar pesanan <ArrowRight size={10} />
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-blue-100 bg-blue-50 text-blue-600">
              <Shirt size={18} strokeWidth={1.5} />
            </div>
          </div>
        </Link>

        {/* Card 3: Repeat Order % */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 flex items-start justify-between">
          <div>
            <p className="font-[family-name:var(--font-inter)] text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
              <UserCheck size={12} className="text-emerald-500" />
              Repeat Order %
            </p>
            <p className="font-[family-name:var(--font-inter)] text-3xl font-bold text-slate-800">
              {stats.repeatRate}%
            </p>
            <span className="text-[11px] text-slate-500 font-normal mt-2 inline-block">
              Loyalitas pelanggan jahit
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-emerald-100 bg-emerald-50 text-emerald-600">
            <Users size={18} strokeWidth={1.5} />
          </div>
        </div>

        {/* Card 4: Kunjungan Web */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 flex items-start justify-between">
          <div>
            <p className="font-[family-name:var(--font-inter)] text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
              <Eye size={12} className="text-indigo-500" />
              Kunjungan Web (90 Hari)
            </p>
            <p className="font-[family-name:var(--font-inter)] text-3xl font-bold text-slate-800">
              {stats.totalPageViews} <span className="text-xs font-normal text-slate-400">views</span>
            </p>
            <span className="text-[11px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full mt-2 inline-block">
              {stats.uniqueVisitors} Pengunjung Unik
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-indigo-100 bg-indigo-50 text-indigo-600">
            <Eye size={18} strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* ── ROW 2: PRIMARY CHARTS (65% / 35%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 1: Tren Pendapatan & Volume Pesanan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2 flex flex-col justify-between min-h-[350px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 font-[family-name:var(--font-inter)] flex items-center gap-1.5">
                <TrendingUp size={16} className="text-[#8B5E3C]" />
                Tren Pendapatan & Volume Pesanan (6 Bulan Terakhir)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Pendapatan kotor vs volume transaksi masuk per bulan.</p>
            </div>
            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-500">
              <div className="flex items-center gap-1">
                <span className="w-3 h-1.5 rounded-xs bg-[#A47251] inline-block" />
                Pendapatan
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-1.5 rounded-xs bg-blue-500 border border-dashed border-blue-500 inline-block" />
                Volume Pesanan
              </div>
            </div>
          </div>

          {/* Interactive SVG Line/Area Chart */}
          <div className="relative flex-1 flex items-center justify-center">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full max-h-[220px]">
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A47251" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#A47251" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[0, 1, 2, 3].map((v) => {
                const y = paddingTop + (v * (chartHeight - paddingTop - paddingBottom)) / 3;
                return (
                  <line 
                    key={v} 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={chartWidth - paddingRight} 
                    y2={y} 
                    stroke="#F1F5F9" 
                    strokeWidth="1" 
                  />
                );
              })}

              {/* X Axis Labels */}
              {revenueChartData.map((d, idx) => (
                <text
                  key={idx}
                  x={getX(idx)}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  className="fill-slate-400 font-semibold text-[10px]"
                >
                  {d.label}
                </text>
              ))}

              {/* Y Axis Labels (Left - Revenue) */}
              {[0, 1, 2, 3].map((v) => {
                const yVal = maxRevenue - (v * maxRevenue) / 3;
                const y = paddingTop + (v * (chartHeight - paddingTop - paddingBottom)) / 3;
                return (
                  <text
                    key={v}
                    x={paddingLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-slate-400 font-semibold text-[9px]"
                  >
                    {yVal >= 1000000 ? `${(yVal / 1000000).toFixed(1)}jt` : `${yVal / 1000}rb`}
                  </text>
                );
              })}

              {/* Y Axis Labels (Right - Orders) */}
              {[0, 1, 2, 3].map((v) => {
                const yVal = Math.round(maxOrders - (v * maxOrders) / 3);
                const y = paddingTop + (v * (chartHeight - paddingTop - paddingBottom)) / 3;
                return (
                  <text
                    key={v}
                    x={chartWidth - paddingRight + 8}
                    y={y + 3}
                    textAnchor="start"
                    className="fill-slate-400 font-semibold text-[9px]"
                  >
                    {yVal}
                  </text>
                );
              })}

              {/* Revenue Area (Gradient fill) */}
              {revenueAreaD && (
                <path d={revenueAreaD} fill="url(#revenueGrad)" />
              )}

              {/* Revenue Line */}
              {revenuePathD && (
                <path 
                  d={revenuePathD} 
                  fill="none" 
                  stroke="#A47251" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Order Volume Line (dashed blue) */}
              {orderPathD && (
                <path 
                  d={orderPathD} 
                  fill="none" 
                  stroke="#3B82F6" 
                  strokeWidth="2" 
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Interactive Dots & Tooltip Lines */}
              {revenueChartData.map((d, idx) => {
                const rx = getX(idx);
                const ry = getRevenueY(d.revenue);
                const oy = getOrdersY(d.orders);

                const isActive = activeRevenueIdx === idx;

                return (
                  <g key={idx}>
                    {/* Hover vertical alignment line */}
                    {isActive && (
                      <line 
                        x1={rx} 
                        y1={paddingTop} 
                        x2={rx} 
                        y2={chartHeight - paddingBottom} 
                        stroke="#A47251" 
                        strokeOpacity="0.3"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Revenue Dot */}
                    <circle 
                      cx={rx} 
                      cy={ry} 
                      r={isActive ? 5 : 3.5} 
                      fill="#FFFFFF" 
                      stroke="#A47251" 
                      strokeWidth={isActive ? 2.5 : 1.5} 
                    />

                    {/* Order Dot */}
                    <circle 
                      cx={rx} 
                      cy={oy} 
                      r={isActive ? 5 : 3.5} 
                      fill="#FFFFFF" 
                      stroke="#3B82F6" 
                      strokeWidth={isActive ? 2.5 : 1.5} 
                    />

                    {/* Invisible hotzones for hovering */}
                    <rect
                      x={rx - 25}
                      y={paddingTop}
                      width={50}
                      height={chartHeight - paddingTop - paddingBottom}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setActiveRevenueIdx(idx)}
                      onMouseLeave={() => setActiveRevenueIdx(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Float Tooltip */}
            {activeRevenueIdx !== null && (
              <div 
                className="absolute z-10 bg-slate-900/95 backdrop-blur-xs text-white p-3 rounded-xl shadow-lg border border-slate-800 text-[11px] space-y-1 animate-in zoom-in-95 duration-150"
                style={{ 
                  left: `${(getX(activeRevenueIdx) / chartWidth) * 100}%`, 
                  top: '10%',
                  transform: 'translateX(-50%)'
                }}
              >
                <p className="font-bold text-center border-b border-slate-700 pb-1 mb-1 text-slate-300">
                  {revenueChartData[activeRevenueIdx].label}
                </p>
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">Omzet:</span>
                  <span className="font-bold text-[#F0D8A1]">{formatRupiah(revenueChartData[activeRevenueIdx].revenue)}</span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">Pesanan:</span>
                  <span className="font-bold text-blue-300">{revenueChartData[activeRevenueIdx].orders} transaksi</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CHART 2: Rasio Status Pesanan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between min-h-[350px]">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 font-[family-name:var(--font-inter)] flex items-center gap-1.5">
              <PieChart size={16} className="text-[#8B5E3C]" />
              Rasio Status Pesanan
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Proporsi siklus pengerjaan pesanan online.</p>
          </div>

          {/* Donut SVG Rendering */}
          <div className="relative flex items-center justify-center my-4">
            {totalStatusCount > 0 ? (
              <>
                <svg viewBox="0 0 100 100" className="w-36 h-36">
                  {/* Background track circle */}
                  <circle 
                    cx={donutCx} 
                    cy={donutCy} 
                    r={donutR} 
                    fill="transparent" 
                    stroke="#F8FAFC" 
                    strokeWidth="11" 
                  />

                  {/* Donut segments */}
                  {donutSegments.map((seg, idx) => {
                    if (seg.percent === 0) return null;
                    const isHovered = activeStatusIdx === idx;
                    return (
                      <circle
                        key={idx}
                        cx={donutCx}
                        cy={donutCy}
                        r={donutR}
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth={isHovered ? 13 : 11}
                        strokeDasharray={seg.strokeDasharray}
                        strokeDashoffset={seg.strokeDashoffset}
                        transform="rotate(-90 50 50)"
                        className="transition-all duration-200 cursor-pointer origin-center"
                        onMouseEnter={() => setActiveStatusIdx(idx)}
                        onMouseLeave={() => setActiveStatusIdx(null)}
                      />
                    );
                  })}
                </svg>

                {/* Donut Inner Label */}
                <div className="absolute text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Total</span>
                  <p className="text-2xl font-black text-slate-700">{totalStatusCount}</p>
                </div>
              </>
            ) : (
              <div className="h-36 flex items-center justify-center text-xs text-slate-400">Belum ada data pesanan</div>
            )}

            {/* Hover status details box */}
            {activeStatusIdx !== null && (
              <div className="absolute -bottom-2 bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-[10px] text-center font-semibold shadow-md">
                {statusChartData[activeStatusIdx].name}: {statusChartData[activeStatusIdx].count} ({Math.round(donutSegments[activeStatusIdx].percent)}%)
              </div>
            )}
          </div>

          {/* Donut Legend */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-50">
            {statusChartData.map((s, idx) => (
              <div 
                key={idx} 
                className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors cursor-default ${activeStatusIdx === idx ? 'bg-slate-50' : ''}`}
                onMouseEnter={() => setActiveStatusIdx(idx)}
                onMouseLeave={() => setActiveStatusIdx(null)}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${s.bg} shrink-0`} />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-700 leading-none">{s.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{s.count} pcs</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── ROW 3: TRAFFIC & TOP CUSTOMERS (50% / 50%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 3: Tren Kunjungan Website */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between min-h-[350px]">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 font-[family-name:var(--font-inter)] flex items-center gap-1.5">
              <Eye size={16} className="text-[#8B5E3C]" />
              Tren Kunjungan Website (7 Hari Terakhir)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Analisis trafik page views harian calon pelanggan.</p>
          </div>

          <div className="relative flex-1 flex items-center justify-center mt-4">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full max-h-[220px]">
              {/* Gridlines */}
              {[0, 1, 2, 3].map((v) => {
                const y = paddingTop + (v * (chartHeight - paddingTop - paddingBottom)) / 3;
                return (
                  <line 
                    key={v} 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={chartWidth - paddingRight} 
                    y2={y} 
                    stroke="#F1F5F9" 
                    strokeWidth="1" 
                  />
                );
              })}

              {/* X Axis labels */}
              {trafficChartData.map((t, idx) => (
                <text
                  key={idx}
                  x={getTrafficBarX(idx) + trafficBarWidth / 2}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  className="fill-slate-400 font-semibold text-[10px]"
                >
                  {t.label}
                </text>
              ))}

              {/* Y Axis labels */}
              {[0, 1, 2, 3].map((v) => {
                const yVal = Math.round(trafficMax - (v * trafficMax) / 3);
                const y = paddingTop + (v * (chartHeight - paddingTop - paddingBottom)) / 3;
                return (
                  <text
                    key={v}
                    x={paddingLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-slate-400 font-semibold text-[9px]"
                  >
                    {yVal}
                  </text>
                );
              })}

              {/* Bars */}
              {trafficChartData.map((t, idx) => {
                const x = getTrafficBarX(idx);
                const h = getTrafficHeight(t.views);
                const y = chartHeight - paddingBottom - h;
                const isHovered = activeTrafficIdx === idx;

                return (
                  <g key={idx}>
                    {/* SVG Rect with gradient colors */}
                    <rect
                      x={x}
                      y={y}
                      width={trafficBarWidth}
                      height={Math.max(h, 2)}
                      rx={4}
                      fill={isHovered ? '#8B5E3C' : '#DD9E59'}
                      opacity={isHovered ? 1 : 0.8}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setActiveTrafficIdx(idx)}
                      onMouseLeave={() => setActiveTrafficIdx(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {activeTrafficIdx !== null && (
              <div 
                className="absolute z-10 bg-slate-900/95 backdrop-blur-xs text-white p-2.5 rounded-lg shadow-lg border border-slate-800 text-[10px] space-y-1 animate-in zoom-in-95 duration-150"
                style={{ 
                  left: `${(getTrafficBarX(activeTrafficIdx) / chartWidth) * 100}%`, 
                  top: '10%',
                  transform: 'translateX(-50%)'
                }}
              >
                <p className="font-bold text-center border-b border-slate-700 pb-1 mb-1 text-slate-300">
                  {trafficChartData[activeTrafficIdx].key}
                </p>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Page Views:</span>
                  <span className="font-bold text-[#F0D8A1]">{trafficChartData[activeTrafficIdx].views} views</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Pengunjung:</span>
                  <span className="font-bold text-indigo-300">{trafficChartData[activeTrafficIdx].visitors} user</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PANEL 4: Pelanggan Setia */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between min-h-[350px]">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 font-[family-name:var(--font-inter)] flex items-center gap-1.5">
              <Award size={16} className="text-[#8B5E3C]" />
              Pelanggan Paling Setia (Leaderboard)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Top 5 pelanggan dengan transaksi pemesanan terbanyak.</p>
          </div>

          <div className="flex-1 mt-4 overflow-x-auto">
            {topCustomers.length > 0 ? (
              <table className="w-full text-[13px] text-slate-600 font-[family-name:var(--font-inter)]">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="text-left pb-2 font-semibold">Nama Pelanggan</th>
                    <th className="text-center pb-2 font-semibold">Frekuensi</th>
                    <th className="text-right pb-2 font-semibold">Total Belanja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {topCustomers.map((cust, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pr-2">
                        <p className="font-semibold text-slate-800">{cust.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{cust.phone}</p>
                      </td>
                      <td className="py-3 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 bg-amber-50 text-[#8B5E3C] rounded-full text-xs font-semibold">
                          {cust.orders} kali
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-slate-800">
                        {formatRupiah(cust.spent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Belum ada data pelanggan jahit</div>
            )}
          </div>
        </div>

      </div>

      {/* ── ROW 4: INVENTORY & FABRIC TRENDS (100%) ── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-800 font-[family-name:var(--font-inter)] flex items-center gap-1.5">
            <Palette size={16} className="text-[#8B5E3C]" />
            Tren Bahan & Warna Terpopuler (Fabric & Color Trends)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Analisis preferensi jenis pakaian/bahan kain dan warna pesanan masuk.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bahan Terpopuler */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
              <Shirt size={12} className="text-[#8B5E3C]" />
              Peringkat Pakaian / Bahan Terpopuler
            </h3>
            {fabricTrends.length > 0 ? (
              <div className="space-y-3">
                {fabricTrends.map((f, idx) => {
                  const maxCount = Math.max(...fabricTrends.map(t => t.count), 1);
                  const widthPercent = (f.count / maxCount) * 100;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-[family-name:var(--font-inter)]">
                        <span className="font-semibold text-slate-700">{f.name}</span>
                        <span className="font-bold text-slate-500">{f.count} item</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#DD9E59] to-[#8B5E3C] rounded-full transition-all duration-500" 
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4">Belum ada data kain dari pesanan masuk</p>
            )}
          </div>

          {/* Warna Terpopuler */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
              <Palette size={12} className="text-[#8B5E3C]" />
              Peringkat Warna Pilihan Pelanggan
            </h3>
            {colorTrends.length > 0 ? (
              <div className="space-y-3">
                {colorTrends.map((c, idx) => {
                  const maxCount = Math.max(...colorTrends.map(t => t.count), 1);
                  const widthPercent = (c.count / maxCount) * 100;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-[family-name:var(--font-inter)]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                          {c.name}
                        </span>
                        <span className="font-bold text-slate-500">{c.count} pcs</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#DD9E59] rounded-full transition-all duration-500" 
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4">Belum ada data warna dari pesanan masuk</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
