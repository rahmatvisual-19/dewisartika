'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Image as ImageIcon, Plus, Pencil, X } from 'lucide-react';

export interface HeroImage {
  id: string;
  imageUrl: string;
}

const MAX_IMAGES = 3;

// ─── Action Popup ─────────────────────────────────────────────────────────────
function ActionPopup({
  onEdit, onDelete, onClose,
}: { onEdit: () => void; onDelete: () => void; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white rounded-2xl w-full max-w-xs shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <p className="font-[family-name:var(--font-inter)] text-[14px] font-semibold text-slate-800">
              Pilih Aksi
            </p>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Aksi */}
          <div className="p-3 space-y-1">
            <button
              onClick={onEdit}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                         font-[family-name:var(--font-inter)] text-[14px] font-medium text-slate-700
                         hover:bg-[#F0D8A1]/30 hover:text-[#A47251] transition-all duration-150 active:scale-[0.98]"
            >
              <Pencil size={17} strokeWidth={1.5} className="text-[#A47251]" />
              Ganti Gambar
            </button>

            <button
              onClick={onDelete}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                         font-[family-name:var(--font-inter)] text-[14px] font-medium text-red-500
                         hover:bg-red-50 transition-all duration-150 active:scale-[0.98]"
            >
              <Trash2 size={17} strokeWidth={1.5} />
              Hapus Gambar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Image Slot ───────────────────────────────────────────────────────────────
function ImageSlot({
  hero, onReplace, onDelete,
}: { hero: HeroImage; onReplace: (id: string, url: string) => void; onDelete: (id: string) => void }) {
  const inputRef          = useRef<HTMLInputElement>(null);
  const [open, setOpen]   = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onReplace(hero.id, URL.createObjectURL(file));
    e.target.value = '';
    setOpen(false);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={() => setOpen(true)}
        className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-video
                   border border-slate-200 shadow-sm cursor-pointer
                   hover:shadow-md hover:scale-[1.01] transition-all duration-200"
      >
        <img src={hero.imageUrl} alt="Hero" className="w-full h-full object-cover" />

        {/* Nomor urut */}
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm
                        flex items-center justify-center
                        font-[family-name:var(--font-inter)] text-[11px] font-bold text-white">
          {/* diisi dari parent via index */}
        </div>

        {/* Tap hint */}
        <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm
                        font-[family-name:var(--font-inter)] text-[10px] font-medium text-white">
          Ketuk untuk edit
        </div>
      </motion.div>

      {/* Popup */}
      {open && (
        <ActionPopup
          onEdit={() => inputRef.current?.click()}
          onDelete={() => { onDelete(hero.id); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </>
  );
}

// ─── Add Slot ─────────────────────────────────────────────────────────────────
function AddSlot({ onAdd }: { onAdd: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onAdd(URL.createObjectURL(file));
    e.target.value = '';
  };

  return (
    <motion.label
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center aspect-video rounded-2xl
                 border-2 border-dashed border-slate-200 bg-slate-50/50 cursor-pointer
                 hover:border-[#A47251] hover:bg-[#F0D8A1]/10 transition-all duration-200"
    >
      <div className="w-10 h-10 rounded-full bg-[#F0D8A1]/40 flex items-center justify-center text-[#A47251] mb-2">
        <Plus size={20} strokeWidth={1.5} />
      </div>
      <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 font-medium">
        Tambah Gambar
      </p>
      <p className="font-[family-name:var(--font-inter)] text-[11px] text-slate-400 mt-0.5">
        JPG, PNG, WebP
      </p>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </motion.label>
  );
}

// ─── Grid Utama ───────────────────────────────────────────────────────────────
export function HeroImageGrid({
  images, onAdd, onReplace, onDelete,
}: {
  images: HeroImage[];
  onAdd: (url: string) => void;
  onReplace: (id: string, url: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <AnimatePresence>
        {images.map(img => (
          <ImageSlot key={img.id} hero={img} onReplace={onReplace} onDelete={onDelete} />
        ))}
      </AnimatePresence>

      {images.length < MAX_IMAGES && (
        <AddSlot onAdd={onAdd} />
      )}
    </div>
  );
}
