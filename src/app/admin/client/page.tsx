'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Users, Plus, Loader2 } from 'lucide-react';
import {
  ClientCard, ClientFormModal, DeleteClientModal,
  ClientData, ClientFormData
} from '@/components/admin/AdminClientComponents';
import { supabase } from '@/lib/supabase';
import { compressAndConvertToWebp } from '@/lib/imageCompressor';

export default function AdminClientPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ClientFormData>({ name: '', logoUrl: '' });

  // Fetch clients from Supabase
  const fetchClients = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        setClients(data.map(c => ({
          id: c.id,
          name: c.name,
          logoUrl: c.logo_url
        })));
      }
    } catch (error: any) {
      console.error('Error fetching clients:', error?.message || error);
      setErrorMessage(
        `Gagal memuat data klien dari Supabase: ${error?.message || 'Pastikan tabel "clients" sudah dibuat.'}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openCreate = () => {
    setFormData({ name: '', logoUrl: '' });
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const openEdit = (client: ClientData) => {
    setFormData({ name: client.name, logoUrl: client.logoUrl });
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  // Helper function to upload logo to Supabase Storage
  const uploadToStorage = async (file: File): Promise<string | null> => {
    try {
      // Kompres dan ubah ke format WebP
      const compressedFile = await compressAndConvertToWebp(file);
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.webp`;
      const filePath = `logos/${fileName}`;

      const { data, error } = await supabase.storage
        .from('client-logos')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        if (error.message?.toLowerCase().includes('bucket') || error.message?.toLowerCase().includes('not found')) {
          alert(
            "PENTING: Gagal mengunggah logo ke Storage!\n\n" +
            "Pastikan Anda telah membuat Bucket bernama 'client-logos' di dasbor Supabase (Storage -> New Bucket), " +
            "serta mengaturnya sebagai 'Public'.\n\n" +
            "Detail error: " + error.message
          );
        } else {
          alert("Gagal mengunggah logo ke Storage: " + error.message);
        }
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('client-logos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      alert("Terjadi kesalahan saat mengunggah logo: " + err.message);
      return null;
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    let finalLogoUrl = formData.logoUrl;

    // Jika admin mengunggah file baru, proses upload terlebih dahulu
    if (formData.logoFile) {
      const uploadedUrl = await uploadToStorage(formData.logoFile);
      if (!uploadedUrl) {
        setLoading(false);
        return; // Hentikan penyimpanan jika upload gagal
      }
      finalLogoUrl = uploadedUrl;
    }

    try {
      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update({ name: formData.name, logo_url: finalLogoUrl })
          .eq('id', editingClient.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clients')
          .insert([{ name: formData.name, logo_url: finalLogoUrl }]);
        if (error) throw error;
      }

      setIsFormOpen(false);
      await fetchClients();
    } catch (error: any) {
      alert("Gagal menyimpan ke database: " + error.message);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deletingId) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', deletingId);

        if (error) throw error;

        setIsDeleteOpen(false);
        setDeletingId(null);
        await fetchClients();
      } catch (error: any) {
        alert("Gagal menghapus klien: " + error.message);
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
              <Users size={18} strokeWidth={1.5} />
            </div>
            Klien &amp; Partner
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mt-1">
            Kelola logo klien secara dinamis menggunakan database Supabase.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {loading && (
            <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium font-[family-name:var(--font-inter)] bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Loader2 size={14} className="animate-spin text-[#8B5E3C]" />
              Memproses...
            </div>
          )}
          
          <button
            onClick={openCreate}
            disabled={loading}
            className="inline-flex items-center gap-2
                       font-[family-name:var(--font-inter)] text-[13px] font-semibold
                       bg-[#8B5E3C] text-white rounded-xl px-5 py-2.5
                       hover:bg-[#DD9E59] transition-all duration-300 active:scale-95 disabled:opacity-55
                       shadow-[0_2px_8px_rgba(164,114,81,0.25)]">
            <Plus size={16} strokeWidth={2} /> Tambah Klien
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[13px] text-red-600 font-[family-name:var(--font-inter)] shadow-sm">
          {errorMessage}
        </div>
      )}

      {/* Grid */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 ${loading ? 'opacity-70 pointer-events-none' : ''}`}>
        <AnimatePresence>
          {clients.map(client => (
            <ClientCard key={client.id} client={client} onEdit={openEdit} onDelete={openDelete} />
          ))}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <ClientFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        isEditing={!!editingClient}
        formData={formData}
        setFormData={setFormData}
      />
      <DeleteClientModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
