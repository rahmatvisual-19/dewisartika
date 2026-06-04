'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Loader2 } from 'lucide-react';
import {
  ReviewCard, ReviewFormModal, DeleteReviewModal, ReviewData, ReviewFormData
} from '@/components/admin/AdminReviewComponents';
import { supabase } from '@/lib/supabase';

const emptyForm = (): ReviewFormData => ({ name: '', role: '', avatarUrl: '', message: '' });

export default function AdminReviewPage() {
  const [reviews, setReviews]             = useState<ReviewData[]>([]);
  const [loading, setLoading]             = useState(false);
  const [errorMessage, setErrorMessage]   = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen]       = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewData | null>(null);
  const [isDeleteOpen, setIsDeleteOpen]   = useState(false);
  const [deletingId, setDeletingId]       = useState<string | null>(null);
  const [formData, setFormData]           = useState<ReviewFormData>(emptyForm());

  // Fetch reviews from Supabase
  const fetchReviews = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setReviews(data.map(r => ({
          id: r.id.toString(),
          name: r.name,
          role: r.role,
          avatarUrl: r.avatar_url || '',
          message: r.message
        })));
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error?.message || error);
      setErrorMessage(
        `Gagal memuat ulasan dari Supabase: ${error?.message || 'Pastikan tabel "testimonials" sudah siap.'}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openCreate = () => {
    setFormData(emptyForm());
    setEditingReview(null);
    setIsFormOpen(true);
  };

  const openEdit = (review: ReviewData) => {
    setFormData({ name: review.name, role: review.role, avatarUrl: review.avatarUrl, message: review.message });
    setEditingReview(review);
    setIsFormOpen(true);
  };

  const openDelete = (id: string) => { setDeletingId(id); setIsDeleteOpen(true); };

  // Helper to upload avatar image to storage
  const uploadToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data, error } = await supabase.storage
        .from('testimonials')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        if (error.message?.toLowerCase().includes('bucket') || error.message?.toLowerCase().includes('not found')) {
          alert(
            "PENTING: Gagal mengunggah foto profil ke Storage!\n\n" +
            "Pastikan Anda telah membuat Bucket bernama 'testimonials' di dasbor Supabase Anda (Storage -> New Bucket), " +
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
        .from('testimonials')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      alert("Terjadi kesalahan saat mengunggah foto: " + err.message);
      return null;
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    let finalAvatarUrl = formData.avatarUrl;

    if (formData.avatarFile) {
      const uploadedUrl = await uploadToStorage(formData.avatarFile);
      if (!uploadedUrl) {
        setLoading(false);
        return;
      }
      finalAvatarUrl = uploadedUrl;
    }

    try {
      const payload = {
        name: formData.name,
        role: formData.role,
        avatar_url: finalAvatarUrl,
        message: formData.message
      };

      if (editingReview) {
        const { error } = await supabase
          .from('testimonials')
          .update(payload)
          .eq('id', editingReview.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert([payload]);
        if (error) throw error;
      }

      setIsFormOpen(false);
      await fetchReviews();
    } catch (error: any) {
      alert("Gagal menyimpan ulasan ke database: " + error.message);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deletingId) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('testimonials')
          .delete()
          .eq('id', deletingId);

        if (error) throw error;

        setIsDeleteOpen(false);
        setDeletingId(null);
        await fetchReviews();
      } catch (error: any) {
        alert("Gagal menghapus ulasan: " + error.message);
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4
                      bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="font-[family-name:var(--font-inter)] text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-[#F0D8A1]/30 text-[#8B5E3C] rounded-lg">
              <MessageSquare size={18} strokeWidth={1.5} />
            </div>
            Ulasan Pelanggan
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mt-1">
            Kelola testimoni pelanggan yang tampil di halaman beranda secara dinamis dengan Supabase.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {loading && (
            <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium font-[family-name:var(--font-inter)] bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Loader2 size={14} className="animate-spin text-[#8B5E3C]" />
              Memproses...
            </div>
          )}

          <button onClick={openCreate}
            disabled={loading}
            className="inline-flex items-center gap-2
                       font-[family-name:var(--font-inter)] text-[13px] font-semibold
                       bg-[#8B5E3C] text-white rounded-xl px-5 py-2.5
                       hover:bg-[#DD9E59] transition-all duration-300 active:scale-95 disabled:opacity-55
                       shadow-[0_2px_8px_rgba(164,114,81,0.25)]">
            <Plus size={16} strokeWidth={2} /> Tambah Ulasan
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[13px] text-red-600 font-[family-name:var(--font-inter)] shadow-sm">
          {errorMessage}
        </div>
      )}

      {/* Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start ${loading ? 'opacity-70 pointer-events-none' : ''}`}>
        <AnimatePresence>
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} onEdit={openEdit} onDelete={openDelete} />
          ))}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <ReviewFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        isEditing={!!editingReview}
        formData={formData}
        setFormData={setFormData}
      />
      <DeleteReviewModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
