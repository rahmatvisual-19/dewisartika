'use client';

import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { HeroImageGrid, HeroImage } from '@/components/admin/AdminHeroComponents';

const initialImages: HeroImage[] = [
  { id: '1', imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?q=80&w=800&auto=format&fit=crop' },
  { id: '2', imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop' },
  { id: '3', imageUrl: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?q=80&w=800&auto=format&fit=crop' },
];

export default function AdminHeroPage() {
  const [images, setImages] = useState<HeroImage[]>(initialImages);

  const handleAdd = (url: string) => {
    setImages(prev => [...prev, { id: Date.now().toString(), imageUrl: url }]);
  };

  const handleReplace = (id: string, url: string) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, imageUrl: url } : img));
  };

  const handleDelete = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="font-[family-name:var(--font-inter)] text-xl font-bold text-slate-800 flex items-center gap-2">
          <div className="p-2 bg-[#F0D8A1]/30 text-[#A47251] rounded-lg">
            <ImageIcon size={18} strokeWidth={1.5} />
          </div>
          Gambar Utama (Hero)
        </h1>
        <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mt-1">
          Kelola hingga <strong>3 gambar</strong> yang tampil di slider beranda. Hover gambar untuk mengganti atau menghapus.
        </p>
      </div>

      {/* Grid gambar */}
      <HeroImageGrid
        images={images}
        onAdd={handleAdd}
        onReplace={handleReplace}
        onDelete={handleDelete}
      />

    </div>
  );
}
