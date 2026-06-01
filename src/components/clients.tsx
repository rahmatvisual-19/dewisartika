'use client';

import { cn } from '@/lib/utils';
import { useMotionValue, animate, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import useMeasure from 'react-use-measure';
import SoftGradient from '@/components/SoftGradient';

// ==========================================
// 1. DATA DUMMY LOGO
// ==========================================
type Logo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

const logos: Logo[] = [
  { src: "https://svgl.app/library/nvidia-wordmark-light.svg", alt: "Nvidia Logo" },
  { src: "https://svgl.app/library/supabase_wordmark_light.svg", alt: "Supabase Logo" },
  { src: "https://svgl.app/library/openai_wordmark_light.svg", alt: "OpenAI Logo" },
  { src: "https://svgl.app/library/turso-wordmark-light.svg", alt: "Turso Logo" },
  { src: "https://svgl.app/library/vercel_wordmark.svg", alt: "Vercel Logo" },
  { src: "https://svgl.app/library/github_wordmark_light.svg", alt: "GitHub Logo" },
  { src: "https://svgl.app/library/claude-ai-wordmark-icon_light.svg", alt: "Claude AI Logo" },
  { src: "https://svgl.app/library/clerk-wordmark-light.svg", alt: "Clerk Logo" },
];

// ==========================================
// 2. LOGIKA INFINITE SLIDER (Animasi)
// ==========================================
type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
};

function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [currentDuration, setCurrentDuration] = useState(duration);
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    let controls;
    const size = direction === 'horizontal' ? width : height;
    const contentSize = size > 0 ? size + gap : 1000; 
    const from = reverse ? -contentSize / 2 : 0;
    const to = reverse ? 0 : -contentSize / 2;

    if (isTransitioning) {
      controls = animate(translation, [translation.get(), to], {
        ease: 'linear',
        duration: currentDuration * Math.abs((translation.get() - to) / contentSize),
        onComplete: () => {
          setIsTransitioning(false);
          setKey((prevKey) => prevKey + 1);
        },
      });
    } else {
      controls = animate(translation, [from, to], {
        ease: 'linear',
        duration: currentDuration,
        repeat: Infinity,
        repeatType: 'loop',
        repeatDelay: 0,
        onRepeat: () => {
          translation.set(from);
        },
      });
    }

    return controls?.stop;
  }, [
    key, translation, currentDuration, width, height, gap, isTransitioning, direction, reverse,
  ]);

  const hoverProps = durationOnHover
    ? {
        onHoverStart: () => {
          setIsTransitioning(true);
          setCurrentDuration(durationOnHover);
        },
        onHoverEnd: () => {
          setIsTransitioning(true);
          setCurrentDuration(duration);
        },
      }
    : {};

  return (
    <div className={cn('overflow-hidden', className)}>
      <motion.div
        className='flex w-max'
        style={{
          ...(direction === 'horizontal' ? { x: translation } : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
        }}
        ref={ref}
        {...hoverProps}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

// ==========================================
// 3. KOMPONEN LOGO CLOUD UTAMA (Export)
// ==========================================
export function LogoCloud({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full overflow-hidden py-6", className)}>
      <SoftGradient variant="clients" />
      {/* Efek Blur Glow di Latar Belakang */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute left-1/2 top-1/2 -z-10 h-[100vmin] w-[100vmin] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none",
          "bg-[radial-gradient(ellipse_at_center,rgba(244,143,104,0.05),transparent_50%)]",
          "blur-[30px]"
        )}
      />

      <section className="relative mx-auto max-w-5xl">
        {/* Garis pemisah atas */}
        <div className="mx-auto mb-6 h-px w-full max-w-3xl bg-slate-200 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />

        {/* Pemanggilan Slider + Mapping Data */}
        <div className="overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black,transparent)]">
          <InfiniteSlider gap={42} reverse duration={40} durationOnHover={80}>
            {logos.map((logo) => (
              <img
                key={`logo-${logo.alt}`}
                alt={logo.alt}
                src={logo.src}
                width={logo.width || "auto"}
                height={logo.height || "auto"}
                loading="lazy"
                decoding="async"
                className="pointer-events-none h-4 md:h-5 select-none opacity-60 transition-opacity duration-200 hover:opacity-100"
              />
            ))}
          </InfiniteSlider>
        </div>

        {/* Garis pemisah bawah */}
        <div className="mx-auto mt-6 h-px w-full max-w-3xl bg-slate-200 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
      </section>
    </div>
  );
}