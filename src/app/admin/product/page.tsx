'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Shirt, Search } from 'lucide-react';
import {
  AdminProductCard, ProductFormModal, DeleteProductModal, ProductData,
} from '@/components/admin/AdminProductComponents';

const initialProducts: ProductData[] = [
  {
    id: '1', name: 'Kancing Jas Eksklusif', category: 'Aksesoris', price: 85000, unit: '/lusin',
    images: ['https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?q=80&w=800&auto=format&fit=crop'],
    description: 'Set kancing jas premium berbahan kuningan anti-karat dengan ukiran klasik.',
    details: [{ label: 'Kualitas', value: 'Premium' }, { label: 'Garansi', value: 'Kepuasan 100%' }],
  },
  {
    id: '2', name: 'Kain Sutra Premium', category: 'Material Kain', price: 150000, unit: '/meter',
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop'],
    description: 'Kain sutra asli dengan tekstur sangat lembut dan kilau alami yang mewah.',
    details: [{ label: 'Grade', value: 'A' }, { label: 'Asal', value: 'Impor' }],
  },
];

const DEFAULT_CATEGORIES = ['Material Kain', 'Jasa Tailoring', 'Ready to Wear', 'Aksesoris'];
const DEFAULT_UNITS       = ['/biji', '/meter', '/lusin', '/set', '/pcs'];

const emptyForm = (): Omit<ProductData, 'id'> => ({
  name: '', category: '', price: 0, unit: '', images: [], description: '', details: [],
});

export default function AdminProductPage() {
  const [products, setProducts]             = useState<ProductData[]>(initialProducts);
  const [categories, setCategories]         = useState<string[]>(DEFAULT_CATEGORIES);
  const [units, setUnits]                   = useState<string[]>(DEFAULT_UNITS);
  const [isFormOpen, setIsFormOpen]         = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [isDeleteOpen, setIsDeleteOpen]     = useState(false);
  const [deletingId, setDeletingId]         = useState<string | null>(null);
  const [formData, setFormData]             = useState<Omit<ProductData, 'id'>>(emptyForm());

  // ── Search & Filter ──
  const [search, setSearch]               = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat    = activeCategory === 'Semua' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, search, activeCategory]);

  // Kategori unik dari produk yang ada + default
  const allCategories = useMemo(() => {
    const fromProducts = products.map(p => p.category).filter(Boolean);
    return ['Semua', ...Array.from(new Set([...DEFAULT_CATEGORIES, ...fromProducts]))];
  }, [products]);

  const openCreate = () => {
    setFormData(emptyForm());
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const openEdit = (product: ProductData) => {
    setFormData({
      name: product.name, category: product.category, price: product.price,
      unit: product.unit, images: product.images, description: product.description,
      details: product.details,
    });
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const openDelete = (id: string) => { setDeletingId(id); setIsDeleteOpen(true); };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...formData, id: editingProduct.id } : p));
    } else {
      setProducts(prev => [{ ...formData, id: Date.now().toString() }, ...prev]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (deletingId) {
      setProducts(prev => prev.filter(p => p.id !== deletingId));
      setIsDeleteOpen(false);
      setDeletingId(null);
    }
  };

  const addCategory = (v: string) => {
    if (!categories.includes(v)) setCategories(prev => [...prev, v]);
  };

  const addUnit = (v: string) => {
    if (!units.includes(v)) setUnits(prev => [...prev, v]);
  };

  const removeCategory = (v: string) => {
    setCategories(prev => prev.filter(c => c !== v));
  };

  const removeUnit = (v: string) => {
    setUnits(prev => prev.filter(u => u !== v));
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4
                      bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="font-[family-name:var(--font-inter)] text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-[#F0D8A1]/30 text-[#A47251] rounded-lg">
              <Shirt size={18} strokeWidth={1.5} />
            </div>
            Katalog Produk
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mt-1">
            Kelola daftar produk, harga, dan spesifikasinya.
          </p>
        </div>
        <button onClick={openCreate}
          suppressHydrationWarning
          className="inline-flex items-center gap-2
                     font-[family-name:var(--font-inter)] text-[13px] font-semibold
                     bg-[#A47251] text-white rounded-xl px-5 py-2.5
                     hover:bg-[#DD9E59] transition-all duration-300 active:scale-95
                     shadow-[0_2px_8px_rgba(164,114,81,0.25)]">
          <Plus size={16} strokeWidth={2} /> Tambah Produk
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            suppressHydrationWarning
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white
                       font-[family-name:var(--font-inter)] text-sm text-slate-800 placeholder:text-slate-400
                       focus:outline-none focus:ring-2 focus:ring-[#A47251]/30 focus:border-[#A47251]
                       transition-all shadow-sm"
          />
          <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        {/* Filter kategori */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              suppressHydrationWarning
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl
                          font-[family-name:var(--font-inter)] text-[12px] font-semibold
                          transition-all duration-200 active:scale-95
                          ${activeCategory === cat
                            ? 'bg-[#A47251] text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-[#A47251] hover:text-[#A47251]'
                          }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <AdminProductCard key={product.id} product={product} onEdit={openEdit} onDelete={openDelete} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <Search size={24} strokeWidth={1.5} />
              </div>
              <p className="font-[family-name:var(--font-inter)] text-[14px] font-semibold text-slate-600 mb-1">
                Produk tidak ditemukan
              </p>
              <p className="font-[family-name:var(--font-inter)] text-[12px] text-slate-400">
                Coba kata kunci lain atau ubah filter kategori
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        isEditing={!!editingProduct}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        onAddCategory={addCategory}
        onRemoveCategory={removeCategory}
        units={units}
        onAddUnit={addUnit}
        onRemoveUnit={removeUnit}
      />
      <DeleteProductModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
