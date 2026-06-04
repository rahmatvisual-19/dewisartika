'use client';

import { useState, useEffect } from 'react';
import { UserCircle, Save, CheckCircle, Loader2 } from 'lucide-react';
import { AdminAboutEditor, AboutPerson } from '@/components/admin/AdminAboutComponents';
import { supabase } from '@/lib/supabase';

export default function AdminAboutPage() {
  const [persons, setPersons] = useState<AboutPerson[]>([]);
  const [tailors, setTailors] = useState<{ id: string; name: string; phone: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch tailor profiles and contacts from Supabase
  const fetchPersons = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // 1. Fetch about_me profiles
      const { data: aboutData, error: aboutError } = await supabase
        .from('about_me')
        .select('*')
        .order('id', { ascending: true });

      if (aboutError) throw aboutError;

      // 2. Fetch tailor contacts
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .select('*')
        .eq('type', 'tailor')
        .order('created_at', { ascending: true });

      if (contactError) throw contactError;

      if (contactData) {
        setTailors(contactData.map(c => ({
          id: c.id.toString(),
          name: c.name || '',
          phone: c.value
        })));
      }

      if (aboutData && aboutData.length > 0) {
        setPersons(aboutData.map(p => ({
          id: p.id,
          label: p.label,
          icon: p.icon as 'scissors' | 'shirt',
          badge: p.badge,
          title: p.title,
          description: p.description,
          services: p.services || [],
          buttonText: p.button_text,
          buttonHref: p.button_href,
          image: p.image,
          imageAlt: p.image_alt
        })));
      }
    } catch (error: any) {
      console.error('Error fetching tailor profiles:', error?.message || error);
      setErrorMessage(
        `Gagal memuat data penjahit dari Supabase: ${error?.message || 'Pastikan tabel "about_me" dan data awal sudah dibuat.'}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersons();
  }, []);

  // Helper function to upload file to Supabase Storage
  const uploadToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { data, error } = await supabase.storage
        .from('about-me-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        if (error.message?.toLowerCase().includes('bucket') || error.message?.toLowerCase().includes('not found')) {
          alert(
            "PENTING: Gagal mengunggah foto ke Storage!\n\n" +
            "Pastikan Anda telah membuat Bucket bernama 'about-me-photos' di dasbor Supabase Anda (Storage -> New Bucket), " +
            "serta mengaturnya sebagai 'Public'.\n\n" +
            "Detail error: " + error.message
          );
        } else {
          alert("Gagal mengunggah foto ke Storage: " + error.message);
        }
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('about-me-photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      alert("Terjadi kesalahan saat mengunggah foto: " + err.message);
      return null;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      // Loop untuk mengunggah foto (jika ada) dan menyimpan perubahan masing-masing profil
      for (const p of persons) {
        let finalImageUrl = p.image;

        if (p.newImageFile) {
          const uploadedUrl = await uploadToStorage(p.newImageFile);
          if (!uploadedUrl) {
            setLoading(false);
            return; // Batalkan jika upload gagal
          }
          finalImageUrl = uploadedUrl;
        }

        const { error } = await supabase
          .from('about_me')
          .update({
            label: p.label,
            icon: p.icon,
            badge: p.badge,
            title: p.title,
            description: p.description,
            services: p.services,
            button_text: p.buttonText,
            button_href: p.buttonHref,
            image: finalImageUrl,
            image_alt: p.imageAlt
          })
          .eq('id', p.id);

        if (error) throw error;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      await fetchPersons(); // Refresh data
    } catch (error: any) {
      console.error('Error saving about_me profiles:', error);
      alert("Gagal menyimpan perubahan: " + error.message);
    } finally {
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
              <UserCircle size={18} strokeWidth={1.5} />
            </div>
            About Me
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mt-1">
            Kelola profil, foto, dan layanan masing-masing penjahit yang tampil di halaman utama secara dinamis.
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium font-[family-name:var(--font-inter)] bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <Loader2 size={14} className="animate-spin text-[#8B5E3C]" />
            Memproses...
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[13px] text-red-600 font-[family-name:var(--font-inter)] shadow-sm">
          {errorMessage}
        </div>
      )}

      {/* Editor */}
      {persons.length > 0 && (
        <div className={loading ? 'opacity-70 pointer-events-none transition-opacity' : 'transition-opacity'}>
          <AdminAboutEditor persons={persons} onChange={setPersons} tailors={tailors} />
        </div>
      )}

      {/* Tombol Simpan */}
      {persons.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl shrink-0
                        font-[family-name:var(--font-inter)] text-[13px] font-semibold
                        transition-all duration-200 active:scale-95 shadow-md disabled:opacity-55
                        ${saved
                          ? 'bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.30)]'
                          : 'bg-[#8B5E3C] text-white shadow-[0_4px_12px_rgba(164,114,81,0.25)] hover:bg-[#DD9E59]'
                        }`}
          >
            {saved ? (
              <>
                <CheckCircle size={15} strokeWidth={1.5} />
                Tersimpan
              </>
            ) : (
              <>
                <Save size={15} strokeWidth={1.5} />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
