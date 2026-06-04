'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Shirt } from 'lucide-react';
import Link from 'next/link';

const tabs = [
  {
    value: 'dewi',
    icon: <Scissors className="w-4 h-4 shrink-0" />,
    label: 'Dewi Sartika',
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
    value: 'maulana',
    icon: <Shirt className="w-4 h-4 shrink-0" />,
    label: 'Penjahit Maulana',
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

interface DBAboutProfile {
  id: string | number;
  label: string;
  icon: string;
  badge: string;
  title: string;
  description: string;
  services: string[];
  button_text: string;
  button_href: string;
  image: string;
  image_alt: string;
}

export default function AboutSection({ aboutData }: { aboutData?: DBAboutProfile[] }) {
  const activeTabs = aboutData && aboutData.length > 0
    ? aboutData.map(p => ({
        value: p.label.toLowerCase().replace(/\s+/g, '-'),
        icon: p.icon === 'scissors' 
          ? <Scissors className="w-4 h-4 shrink-0" /> 
          : <Shirt className="w-4 h-4 shrink-0" />,
        label: p.label,
        badge: p.badge,
        title: p.title,
        description: p.description,
        services: p.services || [],
        buttonText: p.button_text || '',
        buttonHref: p.button_href || '#',
        image: p.image || '',
        imageAlt: p.image_alt || '',
      }))
    : tabs;

  const [active, setActive] = useState(activeTabs[0]?.value || 'dewi');
  const current = activeTabs.find(t => t.value === active) ?? activeTabs[0];

  if (!current) return null;

  return (
    <section className="py-12 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center mb-10">
          <span className="inline-block py-1 px-4 rounded-full border border-[#DD9E59]/30 bg-[#F0D8A1]/20
                           font-[family-name:var(--font-inter)] text-sm font-semibold text-[#8B5E3C]">
            Tim Penjahit Kami
          </span>
          <h2
            className="font-[family-name:var(--font-instrument-serif)] text-4xl md:text-5xl font-normal text-slate-800 max-w-2xl"
            style={{ letterSpacing: '-0.02em' }}
          >
            Tangan <em className="not-italic italic text-[#8B5E3C]">terampil</em> di balik setiap karya
          </h2>
          <p className="font-[family-name:var(--font-inter)] text-slate-500 text-[15px] max-w-xl leading-relaxed">
            Kenali para ahli yang dengan penuh dedikasi mewujudkan busana impian Anda menjadi kenyataan.
          </p>
        </div>

        {/* Tab Triggers — 2 tab sejajar, lebar sama, tidak wrap */}
        <div className="flex gap-3 max-w-md mx-auto mb-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {activeTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActive(tab.value)}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold
                          font-[family-name:var(--font-inter)] transition-all duration-200 active:scale-95
                          whitespace-nowrap flex-1
                          ${active === tab.value
                            ? 'bg-[#8B5E3C] text-white shadow-[0_4px_12px_rgba(164,114,81,0.30)]'
                            : 'bg-slate-100 text-slate-600 hover:bg-[#F0D8A1]/50 hover:text-[#8B5E3C]'
                          }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content — tinggi card sama dengan min-h */}
        <div className="rounded-3xl bg-slate-50/70 border border-slate-100 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px]"
            >
              {/* Gambar — full height di desktop */}
              <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:min-h-[480px] overflow-hidden order-1 lg:order-2">
                <img
                  src={current.image}
                  alt={current.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                {/* Overlay gradient di mobile */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent lg:hidden" />
              </div>

              {/* Teks */}
              <div className="flex flex-col gap-5 p-6 lg:p-12 order-2 lg:order-1">
                <span className="inline-block w-fit py-1 px-3 rounded-full border border-[#8B5E3C]/20 bg-white
                                 font-[family-name:var(--font-inter)] text-[12px] font-semibold text-[#8B5E3C]">
                  {current.badge}
                </span>
                <h3
                  className="font-[family-name:var(--font-instrument-serif)] text-2xl lg:text-3xl font-normal text-slate-800 leading-tight"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {current.title}
                </h3>
                <p className="font-[family-name:var(--font-inter)] text-slate-600 text-[14px] leading-relaxed">
                  {current.description}
                </p>

                {/* Daftar layanan — horizontal scroll di mobile, wrap di desktop */}
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1
                                [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                                sm:flex-wrap sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
                  {current.services.map(s => (
                    <span key={s}
                      className="font-[family-name:var(--font-inter)] text-[11px] font-semibold
                                 text-[#8B5E3C] bg-[#F0D8A1]/30 border border-[#8B5E3C]/15
                                 px-3 py-1 rounded-full whitespace-nowrap shrink-0">
                      {s}
                    </span>
                  ))}
                </div>

                {current.buttonHref.startsWith('http') ? (
                  <a
                    href={current.buttonHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 w-fit mt-auto
                               font-[family-name:var(--font-inter)] text-[13px] font-semibold
                               px-6 py-3 rounded-2xl bg-[#8B5E3C] text-white
                               hover:bg-[#DD9E59] transition-all duration-300 active:scale-95
                               shadow-[0_4px_16px_rgba(164,114,81,0.25)]"
                  >
                    {current.buttonText}
                  </a>
                ) : (
                  <Link
                    href={current.buttonHref}
                    className="inline-flex items-center gap-2 w-fit mt-auto
                               font-[family-name:var(--font-inter)] text-[13px] font-semibold
                               px-6 py-3 rounded-2xl bg-[#8B5E3C] text-white
                               hover:bg-[#DD9E59] transition-all duration-300 active:scale-95
                               shadow-[0_4px_16px_rgba(164,114,81,0.25)]"
                  >
                    {current.buttonText}
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
