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
import { supabase } from '@/lib/supabase';

export default async function Home() {
  // Default fallback images
  let activeImages = [
    'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?q=80&w=800&auto=format&fit=crop',
  ];

  let aboutMeData: any[] = [];
  let adminCtaPhone = '628123456789';

  try {
    const { data: dbImages, error: heroError } = await supabase
      .from('hero_images')
      .select('image_url')
      .order('order_index', { ascending: true });

    if (!heroError && dbImages && dbImages.length > 0) {
      const urls = dbImages.map(img => img.image_url).filter(Boolean);
      if (urls.length > 0) {
        // Isi slot 1, 2, 3 dengan gambar dari DB jika tersedia, jika tidak gunakan default fallback
        activeImages = [
          urls[0] || activeImages[0],
          urls[1] || activeImages[1],
          urls[2] || activeImages[2],
        ];
      }
    }

    const { data: dbAbout, error: aboutError } = await supabase
      .from('about_me')
      .select('*')
      .order('id', { ascending: true });

    if (!aboutError && dbAbout) {
      // Fetch contacts to dynamically resolve links
      const { data: dbContacts } = await supabase
        .from('contacts')
        .select('*');

      const foundAdminCta = dbContacts?.find(c => c.type === 'admin_cta');
      if (foundAdminCta) {
        adminCtaPhone = foundAdminCta.value;
      }

      aboutMeData = dbAbout.map(item => {
        let buttonHref = item.button_href || '/kontak';
        if (buttonHref.startsWith('contact:')) {
          const contactId = buttonHref.split(':')[1];
          const foundContact = dbContacts?.find(c => c.id.toString() === contactId);
          if (foundContact && foundContact.type === 'tailor') {
            buttonHref = `https://wa.me/${foundContact.value}`;
          } else {
            buttonHref = '/kontak';
          }
        }
        return {
          ...item,
          button_href: buttonHref
        };
      });
    }
  } catch (err) {
    console.error('Error fetching data from database:', err);
  }

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
      { text: 'Konsultasi Desain', href: `https://wa.me/${adminCtaPhone}`, variant: 'outline' as const },
    ],
    stats: [
      { value: '2.5K+', label: 'Klien Puas', icon: <Users className="h-5 w-5 text-[#E89B7E]" /> },
      { value: '15+', label: 'Penjahit Ahli', icon: <Scissors className="h-5 w-5 text-[#E89B7E]" /> },
      { value: '100+', label: 'Koleksi Kain', icon: <Shirt className="h-5 w-5 text-[#E89B7E]" /> },
    ],
    images: activeImages,
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
      <AboutSection aboutData={aboutMeData} />
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
