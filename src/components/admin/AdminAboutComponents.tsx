'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Shirt, Upload, X, Plus, Trash2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AboutPerson {
  id: string;
  label: string;
  icon: 'scissors' | 'shirt';
  badge: string;
  title: string;
  description: string;
  services: string[];
  buttonText: string;
  buttonHref: string;
  image: string;
  imageAlt: string;
}

// ─── Image Upload ─────────────────────────────────────────────────────────────
function ImageUpload({
  image,
  imageAlt,
  onChange,
}: {
  image: string;
  imageAlt: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(URL.createObjectURL(file));
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <p className="font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-700">
        Foto Penjahit
      </p>

      {/* Preview */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
        {image ? (
          <>
            <img src={image} alt={imageAlt} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 backdrop-blur-sm
                           font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-800
                           shadow-lg hover:bg-white transition-all duration-150"
              >
                <Upload size={15} strokeWidth={1.5} />
                Ganti Foto
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center gap-2
                       hover:bg-slate-50 transition-colors duration-150"
          >
            <div className="w-12 h-12 rounded-full bg-[#F0D8A1]/40 flex items-center justify-center text-[#A47251]">
              <Upload size={22} strokeWidth={1.5} />
            </div>
            <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 font-medium">
              Upload Foto
            </p>
            <p className="font-[family-name:var(--font-inter)] text-[11px] text-slate-400">
              JPG, PNG, WebP
            </p>
          </button>
        )}
      </div>

      {/* Tombol ganti di bawah preview */}
      {image && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                     border border-dashed border-[#A47251]/40 bg-[#F0D8A1]/10
                     font-[family-name:var(--font-inter)] text-[13px] font-medium text-[#A47251]
                     hover:bg-[#F0D8A1]/20 transition-all duration-150"
        >
          <Upload size={14} strokeWidth={1.5} />
          Ganti Foto
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

// ─── Services Editor ──────────────────────────────────────────────────────────
function ServicesEditor({
  services,
  onChange,
}: {
  services: string[];
  onChange: (services: string[]) => void;
}) {
  const [newService, setNewService] = useState('');

  const handleAdd = () => {
    const trimmed = newService.trim();
    if (!trimmed) return;
    onChange([...services, trimmed]);
    setNewService('');
  };

  const handleRemove = (index: number) => {
    onChange(services.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <p className="font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-700">
        Daftar Layanan
      </p>

      {/* Tag list */}
      <div className="flex flex-wrap gap-2 min-h-[36px]">
        <AnimatePresence>
          {services.map((s, i) => (
            <motion.span
              key={s + i}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                         font-[family-name:var(--font-inter)] text-[11px] font-semibold
                         text-[#A47251] bg-[#F0D8A1]/30 border border-[#A47251]/15"
            >
              {s}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="text-[#A47251]/60 hover:text-red-500 transition-colors"
              >
                <X size={11} strokeWidth={2} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Input tambah */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newService}
          onChange={e => setNewService(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tambah layanan baru..."
          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white
                     font-[family-name:var(--font-inter)] text-[13px] text-slate-700
                     placeholder:text-slate-400 focus:outline-none focus:ring-2
                     focus:ring-[#A47251]/30 focus:border-[#A47251]/50 transition-all"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-2 rounded-xl bg-[#A47251] text-white
                     hover:bg-[#DD9E59] transition-all duration-150 active:scale-95"
        >
          <Plus size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

// ─── Field Input ──────────────────────────────────────────────────────────────
function Field({
  label, value, onChange, multiline = false, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  const base =
    'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white ' +
    'font-[family-name:var(--font-inter)] text-[13px] text-slate-700 ' +
    'placeholder:text-slate-400 focus:outline-none focus:ring-2 ' +
    'focus:ring-[#A47251]/30 focus:border-[#A47251]/50 transition-all';

  return (
    <div className="space-y-1.5">
      <label className="font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-700">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={base}
        />
      )}
    </div>
  );
}

// ─── Person Form ──────────────────────────────────────────────────────────────
function PersonForm({
  data,
  onChange,
}: {
  data: AboutPerson;
  onChange: (updated: AboutPerson) => void;
}) {
  const set = <K extends keyof AboutPerson>(key: K, value: AboutPerson[K]) =>
    onChange({ ...data, [key]: value });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Kolom kiri — gambar */}
      <div className="space-y-4">
        <ImageUpload
          image={data.image}
          imageAlt={data.imageAlt}
          onChange={url => set('image', url)}
        />
        <Field
          label="Alt Text Gambar"
          value={data.imageAlt}
          onChange={v => set('imageAlt', v)}
          placeholder="Deskripsi gambar untuk aksesibilitas"
        />
      </div>

      {/* Kolom kanan — teks */}
      <div className="space-y-4">
        <Field
          label="Nama / Label Tab"
          value={data.label}
          onChange={v => set('label', v)}
          placeholder="cth. Dewi Sartika"
        />
        <Field
          label="Badge Spesialisasi"
          value={data.badge}
          onChange={v => set('badge', v)}
          placeholder="cth. Spesialis Pakaian Wanita"
        />
        <Field
          label="Judul"
          value={data.title}
          onChange={v => set('title', v)}
          placeholder="cth. Keindahan dalam setiap detail busana wanita."
        />
        <Field
          label="Deskripsi"
          value={data.description}
          onChange={v => set('description', v)}
          multiline
          placeholder="Deskripsi singkat tentang penjahit..."
        />
        <ServicesEditor
          services={data.services}
          onChange={v => set('services', v)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Teks Tombol"
            value={data.buttonText}
            onChange={v => set('buttonText', v)}
            placeholder="cth. Konsultasi dengan Dewi"
          />
          <Field
            label="Link Tombol"
            value={data.buttonHref}
            onChange={v => set('buttonHref', v)}
            placeholder="/kontak"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminAboutEditor({
  persons,
  onChange,
}: {
  persons: AboutPerson[];
  onChange: (persons: AboutPerson[]) => void;
}) {
  const [activeTab, setActiveTab] = useState(persons[0]?.id ?? '');

  const current = persons.find(p => p.id === activeTab) ?? persons[0];

  const handlePersonChange = (updated: AboutPerson) => {
    onChange(persons.map(p => (p.id === updated.id ? updated : p)));
  };

  const iconMap = {
    scissors: <Scissors className="w-4 h-4 shrink-0" />,
    shirt: <Shirt className="w-4 h-4 shrink-0" />,
  };

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-3 max-w-md overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {persons.map(p => (
          <button
            key={p.id}
            onClick={() => setActiveTab(p.id)}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold
                        font-[family-name:var(--font-inter)] transition-all duration-200 active:scale-95
                        whitespace-nowrap flex-1
                        ${activeTab === p.id
                          ? 'bg-[#A47251] text-white shadow-[0_4px_12px_rgba(164,114,81,0.30)]'
                          : 'bg-slate-100 text-slate-600 hover:bg-[#F0D8A1]/50 hover:text-[#A47251]'
                        }`}
          >
            {iconMap[p.icon]}
            {p.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
        >
          {current && (
            <PersonForm data={current} onChange={handlePersonChange} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
