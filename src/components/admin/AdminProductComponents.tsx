'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, X, Image as ImageIcon, Plus, ChevronDown } from 'lucide-react';
// ─── Types ────────────────────────────────────────────────────────────────────
export type ProductDetail = { label: string; value: string };

export type ProductData = {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  images: string[];          // maks 4 gambar
  description: string;
  details: ProductDetail[];  // detail spesifik custom
};

const MAX_IMAGES   = 4;
const MAX_FILE_MB  = 2;

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

// ─── Dropdown + Tambah ────────────────────────────────────────────────────────
function DropdownWithAdd({
  value, options, onChange, onAdd, onRemove, placeholder,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen]     = useState(false);
  const [newVal, setNewVal] = useState('');

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 " +
    "font-[family-name:var(--font-inter)] text-sm text-slate-800 placeholder:text-slate-400 " +
    "focus:outline-none focus:ring-2 focus:ring-[#A47251]/30 focus:border-[#A47251] transition-all";

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl border
                      font-[family-name:var(--font-inter)] text-sm transition-all min-w-0
                      ${value ? 'text-slate-800' : 'text-slate-400'}
                      ${open ? 'border-[#A47251] ring-2 ring-[#A47251]/30' : 'border-slate-200 bg-slate-50/50'}`}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronDown size={15} strokeWidth={1.5} className={`text-slate-400 transition-transform shrink-0 ml-1 ${open ? 'rotate-180' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => setOpen(true)}
          title="Tambah opsi baru"
          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border border-dashed border-[#A47251]/50
                     text-[#A47251] hover:bg-[#F0D8A1]/20 transition-all active:scale-90"
        >
          <Plus size={16} strokeWidth={2} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200
                       shadow-lg z-30 overflow-hidden"
          >
            <div className="max-h-40 overflow-y-auto">
              {options.map(opt => (
                <div key={opt} className="flex items-center border-b border-slate-50 last:border-0">
                  <button
                    type="button"
                    onClick={() => { onChange(opt); setOpen(false); }}
                    className={`flex-1 text-left px-4 py-3 font-[family-name:var(--font-inter)] text-[14px]
                                transition-colors
                                ${value === opt ? 'text-[#A47251] font-semibold bg-[#F0D8A1]/10' : 'text-slate-700'}`}
                  >
                    {opt}
                  </button>
                  {/* Tombol hapus — selalu terlihat, tap target besar */}
                  <button
                    type="button"
                    onClick={() => {
                      onRemove(opt);
                      if (value === opt) onChange('');
                    }}
                    title={`Hapus "${opt}"`}
                    className="w-10 h-10 flex items-center justify-center shrink-0 mr-1
                               rounded-xl bg-red-50 text-red-400
                               active:scale-90 transition-all"
                  >
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
              {options.length === 0 && (
                <p className="px-4 py-3 font-[family-name:var(--font-inter)] text-[12px] text-slate-400">
                  Belum ada opsi
                </p>
              )}
            </div>

            <div className="border-t border-slate-100 p-2 flex gap-2">
              <input
                type="text" placeholder="Tambah opsi baru..."
                value={newVal}
                onChange={e => setNewVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newVal.trim()) {
                    e.preventDefault();
                    onAdd(newVal.trim());
                    onChange(newVal.trim());
                    setNewVal('');
                    setOpen(false);
                  }
                }}
                className={`${inputClass} py-2 text-[12px]`}
              />
              <button
                type="button"
                onClick={() => {
                  if (newVal.trim()) {
                    onAdd(newVal.trim());
                    onChange(newVal.trim());
                    setNewVal('');
                    setOpen(false);
                  }
                }}
                className="px-3 rounded-xl bg-[#A47251] text-white font-[family-name:var(--font-inter)]
                           text-[12px] font-semibold hover:bg-[#DD9E59] transition-all active:scale-95 shrink-0"
              >
                Tambah
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Multi Image Upload ───────────────────────────────────────────────────────
function MultiImageUpload({
  images, onChange,
}: { images: string[]; onChange: (imgs: string[]) => void }) {
  const [error, setError] = useState('');

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setError('');

    const remaining = MAX_IMAGES - images.length;
    if (files.length > remaining) {
      setError(`Maksimal ${MAX_IMAGES} gambar. Hanya ${remaining} slot tersisa.`);
      return;
    }

    const oversized = files.filter(f => f.size > MAX_FILE_MB * 1024 * 1024);
    if (oversized.length > 0) {
      setError(`Ukuran file maks ${MAX_FILE_MB}MB. File terlalu besar: ${oversized.map(f => f.name).join(', ')}`);
      return;
    }

    const urls = files.map(f => URL.createObjectURL(f));
    onChange([...images, ...urls]);
    e.target.value = '';
  };

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        {/* Slot gambar yang sudah ada */}
        {images.map((src, idx) => (
          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group">
            <img src={src} alt={`img-${idx}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white
                         flex items-center justify-center opacity-0 group-hover:opacity-100
                         transition-opacity active:scale-90"
            >
              <X size={10} strokeWidth={2.5} />
            </button>
            <span className="absolute bottom-1 left-1 w-4 h-4 rounded-full bg-black/50 text-white
                             font-[family-name:var(--font-inter)] text-[9px] font-bold
                             flex items-center justify-center">
              {idx + 1}
            </span>
          </div>
        ))}

        {/* Slot tambah */}
        {images.length < MAX_IMAGES && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50
                            flex flex-col items-center justify-center cursor-pointer
                            hover:border-[#A47251] hover:bg-[#F0D8A1]/10 transition-all">
            <ImageIcon size={18} strokeWidth={1.5} className="text-slate-400 mb-1" />
            <span className="font-[family-name:var(--font-inter)] text-[10px] text-slate-400">
              {images.length}/{MAX_IMAGES}
            </span>
            <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
          </label>
        )}
      </div>

      {error && (
        <p className="font-[family-name:var(--font-inter)] text-[11px] text-red-500">{error}</p>
      )}
      <p className="font-[family-name:var(--font-inter)] text-[11px] text-slate-400">
        Maks {MAX_IMAGES} gambar · Maks {MAX_FILE_MB}MB per file · JPG, PNG, WebP
      </p>
    </div>
  );
}

// ─── Custom Details Editor ────────────────────────────────────────────────────
function DetailsEditor({
  details, onChange,
}: { details: ProductDetail[]; onChange: (d: ProductDetail[]) => void }) {
  const add = () => onChange([...details, { label: '', value: '' }]);
  const remove = (i: number) => onChange(details.filter((_, idx) => idx !== i));
  const update = (i: number, field: 'label' | 'value', val: string) => {
    onChange(details.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  };

  const inputClass =
    "w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 " +
    "font-[family-name:var(--font-inter)] text-[12px] text-slate-800 placeholder:text-slate-400 " +
    "focus:outline-none focus:ring-2 focus:ring-[#A47251]/30 focus:border-[#A47251] transition-all";

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {details.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="flex gap-2 items-center"
          >
            <input
              type="text" placeholder="Nama detail (cth: Kualitas)"
              value={d.label}
              onChange={e => update(i, 'label', e.target.value)}
              className={`${inputClass} flex-1`}
            />
            <input
              type="text" placeholder="Nilai (cth: Premium)"
              value={d.value}
              onChange={e => update(i, 'value', e.target.value)}
              className={`${inputClass} flex-1`}
            />
            <button
              type="button" onClick={() => remove(i)}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-red-400
                         hover:bg-red-50 hover:text-red-500 transition-all active:scale-90 shrink-0"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        type="button" onClick={add}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-[#A47251]/40
                   font-[family-name:var(--font-inter)] text-[12px] font-semibold text-[#A47251]
                   hover:bg-[#F0D8A1]/20 transition-all active:scale-95"
      >
        <Plus size={13} strokeWidth={2} /> Tambah Detail
      </button>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
export function AdminProductCard({
  product, onEdit, onDelete,
}: { product: ProductData; onEdit: (p: ProductData) => void; onDelete: (id: string) => void }) {
  const thumb = product.images[0] ?? '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col
                 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.07)]
                 transition-shadow duration-300 group"
    >
      <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
        {thumb
          ? <img src={thumb} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={32} strokeWidth={1} /></div>
        }
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-semibold
                         bg-white/90 backdrop-blur-md text-[#A47251] shadow-sm">
          {product.category}
        </span>
        {product.images.length > 1 && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm
                           font-[family-name:var(--font-inter)] text-[10px] text-white">
            +{product.images.length - 1} foto
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-[family-name:var(--font-inter)] text-[14px] font-bold text-slate-800 line-clamp-1 mb-1">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="font-[family-name:var(--font-inter)] font-bold text-[#A47251] text-[15px]">
            {formatRupiah(product.price)}
          </span>
          <span className="font-[family-name:var(--font-inter)] text-[11px] text-slate-400">{product.unit}</span>
        </div>
        <p className="font-[family-name:var(--font-inter)] text-[12px] text-slate-500 line-clamp-2 mb-4">
          {product.description}
        </p>

        <div className="mt-auto pt-3 border-t border-slate-100 flex gap-2">
          <button onClick={() => onEdit(product)}
            suppressHydrationWarning
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
                       font-[family-name:var(--font-inter)] text-[12px] font-semibold
                       border border-slate-200 text-slate-600
                       hover:border-[#A47251] hover:text-[#A47251] transition-all active:scale-95">
            <Pencil size={13} strokeWidth={1.5} /> Edit
          </button>
          <button onClick={() => onDelete(product.id)}
            suppressHydrationWarning
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
                       font-[family-name:var(--font-inter)] text-[12px] font-semibold
                       border border-slate-200 text-red-500
                       hover:border-red-400 hover:bg-red-50 transition-all active:scale-95">
            <Trash2 size={13} strokeWidth={1.5} /> Hapus
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────
interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
  isEditing: boolean;
  formData: Omit<ProductData, 'id'>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<ProductData, 'id'>>>;
  categories: string[];
  onAddCategory: (v: string) => void;
  onRemoveCategory: (v: string) => void;
  units: string[];
  onAddUnit: (v: string) => void;
  onRemoveUnit: (v: string) => void;
}

export function ProductFormModal({
  isOpen, onClose, onSave, isEditing, formData, setFormData,
  categories, onAddCategory, onRemoveCategory, units, onAddUnit, onRemoveUnit,
}: ProductFormModalProps) {
  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 " +
    "font-[family-name:var(--font-inter)] text-sm text-slate-800 placeholder:text-slate-400 " +
    "focus:outline-none focus:ring-2 focus:ring-[#A47251]/30 focus:border-[#A47251] transition-all";

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
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h2 className="font-[family-name:var(--font-inter)] text-[15px] font-bold text-slate-800">
                {isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Scrollable form */}
            <form onSubmit={onSave} className="p-6 overflow-y-auto space-y-5 flex-1">

              {/* Nama */}
              <div>
                <label className={labelClass}>Nama Produk *</label>
                <input type="text" required placeholder="Cth: Kancing Jas Eksklusif"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className={inputClass} />
              </div>

              {/* Kategori — satu baris */}
              <div>
                <label className={labelClass}>Kategori *</label>
                <DropdownWithAdd
                  value={formData.category}
                  options={categories}
                  onChange={v => setFormData(p => ({ ...p, category: v }))}
                  onAdd={onAddCategory}
                  onRemove={onRemoveCategory}
                  placeholder="Pilih kategori"
                />
              </div>

              {/* Harga */}
              <div>
                <label className={labelClass}>Harga (Rp) *</label>
                <input type="number" required placeholder="85000" min={0}
                  value={formData.price || ''}
                  onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))}
                  className={inputClass} />
              </div>

              {/* Satuan — di bawah Harga */}
              <div>
                <label className={labelClass}>Satuan *</label>
                <DropdownWithAdd
                  value={formData.unit}
                  options={units}
                  onChange={v => setFormData(p => ({ ...p, unit: v }))}
                  onAdd={onAddUnit}
                  onRemove={onRemoveUnit}
                  placeholder="Pilih satuan"
                />
              </div>

              {/* Gambar */}
              <div>
                <label className={labelClass}>Gambar Produk (maks {MAX_IMAGES})</label>
                <MultiImageUpload
                  images={formData.images}
                  onChange={imgs => setFormData(p => ({ ...p, images: imgs }))}
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className={labelClass}>Deskripsi *</label>
                <textarea required rows={3} placeholder="Jelaskan detail produk..."
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  className={`${inputClass} resize-none`} />
              </div>

              {/* Detail Spesifik Custom */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <p className="font-[family-name:var(--font-inter)] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Detail Spesifik (Custom)
                </p>
                <DetailsEditor
                  details={formData.details}
                  onChange={d => setFormData(p => ({ ...p, details: d }))}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600
                             font-[family-name:var(--font-inter)] text-[13px] font-semibold
                             hover:bg-slate-50 transition-all active:scale-95">
                  Batal
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#A47251] text-white
                             font-[family-name:var(--font-inter)] text-[13px] font-semibold
                             hover:bg-[#DD9E59] transition-all active:scale-95
                             shadow-[0_2px_8px_rgba(164,114,81,0.25)]">
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
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
export function DeleteProductModal({
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
              Hapus Produk?
            </h3>
            <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mb-6">
              Produk akan dihapus dari katalog secara permanen.
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
