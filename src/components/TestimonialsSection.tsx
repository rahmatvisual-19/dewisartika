'use client';

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import SoftGradient from "@/components/SoftGradient";

// ==========================================
// 1. DATA DUMMY TESTIMONIALS (Tema Tailor)
// ==========================================
const testimonials = [
  {
    text: "Pengerjaan jas untuk pernikahan saya sangat rapi. Ukurannya pas di badan dan bahannya sangat nyaman dipakai seharian. Terima kasih TailorCraft!",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "Dimas Anggara",
    role: "Groom",
  },
  {
    text: "Luar biasa! Seragam bridesmaid kami selesai tepat waktu dengan kualitas jahitan butik. Semua teman saya sangat puas dengan modelnya.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "Sarah Wijayanto",
    role: "Bride-to-be",
  },
  {
    text: "Sangat profesional. Kemeja kerja custom saya potongannya sangat presisi, berbeda jauh dengan kemeja ready-to-wear yang biasa saya beli.",
    image: "https://randomuser.me/api/portraits/men/46.jpg",
    name: "Andi Pratama",
    role: "Eksekutif Perusahaan",
  },
  {
    text: "Permak gaun malam saya hasilnya sangat halus. Jahitan aslinya tetap terjaga dan sekarang pas banget di badan. Pelayanannya juga ramah.",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    name: "Lestari",
    role: "Pelanggan Setia",
  },
  {
    text: "Pilihan kainnya sangat lengkap dan berkualitas premium. Konsultasi desainnya juga sangat membantu merealisasikan ide baju saya.",
    image: "https://randomuser.me/api/portraits/women/24.jpg",
    name: "Bunga Jelitha",
    role: "Fashion Enthusiast",
  },
  {
    text: "Seragam dinas kantor kami dipesan di sini. Detail bordir dan kerapian jahitannya luar biasa. Sangat direkomendasikan untuk instansi.",
    image: "https://randomuser.me/api/portraits/men/78.jpg",
    name: "Budi Santoso",
    role: "Kepala Bagian Umum",
  },
  {
    text: "Kebaya wisuda saya hasilnya memukau! Payetnya dijahit dengan sangat teliti. Benar-benar membuat hari spesial saya makin sempurna.",
    image: "https://randomuser.me/api/portraits/women/90.jpg",
    name: "Alya",
    role: "Mahasiswi",
  },
  {
    text: "Kualitas tidak pernah bohong. Sudah tiga kali saya bikin setelan jas di sini dan hasilnya selalu konsisten memuaskan. Top markotop!",
    image: "https://randomuser.me/api/portraits/men/55.jpg",
    name: "Hendra",
    role: "Pengusaha",
  },
  {
    text: "Harga sangat sebanding dengan kualitas. Dari fitting pertama sampai pengambilan barang, prosesnya sangat mulus dan tepat waktu.",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
    name: "Diana",
    role: "Dokter",
  },
];

// Membagi data menjadi 3 kolom
const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

// ==========================================
// 2. KOMPONEN KOLOM ANIMASI
// ==========================================
const TestimonialsColumn = (props: {
  className?: string;
  testimonials: typeof testimonials;
  duration?: number;
}) => {
  return (
    <div className={cn("overflow-hidden", props.className)}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 15, // Disesuaikan agar tidak terlalu cepat
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {/* Menggandakan data agar scroll infinite terlihat mulus */}
        {[...new Array(2)].fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, image, name, role }, i) => (
              <div 
                className="p-8 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_25px_rgba(244,143,104,0.1)] transition-shadow duration-300 max-w-[320px] w-full mx-auto" 
                key={i}
                role="article"
                aria-label={`Testimoni dari ${name}`}
              >
                <div className="font-[family-name:var(--font-inter)] text-slate-600 text-sm leading-relaxed mb-6">
                  "{text}"
                </div>
                <div className="flex items-center gap-4">
                  <img
                    src={image}
                    alt={name}
                    className="h-12 w-12 rounded-full object-cover border-2 border-tailor-surface"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="flex flex-col">
                    <div className="font-[family-name:var(--font-inter)] font-semibold text-slate-800 tracking-wide">{name}</div>
                    <div className="font-[family-name:var(--font-inter)] text-xs text-tailor-primary font-medium">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

// ==========================================
// 3. KOMPONEN UTAMA (Export)
// ==========================================
export default function TestimonialsSection() {
  return (
    <section className="py-12 bg-slate-50/50 relative overflow-hidden">
      <SoftGradient variant="testimonials" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-2xl mx-auto mb-8 text-center"
        >
          <div className="inline-block py-1 px-4 rounded-full border border-tailor-secondary/30 bg-tailor-surface/20 text-tailor-primary font-[family-name:var(--font-inter)] text-sm font-semibold mb-6">
            Testimoni Pelanggan
          </div>

          <h2 className="font-[family-name:var(--font-instrument-serif)] text-4xl md:text-5xl font-normal text-tailor-primary mb-4"
              style={{ letterSpacing: '-0.02em' }}>
            Kepercayaan <em className="not-italic italic">Mereka</em>
          </h2>
          <p className="font-[family-name:var(--font-inter)] text-slate-500 text-[15px] leading-relaxed">
            Kisah nyata dari klien yang telah mempercayakan penampilan terbaik mereka bersama karya jahitan kami.
          </p>
        </motion.div>

        {/* Area Kolom Animasi dengan Masking Atas-Bawah */}
        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] h-[600px] md:h-[700px] overflow-hidden">
          {/* Kolom 1 (Tampil di semua layar) */}
          <TestimonialsColumn testimonials={firstColumn} duration={25} />
          
          {/* Kolom 2 (Disembunyikan di HP, tampil di Tablet/Desktop) */}
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={30} />
          
          {/* Kolom 3 (Disembunyikan di HP/Tablet, tampil di Desktop) */}
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={22} />
        </div>
      </div>
      
    </section>
  );
}