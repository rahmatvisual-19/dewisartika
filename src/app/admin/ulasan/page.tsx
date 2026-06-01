'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare } from 'lucide-react';
import {
  ReviewCard, ReviewFormModal, DeleteReviewModal, ReviewData,
} from '@/components/admin/AdminReviewComponents';

const initialReviews: ReviewData[] = [
  {
    id: '1', name: 'Dimas Anggara', role: 'Groom',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    message: 'Pengerjaan jas untuk pernikahan saya sangat rapi. Ukurannya pas di badan dan bahannya sangat nyaman dipakai seharian. Terima kasih TailorCraft!',
  },
  {
    id: '2', name: 'Andi Pratama', role: 'Eksekutif Perusahaan',
    avatarUrl: 'https://randomuser.me/api/portraits/men/46.jpg',
    message: 'Sangat profesional. Kemeja kerja custom saya potongannya sangat presisi, berbeda jauh dengan kemeja ready-to-wear yang biasa saya beli.',
  },
];

const emptyForm = (): Omit<ReviewData, 'id'> => ({ name: '', role: '', avatarUrl: '', message: '' });

export default function AdminReviewPage() {
  const [reviews, setReviews]             = useState<ReviewData[]>(initialReviews);
  const [isFormOpen, setIsFormOpen]       = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewData | null>(null);
  const [isDeleteOpen, setIsDeleteOpen]   = useState(false);
  const [deletingId, setDeletingId]       = useState<string | null>(null);
  const [formData, setFormData]           = useState<Omit<ReviewData, 'id'>>(emptyForm());

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

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingReview) {
      setReviews(prev => prev.map(r => r.id === editingReview.id ? { ...formData, id: editingReview.id } : r));
    } else {
      setReviews(prev => [{ ...formData, id: Date.now().toString() }, ...prev]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (deletingId) {
      setReviews(prev => prev.filter(r => r.id !== deletingId));
      setIsDeleteOpen(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4
                      bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="font-[family-name:var(--font-inter)] text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-[#F0D8A1]/30 text-[#A47251] rounded-lg">
              <MessageSquare size={18} strokeWidth={1.5} />
            </div>
            Ulasan Pelanggan
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mt-1">
            Kelola testimoni pelanggan yang tampil di halaman beranda.
          </p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2
                     font-[family-name:var(--font-inter)] text-[13px] font-semibold
                     bg-[#A47251] text-white rounded-xl px-5 py-2.5
                     hover:bg-[#DD9E59] transition-all duration-300 active:scale-95
                     shadow-[0_2px_8px_rgba(164,114,81,0.25)]">
          <Plus size={16} strokeWidth={2} /> Tambah Ulasan
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
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
