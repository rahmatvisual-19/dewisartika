'use client';

import { useState, useEffect } from 'react';
import { Phone, Globe, MapPin, Plus, Trash2, Pencil, Check, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
  const [editing, setEditing] = useState(value === '');
  const [draft, setDraft]     = useState(value);

  const save = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  const inputClass =
    "flex-1 px-3 py-2 rounded-xl border border-[#8B5E3C] bg-white " +
    "font-[family-name:var(--font-inter)] text-sm text-slate-800 " +
    "focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 transition-all";

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
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#8B5E3C] text-white active:scale-90 transition-all cursor-pointer">
            <Check size={14} strokeWidth={2} />
          </button>
          <button onClick={cancel}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 active:scale-90 transition-all cursor-pointer">
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
                       hover:border-[#8B5E3C] hover:text-[#8B5E3C] transition-all active:scale-90 cursor-pointer">
            <Pencil size={13} strokeWidth={1.5} />
          </button>
          <button onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-red-400
                       hover:border-red-400 hover:bg-red-50 transition-all active:scale-90 cursor-pointer">
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
  const [editing, setEditing] = useState(tailor.name === '' && tailor.phone === '');
  const [name,    setName]    = useState(tailor.name);
  const [phone,   setPhone]   = useState(tailor.phone);

  const save = () => { onSave({ ...tailor, name, phone }); setEditing(false); };
  const cancel = () => { setName(tailor.name); setPhone(tailor.phone); setEditing(false); };

  const inputClass =
    "w-full px-3 py-2 rounded-xl border border-[#8B5E3C] bg-white " +
    "font-[family-name:var(--font-inter)] text-sm text-slate-800 " +
    "focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 transition-all";

  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      {editing ? (
        <div className="space-y-2">
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Nama penjahit" className={inputClass} autoFocus />
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="Nomor WA (cth: 628123...)" className={inputClass} />
          <div className="flex gap-2 pt-1">
            <button onClick={save}
              className="flex-1 py-2 rounded-xl bg-[#8B5E3C] text-white
                         font-[family-name:var(--font-inter)] text-[12px] font-semibold
                         hover:bg-[#DD9E59] transition-all active:scale-95 cursor-pointer">
              Simpan
            </button>
            <button onClick={cancel}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600
                         font-[family-name:var(--font-inter)] text-[12px] font-semibold
                         hover:bg-slate-50 transition-all active:scale-95 cursor-pointer">
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
                       hover:border-[#8B5E3C] hover:text-[#8B5E3C] transition-all active:scale-90 cursor-pointer">
            <Pencil size={13} strokeWidth={1.5} />
          </button>
          <button onClick={() => onDelete(tailor.id)}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-red-400
                       hover:border-red-400 hover:bg-red-50 transition-all active:scale-90 cursor-pointer">
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
  const [editing, setEditing] = useState(entry.label === '' && entry.url === '');
  const [label,   setLabel]   = useState(entry.label);
  const [url,     setUrl]     = useState(entry.url);

  const save = () => { onSave({ ...entry, label, url }); setEditing(false); };
  const cancel = () => { setLabel(entry.label); setUrl(entry.url); setEditing(false); };

  const inputClass =
    "w-full px-3 py-2 rounded-xl border border-[#8B5E3C] bg-white " +
    "font-[family-name:var(--font-inter)] text-sm text-slate-800 " +
    "focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 transition-all";

  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      {editing ? (
        <div className="space-y-2">
          <input type="text" value={label} onChange={e => setLabel(e.target.value)}
            placeholder="Label (cth: www.tailorcraft.com)" className={inputClass} autoFocus />
          <input type="url" value={url} onChange={e => setUrl(e.target.value)}
            placeholder="URL (cth: https://tailorcraft.com)" className={inputClass} />
          <div className="flex gap-2 pt-1">
            <button onClick={save}
              className="flex-1 py-2 rounded-xl bg-[#8B5E3C] text-white
                         font-[family-name:var(--font-inter)] text-[12px] font-semibold
                         hover:bg-[#DD9E59] transition-all active:scale-95 cursor-pointer">
              Simpan
            </button>
            <button onClick={cancel}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600
                         font-[family-name:var(--font-inter)] text-[12px] font-semibold
                         hover:bg-slate-50 transition-all active:scale-95 cursor-pointer">
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
                       hover:border-[#8B5E3C] hover:text-[#8B5E3C] transition-all active:scale-90 cursor-pointer">
            <Pencil size={13} strokeWidth={1.5} />
          </button>
          <button onClick={() => onDelete(entry.id)}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-red-400
                       hover:border-red-400 hover:bg-red-50 transition-all active:scale-90 cursor-pointer">
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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#F0D8A1]/30 flex items-center justify-center text-[#8B5E3C]">
          <Icon size={16} strokeWidth={1.5} />
        </div>
        <h2 className="font-[family-name:var(--font-inter)] text-[14px] font-bold text-slate-800">
          {title}
        </h2>
      </div>
      <div className="px-5 pb-4 flex-grow flex flex-col justify-between">
        <div className="flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminKontakPage() {
  const [tailors,   setTailors]   = useState<Tailor[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [websites,  setWebsites]  = useState<WebEntry[]>([]);
  const [adminCtas, setAdminCtas] = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch contact entries from Supabase
  const fetchContacts = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        setTailors(data.filter(c => c.type === 'tailor').map(c => ({ id: c.id.toString(), name: c.name || '', phone: c.value })));
        setAddresses(data.filter(c => c.type === 'address').map(c => ({ id: c.id.toString(), value: c.value })));
        setWebsites(data.filter(c => c.type === 'website').map(c => ({ id: c.id.toString(), label: c.name || '', url: c.value })));
        setAdminCtas(data.filter(c => c.type === 'admin_cta').map(c => ({ id: c.id.toString(), value: c.value })));
      }
    } catch (err: any) {
      console.error('Error loading contacts:', err);
      setErrorMessage(`Gagal mengambil data dari Supabase: ${err.message || 'Pastikan tabel "contacts" sudah siap.'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Tailor handlers
  const saveTailor = async (t: Tailor) => {
    setLoading(true);
    try {
      if (t.id.startsWith('temp-')) {
        const { error } = await supabase
          .from('contacts')
          .insert([{ type: 'tailor', name: t.name, value: t.phone }]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contacts')
          .update({ name: t.name, value: t.phone })
          .eq('id', t.id);
        if (error) throw error;
      }
      await fetchContacts();
    } catch (err: any) {
      alert(`Gagal menyimpan data penjahit: ${err.message}`);
      setLoading(false);
    }
  };

  const deleteTailor = async (id: string) => {
    if (id.startsWith('temp-')) {
      setTailors(prev => prev.filter(x => x.id !== id));
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchContacts();
    } catch (err: any) {
      alert(`Gagal menghapus data: ${err.message}`);
      setLoading(false);
    }
  };

  const addTailor = () => {
    setTailors(prev => [...prev, { id: 'temp-' + Date.now(), name: '', phone: '' }]);
  };

  // Address handlers
  const saveAddress = async (id: string, value: string) => {
    setLoading(true);
    try {
      if (id.startsWith('temp-')) {
        const { error } = await supabase
          .from('contacts')
          .insert([{ type: 'address', value }]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contacts')
          .update({ value })
          .eq('id', id);
        if (error) throw error;
      }
      await fetchContacts();
    } catch (err: any) {
      alert(`Gagal menyimpan alamat: ${err.message}`);
      setLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (id.startsWith('temp-')) {
      setAddresses(prev => prev.filter(x => x.id !== id));
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchContacts();
    } catch (err: any) {
      alert(`Gagal menghapus alamat: ${err.message}`);
      setLoading(false);
    }
  };

  const addAddress = () => {
    setAddresses(prev => [...prev, { id: 'temp-' + Date.now(), value: '' }]);
  };

  // Website handlers
  const saveWebsite = async (entry: WebEntry) => {
    setLoading(true);
    try {
      if (entry.id.startsWith('temp-')) {
        const { error } = await supabase
          .from('contacts')
          .insert([{ type: 'website', name: entry.label, value: entry.url }]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contacts')
          .update({ name: entry.label, value: entry.url })
          .eq('id', entry.id);
        if (error) throw error;
      }
      await fetchContacts();
    } catch (err: any) {
      alert(`Gagal menyimpan website: ${err.message}`);
      setLoading(false);
    }
  };

  const deleteWebsite = async (id: string) => {
    if (id.startsWith('temp-')) {
      setWebsites(prev => prev.filter(x => x.id !== id));
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchContacts();
    } catch (err: any) {
      alert(`Gagal menghapus website: ${err.message}`);
      setLoading(false);
    }
  };

  const addWebsite = () => {
    setWebsites(prev => [...prev, { id: 'temp-' + Date.now(), label: '', url: '' }]);
  };

  // Admin CTA handlers
  const saveAdminCta = async (id: string, value: string) => {
    setLoading(true);
    try {
      if (id.startsWith('temp-')) {
        const { error } = await supabase
          .from('contacts')
          .insert([{ type: 'admin_cta', name: 'WhatsApp Admin / CTA', value }]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contacts')
          .update({ value })
          .eq('id', id);
        if (error) throw error;
      }
      await fetchContacts();
    } catch (err: any) {
      alert(`Gagal menyimpan nomor CTA Admin: ${err.message}`);
      setLoading(false);
    }
  };

  const deleteAdminCta = async (id: string) => {
    if (id.startsWith('temp-')) {
      setAdminCtas([]);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchContacts();
    } catch (err: any) {
      alert(`Gagal menghapus nomor CTA: ${err.message}`);
      setLoading(false);
    }
  };

  const addAdminCta = () => {
    setAdminCtas([{ id: 'temp-' + Date.now(), value: '' }]);
  };

  const addBtnClass =
    "w-full flex items-center justify-center gap-2 py-2.5 mt-2 rounded-xl border border-dashed border-[#8B5E3C]/40 " +
    "font-[family-name:var(--font-inter)] text-[12px] font-semibold text-[#8B5E3C] " +
    "hover:bg-[#F0D8A1]/20 transition-all active:scale-95 cursor-pointer";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="font-[family-name:var(--font-inter)] text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-[#F0D8A1]/30 text-[#8B5E3C] rounded-lg">
              <Phone size={18} strokeWidth={1.5} />
            </div>
            Kelola Kontak
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mt-1">
            Kelola nomor WhatsApp penjahit, alamat, website, dan nomor CTA Admin yang tampil di web.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Nomor WhatsApp Penjahit */}
        <SectionCard icon={Phone} title="Nomor WhatsApp Penjahit">
          {tailors.map(t => (
            <TailorRow key={t.id} tailor={t} onSave={saveTailor} onDelete={deleteTailor} />
          ))}
          <button onClick={addTailor} className={addBtnClass}>
            <Plus size={14} strokeWidth={2} /> Tambah Penjahit
          </button>
        </SectionCard>

        <div className="space-y-6 flex flex-col h-full">
          {/* Nomor CTA Admin */}
          <SectionCard icon={Phone} title="Nomor WhatsApp CTA Admin">
            <div className="text-[12px] text-slate-400 font-[family-name:var(--font-inter)] mb-3 leading-relaxed">
              Nomor WhatsApp utama untuk tombol konsultasi produk (WhatsApp Admin) di halaman detail.
            </div>
            {adminCtas.map(c => (
              <EditableRow
                key={c.id}
                value={c.value}
                placeholder="Nomor WA (cth: 628123...)"
                onSave={v => saveAdminCta(c.id, v)}
                onDelete={() => deleteAdminCta(c.id)}
              />
            ))}
            {adminCtas.length === 0 && (
              <button onClick={addAdminCta} className={addBtnClass}>
                <Plus size={14} strokeWidth={2} /> Tambah Nomor CTA Admin
              </button>
            )}
          </SectionCard>

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
