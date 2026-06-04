'use client';

import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Shirt, Search, Loader2 } from 'lucide-react';
import {
  AdminProductCard, ProductFormModal, DeleteProductModal, ProductData,
} from '@/components/admin/AdminProductComponents';
import { supabase } from '@/lib/supabase';
import { compressAndConvertToWebp } from '@/lib/imageCompressor';

const DEFAULT_CATEGORIES = ['Material Kain', 'Jasa Tailoring', 'Ready to Wear', 'Aksesoris'];

const emptyForm = (): Omit<ProductData, 'id'> & { newImageFiles?: File[] } => ({
  name: '',
  category: '',
  price: 0,
  unit: '',
  images: [],
  description: '',
  details: [],
  colors: [],
  sizes: [],
  newImageFiles: [],
});

export default function AdminProductPage() {
  const [products, setProducts]             = useState<ProductData[]>([]);
  const [categories, setCategories]         = useState<string[]>(DEFAULT_CATEGORIES);
  const [units, setUnits]                   = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen]         = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [isDeleteOpen, setIsDeleteOpen]     = useState(false);
  const [deletingId, setDeletingId]         = useState<string | null>(null);
  const [formData, setFormData]             = useState<Omit<ProductData, 'id'> & { newImageFiles?: File[] }>(emptyForm());
  const [loading, setLoading]               = useState(false);
  const [errorMessage, setErrorMessage]     = useState<string | null>(null);

  // ── Search & Filter ──
  const [search, setSearch]               = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  // Fetch products and units from Supabase
  const fetchProductsAndUnits = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // 1. Fetch units
      const { data: dbUnits, error: unitsError } = await supabase
        .from('product_units')
        .select('*')
        .order('name');
      if (unitsError) throw unitsError;
      if (dbUnits) {
        setUnits(dbUnits.map((u: any) => u.name));
      }

      // 2. Fetch products
      const { data: dbProducts, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (productsError) throw productsError;
      if (dbProducts) {
        setProducts(dbProducts.map((p: any) => ({
          id: p.id.toString(),
          name: p.name,
          category: p.category,
          price: Number(p.price),
          unit: p.unit,
          images: p.images || [],
          description: p.description,
          details: p.details || [],
          colors: p.colors || [],
          sizes: p.sizes || [],
        })));
      }
    } catch (error: any) {
      console.error('Error fetching products/units:', error?.message || error);
      setErrorMessage(`Gagal mengambil data dari Supabase: ${error?.message || 'Pastikan tabel database sudah siap.'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndUnits();
  }, []);

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
      name: product.name,
      category: product.category,
      price: product.price,
      unit: product.unit,
      images: product.images,
      description: product.description,
      details: product.details || [],
      colors: product.colors || [],
      sizes: product.sizes || [],
      newImageFiles: [],
    });
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const openDelete = (id: string) => { setDeletingId(id); setIsDeleteOpen(true); };

  // Helper upload file ke storage bucket 'product-images'
  const uploadFileToStorage = async (file: File): Promise<string | null> => {
    try {
      // Kompres dan ubah ke format WebP
      const compressedFile = await compressAndConvertToWebp(file);
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.webp`;
      const filePath = `catalog/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error uploading file:', error.message);
        alert(`Gagal mengunggah gambar ke Storage: ${error.message}`);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      console.error('Error uploading file to storage:', err);
      alert(err.message || 'Gagal memproses gambar.');
      return null;
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Upload file gambar umum produk yang berupa blob url
      let uploadedImages = [...formData.images];
      if (formData.newImageFiles && formData.newImageFiles.length > 0) {
        for (const file of formData.newImageFiles) {
          const publicUrl = await uploadFileToStorage(file);
          if (publicUrl) {
            const blobIdx = uploadedImages.findIndex(img => img.startsWith('blob:'));
            if (blobIdx !== -1) {
              uploadedImages[blobIdx] = publicUrl;
            } else {
              uploadedImages.push(publicUrl);
            }
          }
        }
      }
      uploadedImages = uploadedImages.filter(img => !img.startsWith('blob:'));

      // 2. Upload file gambar untuk variasi Warna
      const uploadedColors = [];
      for (const c of (formData.colors || [])) {
        let imageUrl = c.image;
        if (c.newImageFile) {
          const publicUrl = await uploadFileToStorage(c.newImageFile);
          if (publicUrl) imageUrl = publicUrl;
        }
        uploadedColors.push({
          color: c.color,
          image: imageUrl,
        });
      }

      // 3. Upload file gambar untuk variasi Ukuran
      const uploadedSizes = [];
      for (const s of (formData.sizes || [])) {
        let imageUrl = s.image;
        if (s.newImageFile) {
          const publicUrl = await uploadFileToStorage(s.newImageFile);
          if (publicUrl) imageUrl = publicUrl;
        }
        uploadedSizes.push({
          size: s.size,
          image: imageUrl,
        });
      }

      // 4. Save to Database products
      const payload = {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        unit: formData.unit,
        images: uploadedImages,
        description: formData.description,
        details: formData.details,
        colors: uploadedColors,
        sizes: uploadedSizes,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([payload]);
        if (error) throw error;
      }

      setIsFormOpen(false);
      await fetchProductsAndUnits();
    } catch (err: any) {
      console.error('Error saving product:', err?.message || err);
      alert(`Gagal menyimpan produk: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deletingId) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', deletingId);
        if (error) throw error;
        
        setIsDeleteOpen(false);
        setDeletingId(null);
        await fetchProductsAndUnits();
      } catch (err: any) {
        console.error('Error deleting product:', err?.message || err);
        alert(`Gagal menghapus produk: ${err?.message || err}`);
        setLoading(false);
      }
    }
  };

  const addCategory = (v: string) => {
    if (!categories.includes(v)) setCategories(prev => [...prev, v]);
  };

  const addUnit = async (v: string) => {
    if (!units.includes(v)) {
      const { error } = await supabase
        .from('product_units')
        .insert([{ name: v }]);
      if (!error) {
        setUnits(prev => [...prev, v]);
      } else {
        console.error('Error adding unit to Supabase:', error.message);
      }
    }
  };

  const removeCategory = (v: string) => {
    setCategories(prev => prev.filter(c => c !== v));
  };

  const removeUnit = async (v: string) => {
    const { error } = await supabase
      .from('product_units')
      .delete()
      .eq('name', v);
    if (!error) {
      setUnits(prev => prev.filter(u => u !== v));
    } else {
      console.error('Error deleting unit from Supabase:', error.message);
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
              <Shirt size={18} strokeWidth={1.5} />
            </div>
            Katalog Produk
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mt-1">
            Kelola daftar produk, harga, dan spesifikasinya.
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
            suppressHydrationWarning
            disabled={loading}
            className="inline-flex items-center gap-2
                       font-[family-name:var(--font-inter)] text-[13px] font-semibold
                       bg-[#8B5E3C] text-white rounded-xl px-5 py-2.5
                       hover:bg-[#DD9E59] transition-all duration-300 active:scale-95 disabled:opacity-55
                       shadow-[0_2px_8px_rgba(164,114,81,0.25)]">
            <Plus size={16} strokeWidth={2} /> Tambah Produk
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[13px] text-red-600 font-[family-name:var(--font-inter)] shadow-sm">
          {errorMessage}
        </div>
      )}

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
                       focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C]
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
                            ? 'bg-[#8B5E3C] text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-[#8B5E3C] hover:text-[#8B5E3C]'
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
        setFormData={setFormData as any}
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
