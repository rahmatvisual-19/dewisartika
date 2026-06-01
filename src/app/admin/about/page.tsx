'use client';

import { useState } from 'react';
import { UserCircle, Save, CheckCircle } from 'lucide-react';
import { AdminAboutEditor, AboutPerson } from '@/components/admin/AdminAboutComponents';

const initialPersons: AboutPerson[] = [
  {
    id: 'dewi',
    label: 'Dewi Sartika',
    icon: 'scissors',
    badge: 'Spesialis Pakaian Wanita',
    title: 'Keindahan dalam setiap detail busana wanita.',
    description:
      'Dewi Sartika adalah ahli di balik keanggunan busana wanita TailorCraft. Dengan keahlian mendalam dalam teknik memayet, bordir, dan sablon custom, ia menghadirkan sentuhan artistik yang tak tertandingi pada setiap karya. Mulai dari peralatan jahit berkualitas, jasa permak profesional, hingga pembuatan kebaya dan pakaian wanita penuh simbol — semua dikerjakan dengan penuh dedikasi dan cita rasa seni yang tinggi.',
    services: [
      'Penjualan Peralatan Menjahit',
      'Jasa Permak Profesional',
      'Spesialis Pakaian Wanita',
      'Memayet & Hiasan Busana',
      'Simbol & Aksesori Pakaian',
      'Bordir & Sablon Custom',
    ],
    buttonText: 'Konsultasi dengan Dewi',
    buttonHref: '/kontak',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=800&auto=format&fit=crop',
    imageAlt: 'Dewi Sartika — Spesialis pakaian wanita TailorCraft',
  },
  {
    id: 'maulana',
    label: 'Penjahit Maulana',
    icon: 'shirt',
    badge: 'Spesialis Jas & Pakaian Formal',
    title: 'Ketegasan potongan untuk penampilan terbaik pria.',
    description:
      'Penjahit Maulana adalah maestro di balik setiap setelan jas dan pakaian formal TailorCraft. Dengan presisi tingkat tinggi dan pemahaman mendalam tentang proporsi tubuh, ia menghadirkan jas bespoke, pakaian dinas pemerintahan, serta pakaian formal dan custom untuk pria maupun wanita yang tidak hanya indah dipandang, tetapi juga nyaman dipakai sepanjang hari.',
    services: [
      'Spesialis Jas Pria & Wanita',
      'Pakaian Dinas Pemerintahan',
      'Pakaian Formal Pria & Wanita',
      'Pakaian Custom Pria & Wanita',
      'Setelan Bespoke',
      'Seragam Instansi & Korporat',
    ],
    buttonText: 'Konsultasi dengan Maulana',
    buttonHref: '/kontak',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
    imageAlt: 'Penjahit Maulana — Spesialis jas dan pakaian formal TailorCraft',
  },
];

export default function AdminAboutPage() {
  const [persons, setPersons] = useState<AboutPerson[]>(initialPersons);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: kirim ke API / database
    console.log('Saved about data:', persons);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="font-[family-name:var(--font-inter)] text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-[#F0D8A1]/30 text-[#A47251] rounded-lg">
              <UserCircle size={18} strokeWidth={1.5} />
            </div>
            About Me
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mt-1">
            Kelola profil, foto, dan layanan masing-masing penjahit yang tampil di halaman utama.
          </p>
        </div>
      </div>

      {/* Editor */}
      <AdminAboutEditor persons={persons} onChange={setPersons} />

      {/* Tombol Simpan */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl shrink-0
                      font-[family-name:var(--font-inter)] text-[13px] font-semibold
                      transition-all duration-200 active:scale-95 shadow-md
                      ${saved
                        ? 'bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.30)]'
                        : 'bg-[#A47251] text-white shadow-[0_4px_12px_rgba(164,114,81,0.25)] hover:bg-[#DD9E59]'
                      }`}
        >
          {saved ? (
            <>
              <CheckCircle size={15} strokeWidth={1.5} />
              Tersimpan
            </>
          ) : (
            <>
              <Save size={15} strokeWidth={1.5} />
              Simpan Perubahan
            </>
          )}
        </button>
      </div>

    </div>
  );
}
