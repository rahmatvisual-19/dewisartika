'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, X, Building2, Image as ImageIcon, Plus } from 'lucide-react';

export type ClientData = {
  id: string;
  name: string;
  logoUrl: string;
};

// ─── Client Card ──────────────────────────────────────────────────────────────
export function ClientCard({
  client, onEdit, onDelete,
}: { client: ClientData; onEdit: (c: ClientData) => void; onDelete: (id: string) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col items-center
                 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.07)]
                 transition-shadow duration-300 group"
    >
      {/* Logo */}
      <div className="w-full h-28 flex items-center justify-center bg-slate-50 rounded-xl mb-4 p-4 border border-slate-100">
        {client.logoUrl ? (
          <img
            src={client.logoUrl}
            alt={client.name}
            loading="lazy"
            className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
          />
        ) : (
          <div className="flex flex-col items-center text-slate-400">
            <Building2 size={28} strokeWidth={1.5} className="mb-1.5 opacity-50" />
            <span className="font-[family-name:var(--font-inter)] text-[12px] font-semibold text-slate-600 text-center line-clamp-2">
              {client.name}
            </span>
          </div>
        )}
      </div>

      <p className="font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-800 text-center mb-4 line-clamp-1 w-full">
        {client.name || <span className="text-slate-400 italic">Tanpa Nama</span>}
      </p>

      {/* Aksi */}
      <div className="mt-auto w-full flex gap-2">
        <button
          onClick={() => onEdit(client)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
                     font-[family-name:var(--font-inter)] text-[12px] font-semibold
                     border border-slate-200 text-slate-600
                     hover:border-[#A47251] hover:text-[#A47251] transition-all duration-200 active:scale-95"
        >
          <Pencil size={13} strokeWidth={1.5} /> Edit
        </button>
        <button
          onClick={() => onDelete(client.id)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
                     font-[family-name:var(--font-inter)] text-[12px] font-semibold
                     border border-slate-200 text-red-500
                     hover:border-red-400 hover:bg-red-50 transition-all duration-200 active:scale-95"
        >
          <Trash2 size={13} strokeWidth={1.5} /> Hapus
        </button>
      </div>
    </motion.div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────
interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
  isEditing: boolean;
  formData: Omit<ClientData, 'id'>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<ClientData, 'id'>>>;
}

export function ClientFormModal({ isOpen, onClose, onSave, isEditing, formData, setFormData }: ClientFormModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData(p => ({ ...p, logoUrl: URL.createObjectURL(file) }));
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 " +
    "font-[family-name:var(--font-inter)] text-sm text-slate-800 placeholder:text-slate-400 " +
    "focus:outline-none focus:ring-2 focus:ring-[#A47251]/30 focus:border-[#A47251] transition-all";

  const labelClass = "block font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-700 mb-1.5";

  const isValid = formData.name.trim() !== '' || formData.logoUrl.trim() !== '';

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
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-[family-name:var(--font-inter)] text-[15px] font-bold text-slate-800">
                {isEditing ? 'Edit Klien' : 'Tambah Klien Baru'}
              </h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <form onSubmit={onSave} className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Nama Klien / Perusahaan</label>
                <div className="relative">
                  <input type="text" placeholder="Cth: PT Sukses Makmur"
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className={`${inputClass} pl-10`} />
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={1.5} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Logo</label>
                <label className="flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed
                                  border-slate-200 bg-slate-50/50 cursor-pointer
                                  hover:border-[#A47251] hover:bg-[#F0D8A1]/10 transition-all duration-200 overflow-hidden">
                  {formData.logoUrl ? (
                    <div className="relative w-full h-28 flex items-center justify-center p-4">
                      <img src={formData.logoUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="font-[family-name:var(--font-inter)] text-white text-[12px] font-semibold">Ganti Logo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#F0D8A1]/40 flex items-center justify-center text-[#A47251]">
                        <ImageIcon size={18} strokeWidth={1.5} />
                      </div>
                      <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500">Klik untuk upload logo</p>
                      <p className="font-[family-name:var(--font-inter)] text-[11px] text-slate-400">SVG, PNG, JPG</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600
                             font-[family-name:var(--font-inter)] text-[13px] font-semibold
                             hover:bg-slate-50 transition-all active:scale-95">
                  Batal
                </button>
                <button type="submit" disabled={!isValid}
                  className="flex-1 py-2.5 rounded-xl bg-[#A47251] text-white
                             font-[family-name:var(--font-inter)] text-[13px] font-semibold
                             hover:bg-[#DD9E59] disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all active:scale-95 shadow-[0_2px_8px_rgba(164,114,81,0.25)]">
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
export function DeleteClientModal({
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
              Hapus Klien?
            </h3>
            <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mb-6">
              Klien akan dihapus dari slider logo di beranda. Tindakan ini tidak dapat dibatalkan.
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

// ─── Add Slot ─────────────────────────────────────────────────────────────────
export function AddClientSlot({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center h-full min-h-[180px] rounded-2xl
                 border-2 border-dashed border-slate-200 bg-slate-50/50
                 hover:border-[#A47251] hover:bg-[#F0D8A1]/10 transition-all duration-200"
    >
      <div className="w-10 h-10 rounded-full bg-[#F0D8A1]/40 flex items-center justify-center text-[#A47251] mb-2">
        <Plus size={20} strokeWidth={1.5} />
      </div>
      <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 font-medium">
        Tambah Klien
      </p>
    </motion.button>
  );
}
