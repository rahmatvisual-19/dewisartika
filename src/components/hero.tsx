"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import SoftGradient from '@/components/SoftGradient';
import { cn } from '@/lib/utils';

// ==========================================
// 1. BUTTON COMPONENT
// ==========================================
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#A65D43] text-white hover:bg-[#8D4A32] active:scale-95",
        destructive: "bg-red-500 text-white hover:bg-red-500/90",
        outline: "border border-[#A65D43] text-[#A65D43] bg-transparent hover:bg-[#A65D43] hover:text-white active:scale-95",
        secondary: "bg-[#F0D8A1] text-[#8B5E3C] hover:bg-[#F0D8A1]/80",
        ghost: "hover:bg-[#F0D8A1] hover:text-[#8B5E3C]",
        link: "text-[#A65D43] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";


// ==========================================
// 2. HERO SECTION COMPONENT
// ==========================================
interface StatProps {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface ActionProps {
  text: string;
  href: string;
  variant?: ButtonProps['variant'];
  className?: string;
}

interface HeroSectionProps {
  title: React.ReactNode;
  subtitle: string;
  actions: ActionProps[];
  stats: StatProps[];
  images: string[];
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const floatingVariants = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
  },
};

const HeroSection = ({ title, subtitle, actions, stats, images, className }: HeroSectionProps) => {
  return (
    <section className={cn('w-full overflow-hidden bg-transparent pt-6 pb-8 sm:pt-10 sm:pb-14 relative', className)}>
      <SoftGradient variant="hero" />
      <div className="container mx-auto grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8 px-4 md:px-8 max-w-7xl relative z-10">

        {/* Kolom Kiri: Teks */}
        <motion.div
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="tracking-tight" variants={itemVariants}>
            {title}
          </motion.div>          <motion.p className="mt-6 max-w-md text-lg text-slate-600" variants={itemVariants}>
            {subtitle}
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start"
            variants={itemVariants}
          >
            {actions.map((action, index) => {
              const isExternal = action.href.startsWith('http');
              return (
                <Button key={index} variant={action.variant} size="lg" className={action.className} asChild>
                  {isExternal ? (
                    <a href={action.href} target="_blank" rel="noopener noreferrer">
                      {action.text}
                    </a>
                  ) : (
                    <Link href={action.href}>{action.text}</Link>
                  )}
                </Button>
              );
            })}
          </motion.div>
          <motion.div
            className="mt-12 flex flex-wrap justify-center gap-8 lg:justify-start"
            variants={itemVariants}
          >
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0D8A1]/50">
                  {stat.icon}
                </div>
                <div className="text-left">
                  <p
                    className="font-[family-name:var(--font-inter)] text-2xl font-bold text-[#1A1A1A] leading-none"
                  >
                    {stat.value}
                  </p>
                  <p
                    className="font-[family-name:var(--font-inter)] text-[12px] font-medium text-[#596A80] mt-0.5 tracking-wide"
                  >
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Kolom Kanan: Gambar */}
        <motion.div
          className="relative h-[350px] w-full sm:h-[420px]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Decorative Shapes */}
          <motion.div
            className="absolute -top-4 left-1/4 h-16 w-16 rounded-full bg-[#8B5E3C]/20"
            variants={floatingVariants}
            animate="animate"
          />
          <motion.div
            className="absolute bottom-0 right-1/4 h-12 w-12 rounded-lg bg-[#DD9E59]/20"
            variants={floatingVariants}
            animate="animate"
            style={{ transitionDelay: '0.5s' }}
          />
          <motion.div
            className="absolute bottom-1/4 left-4 h-6 w-6 rounded-full bg-[#DCF0C3]/50"
            variants={floatingVariants}
            animate="animate"
            style={{ transitionDelay: '1s' }}
          />

          {/* Images */}
          <motion.div
            className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-2xl bg-white p-2 shadow-xl sm:h-64 sm:w-64 z-10"
            variants={imageVariants}
          >
            <img src={images[0]} alt="Koleksi busana TailorCraft - tampilan utama"
              fetchPriority="high"
              className="h-full w-full rounded-xl object-cover" />
          </motion.div>
          <motion.div
            className="absolute right-0 top-1/3 h-40 w-40 rounded-2xl bg-white p-2 shadow-xl sm:h-56 sm:w-56 z-20"
            variants={imageVariants}
          >
            <img src={images[1]} alt="Detail kain premium TailorCraft"
              loading="lazy"
              className="h-full w-full rounded-xl object-cover" />
          </motion.div>
          <motion.div
            className="absolute bottom-0 left-0 h-32 w-32 rounded-2xl bg-white p-2 shadow-xl sm:h-48 sm:w-48 z-20"
            variants={imageVariants}
          >
            <img src={images[2]} alt="Hasil jahitan custom TailorCraft"
              loading="lazy"
              className="h-full w-full rounded-xl object-cover" />
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
