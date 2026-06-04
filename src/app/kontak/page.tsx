import ContactForm from '@/components/ContactForm';

export default function KontakPage() {
  return (
    <main className="min-h-screen pt-6 md:pt-20 pb-12 bg-slate-50/50 relative">
      {/* Ornamen background */}
      <div className="absolute top-0 right-0 w-1/2 h-[500px] bg-gradient-to-b from-[#F0D8A1]/30 to-transparent blur-3xl -z-10 pointer-events-none" />
      <ContactForm />
    </main>
  );
}
