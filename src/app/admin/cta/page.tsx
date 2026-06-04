'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, X, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { compressAndConvertToWebp } from '@/lib/imageCompressor';

interface CtaImage {
  id: string;
  imageUrl: string;
  row: 1 | 2;
}

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
                         hover:bg-[#F0D8A1]/30 hover:text-[#8B5E3C] transition-all active:scale-[0.98]">
              <ImageIcon size={17} strokeWidth={1.5} className="text-[#8B5E3C]" />
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
}: { image: CtaImage; onReplace: (id: string, file: File) => void; onDelete: (id: string) => void }) {
  const inputRef        = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onReplace(image.id, file);
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

function AddSlot({ onAdd }: { onAdd: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onAdd(file);
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
                 hover:border-[#8B5E3C] hover:bg-[#F0D8A1]/10 transition-all duration-200"
    >
      <div className="w-10 h-10 rounded-full bg-[#F0D8A1]/40 flex items-center justify-center text-[#8B5E3C] mb-2">
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
  const [images, setImages] = useState<CtaImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch images from Supabase
  const fetchImages = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase
        .from('cta_images')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;

      if (data) {
        setImages(data.map(img => ({
          id: img.id.toString(),
          imageUrl: img.image_url,
          row: img.row as 1 | 2
        })));
      }
    } catch (error: any) {
      console.error('Error fetching CTA images:', error?.message || error);
      setErrorMessage(
        `Gagal mengambil data dari Supabase: ${error?.message || 'Pastikan tabel "cta_images" sudah dibuat.'}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Helper function to upload file to Supabase Storage
  const uploadToStorage = async (file: File): Promise<string | null> => {
    try {
      // Kompres dan ubah ke format WebP
      const compressedFile = await compressAndConvertToWebp(file);
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.webp`;
      const filePath = `cta-uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('cta-images')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        if (error.message?.toLowerCase().includes('bucket') || error.message?.toLowerCase().includes('not found')) {
          alert(
            "PENTING: Gagal mengunggah gambar ke Storage!\n\n" +
            "Pastikan Anda telah membuat Bucket bernama 'cta-images' di dasbor Supabase Anda (Storage -> New Bucket), " +
            "serta mengaturnya sebagai 'Public'.\n\n" +
            "Detail error: " + error.message
          );
        } else {
          alert("Gagal mengunggah gambar ke Storage: " + error.message);
        }
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('cta-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      alert("Terjadi kesalahan saat mengunggah: " + err.message);
      return null;
    }
  };

  // Add new image
  const handleAdd = (row: 1 | 2) => async (file: File) => {
    setLoading(true);
    const imageUrl = await uploadToStorage(file);
    if (!imageUrl) {
      setLoading(false);
      return;
    }

    try {
      // Hitung order_index berikutnya untuk baris ini
      const rowImages = images.filter(img => img.row === row);
      const nextIndex = rowImages.length;

      const { error } = await supabase
        .from('cta_images')
        .insert([{ image_url: imageUrl, row, order_index: nextIndex }]);

      if (error) throw error;
      await fetchImages();
    } catch (error: any) {
      alert("Gagal menyimpan ke database: " + error.message);
      setLoading(false);
    }
  };

  // Replace existing image
  const handleReplace = async (id: string, file: File) => {
    setLoading(true);
    const imageUrl = await uploadToStorage(file);
    if (!imageUrl) {
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('cta_images')
        .update({ image_url: imageUrl })
        .eq('id', id);

      if (error) throw error;
      await fetchImages();
    } catch (error: any) {
      alert("Gagal memperbarui gambar: " + error.message);
      setLoading(false);
    }
  };

  // Delete image
  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('cta_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchImages();
    } catch (error: any) {
      alert("Gagal menghapus gambar: " + error.message);
      setLoading(false);
    }
  };

  const row1 = images.filter(i => i.row === 1);
  const row2 = images.filter(i => i.row === 2);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="font-[family-name:var(--font-inter)] text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-[#F0D8A1]/30 text-[#8B5E3C] rounded-lg">
              <Megaphone size={18} strokeWidth={1.5} />
            </div>
            Gambar CTA
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mt-1">
            Kelola gambar yang tampil di bagian <em>Call to Action</em> (marquee bergerak) di beranda secara dinamis dengan Supabase.
            Ketuk gambar untuk mengganti atau menghapus.
          </p>
        </div>
        
        {loading && (
          <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium font-[family-name:var(--font-inter)] bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <Loader2 size={16} className="animate-spin text-[#8B5E3C]" />
            Sedang memproses...
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[13px] text-red-600 font-[family-name:var(--font-inter)] shadow-sm">
          {errorMessage}
        </div>
      )}

      {/* Baris 1 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <p className="font-[family-name:var(--font-inter)] text-[12px] font-bold text-slate-500 uppercase tracking-wider">
          Baris 1 (bergerak ke kiri)
        </p>
        <div className={loading ? 'opacity-70 pointer-events-none transition-opacity' : 'transition-opacity'}>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            <AnimatePresence>
              {row1.map(img => (
                <ImageSlot key={img.id} image={img} onReplace={handleReplace} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
            <AddSlot onAdd={handleAdd(1)} />
          </div>
        </div>
      </div>

      {/* Baris 2 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <p className="font-[family-name:var(--font-inter)] text-[12px] font-bold text-slate-500 uppercase tracking-wider">
          Baris 2 (bergerak ke kanan)
        </p>
        <div className={loading ? 'opacity-70 pointer-events-none transition-opacity' : 'transition-opacity'}>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            <AnimatePresence>
              {row2.map(img => (
                <ImageSlot key={img.id} image={img} onReplace={handleReplace} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
            <AddSlot onAdd={handleAdd(2)} />
          </div>
        </div>
      </div>

    </div>
  );
}
