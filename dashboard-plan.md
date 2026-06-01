# Panduan Implementasi Dashboard Admin (Desktop & Mobile)
Proyek: **Katalog Tailoring (Katalog Bunda)**

Dokumen ini menjelaskan rancangan tata letak, kebutuhan informasi, integrasi warna, serta contoh kode Next.js lengkap untuk mengimplementasikan Dashboard Admin yang responsif (desktop & mobile-friendly).

---

## 1. Arsitektur & Informasi Utama Dashboard

Dashboard admin dirancang menggunakan pendekatan **Mobile-First** dan **Action-Oriented**, sehingga admin dapat dengan mudah memantau dan mengelola katalog langsung dari smartphone maupun PC desktop.

### A. Tampilan Desktop vs Tampilan Mobile
| Informasi / Fitur | Desktop | Mobile (Smartphone) | Urgensi |
| :--- | :---: | :---: | :---: |
| **Grid Metrik (KPIs)** | 4 Kolom (Lengkap) | 2 Kolom (Kompak) | **Tinggi** |
| **Tindakan Cepat (Quick Actions)** | Tombol Grid Berjajar | Tombol Grid Sentuh Besar | **Tinggi** |
| **Moderasi Ulasan Baru** | Detail Lengkap & Aksi | Kartu Ringkas (Scrollable) | **Tinggi** |
| **Tips & Panduan Butik** | Tampil di Sidebar Kanan | Diletakkan di Bagian Bawah | Sedang |
| **Grafik Tren Populer** | Visual Chart (Bar/Pie) | Disederhanakan (List) | Rendah |

---

## 2. Integrasi Palet Warna & Desain UI/UX Premium
Sesuai dengan panduan estetika butik penjahit mewah yang ada pada [warna.md](file:///e:/0%20PERSIAPAN%20DUNIA%20KERJA/TEMPLATE/katalog-tailoring/warna.md):

* **Warna Utama (#A47251 - Cokelat Gelap):** Digunakan untuk judul section (`Selamat Datang, Admin`), teks angka statistik besar, dan tombol utama. Memberikan kesan berwibawa, klasik, dan premium.
* **Warna Sekunder & Hover (#DD9E59 - Emas/Krem Hangat):** Digunakan untuk ikon penunjuk metrik, efek *hover* pada tombol utama, serta border pemisah interaktif.
* **Latar Belakang Sekunder (#F0D8A1 - Krem Lembut):** Digunakan sebagai latar belakang kartu tips atau pembeda section tertentu agar tampilan tidak monoton.
* **Aksen Pelengkap (#DCF0C3 - Hijau Pastel):** Digunakan untuk penanda status positif (seperti badge status ulasan "Baru" atau status produk "Aktif").

---

## 3. Implementasi Kode Dashboard (`src/app/admin/page.tsx`)

Berikut adalah kode lengkap untuk diimplementasikan di halaman dashboard admin (`src/app/admin/page.tsx`). Kode ini sudah dioptimalkan agar responsif secara otomatis menggunakan Tailwind CSS, dilengkapi dengan ikon dari **Lucide React**.

```tsx
'use client';

import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Package, 
  PhoneCall, 
  Star, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight 
} from 'lucide-react';

export default function AdminDashboardPage() {
  // Data dummy statistik (Bisa dihubungkan ke Supabase/API nantinya)
  const stats = [
    { label: 'Total Produk', value: '24', icon: Package, description: 'Produk dalam katalog' },
    { label: 'Ulasan Masuk', value: '156', icon: MessageSquare, description: 'Testimoni terdaftar' },
    { label: 'Klien Portfolio', value: '12', icon: Star, description: 'Klien custom terpublikasi' },
    { label: 'Klik Hubungi', value: '382', icon: PhoneCall, description: 'Total ketukan WhatsApp' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* ── 1. Bagian Header Welcome ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 
            className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl font-normal text-[#A47251] mb-2"
            style={{ letterSpacing: '-0.02em' }}
          >
            Selamat Datang, <em className="not-italic italic">Admin</em>
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-slate-500 text-[14px]">
            Pantau statistik katalog dan kelola ulasan butik Anda dengan mudah di sini.
          </p>
        </div>
        
        {/* Indikator Waktu/Status saat ini */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-100/60 px-3 py-1.5 rounded-full text-slate-600 text-[12px] font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Sistem Terhubung (Supabase)
        </div>
      </div>

      {/* ── 2. Grid Statistik (Responsif: 2 Kolom di Mobile, 4 Kolom di Desktop) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, description }) => (
          <div 
            key={label} 
            className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-[#DD9E59]/40 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                {label}
              </span>
              <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-[#F0D8A1]/20 transition-colors">
                <Icon size={16} className="text-[#DD9E59]" />
              </div>
            </div>
            <div>
              <p className="font-[family-name:var(--font-inter)] text-2xl md:text-3xl font-bold text-[#A47251] mb-1">
                {value}
              </p>
              <p className="text-slate-400 text-[11px] hidden md:block">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. Panel Tindakan Cepat (Sangat Berguna untuk Akses HP) ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-[#DD9E59]" />
          <h2 className="font-[family-name:var(--font-inter)] text-slate-800 text-[14px] font-semibold">
            Tindakan Cepat (Quick Actions)
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a 
            href="/admin/product?action=new" 
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#A47251] hover:bg-[#DD9E59] text-white transition-all text-[13px] font-medium active:scale-95 text-center"
          >
            <Plus size={16} />
            <span>Tambah Produk</span>
          </a>
          <a 
            href="/admin/ulasan" 
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-slate-200 hover:border-[#DD9E59] text-slate-700 transition-all text-[13px] font-medium active:scale-95 text-center"
          >
            <MessageSquare size={16} className="text-[#DD9E59]" />
            <span>Ulasan Masuk</span>
          </a>
          <a 
            href="/admin/hero" 
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-slate-200 hover:border-[#DD9E59]/60 text-slate-700 transition-all text-[13px] font-medium active:scale-95 text-center"
          >
            <span>Ubah Banner Hero</span>
          </a>
          <a 
            href="/admin/kontak" 
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-slate-200 hover:border-[#DD9E59]/60 text-slate-700 transition-all text-[13px] font-medium active:scale-95 text-center"
          >
            <span>Update WhatsApp</span>
          </a>
        </div>
      </div>

      {/* ── 4. Layout Kolom Ganda (Ulasan Terbaru & Panduan Butik) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Moderasi Ulasan (Tampil Optimal di HP & PC) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-[family-name:var(--font-inter)] text-slate-800 text-[14px] font-semibold">
              Ulasan Terbaru Menunggu Moderasi
            </h2>
            <a 
              href="/admin/ulasan" 
              className="text-[12px] text-[#A47251] hover:text-[#DD9E59] font-medium flex items-center gap-1"
            >
              Lihat Semua <ArrowUpRight size={14} />
            </a>
          </div>
          
          <div className="space-y-3">
            {[
              { nama: 'Bunda Rini', ulasan: 'Jahitan kebaya sangat rapi dan pas di badan! Puas sekali belanja di sini.', rating: 5, tanggal: 'Baru saja' },
              { nama: 'Ahmad Fauzi', ulasan: 'Bahan jas tebal dan potongan modern. Jahitan sangat rapi untuk acara formal.', rating: 5, tanggal: '2 jam lalu' }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="p-4 bg-slate-50/70 hover:bg-slate-50 rounded-xl flex flex-col justify-between gap-3 border border-slate-100/50"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-800 text-[13px]">{item.nama}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#DCF0C3] text-emerald-800 font-bold uppercase tracking-wider">
                      {item.tanggal}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[12px] line-clamp-2 leading-relaxed">
                    "{item.ulasan}"
                  </p>
                </div>
                {/* Tombol aksi cepat sentuh di mobile */}
                <div className="flex justify-end gap-2 border-t border-slate-200/40 pt-2.5">
                  <button className="px-3.5 py-1.5 rounded-lg bg-[#DCF0C3] text-emerald-900 text-[11px] font-semibold active:scale-95 hover:bg-[#bce496] transition-all">
                    Setujui
                  </button>
                  <button className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold active:scale-95 transition-all">
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Tips Bisnis / Info Latar Belakang (Lebih Ramping) */}
        <div className="bg-[#F0D8A1]/20 p-6 rounded-2xl border border-[#F0D8A1]/40 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#A47251]">
              <TrendingUp size={18} />
              <h3 className="font-[family-name:var(--font-inter)] text-[14px] font-bold">
                Tips Foto Katalog
              </h3>
            </div>
            <p className="text-slate-600 text-[13px] leading-relaxed">
              Foto dengan pencahayaan alami di pagi hari akan memunculkan tekstur asli kain (seperti brokat, sutra, atau batik tulis) secara sempurna. Pelanggan lebih menyukai foto detail jahitan dekat.
            </p>
          </div>
          
          <div className="border-t border-[#F0D8A1]/60 pt-4 text-[12px] text-slate-500">
            Butuh bantuan? Silakan hubungi tim IT pengelola katalog Anda.
          </div>
        </div>

      </div>

    </div>
  );
}
```

---

## 4. Panduan Pengujian Desain Responsif

Untuk memastikan dashboard di atas berjalan dengan mulus dan estetik pada semua ukuran layar:

1. **Pengujian Layar Mobile (Lebar < 640px):**
   * Pastikan **Grid Metrik** terbagi menjadi 2 kolom sehingga teks angka tidak keluar dari kartu (*overflow*).
   * Tombol-tombol di **Tindakan Cepat (Quick Actions)** harus memiliki tinggi minimal 48px agar nyaman ditekan menggunakan ibu jari.
2. **Pengujian Layar Desktop (Lebar > 1024px):**
   * Pastikan layout secara otomatis meregang menjadi susunan 3 kolom (2 kolom untuk Ulasan, 1 kolom untuk Tips Katalog di sebelah kanan).
   * Efek *hover border* pada kartu metrik harus transisi dengan mulus.

---

> [!NOTE]
> Panduan ini dapat langsung Anda gunakan sebagai referensi kode utama di proyek Next.js Anda atau dijadikan panduan dokumentasi bagi developer. Estetika warna telah disesuaikan agar serasi dengan identitas butik yang premium.
