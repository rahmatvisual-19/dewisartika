import { Users, Scissors, Shirt } from 'lucide-react';
import { Suspense } from 'react';
import HeroSection from '@/components/hero';
import { LogoCloud } from '@/components/clients';
import ProductShowcase from '@/components/ProductShowcase';
import ServicesSection from '@/components/ServicesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';
import AboutSection from '@/components/AboutSection';

export default function Home() {
  const heroData = {
    title: (
      <h1
        className="font-[family-name:var(--font-instrument-serif)] text-5xl sm:text-7xl font-normal leading-[1.1] block"
        style={{ letterSpacing: '-0.02em', color: '#1A1A1A' }}
      >
        Seni{' '}
        <em className="not-italic italic">Jahitan</em>
        <br />
        <span className="text-[#E89B7E]">Sempurna</span>
      </h1>
    ),
    subtitle: 'Wujudkan busana impian Anda bersama TailorCraft. Kami menggabungkan material premium dengan presisi tingkat tinggi untuk setiap mahakarya.',
    actions: [
      { text: 'Lihat Katalog', href: '/katalog', variant: 'default' as const },
      { text: 'Konsultasi Desain', href: '/kontak', variant: 'outline' as const },
    ],
    stats: [
      { value: '2.5K+', label: 'Klien Puas', icon: <Users className="h-5 w-5 text-[#E89B7E]" /> },
      { value: '15+', label: 'Penjahit Ahli', icon: <Scissors className="h-5 w-5 text-[#E89B7E]" /> },
      { value: '100+', label: 'Koleksi Kain', icon: <Shirt className="h-5 w-5 text-[#E89B7E]" /> },
    ],
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?q=80&w=800&auto=format&fit=crop',
    ],
  };

  return (
    <main className="pt-[68px] bg-white">
      <HeroSection
        title={heroData.title}
        subtitle={heroData.subtitle}
        actions={heroData.actions}
        stats={heroData.stats}
        images={heroData.images}
      />
      <LogoCloud />
      <AboutSection />
      <ProductShowcase />
      <ServicesSection />
      <Suspense fallback={<div className="h-[600px] bg-slate-50/50" aria-hidden="true" />}>
        <TestimonialsSection />
      </Suspense>
      <Suspense fallback={<div className="h-[400px] bg-white" aria-hidden="true" />}>
        <CallToAction />
      </Suspense>
      <Footer />
    </main>
  );
}
