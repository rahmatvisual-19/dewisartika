import Link from 'next/link';
import ProductDetailView from '@/components/ProductDetailView';

const catalogData = [
  { id: 1,  name: 'Kain Sutra Premium',        category: 'Material Kain',  price: 'Rp 150.000',   unit: '/meter', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop', desc: 'Kain sutra asli dengan tekstur sangat lembut, jatuh, dan memiliki kilau alami yang mewah. Sangat cocok untuk pembuatan gaun malam, kebaya, atau kemeja eksklusif.' },
  { id: 2,  name: 'Kancing Jas Eksklusif',     category: 'Aksesoris',      price: 'Rp 85.000',    unit: '/lusin', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?q=80&w=1000&auto=format&fit=crop', desc: 'Set kancing jas premium berbahan kuningan anti-karat dengan ukiran klasik. Menambah kesan elegan pada setelan jas Anda.' },
  { id: 3,  name: 'Custom Blazer Linen',       category: 'Jasa Tailoring', price: 'Rp 1.850.000', unit: '/biji',  image: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?q=80&w=1000&auto=format&fit=crop', desc: 'Jasa pembuatan blazer menggunakan material linen impor. Cocok untuk cuaca tropis, memberikan tampilan smart-casual yang berkelas.' },
  { id: 4,  name: 'Kemeja Katun Polos',        category: 'Ready to Wear',  price: 'Rp 450.000',   unit: '/biji',  image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop', desc: 'Kemeja pria ready-to-wear berbahan 100% katun bambu. Menyerap keringat, anti-bakteri, dan potongan slim-fit yang mengikuti bentuk tubuh.' },
  { id: 5,  name: 'Kain Wool Italia',          category: 'Material Kain',  price: 'Rp 350.000',   unit: '/meter', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop', desc: 'Kain wool impor dari Italia dengan ketebalan sedang, cocok untuk pembuatan jas, mantel, atau celana formal berkualitas tinggi.' },
  { id: 6,  name: 'Setelan Jas Navy Bespoke',  category: 'Jasa Tailoring', price: 'Rp 4.500.000', unit: '/set',   image: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?q=80&w=1000&auto=format&fit=crop', desc: 'Setelan jas bespoke warna navy dengan lapisan dalam sutra. Dibuat sepenuhnya sesuai ukuran dan preferensi Anda.' },
  { id: 7,  name: 'Benang Jahit Ekstra Kuat',  category: 'Aksesoris',      price: 'Rp 25.000',    unit: '/lusin', image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1000&auto=format&fit=crop', desc: 'Benang jahit polyester ekstra kuat dengan 50 warna pilihan. Tahan lama dan tidak mudah putus meski digunakan pada mesin jahit industri.' },
  { id: 8,  name: 'Kebaya Payet Modern',       category: 'Jasa Tailoring', price: 'Rp 2.800.000', unit: '/biji',  image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1000&auto=format&fit=crop', desc: 'Kebaya modern dengan hiasan payet tangan yang dikerjakan secara detail. Cocok untuk acara pernikahan, wisuda, atau pesta formal.' },
  { id: 9,  name: 'Kain Batik Tulis Solo',     category: 'Material Kain',  price: 'Rp 320.000',   unit: '/meter', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1000&auto=format&fit=crop', desc: 'Batik tulis asli Solo dengan motif klasik parang dan kawung. Dibuat oleh pengrajin batik berpengalaman menggunakan canting dan malam alami.' },
  { id: 10, name: 'Celana Chino Slim Fit',     category: 'Ready to Wear',  price: 'Rp 380.000',   unit: '/biji',  image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1000&auto=format&fit=crop', desc: 'Celana chino slim fit berbahan cotton stretch yang nyaman dipakai seharian. Tersedia dalam berbagai pilihan warna netral.' },
  { id: 11, name: 'Kancing Mutiara Set',       category: 'Aksesoris',      price: 'Rp 120.000',   unit: '/set',   image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=1000&auto=format&fit=crop', desc: 'Set kancing mutiara sintetis berkualitas tinggi untuk kebaya dan gaun. Memberikan kesan mewah dan feminin pada busana Anda.' },
  { id: 12, name: 'Polo Shirt Pique',          category: 'Ready to Wear',  price: 'Rp 290.000',   unit: '/biji',  image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?q=80&w=1000&auto=format&fit=crop', desc: 'Polo shirt berbahan pique cotton premium dengan bordir logo kecil di dada. Cocok untuk casual maupun semi-formal.' },
  { id: 13, name: 'Kain Velvet Mewah',         category: 'Material Kain',  price: 'Rp 210.000',   unit: '/meter', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1000&auto=format&fit=crop', desc: 'Kain velvet dengan tekstur lembut dan kilau elegan. Ideal untuk pembuatan gaun pesta, blazer, atau aksesori fashion premium.' },
  { id: 14, name: 'Jaket Kulit Sintetis',      category: 'Ready to Wear',  price: 'Rp 890.000',   unit: '/biji',  image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop', desc: 'Jaket kulit sintetis premium dengan jahitan rapi dan lapisan fleece hangat. Desain modern yang cocok untuk berbagai kesempatan.' },
  { id: 15, name: 'Gaun Pesta Custom',         category: 'Jasa Tailoring', price: 'Rp 2.750.000', unit: '/biji',  image: 'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?q=80&w=1000&auto=format&fit=crop', desc: 'Gaun pesta custom sesuai desain dan ukuran Anda. Tersedia pilihan material satin, organza, dan tulle dengan berbagai pilihan warna.' },
  { id: 16, name: 'Resleting YKK Premium',     category: 'Aksesoris',      price: 'Rp 25.000',    unit: '/pcs',   image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1000&auto=format&fit=crop', desc: 'Resleting YKK original dengan mekanisme halus dan tahan lama. Tersedia dalam berbagai ukuran dan warna untuk semua jenis busana.' },
  { id: 17, name: 'Jas Formal Wol Italia',     category: 'Jasa Tailoring', price: 'Rp 3.200.000', unit: '/biji',  image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop', desc: 'Jas formal berbahan wol Italia dengan potongan slim yang elegan. Cocok untuk acara bisnis, pernikahan, atau acara formal lainnya.' },
  { id: 18, name: 'Kain Denim Premium',        category: 'Material Kain',  price: 'Rp 95.000',    unit: '/meter', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1000&auto=format&fit=crop', desc: 'Kain denim premium 12oz dengan warna indigo yang kaya. Cocok untuk pembuatan celana jeans, jaket, atau tas custom.' },
  { id: 19, name: 'Dress Kebaya Modern',       category: 'Jasa Tailoring', price: 'Rp 2.100.000', unit: '/biji',  image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=1000&auto=format&fit=crop', desc: 'Dress kebaya modern dengan perpaduan kain brokat dan chiffon. Desain kontemporer yang tetap mempertahankan keanggunan kebaya tradisional.' },
  { id: 20, name: 'Kemeja Flannel Kotak',      category: 'Ready to Wear',  price: 'Rp 320.000',   unit: '/biji',  image: 'https://images.unsplash.com/photo-1602810316693-3667c854239a?q=80&w=1000&auto=format&fit=crop', desc: 'Kemeja flannel motif kotak dengan bahan tebal dan hangat. Cocok untuk cuaca dingin atau gaya casual sehari-hari.' },
];

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = catalogData.find(p => p.id.toString() === id);

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
                     bg-[#A47251] text-white rounded-full px-8 py-4
                     hover:bg-[#DD9E59] transition-all duration-300 active:scale-95"
        >
          Kembali ke Katalog
        </Link>
      </main>
    );
  }

  return <ProductDetailView product={product} />;
}
