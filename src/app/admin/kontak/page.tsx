'use client';

import { useState } from 'react';
import { Phone, Globe, MapPin, Plus, Trash2, Pencil, Check, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Tailor {
  id: string;
  name: string;
  phone: string;
}

interface WebEntry {
  id: string;
  label: string;
  url: string;
}

// ─── Initial Data ─────────────────────────────────────────────────────────────
const initialTailors: Tailor[] = [
  { id: '1', name: 'Dewi Sartika',     phone: '6281362989136' },
  { id: '2', name: 'Penjahit Maulana', phone: '6285262472451' },
];

const initialAddresses = [
  { id: '1', value: 'Jl. Sudirman No. 123, Jakarta Selatan' },
];

const initialWebsites: WebEntry[] = [
  { id: '1', label: 'www.tailorcraft.com', url: 'https://tailorcraft.com' },
];

// ─── Inline Edit Row ──────────────────────────────────────────────────────────
function EditableRow({
  label, value, onSave, onDelete, placeholder,
}: {
  label?: string;
  value: string;
  onSave: (v: string) => void;
  onDelete: () => void;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);

  const save = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  const inputClass =
    "flex-1 px-3 py-2 rounded-xl border border-[#A47251] bg-white " +
    "font-[family-name:var(--font-inter)] text-sm text-slate-800 " +
    "focus:outline-none focus:ring-2 focus:ring-[#A47251]/30 transition-all";

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      {editing ? (
        <>
          <input
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder={placeholder}
            className={inputClass}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
            autoFocus
          />
          <button onClick={save}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#A47251] text-white active:scale-90 transition-all">
            <Check size={14} strokeWidth={2} />
          </button>
          <button onClick={cancel}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 active:scale-90 transition-all">
            <X size={14} strokeWidth={2} />
          </button>
        </>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            {label && (
              <p className="font-[family-name:var(--font-inter)] text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                {label}
              </p>
            )}
            <p className="font-[family-name:var(--font-inter)] text-[14px] text-slate-700 truncate">
              {value}
            </p>
          </div>
          <button onClick={() => setEditing(true)}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400
                       hover:border-[#A47251] hover:text-[#A47251] transition-all active:scale-90">
            <Pencil size={13} strokeWidth={1.5} />
          </button>
          <button onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-red-400
                       hover:border-red-400 hover:bg-red-50 transition-all active:scale-90">
            <Trash2 size={13} strokeWidth={1.5} />
          </button>
        </>
      )}
    </div>
  );
}

// ─── Tailor Row (nama + nomor) ────────────────────────────────────────────────
function TailorRow({
  tailor, onSave, onDelete,
}: { tailor: Tailor; onSave: (t: Tailor) => void; onDelete: (id: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [name,    setName]    = useState(tailor.name);
  const [phone,   setPhone]   = useState(tailor.phone);

  const save = () => { onSave({ ...tailor, name, phone }); setEditing(false); };
  const cancel = () => { setName(tailor.name); setPhone(tailor.phone); setEditing(false); };

  const inputClass =
    "w-full px-3 py-2 rounded-xl border border-[#A47251] bg-white " +
    "font-[family-name:var(--font-inter)] text-sm text-slate-800 " +
    "focus:outline-none focus:ring-2 focus:ring-[#A47251]/30 transition-all";

  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      {editing ? (
        <div className="space-y-2">
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Nama penjahit" className={inputClass} />
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="Nomor WA (cth: 628123...)" className={inputClass} />
          <div className="flex gap-2 pt-1">
            <button onClick={save}
              className="flex-1 py-2 rounded-xl bg-[#A47251] text-white
                         font-[family-name:var(--font-inter)] text-[12px] font-semibold
                         hover:bg-[#DD9E59] transition-all active:scale-95">
              Simpan
            </button>
            <button onClick={cancel}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600
                         font-[family-name:var(--font-inter)] text-[12px] font-semibold
                         hover:bg-slate-50 transition-all active:scale-95">
              Batal
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-[family-name:var(--font-inter)] text-[14px] font-semibold text-slate-800">
              {tailor.name}
            </p>
            <p className="font-[family-name:var(--font-inter)] text-[12px] text-slate-500 mt-0.5">
              +{tailor.phone}
            </p>
          </div>
          <button onClick={() => setEditing(true)}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400
                       hover:border-[#A47251] hover:text-[#A47251] transition-all active:scale-90">
            <Pencil size={13} strokeWidth={1.5} />
          </button>
          <button onClick={() => onDelete(tailor.id)}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-red-400
                       hover:border-red-400 hover:bg-red-50 transition-all active:scale-90">
            <Trash2 size={13} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Website Row (label + url) ────────────────────────────────────────────────
function WebsiteRow({
  entry, onSave, onDelete,
}: { entry: WebEntry; onSave: (e: WebEntry) => void; onDelete: (id: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [label,   setLabel]   = useState(entry.label);
  const [url,     setUrl]     = useState(entry.url);

  const save = () => { onSave({ ...entry, label, url }); setEditing(false); };
  const cancel = () => { setLabel(entry.label); setUrl(entry.url); setEditing(false); };

  const inputClass =
    "w-full px-3 py-2 rounded-xl border border-[#A47251] bg-white " +
    "font-[family-name:var(--font-inter)] text-sm text-slate-800 " +
    "focus:outline-none focus:ring-2 focus:ring-[#A47251]/30 transition-all";

  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      {editing ? (
        <div className="space-y-2">
          <input type="text" value={label} onChange={e => setLabel(e.target.value)}
            placeholder="Label (cth: www.tailorcraft.com)" className={inputClass} />
          <input type="url" value={url} onChange={e => setUrl(e.target.value)}
            placeholder="URL (cth: https://tailorcraft.com)" className={inputClass} />
          <div className="flex gap-2 pt-1">
            <button onClick={save}
              className="flex-1 py-2 rounded-xl bg-[#A47251] text-white
                         font-[family-name:var(--font-inter)] text-[12px] font-semibold
                         hover:bg-[#DD9E59] transition-all active:scale-95">
              Simpan
            </button>
            <button onClick={cancel}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600
                         font-[family-name:var(--font-inter)] text-[12px] font-semibold
                         hover:bg-slate-50 transition-all active:scale-95">
              Batal
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-[family-name:var(--font-inter)] text-[14px] font-semibold text-slate-800 truncate">
              {entry.label}
            </p>
            <p className="font-[family-name:var(--font-inter)] text-[12px] text-slate-500 truncate mt-0.5">
              {entry.url}
            </p>
          </div>
          <button onClick={() => setEditing(true)}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400
                       hover:border-[#A47251] hover:text-[#A47251] transition-all active:scale-90">
            <Pencil size={13} strokeWidth={1.5} />
          </button>
          <button onClick={() => onDelete(entry.id)}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-red-400
                       hover:border-red-400 hover:bg-red-50 transition-all active:scale-90">
            <Trash2 size={13} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-[#F0D8A1]/30 flex items-center justify-center text-[#A47251]">
          <Icon size={16} strokeWidth={1.5} />
        </div>
        <h2 className="font-[family-name:var(--font-inter)] text-[14px] font-bold text-slate-800">
          {title}
        </h2>
      </div>
      <div className="px-5 pb-2">
        {children}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminKontakPage() {
  const [tailors,   setTailors]   = useState<Tailor[]>(initialTailors);
  const [addresses, setAddresses] = useState(initialAddresses);
  const [websites,  setWebsites]  = useState<WebEntry[]>(initialWebsites);

  // Tailor handlers
  const saveTailor  = (t: Tailor) => setTailors(prev => prev.map(x => x.id === t.id ? t : x));
  const deleteTailor = (id: string) => setTailors(prev => prev.filter(x => x.id !== id));
  const addTailor   = () => setTailors(prev => [...prev, { id: Date.now().toString(), name: '', phone: '' }]);

  // Address handlers
  const saveAddress  = (id: string, v: string) => setAddresses(prev => prev.map(x => x.id === id ? { ...x, value: v } : x));
  const deleteAddress = (id: string) => setAddresses(prev => prev.filter(x => x.id !== id));
  const addAddress   = () => setAddresses(prev => [...prev, { id: Date.now().toString(), value: '' }]);

  // Website handlers
  const saveWebsite  = (e: WebEntry) => setWebsites(prev => prev.map(x => x.id === e.id ? e : x));
  const deleteWebsite = (id: string) => setWebsites(prev => prev.filter(x => x.id !== id));
  const addWebsite   = () => setWebsites(prev => [...prev, { id: Date.now().toString(), label: '', url: '' }]);

  const addBtnClass =
    "w-full flex items-center justify-center gap-2 py-2.5 mt-2 rounded-xl border border-dashed border-[#A47251]/40 " +
    "font-[family-name:var(--font-inter)] text-[12px] font-semibold text-[#A47251] " +
    "hover:bg-[#F0D8A1]/20 transition-all active:scale-95";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="font-[family-name:var(--font-inter)] text-xl font-bold text-slate-800 flex items-center gap-2">
          <div className="p-2 bg-[#F0D8A1]/30 text-[#A47251] rounded-lg">
            <Phone size={18} strokeWidth={1.5} />
          </div>
          Kelola Kontak
        </h1>
        <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mt-1">
          Kelola nomor WhatsApp penjahit, alamat, dan website yang tampil di halaman kontak.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Nomor WhatsApp Penjahit */}
        <SectionCard icon={Phone} title="Nomor WhatsApp Penjahit">
          {tailors.map(t => (
            <TailorRow key={t.id} tailor={t} onSave={saveTailor} onDelete={deleteTailor} />
          ))}
          <button onClick={addTailor} className={addBtnClass}>
            <Plus size={14} strokeWidth={2} /> Tambah Penjahit
          </button>
        </SectionCard>

        <div className="space-y-6">
          {/* Alamat */}
          <SectionCard icon={MapPin} title="Alamat">
            {addresses.map(a => (
              <EditableRow
                key={a.id}
                value={a.value}
                placeholder="Jl. Contoh No. 1, Kota"
                onSave={v => saveAddress(a.id, v)}
                onDelete={() => deleteAddress(a.id)}
              />
            ))}
            <button onClick={addAddress} className={addBtnClass}>
              <Plus size={14} strokeWidth={2} /> Tambah Alamat
            </button>
          </SectionCard>

          {/* Website */}
          <SectionCard icon={Globe} title="Website">
            {websites.map(w => (
              <WebsiteRow key={w.id} entry={w} onSave={saveWebsite} onDelete={deleteWebsite} />
            ))}
            <button onClick={addWebsite} className={addBtnClass}>
              <Plus size={14} strokeWidth={2} /> Tambah Website
            </button>
          </SectionCard>
        </div>

      </div>
    </div>
  );
}
