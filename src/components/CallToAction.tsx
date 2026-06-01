'use client';

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import Link from "next/link";
import SoftGradient from "@/components/SoftGradient";

// ==========================================
// 1. KOMPONEN MARQUEE (Gambar Berjalan)
// ==========================================
interface MarqueeProps {
  children: ReactNode;
  pauseOnHover?: boolean;
  reverse?: boolean;
  className?: string;
  speed?: number;
}

function Marquee({
  children,
  pauseOnHover = false,
  reverse = false,
  className,
  speed = 40,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "group flex overflow-hidden [--gap:1rem] [gap:var(--gap)]",
        className
      )}
      style={{ "--duration": `${speed}s` } as React.CSSProperties}
    >
      <div
        className={cn(
          "flex min-w-full shrink-0 items-center justify-around gap-[var(--gap)] animate-marquee [will-change:transform]",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex min-w-full shrink-0 items-center justify-around gap-[var(--gap)] animate-marquee [will-change:transform]",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}

// ==========================================
// 2. DATA GAMBAR (Tema Tailoring)
// ==========================================
const images = [
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1605289982774-9a6fef564df8?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop",
];

const images2 = [
  "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=400&h=400&fit=crop",
];

// ==========================================
// 3. KOMPONEN TOMBOL
// ==========================================
function CTAButton() {
  return (
    <Link
      href="/kontak"
      style={{
        display: 'inline-block',
        padding: '16px 40px',
        backgroundColor: '#A47251',
        color: '#ffffff',
        borderRadius: '9999px',
        fontFamily: 'var(--font-inter)',
        fontSize: '14px',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        minWidth: '200px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(164,114,81,0.25)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.opacity = '0.82';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      onMouseDown={e => (e.currentTarget.style.transform = 'translateY(0) scale(0.97)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
    >
      Hubungi Kami
    </Link>
  );
}

// ==========================================
// 4. KOMPONEN CTA UTAMA (Export)
// ==========================================
export default function CallToAction() {
  return (
    <section className="py-12 bg-white text-slate-800 flex items-center overflow-hidden relative">
      <SoftGradient variant="cta" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Bagian Kiri: Marquee Grid */}
          <div className="space-y-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <Marquee speed={30} reverse className="[--gap:1rem]">
              {images.map((src, idx) => (
                <div
                  key={idx}
                  className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden flex-shrink-0 shadow-lg"
                >
                  <img
                    src={src}
                    alt={`Koleksi TailorCraft ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </Marquee>
            <Marquee speed={35} className="[--gap:1rem]">
              {images2.map((src, idx) => (
                <div
                  key={idx}
                  className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden flex-shrink-0 shadow-lg"
                >
                  <img
                    src={src}
                    alt={`Koleksi TailorCraft ${idx + 5}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </Marquee>
          </div>

          {/* Bagian Kanan: Teks & Tombol */}
          <div className="space-y-8 lg:pl-10 text-center lg:text-left">
            <h2
              className="font-[family-name:var(--font-instrument-serif)] text-5xl md:text-6xl lg:text-7xl font-normal text-tailor-primary leading-tight"
              style={{ letterSpacing: '-0.02em' }}
            >
              Wujudkan <em className="not-italic italic">Desain</em> <br /> Impian Anda
            </h2>
            <div className="space-y-1 font-[family-name:var(--font-inter)] text-slate-500">
              <p className="text-[15px]">Konsultasi Gratis.</p>
              <p className="text-[15px]">TailorCraft Studio Eksklusif.</p>
            </div>

            <div className="pt-2">
              <CTAButton />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}