'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, X, User, Image as ImageIcon } from 'lucide-react';

export type ReviewData = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  message: string;
};

// ─── Review Card ──────────────────────────────────────────────────────────────
export function ReviewCard({
  review, onEdit, onDelete,
}: { review: ReviewData; onEdit: (r: ReviewData) => void; onDelete: (id: string) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col
                 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.07)]
                 transition-shadow duration-300"
    >
      {/* Profil */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full overflow-hidden bg-[#F0D8A1]/30 flex items-center justify-center shrink-0 border border-slate-100">
          {review.avatarUrl
            ? <img src={review.avatarUrl} alt={review.name} className="w-full h-full object-cover" loading="lazy" />
            : <User size={20} strokeWidth={1.5} className="text-[#8B5E3C]/50" />
          }
        </div>
        <div>
          <p className="font-[family-name:var(--font-inter)] text-[14px] font-semibold text-slate-800 leading-tight">
            {review.name}
          </p>
          <p className="font-[family-name:var(--font-inter)] text-[11px] font-medium text-[#8B5E3C] mt-0.5">
            {review.role || 'Pelanggan'}
          </p>
        </div>
      </div>

      {/* Pesan */}
      <div className="relative flex-grow mb-5">
        <span className="absolute -top-1 -left-1 text-3xl text-[#F0D8A1] leading-none select-none">"</span>
        <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-600 italic leading-relaxed pl-3">
          {review.message}
        </p>
      </div>

      {/* Aksi */}
      <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
        <button onClick={() => onEdit(review)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
                     font-[family-name:var(--font-inter)] text-[12px] font-semibold
                     border border-slate-200 text-slate-600
                     hover:border-[#8B5E3C] hover:text-[#8B5E3C] transition-all active:scale-95">
          <Pencil size={13} strokeWidth={1.5} /> Edit
        </button>
        <button onClick={() => onDelete(review.id)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
                     font-[family-name:var(--font-inter)] text-[12px] font-semibold
                     border border-slate-200 text-red-500
                     hover:border-red-400 hover:bg-red-50 transition-all active:scale-95">
          <Trash2 size={13} strokeWidth={1.5} /> Hapus
        </button>
      </div>
    </motion.div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────
export type ReviewFormData = Omit<ReviewData, 'id'> & { avatarFile?: File };

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
  isEditing: boolean;
  formData: ReviewFormData;
  setFormData: React.Dispatch<React.SetStateAction<ReviewFormData>>;
}

export function ReviewFormModal({ isOpen, onClose, onSave, isEditing, formData, setFormData }: ReviewFormModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData(p => ({ ...p, avatarUrl: URL.createObjectURL(file), avatarFile: file }));
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 " +
    "font-[family-name:var(--font-inter)] text-sm text-slate-800 placeholder:text-slate-400 " +
    "focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C] transition-all";

  const labelClass = "block font-[family-name:var(--font-inter)] text-[12px] font-semibold text-slate-700 mb-1";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-[family-name:var(--font-inter)] text-[15px] font-bold text-slate-800">
                {isEditing ? 'Edit Ulasan' : 'Tambah Ulasan Baru'}
              </h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <form onSubmit={onSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nama Pelanggan *</label>
                  <input type="text" required placeholder="Cth: Dimas Anggara"
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Jabatan <span className="text-slate-400 font-normal">(opsional)</span></label>
                  <input type="text" placeholder="Cth: Groom, CEO"
                    value={formData.role}
                    onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                    className={inputClass} />
                </div>
              </div>

              {/* Foto profil */}
              <div>
                <label className={labelClass}>Foto Profil <span className="text-slate-400 font-normal">(opsional)</span></label>
                <div className="flex items-center gap-3">
                  {/* Preview avatar */}
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-[#F0D8A1]/20 border border-slate-200 flex items-center justify-center shrink-0">
                    {formData.avatarUrl
                      ? <img src={formData.avatarUrl} alt="preview" className="w-full h-full object-cover" />
                      : <User size={22} strokeWidth={1.5} className="text-slate-300" />
                    }
                  </div>
                  <label className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed
                                    border-slate-200 bg-slate-50/50 cursor-pointer
                                    hover:border-[#8B5E3C] hover:bg-[#F0D8A1]/10 transition-all">
                    <ImageIcon size={15} strokeWidth={1.5} className="text-slate-400" />
                    <span className="font-[family-name:var(--font-inter)] text-[12px] text-slate-500">
                      {formData.avatarUrl ? 'Ganti foto' : 'Upload foto'}
                    </span>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Pesan */}
              <div>
                <label className={labelClass}>Pesan Ulasan *</label>
                <textarea required rows={4} placeholder="Tulis testimoni pelanggan di sini..."
                  value={formData.message}
                  onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  className={`${inputClass} resize-none`} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600
                             font-[family-name:var(--font-inter)] text-[13px] font-semibold
                             hover:bg-slate-50 transition-all active:scale-95">
                  Batal
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#8B5E3C] text-white
                             font-[family-name:var(--font-inter)] text-[13px] font-semibold
                             hover:bg-[#DD9E59] transition-all active:scale-95
                             shadow-[0_2px_8px_rgba(164,114,81,0.25)]">
                  {isEditing ? 'Simpan Perubahan' : 'Tambah'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
export function DeleteReviewModal({
  isOpen, onClose, onConfirm,
}: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center"
          >
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" strokeWidth={1.5} />
            </div>
            <h3 className="font-[family-name:var(--font-inter)] text-[15px] font-bold text-slate-800 mb-2">
              Hapus Ulasan?
            </h3>
            <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mb-6">
              Ulasan akan dihapus permanen dari daftar testimoni.
            </p>
            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600
                           font-[family-name:var(--font-inter)] text-[13px] font-semibold
                           hover:bg-slate-50 transition-all active:scale-95">
                Batal
              </button>
              <button onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white
                           font-[family-name:var(--font-inter)] text-[13px] font-semibold
                           hover:bg-red-600 transition-all active:scale-95">
                Ya, Hapus
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
