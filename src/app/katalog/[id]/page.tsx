import Link from 'next/link';
import ProductDetailView from '@/components/ProductDetailView';
import { supabase } from '@/lib/supabase';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let product: any = null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      product = {
        id: data.id,
        name: data.name,
        category: data.category,
        price: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(data.price)),
        unit: data.unit,
        image: data.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?q=80&w=1000&auto=format&fit=crop',
        images: data.images || [],
        desc: data.description,
        details: data.details || [],
        colors: data.colors || [],
        sizes: data.sizes || [],
      };
    }
  } catch (err) {
    console.error('Error fetching product details from Supabase:', err);
  }

  if (!product) {
    return (
      <main className="min-h-screen pt-20 pb-16 flex flex-col items-center justify-center bg-white">
        <h1
          className="font-[family-name:var(--font-instrument-serif)] text-4xl font-normal text-slate-800 mb-4"
          style={{ letterSpacing: '-0.02em' }}
        >
          Produk Tidak Ditemukan
        </h1>
        <p className="font-[family-name:var(--font-inter)] text-slate-500 text-[15px] mb-8">
          Maaf, barang atau jasa yang Anda cari tidak tersedia.
        </p>
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2
                     font-[family-name:var(--font-inter)] text-[14px] font-semibold
                     bg-[#8B5E3C] text-white rounded-full px-8 py-4
                     hover:bg-[#DD9E59] transition-all duration-300 active:scale-95"
        >
          Kembali ke Katalog
        </Link>
      </main>
    );
  }

  return <ProductDetailView product={product} />;
}
