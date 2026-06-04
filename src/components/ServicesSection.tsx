'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, ShoppingBag, Users, Briefcase, Wand2, Sparkles, ChevronRight } from 'lucide-react';
import SoftGradient from '@/components/SoftGradient';

// ─── Data Layanan ─────────────────────────────────────────────────────────────
const services = [
  {
    id: 1,
    title: 'Suplai Kebutuhan Menjahit',
    description: 'Menyediakan kain berkualitas premium, benang, kancing, dan berbagai aksesoris jahitan terbaik untuk kebutuhan Anda.',
    icon: ShoppingBag,
  },
  {
    id: 2,
    title: 'Jasa Permak Profesional',
    description: 'Perbaikan dan penyesuaian ukuran pakaian lama Anda agar kembali pas, nyaman, dan terlihat seperti baru.',
    icon: Scissors,
  },
  {
    id: 3,
    title: 'Spesialis Jas & Kebaya',
    description: 'Pembuatan jas pria berpotongan rapi dan kebaya wanita yang anggun, dikerjakan dengan detail presisi tinggi.',
    icon: Sparkles,
  },
  {
    id: 4,
    title: 'Seragam Bridesmaid',
    description: 'Rancang busana serasi untuk para pengiring pengantin agar tampil memukau dan seragam di hari bahagia Anda.',
    icon: Users,
  },
  {
    id: 5,
    title: 'Pakaian Dinas Pemerintahan',
    description: 'Pembuatan seragam dinas harian (PDH) dan seragam resmi lainnya dengan standar pola dan kualitas yang ditetapkan.',
    icon: Briefcase,
  },
  {
    id: 6,
    title: 'Custom Pakaian Formal',
    description: 'Wujudkan desain busana impian Anda dari nol. Kami melayani pembuatan gaun, kemeja, dan pakaian formal lainnya.',
    icon: Wand2,
  },
  // Layanan tambahan — muncul saat "Lihat Semua" diklik
  {
    id: 7,
    title: 'Bordir & Sablon Custom',
    description: 'Tambahkan sentuhan personal pada busana Anda dengan bordir nama, logo, atau motif pilihan menggunakan benang premium.',
    icon: Sparkles,
  },
  {
    id: 8,
    title: 'Konsultasi Desain Gratis',
    description: 'Diskusikan ide dan referensi desain Anda bersama tim stylist kami sebelum proses pembuatan dimulai.',
    icon: Wand2,
  },
  {
    id: 9,
    title: 'Pengiriman ke Seluruh Indonesia',
    description: 'Layanan pengiriman aman dengan packaging khusus agar busana Anda tiba dalam kondisi sempurna di mana pun Anda berada.',
    icon: Briefcase,
  },
  {
    id: 10,
    title: 'Bordir Nama, Logo & Teks Custom',
    description: 'Hadirkan identitas unik pada setiap busana dengan layanan bordir presisi tinggi. Nama, logo perusahaan, atau teks pilihan Anda dikerjakan dengan benang berkualitas tinggi yang tahan lama, menghasilkan detail yang tajam dan elegan di atas berbagai jenis kain.',
    icon: Sparkles,
  },
  {
    id: 11,
    title: 'Sablon Logo, Nama & Teks Custom',
    description: 'Tampilkan branding Anda dengan percaya diri melalui layanan sablon custom kami. Menggunakan tinta sablon premium yang tidak mudah luntur dan retak, cocok untuk seragam komunitas, kaos event, hingga merchandise eksklusif dengan hasil cetak yang tajam dan tahan cuci.',
    icon: Wand2,
  },
  {
    id: 12,
    title: 'Melayani Partai Besar, Kecil & Satuan',
    description: 'Tidak ada pesanan yang terlalu kecil atau terlalu besar bagi kami. Kami melayani pemesanan mulai dari satu potong untuk kebutuhan personal hingga ratusan potong untuk seragam instansi, komunitas, atau korporat — dengan standar kualitas dan ketepatan waktu yang sama di setiap pesanan.',
    icon: Users,
  },
];

const INITIAL_COUNT = 6;

// ─── Animasi ─────────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonServiceCard() {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 flex flex-col gap-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 animate-pulse" />
      <div className="h-4 w-2/3 rounded-full bg-slate-100 animate-pulse" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded-full bg-slate-100 animate-pulse" />
        <div className="h-3 w-4/5 rounded-full bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────
function ServiceCard({ service }: { service: typeof services[0] }) {
  const Icon = service.icon;
  return (
    <motion.div
      variants={itemVariants}
      layout
      className="group bg-white p-8 rounded-3xl border border-slate-100
                 hover:border-[#8B5E3C]/30
                 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-xl
                 transition-all duration-300 relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#F0D8A1] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl z-0" />
      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-[#8B5E3C] mb-6
                        group-hover:bg-[#8B5E3C] group-hover:text-white transition-colors duration-300">          <Icon size={28} />
        </div>
        <h3 className="font-[family-name:var(--font-inter)] text-[15px] font-semibold text-slate-800 mb-3
                       group-hover:text-[#8B5E3C] transition-colors duration-300">
          {service.title}
        </h3>
        <p className="font-[family-name:var(--font-inter)] text-slate-500 leading-relaxed text-sm">
          {service.description}
        </p>
      </div>
    </motion.div>
  );
}

// ─── DESKTOP / TABLET VIEW ────────────────────────────────────────────────────
function DesktopTabletView() {
  const [showAll, setShowAll]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const gridRef                   = useRef<HTMLDivElement>(null);

  const visible = showAll ? services : services.slice(0, INITIAL_COUNT);
  const hasMore = services.length > INITIAL_COUNT;

  const handleToggle = () => {
    if (!showAll) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setShowAll(true);
      }, 500);
    } else {
      setShowAll(false);
      gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <div ref={gridRef}>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {visible.map(s => <ServiceCard key={s.id} service={s} />)}
            {/* Skeleton saat loading tambahan */}
            {isLoading && Array.from({ length: 3 }).map((_, i) => (
              <motion.div key={`sk-${i}`} variants={itemVariants} initial="hidden" animate="visible">
                <SkeletonServiceCard />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mt-8"
        >
          <button
            onClick={handleToggle}
            disabled={isLoading}
            className="inline-flex items-center gap-2
                       font-[family-name:var(--font-inter)] text-[13.5px] font-semibold
                       px-7 py-3 rounded-2xl
                       border border-[#8B5E3C]/30 text-[#8B5E3C] bg-white
                       hover:bg-[#8B5E3C] hover:text-white hover:border-[#8B5E3C]
                       disabled:opacity-60 disabled:cursor-not-allowed
                       transition-all duration-300 active:scale-95
                       shadow-[0_2px_12px_rgba(164,114,81,0.10)]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#8B5E3C]/30 border-t-[#8B5E3C] rounded-full animate-spin" />
                Memuat...
              </span>
            ) : showAll ? (
              'Sembunyikan'
            ) : (
              <>Lihat Semua Layanan <ChevronRight size={15} strokeWidth={2} /></>
            )}
          </button>
        </motion.div>
      )}
    </>
  );
}

// ─── MOBILE VIEW: Horizontal Snap Scroll ─────────────────────────────────────
function MobileView() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef                     = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    // Lebar card = 80vw, gap = 16px
    const cardWidth = el.offsetWidth * 0.8 + 16;
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(index);
  };

  return (
    <>
      {/* Horizontal snap scroll container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="region"
        aria-label="Daftar layanan, geser untuk melihat lebih banyak"
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory
                   pb-4 -mx-4 px-4
                   scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]
                   [&::-webkit-scrollbar]:hidden"
      >
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className="snap-start shrink-0 w-[80vw] max-w-[300px]
                         bg-white rounded-3xl border border-slate-100 p-6
                         shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#8B5E3C] mb-5">
                <Icon size={24} />
              </div>
              <h3 className="font-[family-name:var(--font-inter)] text-[14px] font-semibold text-slate-800 mb-2 leading-snug">
                {service.title}
              </h3>
              <p className="font-[family-name:var(--font-inter)] text-[12px] text-slate-500 leading-relaxed">
                {service.description}
              </p>
            </div>
          );
        })}

        {/* Peek spacer — agar kartu terakhir tidak mentok */}
        <div className="shrink-0 w-4" />
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {services.map((_, i) => (
          <button
            key={i}
            aria-label={`Layanan ${i + 1}`}
            onClick={() => {
              const el = scrollRef.current;
              if (!el) return;
              const cardWidth = el.offsetWidth * 0.8 + 16;
              el.scrollTo({ left: i * cardWidth, behavior: 'smooth' });
            }}
            className={`rounded-full transition-all duration-300
              ${i === activeIndex
                ? 'w-5 h-2 bg-[#8B5E3C]'
                : 'w-2 h-2 bg-slate-300'
              }`}
          />
        ))}
      </div>
    </>
  );
}

// ─── Responsive Wrapper ───────────────────────────────────────────────────────
export default function ServicesSection() {
  const [view, setView] = useState<'mobile' | 'desktop' | null>(null);

  useEffect(() => {
    const update = () => setView(window.innerWidth < 768 ? 'mobile' : 'desktop');
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <section id="layanan" className="py-12 bg-white relative overflow-hidden">
      <SoftGradient variant="services" />
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Ornamen blur — tidak mempengaruhi layout */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-[#F0D8A1]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-[#8B5E3C]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block py-1 px-4 rounded-full border border-[#DD9E59]/30 bg-[#F0D8A1]/20 text-[#8B5E3C] font-[family-name:var(--font-inter)] text-sm font-semibold mb-4">
              Apa yang Kami Tawarkan
            </div>
            <h2 className="font-[family-name:var(--font-instrument-serif)] text-4xl md:text-5xl font-normal text-[#8B5E3C] mb-3"
                style={{ letterSpacing: '-0.02em' }}>
              Layanan <em className="not-italic italic">Kami</em>
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-[family-name:var(--font-inter)] text-slate-500 text-[15px] leading-relaxed"
          >
            Dedikasi kami untuk memberikan pengalaman berbusana terbaik melalui berbagai layanan yang dirancang khusus untuk memenuhi gaya dan kebutuhan Anda.
          </motion.p>
        </div>

        {/* Render per breakpoint */}
        {view === 'mobile'  && <MobileView />}
        {view === 'desktop' && <DesktopTabletView />}
        {view === null && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonServiceCard key={i} />)}
          </div>
        )}

      </div>
    </section>
  );
}
