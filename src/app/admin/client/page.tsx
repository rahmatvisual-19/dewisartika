'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Users, Plus } from 'lucide-react';
import {
  ClientCard, ClientFormModal, DeleteClientModal,
  ClientData,
} from '@/components/admin/AdminClientComponents';

const initialClients: ClientData[] = [
  { id: '1', name: 'Nvidia',    logoUrl: 'https://svgl.app/library/nvidia-wordmark-light.svg'          },
  { id: '2', name: 'Supabase',  logoUrl: 'https://svgl.app/library/supabase_wordmark_light.svg'        },
  { id: '3', name: 'OpenAI',    logoUrl: 'https://svgl.app/library/openai_wordmark_light.svg'          },
  { id: '4', name: 'Vercel',    logoUrl: 'https://svgl.app/library/vercel_wordmark.svg'                },
  { id: '5', name: 'GitHub',    logoUrl: 'https://svgl.app/library/github_wordmark_light.svg'          },
  { id: '6', name: 'Claude AI', logoUrl: 'https://svgl.app/library/claude-ai-wordmark-icon_light.svg'  },
];

export default function AdminClientPage() {
  const [clients, setClients]         = useState<ClientData[]>(initialClients);
  const [isFormOpen, setIsFormOpen]   = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [isDeleteOpen, setIsDeleteOpen]   = useState(false);
  const [deletingId, setDeletingId]       = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<ClientData, 'id'>>({ name: '', logoUrl: '' });

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

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingClient) {
      setClients(prev => prev.map(c => c.id === editingClient.id ? { ...formData, id: editingClient.id } : c));
    } else {
      setClients(prev => [...prev, { ...formData, id: Date.now().toString() }]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (deletingId) {
      setClients(prev => prev.filter(c => c.id !== deletingId));
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
              <Users size={18} strokeWidth={1.5} />
            </div>
            Klien &amp; Partner
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mt-1">
            Kelola logo klien yang tampil di slider beranda.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2
                     font-[family-name:var(--font-inter)] text-[13px] font-semibold
                     bg-[#A47251] text-white rounded-xl px-5 py-2.5
                     hover:bg-[#DD9E59] transition-all duration-300 active:scale-95
                     shadow-[0_2px_8px_rgba(164,114,81,0.25)]">
          <Plus size={16} strokeWidth={2} /> Tambah Klien
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
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
