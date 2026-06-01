'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, X, Image as ImageIcon, Trash2 } from 'lucide-react';

interface CtaImage {
  id: string;
  imageUrl: string;
  row: 1 | 2;
}

const initialImages: CtaImage[] = [
  { id: '1', imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop', row: 1 },
  { id: '2', imageUrl: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?w=400&h=400&fit=crop', row: 1 },
  { id: '3', imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?w=400&h=400&fit=crop', row: 1 },
  { id: '4', imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop', row: 1 },
  { id: '5', imageUrl: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=400&h=400&fit=crop', row: 2 },
  { id: '6', imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=400&fit=crop', row: 2 },
  { id: '7', imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop', row: 2 },
  { id: '8', imageUrl: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=400&h=400&fit=crop', row: 2 },
];

function ActionPopup({
  onEdit, onDelete, onClose,
}: { onEdit: () => void; onDelete: () => void; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl w-full max-w-xs shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <p className="font-[family-name:var(--font-inter)] text-[14px] font-semibold text-slate-800">
              Pilih Aksi
            </p>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
          <div className="p-3 space-y-1">
            <button onClick={onEdit}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                         font-[family-name:var(--font-inter)] text-[14px] font-medium text-slate-700
                         hover:bg-[#F0D8A1]/30 hover:text-[#A47251] transition-all active:scale-[0.98]">
              <ImageIcon size={17} strokeWidth={1.5} className="text-[#A47251]" />
              Ganti Gambar
            </button>
            <button onClick={onDelete}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                         font-[family-name:var(--font-inter)] text-[14px] font-medium text-red-500
                         hover:bg-red-50 transition-all active:scale-[0.98]">
              <Trash2 size={17} strokeWidth={1.5} />
              Hapus Gambar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ImageSlot({
  image, onReplace, onDelete,
}: { image: CtaImage; onReplace: (id: string, url: string) => void; onDelete: (id: string) => void }) {
  const inputRef        = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onReplace(image.id, URL.createObjectURL(file));
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
        className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-square
                   border border-slate-200 shadow-sm cursor-pointer
                   hover:shadow-md hover:scale-[1.01] transition-all duration-200"
      >
        <img src={image.imageUrl} alt="CTA" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm
                        font-[family-name:var(--font-inter)] text-[10px] font-medium text-white">
          Ketuk untuk edit
        </div>
      </motion.div>

      {open && (
        <ActionPopup
          onEdit={() => inputRef.current?.click()}
          onDelete={() => { onDelete(image.id); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </>
  );
}

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
      className="flex flex-col items-center justify-center aspect-square rounded-2xl
                 border-2 border-dashed border-slate-200 bg-slate-50/50 cursor-pointer
                 hover:border-[#A47251] hover:bg-[#F0D8A1]/10 transition-all duration-200"
    >
      <div className="w-10 h-10 rounded-full bg-[#F0D8A1]/40 flex items-center justify-center text-[#A47251] mb-2">
        <Plus size={20} strokeWidth={1.5} />
      </div>
      <p className="font-[family-name:var(--font-inter)] text-[12px] text-slate-500 font-medium">
        Tambah
      </p>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </motion.label>
  );
}

export default function AdminCtaPage() {
  const [images, setImages] = useState<CtaImage[]>(initialImages);

  const row1 = images.filter(i => i.row === 1);
  const row2 = images.filter(i => i.row === 2);

  const addToRow = (row: 1 | 2) => (url: string) => {
    setImages(prev => [...prev, { id: Date.now().toString(), imageUrl: url, row }]);
  };

  const replace = (id: string, url: string) => {
    setImages(prev => prev.map(i => i.id === id ? { ...i, imageUrl: url } : i));
  };

  const remove = (id: string) => {
    setImages(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="font-[family-name:var(--font-inter)] text-xl font-bold text-slate-800 flex items-center gap-2">
          <div className="p-2 bg-[#F0D8A1]/30 text-[#A47251] rounded-lg">
            <Megaphone size={18} strokeWidth={1.5} />
          </div>
          Gambar CTA
        </h1>
        <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mt-1">
          Kelola gambar yang tampil di bagian <em>Call to Action</em> (marquee bergerak) di beranda.
          Ketuk gambar untuk mengganti atau menghapus.
        </p>
      </div>

      {/* Baris 1 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <p className="font-[family-name:var(--font-inter)] text-[12px] font-bold text-slate-500 uppercase tracking-wider">
          Baris 1 (bergerak ke kiri)
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          <AnimatePresence>
            {row1.map(img => (
              <ImageSlot key={img.id} image={img} onReplace={replace} onDelete={remove} />
            ))}
          </AnimatePresence>
          <AddSlot onAdd={addToRow(1)} />
        </div>
      </div>

      {/* Baris 2 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <p className="font-[family-name:var(--font-inter)] text-[12px] font-bold text-slate-500 uppercase tracking-wider">
          Baris 2 (bergerak ke kanan)
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          <AnimatePresence>
            {row2.map(img => (
              <ImageSlot key={img.id} image={img} onReplace={replace} onDelete={remove} />
            ))}
          </AnimatePresence>
          <AddSlot onAdd={addToRow(2)} />
        </div>
      </div>

    </div>
  );
}
