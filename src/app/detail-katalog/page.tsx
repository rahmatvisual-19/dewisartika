import Link from 'next/link';
import ProductDetailView from '@/components/ProductDetailView';

const catalogData = [
  {
    id: 1,
    name: 'Kain Sutra Premium',
    category: 'Material Kain',
    price: 'Rp 150.000',
    unit: '/meter',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop',
    desc: 'Kain sutra asli dengan tekstur sangat lembut, jatuh, dan memiliki kilau alami yang mewah. Sangat cocok untuk pembuatan gaun malam, kebaya, atau kemeja eksklusif.',
    images: [],
    details: [],
    colors: [],
    sizes: []
  },
  {
    id: 2,
    name: 'Kancing Jas Eksklusif',
    category: 'Aksesoris',
    price: 'Rp 85.000',
    unit: '/lusin',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?q=80&w=1000&auto=format&fit=crop',
    desc: 'Set kancing jas premium berbahan kuningan anti-karat dengan ukiran klasik. Menambah kesan elegan pada setelan jas Anda.',
    images: [],
    details: [],
    colors: [],
    sizes: []
  },
  {
    id: 3,
    name: 'Custom Blazer Linen',
    category: 'Jasa Tailoring',
    price: 'Rp 1.850.000',
    unit: '/biji',
    image: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?q=80&w=1000&auto=format&fit=crop',
    desc: 'Jasa pembuatan blazer menggunakan material linen impor. Cocok untuk cuaca tropis, memberikan tampilan smart-casual yang berkelas.',
    images: [],
    details: [],
    colors: [],
    sizes: []
  },
  {
    id: 4,
    name: 'Kemeja Katun Polos',
    category: 'Ready to Wear',
    price: 'Rp 450.000',
    unit: '/biji',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop',
    desc: 'Kemeja pria ready-to-wear berbahan 100% katun bambu. Menyerap keringat, anti-bakteri, dan potongan slim-fit yang mengikuti bentuk tubuh.',
    images: [],
    details: [],
    colors: [],
    sizes: []
  },
];

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = catalogData.find(p => p.id.toString() === params.id);

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
