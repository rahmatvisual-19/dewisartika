'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { HeroImageGrid, HeroImage } from '@/components/admin/AdminHeroComponents';
import { supabase } from '@/lib/supabase';
import { compressAndConvertToWebp } from '@/lib/imageCompressor';

export default function AdminHeroPage() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch images from Supabase
  const fetchImages = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;

      if (data) {
        setImages(data.map(img => ({
          id: img.id,
          imageUrl: img.image_url
        })));
      }
    } catch (error: any) {
      console.error('Error fetching hero images:', error?.message || error);
      setErrorMessage(
        `Gagal mengambil data dari Supabase: ${error?.message || 'Pastikan tabel "hero_images" sudah dibuat.'}`
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
      const filePath = `hero-uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('hero-images')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        if (error.message?.toLowerCase().includes('bucket') || error.message?.toLowerCase().includes('not found')) {
          alert(
            "PENTING: Gagal mengunggah ke Storage!\n\n" +
            "Pastikan Anda telah membuat Bucket bernama 'hero-images' di Supabase dashboard Anda (Storage -> New Bucket), " +
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
        .from('hero-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      alert("Terjadi kesalahan saat mengunggah: " + err.message);
      return null;
    }
  };

  // Add new image
  const handleAdd = async (file: File) => {
    setLoading(true);
    const imageUrl = await uploadToStorage(file);
    if (!imageUrl) {
      setLoading(false);
      return;
    }

    try {
      // Hitung order_index berikutnya
      const nextIndex = images.length;

      const { error } = await supabase
        .from('hero_images')
        .insert([{ image_url: imageUrl, order_index: nextIndex }]);

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
        .from('hero_images')
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
        .from('hero_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchImages();
    } catch (error: any) {
      alert("Gagal menghapus gambar: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="font-[family-name:var(--font-inter)] text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-[#F0D8A1]/30 text-[#8B5E3C] rounded-lg">
              <ImageIcon size={18} strokeWidth={1.5} />
            </div>
            Gambar Utama (Hero)
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mt-1">
            Kelola hingga <strong>3 gambar</strong> yang tampil di slider beranda secara dinamis dengan Supabase.
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

      {/* Grid gambar */}
      <div className={loading ? 'opacity-70 pointer-events-none transition-opacity' : 'transition-opacity'}>
        <HeroImageGrid
          images={images}
          onAdd={handleAdd}
          onReplace={handleReplace}
          onDelete={handleDelete}
        />
      </div>

    </div>
  );
}
