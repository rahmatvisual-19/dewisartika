'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Globe, MapPin, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ContactProps {
  title?:       string;
  description?: string;
  web?:         { label: string; url: string };
  address?:     string;
}

export default function ContactForm({
  title       = "Hubungi Kami",
  description = "Punya pertanyaan tentang layanan custom, material, atau ingin mengatur jadwal fitting? Isi form di bawah dan pesan Anda akan langsung dikirim via WhatsApp.",
  web: initialWeb,
  address: initialAddress,
}: ContactProps) {
  const [tailors, setTailors] = useState<{ name: string; phone: string }[]>([]);
  const [web, setWeb] = useState(initialWeb || { label: "www.tailorcraft.com", url: "https://tailorcraft.com" });
  const [address, setAddress] = useState(initialAddress || "Jl. Sudirman No. 123, Jakarta Selatan");

  const [firstname, setFirstname] = useState('');
  const [lastname,  setLastname]  = useState('');
  const [alamat,    setAlamat]    = useState('');
  const [subject,   setSubject]   = useState('');
  const [message,   setMessage]   = useState('');
  const [recipient, setRecipient] = useState('');
  const [open,      setOpen]      = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          const tailorsList = data.filter(c => c.type === 'tailor').map(c => ({ name: c.name || '', phone: c.value }));
          const addressesList = data.filter(c => c.type === 'address').map(c => c.value);
          const websitesList = data.filter(c => c.type === 'website').map(c => ({ label: c.name || '', url: c.value }));

          if (tailorsList.length > 0) setTailors(tailorsList);
          if (addressesList.length > 0) setAddress(addressesList[0]);
          if (websitesList.length > 0) setWeb(websitesList[0]);
        } else {
          setTailors([
            { name: 'Dewi Sartika',     phone: '6281362989136' },
            { name: 'Penjahit Maulana', phone: '6285262472451' },
          ]);
        }
      } catch (err) {
        console.error('Error fetching contacts in client view:', err);
        setTailors([
          { name: 'Dewi Sartika',     phone: '6281362989136' },
          { name: 'Penjahit Maulana', phone: '6285262472451' },
        ]);
      }
    };

    fetchContacts();
  }, [initialWeb, initialAddress]);

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 " +
    "font-[family-name:var(--font-inter)] text-sm text-slate-800 placeholder:text-slate-400 " +
    "focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C] " +
    "transition-all duration-200";

  const labelClass =
    "block font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-700 mb-1.5";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) { setError('Pilih penjahit yang ingin dihubungi.'); return; }
    setError('');

    const tailor = tailors.find(t => t.name === recipient);
    if (!tailor) return;

    const nama = [firstname, lastname].filter(Boolean).join(' ') || 'Pelanggan';
    const lines = [
      `Halo ${tailor.name},`,
      `Nama saya: ${nama}`,
      alamat  ? `Alamat: ${alamat}`       : null,
      subject ? `Keperluan: ${subject}`   : null,
      '',
      message,
    ].filter((l): l is string => l !== null);

    window.open(
      `https://wa.me/${tailor.phone}?text=${encodeURIComponent(lines.join('\n'))}`,
      '_blank'
    );
  };

  return (
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-20">

          {/* ── Kolom Kiri ── */}
          <div className="flex flex-col gap-8 flex-1">
            <div className="text-center lg:text-left">
              <h1
                className="font-[family-name:var(--font-instrument-serif)] text-5xl md:text-6xl font-normal text-[#8B5E3C] mb-4"
                style={{ letterSpacing: '-0.02em' }}
              >
                {title.split(' ')[0]}{' '}
                <em className="not-italic italic">{title.split(' ').slice(1).join(' ')}</em>
              </h1>
              <p className="font-[family-name:var(--font-inter)] text-slate-500 text-[15px] leading-relaxed">
                {description}
              </p>
            </div>

            <div className="bg-[#F0D8A1]/20 p-6 rounded-2xl border border-[#F0D8A1]/50 space-y-3">
              {[
                { icon: Globe,  label: 'Website', value: web.label, href: web.url, external: true  },
                { icon: MapPin, label: 'Alamat',  value: address,   href: null,    external: false },
              ].map(({ icon: Icon, label, value, href, external }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#8B5E3C] shadow-sm shrink-0">
                    <Icon size={14} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-inter)] text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                      {label}
                    </p>
                    {href ? (
                      <a href={href}
                         target={external ? '_blank' : undefined}
                         rel={external ? 'noopener noreferrer' : undefined}
                         className="font-[family-name:var(--font-inter)] text-[13px] text-slate-700 hover:text-[#8B5E3C] transition-colors">
                        {value}
                      </a>
                    ) : (
                      <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-700">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Kolom Kanan: Form ── */}
          <div className="flex-1 rounded-[2rem] border border-slate-100 bg-white p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="mb-6">
              <h3 className="font-[family-name:var(--font-inter)] text-xl font-bold text-slate-800 mb-1">
                Kirim Pesan
              </h3>
              <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500">
                Pesan akan dikirim langsung via WhatsApp ke penjahit pilihan Anda.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Pilih penjahit */}
              <div>
                <label className={labelClass}>Hubungi *</label>
                <div className="relative">
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setOpen(v => !v)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border
                                font-[family-name:var(--font-inter)] text-sm transition-all text-left
                                ${recipient ? 'text-slate-800' : 'text-slate-400'}
                                ${open
                                  ? 'border-[#8B5E3C] ring-2 ring-[#8B5E3C]/30 bg-white'
                                  : 'border-slate-200 bg-slate-50/50'
                                }`}
                  >
                    {recipient || 'Pilih penjahit...'}
                    <ChevronDown size={16} strokeWidth={1.5}
                      className={`text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
                  </button>

                  {open && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg z-20 overflow-hidden">
                      {tailors.map(t => (
                        <button
                          key={t.phone}
                          type="button"
                          onClick={() => { setRecipient(t.name); setOpen(false); setError(''); }}
                          className={`w-full text-left px-4 py-3 font-[family-name:var(--font-inter)] text-[13px]
                                      hover:bg-[#F0D8A1]/20 transition-colors
                                      ${recipient === t.name ? 'text-[#8B5E3C] font-semibold bg-[#F0D8A1]/10' : 'text-slate-700'}`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {error && (
                  <p className="font-[family-name:var(--font-inter)] text-[12px] text-red-500 mt-1">{error}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="firstname" className={labelClass}>Nama Depan</label>
                  <input type="text" id="firstname" placeholder="Nama depan" required
                    suppressHydrationWarning
                    value={firstname} onChange={e => setFirstname(e.target.value)}
                    className={inputClass} />
                </div>
                <div className="flex-grow">
                  <label htmlFor="lastname" className={labelClass}>Nama Belakang</label>
                  <input type="text" id="lastname" placeholder="Nama belakang"
                    suppressHydrationWarning
                    value={lastname} onChange={e => setLastname(e.target.value)}
                    className={inputClass} />
                </div>
              </div>

              <div>
                <label htmlFor="address" className={labelClass}>Alamat</label>
                <input type="text" id="address" placeholder="Jl. Contoh No. 1, Kota"
                  suppressHydrationWarning
                  value={alamat} onChange={e => setAlamat(e.target.value)}
                  className={inputClass} />
              </div>

              <div>
                <label htmlFor="subject" className={labelClass}>Subjek / Keperluan</label>
                <input type="text" id="subject" placeholder="Cth: Konsultasi Gaun Pengantin"
                  suppressHydrationWarning
                  value={subject} onChange={e => setSubject(e.target.value)}
                  className={inputClass} />
              </div>

              <div>
                <label htmlFor="message" className={labelClass}>Pesan Anda *</label>
                <textarea
                  id="message" rows={5} required
                  placeholder="Tuliskan detail pertanyaan atau pesanan Anda di sini..."
                  value={message} onChange={e => setMessage(e.target.value)}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                suppressHydrationWarning
                className="w-full h-12 inline-flex items-center justify-center gap-2
                           font-[family-name:var(--font-inter)] text-[14px] font-semibold
                           bg-[#25D366] text-white rounded-xl cursor-pointer
                           hover:bg-[#1ebe5d] transition-all duration-300
                           shadow-[0_4px_16px_rgba(37,211,102,0.25)]
                           active:scale-[0.98] mt-1"
              >
                <MessageCircle size={16} strokeWidth={1.5} />
                Kirim via WhatsApp
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
