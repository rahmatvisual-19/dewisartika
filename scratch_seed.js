const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Baca .env.local untuk mendapatkan kredensial Supabase Service Role
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('File .env.local tidak ditemukan di workspace');
  process.exit(1);
}
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}=(.*)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Kredensial Supabase tidak ditemukan di .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false }
});

async function deleteTableData(table) {
  console.log(`Membersihkan tabel: ${table}...`);
  
  // Coba delete dengan asumsi id bertipe bigint/integer (> 0)
  let { error } = await supabase.from(table).delete().gt('id', 0);
  if (error) {
    // Jika gagal karena tipe data id bukan integer, coba delete dengan asumsi id bertipe UUID/String
    const { error: uuidErr } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (uuidErr) {
      console.warn(`Peringatan saat membersihkan tabel ${table}:`, uuidErr.message);
    }
  }
}

async function main() {
  console.log('Memulai pembersihan data dummy dan seeding data real...');

  // Urutan pembersihan untuk mencegah konflik relasi database
  const tablesToClear = [
    'order_items',
    'orders',
    'testimonials',
    'clients',
    'hero_images',
    'about_me',
    'cta_images',
    'products',
    'product_units',
    'contacts'
  ];

  for (const table of tablesToClear) {
    await deleteTableData(table);
  }

  console.log('Semua data lama berhasil dibersihkan.');

  // 2. Seed Contacts
  console.log('Seeding contacts...');
  const contacts = [
    { type: 'admin_cta', name: 'WhatsApp Utama Admin', value: '628123456789' },
    { type: 'tailor', name: 'Dewi Sartika', value: '628123456789' },
    { type: 'tailor', name: 'Penjahit Maulana', value: '628987654321' }
  ];
  const { data: contactData, error: contactErr } = await supabase.from('contacts').insert(contacts).select();
  if (contactErr) throw contactErr;
  console.log('Contacts seeded.');

  const dewiContact = contactData.find(c => c.name === 'Dewi Sartika');
  const maulanaContact = contactData.find(c => c.name === 'Penjahit Maulana');
  const dewiContactId = dewiContact ? dewiContact.id : 1;
  const maulanaContactId = maulanaContact ? maulanaContact.id : 2;

  // 3. Seed Product Units
  console.log('Seeding product units...');
  const productUnits = [
    { name: 'stel' },
    { name: 'pcs' },
    { name: 'set' },
    { name: 'meter' }
  ];
  const { error: unitErr } = await supabase.from('product_units').insert(productUnits);
  if (unitErr) throw unitErr;
  console.log('Product units seeded.');

  // 4. Seed Products (Real Tailoring Services)
  console.log('Seeding products...');
  const products = [
    {
      name: 'Setelan Jas Bespoke Premium',
      price: 1850000,
      unit: 'stel',
      description: 'Setelan jas formal pria premium dengan bahan Wool Blend berkualitas tinggi. Termasuk jas dan celana panjang. Proses pembuatan diawali dengan custom fitting (pengukuran langsung) agar pas sempurna di badan. Sangat cocok untuk acara pernikahan, wisuda, atau pertemuan bisnis formal.',
      category: 'Jasa Tailoring',
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop'],
      colors: [
        { color: 'Navy Blue', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop' },
        { color: 'Charcoal Gray', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop' }
      ],
      sizes: [
        { size: 'S', image: '' },
        { size: 'M', image: '' },
        { size: 'L', image: '' },
        { size: 'Custom', image: '' }
      ],
      details: ['Bahan Wool Blend Premium', 'Custom Fitting & Pattern', 'Proses pengerjaan 7-14 hari']
    },
    {
      name: 'Kebaya Pernikahan Modern Brokat Semi-Prancis',
      price: 3200000,
      unit: 'set',
      description: 'Kebaya pengantin modern dengan detail payet hand-made yang mewah dan kain brokat semi-prancis pilihan. Dilengkapi dengan rok batik pengantin premium. Setiap detail dijahit dengan presisi tinggi sesuai postur tubuh calon pengantin untuk hari istimewa Anda.',
      category: 'Jasa Tailoring',
      images: ['https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600&auto=format&fit=crop'],
      colors: [
        { color: 'Rose Gold', image: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600&auto=format&fit=crop' },
        { color: 'Champagne', image: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600&auto=format&fit=crop' }
      ],
      sizes: [
        { size: 'M', image: '' },
        { size: 'L', image: '' },
        { size: 'Custom', image: '' }
      ],
      details: ['Kain Brokat Semi Prancis', 'Payet Jahit Tangan (Handmade)', 'Termasuk Furing Katun Adem']
    },
    {
      name: 'Kemeja Batik Tulis Sutra Eksklusif',
      price: 650000,
      unit: 'pcs',
      description: 'Kemeja batik lengan panjang premium menggunakan bahan batik tulis asli Solo. Dilengkapi dengan lapisan furing katun yang dingin dan halus. Pola batik diselaraskan (matched pattern) pada bagian saku dan kancing agar terlihat rapi dan elegan.',
      category: 'Ready to Wear',
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop'],
      colors: [
        { color: 'Batik Klasik Cokelat', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop' }
      ],
      sizes: [
        { size: 'M', image: '' },
        { size: 'L', image: '' },
        { size: 'XL', image: '' }
      ],
      details: ['Bahan 100% Sutra Batik Tulis', 'Lapisan Furing Katun Halus', 'Kancing Tersembunyi (Hidden Button)']
    },
    {
      name: 'Blazer Kerja Wanita Professional',
      price: 480000,
      unit: 'pcs',
      description: 'Blazer formal wanita dengan potongan slim fit yang menonjolkan siluet profesional namun tetap nyaman digunakan seharian. Menggunakan bahan import bertekstur halus dengan lapisan furing asahi premium.',
      category: 'Ready to Wear',
      images: ['https://images.unsplash.com/photo-1548624149-f7b3be68e363?q=80&w=600&auto=format&fit=crop'],
      colors: [
        { color: 'Soft Beige', image: 'https://images.unsplash.com/photo-1548624149-f7b3be68e363?q=80&w=600&auto=format&fit=crop' },
        { color: 'Black', image: 'https://images.unsplash.com/photo-1548624149-f7b3be68e363?q=80&w=600&auto=format&fit=crop' }
      ],
      sizes: [
        { size: 'S', image: '' },
        { size: 'M', image: '' },
        { size: 'L', image: '' }
      ],
      details: ['Bahan Semi Wool Import', 'Furing Asahi Dingin', 'Saku Aktif Kiri Kanan']
    },
    {
      name: 'Bahan Kain Wool Italia Super-120',
      price: 220000,
      unit: 'meter',
      description: 'Bahan kain Wool Super-120 import asli Italia. Sangat direkomendasikan untuk pembuatan jas formal, celana bahan, maupun seragam premium. Serat kain rapat, jatuh dengan anggun, dan tidak mudah kusut.',
      category: 'Material Kain',
      images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop'],
      colors: [
        { color: 'Jet Black', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop' },
        { color: 'Navy Blue', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop' }
      ],
      sizes: [
        { size: 'Per Meter', image: '' }
      ],
      details: ['Lebar Kain 1.5 Meter', 'Kandungan Wool 70%', 'Tekstur Halus & Adem']
    },
    {
      name: 'Jasa Permak & Resize Pakaian',
      price: 50000,
      unit: 'pcs',
      description: 'Jasa permak, resize, pemotongan, penyesuaian pinggang celana, pengecilan lengan jas, maupun modifikasi pakaian agar pas sesuai lekuk tubuh Anda.',
      category: 'Jasa Tailoring',
      images: ['https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=600&auto=format&fit=crop'],
      colors: [
        { color: 'Semua Warna', image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=600&auto=format&fit=crop' }
      ],
      sizes: [
        { size: 'All Size', image: '' }
      ],
      details: ['Pengerjaan 1-3 hari', 'Dikerjakan penjahit berpengalaman', 'Garansi fitting kembali jika tidak pas']
    }
  ];
  
  const { data: insertedProducts, error: prodErr } = await supabase.from('products').insert(products).select();
  if (prodErr) throw prodErr;
  console.log('Products seeded.');

  // 5. Seed Testimonials (Reviews)
  console.log('Seeding testimonials...');
  const testimonials = [
    {
      name: 'Rahmat Maulana',
      role: 'Pengantin Pria',
      message: 'Sangat puas dengan setelan jas pengantin buatan TailorCraft! Ukurannya sangat pas dan presisi di badan saya. Pengukurannya detail sekali, jahitannya rapi luar dalam. Istri saya juga memuji warna navy-nya yang elegan.',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop'
    },
    {
      name: 'Dewi Lestari',
      role: 'Klien Eksekutif',
      message: 'Jasa jahit blazer kerjanya luar biasa rapi. Pas di bahu dan pinggang, tidak sesak sama sekali saat digunakan bekerja seharian. Bahan furing dalamnya sangat halus dan dingin. Rekomendasi sekali!',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop'
    },
    {
      name: 'Budi Santoso',
      role: 'Pelanggan Setia',
      message: 'Sudah langganan jahit kemeja batik tulis di sini selama 2 tahun. Kelebihannya adalah mereka selalu bisa menyelaraskan motif batik pada bagian sambungan kantong dan kancing depan sehingga terlihat sangat eksklusif.',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop'
    }
  ];
  const { error: testErr } = await supabase.from('testimonials').insert(testimonials);
  if (testErr) throw testErr;
  console.log('Testimonials seeded.');

  // 6. Seed Clients
  console.log('Seeding clients...');
  const clients = [
    { name: 'Corporate Uniform Client A', logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=120&auto=format&fit=crop' },
    { name: 'BUMN Executive Wear Client B', logo_url: 'https://images.unsplash.com/photo-1516880711640-ef7db81be3e1?q=80&w=120&auto=format&fit=crop' },
    { name: 'Wedding Organizer Partner C', logo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=120&auto=format&fit=crop' }
  ];
  const { error: clientErr } = await supabase.from('clients').insert(clients);
  if (clientErr) throw clientErr;
  console.log('Clients seeded.');

  // 7. Seed Hero Images
  console.log('Seeding hero images...');
  const heroImages = [
    { image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?q=80&w=800&auto=format&fit=crop', order_index: 0 },
    { image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop', order_index: 1 },
    { image_url: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?q=80&w=800&auto=format&fit=crop', order_index: 2 }
  ];
  const { error: heroErr } = await supabase.from('hero_images').insert(heroImages);
  if (heroErr) throw heroErr;
  console.log('Hero images seeded.');

  // 8. Seed About Me
  console.log('Seeding about me...');
  const aboutMe = [
    {
      label: 'Dewi Sartika',
      icon: 'scissors',
      badge: 'Spesialis Pakaian Wanita',
      title: 'Keindahan dalam setiap detail busana wanita.',
      description: 'Dewi Sartika adalah ahli di balik keanggunan busana wanita TailorCraft. Dengan keahlian mendalam dalam teknik memayet, bordir, dan sablon custom, ia menghadirkan sentuhan artistik yang tak tertandingi pada setiap karya. Mulai dari peralatan jahit berkualitas, jasa permak profesional, hingga pembuatan kebaya dan pakaian wanita penuh simbol — semua dikerjakan dengan penuh dedikasi dan cita rasa seni yang tinggi.',
      services: [
        'Penjualan Peralatan Menjahit',
        'Jasa Permak Profesional',
        'Spesialis Pakaian Wanita',
        'Memayet & Hiasan Busana',
        'Simbol & Aksesori Pakaian',
        'Bordir & Sablon Custom'
      ],
      button_text: 'Konsultasi dengan Dewi',
      button_href: `contact:${dewiContactId}`,
      image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=800&auto=format&fit=crop',
      image_alt: 'Dewi Sartika — Spesialis pakaian wanita TailorCraft'
    },
    {
      label: 'Penjahit Maulana',
      icon: 'shirt',
      badge: 'Spesialis Jas & Pakaian Formal',
      title: 'Ketegasan potongan untuk penampilan terbaik pria.',
      description: 'Penjahit Maulana adalah maestro di balik setiap setelan jas dan pakaian formal TailorCraft. Dengan presisi tingkat tinggi dan pemahaman mendalam tentang proporsi tubuh, ia menghadirkan jas bespoke, pakaian dinas pemerintahan, serta pakaian formal dan custom untuk pria maupun wanita yang tidak hanya indah dipandang, tetapi juga nyaman dipakai sepanjang hari.',
      services: [
        'Spesialis Jas Pria & Wanita',
        'Pakaian Dinas Pemerintahan',
        'Pakaian Formal Pria & Wanita',
        'Pakaian Custom Pria & Wanita',
        'Setelan Bespoke',
        'Seragam Instansi & Korporat'
      ],
      button_text: 'Konsultasi dengan Maulana',
      button_href: `contact:${maulanaContactId}`,
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
      image_alt: 'Penjahit Maulana — Spesialis jas dan pakaian formal TailorCraft'
    }
  ];
  const { error: aboutErr } = await supabase.from('about_me').insert(aboutMe);
  if (aboutErr) throw aboutErr;
  console.log('About Me seeded.');

  // 9. Seed CTA Images
  console.log('Seeding cta images...');
  const ctaImages = [
    { image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?q=80&w=800&auto=format&fit=crop', order_index: 0 }
  ];
  const { error: ctaErr } = await supabase.from('cta_images').insert(ctaImages);
  if (ctaErr) throw ctaErr;
  console.log('CTA images seeded.');

  // 10. Seed Realistic Orders and Order Items (For Admin Analytics Charts)
  console.log('Seeding orders & order_items...');

  const jasProduct = insertedProducts.find(p => p.name.includes('Jas'));
  const kebayaProduct = insertedProducts.find(p => p.name.includes('Kebaya'));
  const batikProduct = insertedProducts.find(p => p.name.includes('Batik'));
  const blazerProduct = insertedProducts.find(p => p.name.includes('Blazer'));
  const woolProduct = insertedProducts.find(p => p.name.includes('Kain Wool'));

  // Daftar pesanan dengan tanggal historis
  const ordersPayload = [
    {
      customer_name: 'Hendra Wijaya',
      customer_phone: '08123456701',
      customer_address: 'Jl. Sudirman No. 45, Jakarta',
      catatan: 'Ukuran custom fitting disesuaikan di toko',
      subtotal: 1850000,
      tax: 0,
      grand_total: 1850000,
      status: 'selesai',
      created_at: new Date('2026-03-15T10:30:00Z').toISOString()
    },
    {
      customer_name: 'Siti Aminah',
      customer_phone: '08123456702',
      customer_address: 'Perum Gading Serpong Blok C/12, Tangerang',
      catatan: 'Payet warna rose gold',
      subtotal: 3200000,
      tax: 0,
      grand_total: 3200000,
      status: 'selesai',
      created_at: new Date('2026-04-02T14:15:00Z').toISOString()
    },
    {
      customer_name: 'Hendra Wijaya',
      customer_phone: '08123456701',
      customer_address: 'Jl. Sudirman No. 45, Jakarta',
      catatan: 'Lapis furing premium katun adem',
      subtotal: 650000,
      tax: 0,
      grand_total: 650000,
      status: 'selesai',
      created_at: new Date('2026-04-18T09:00:00Z').toISOString()
    },
    {
      customer_name: 'Rudi Hartono',
      customer_phone: '08123456703',
      customer_address: 'Jl. Pemuda No. 18, Bogor',
      catatan: 'Warna Soft Beige size M',
      subtotal: 480000,
      tax: 0,
      grand_total: 480000,
      status: 'selesai',
      created_at: new Date('2026-05-10T16:45:00Z').toISOString()
    },
    {
      customer_name: 'Siti Aminah',
      customer_phone: '08123456702',
      customer_address: 'Perum Gading Serpong Blok C/12, Tangerang',
      catatan: 'Bahan wool Italia warna jet black 2 meter',
      subtotal: 440000,
      tax: 0,
      grand_total: 440000,
      status: 'selesai',
      created_at: new Date('2026-05-24T11:20:00Z').toISOString()
    },
    {
      customer_name: 'Andi Pratama',
      customer_phone: '08123456704',
      customer_address: 'Jl. Gatot Subroto Kav. 21, Jakarta',
      catatan: 'Custom fitting warna Charcoal Gray',
      subtotal: 1850000,
      tax: 0,
      grand_total: 1850000,
      status: 'proses',
      created_at: new Date('2026-06-01T08:30:00Z').toISOString()
    },
    {
      customer_name: 'Rina Kartika',
      customer_phone: '08123456705',
      customer_address: 'Jl. Dago No. 102, Bandung',
      catatan: 'Kebaya pengantin modern Champagne fitting minggu depan',
      subtotal: 3200000,
      tax: 0,
      grand_total: 3200000,
      status: 'pending',
      created_at: new Date('2026-06-04T13:00:00Z').toISOString()
    },
    {
      customer_name: 'Bambang',
      customer_phone: '08123456706',
      customer_address: 'Jl. Merdeka Barat No. 3, Jakarta',
      catatan: 'Minta dibatalkan karena salah ukuran kain',
      subtotal: 650000,
      tax: 0,
      grand_total: 650000,
      status: 'batal',
      created_at: new Date('2026-06-05T15:00:00Z').toISOString()
    }
  ];

  const { data: insertedOrders, error: ordersErr } = await supabase.from('orders').insert(ordersPayload).select();
  if (ordersErr) throw ordersErr;
  console.log('Orders inserted.');

  // Hubungkan order_items ke order dan produk yang tepat
  const orderItemsList = [
    {
      order_id: insertedOrders.find(o => o.customer_name === 'Hendra Wijaya' && o.subtotal === 1850000).id,
      product_id: jasProduct ? jasProduct.id : null,
      name: jasProduct ? jasProduct.name : 'Setelan Jas Bespoke Premium',
      category: jasProduct ? jasProduct.category : 'Jasa Tailoring',
      price: 1850000,
      quantity: 1,
      unit: 'stel',
      color: 'Navy Blue',
      size: 'Custom',
      catatan: 'Fitting celana lingkar pinggang 84cm'
    },
    {
      order_id: insertedOrders.find(o => o.customer_name === 'Siti Aminah' && o.subtotal === 3200000).id,
      product_id: kebayaProduct ? kebayaProduct.id : null,
      name: kebayaProduct ? kebayaProduct.name : 'Kebaya Pernikahan Modern Brokat Semi-Prancis',
      category: kebayaProduct ? kebayaProduct.category : 'Jasa Tailoring',
      price: 3200000,
      quantity: 1,
      unit: 'set',
      color: 'Rose Gold',
      size: 'Custom',
      catatan: 'Payet tangan penuh di lengan'
    },
    {
      order_id: insertedOrders.find(o => o.customer_name === 'Hendra Wijaya' && o.subtotal === 650000).id,
      product_id: batikProduct ? batikProduct.id : null,
      name: batikProduct ? batikProduct.name : 'Kemeja Batik Tulis Sutra Eksklusif',
      category: batikProduct ? batikProduct.category : 'Ready to Wear',
      price: 650000,
      quantity: 1,
      unit: 'pcs',
      color: 'Batik Klasik Cokelat',
      size: 'XL',
      catatan: 'Lengan panjang'
    },
    {
      order_id: insertedOrders.find(o => o.customer_name === 'Rudi Hartono').id,
      product_id: blazerProduct ? blazerProduct.id : null,
      name: blazerProduct ? blazerProduct.name : 'Blazer Kerja Wanita Professional',
      category: blazerProduct ? blazerProduct.category : 'Ready to Wear',
      price: 480000,
      quantity: 1,
      unit: 'pcs',
      color: 'Soft Beige',
      size: 'M',
      catatan: 'Kancing depan satu pas'
    },
    {
      order_id: insertedOrders.find(o => o.customer_name === 'Siti Aminah' && o.subtotal === 440000).id,
      product_id: woolProduct ? woolProduct.id : null,
      name: woolProduct ? woolProduct.name : 'Bahan Kain Wool Italia Super-120',
      category: woolProduct ? woolProduct.category : 'Material Kain',
      price: 220000,
      quantity: 2,
      unit: 'meter',
      color: 'Jet Black',
      size: 'Per Meter',
      catatan: 'Potong utuh 2 meter'
    },
    {
      order_id: insertedOrders.find(o => o.customer_name === 'Andi Pratama').id,
      product_id: jasProduct ? jasProduct.id : null,
      name: jasProduct ? jasProduct.name : 'Setelan Jas Bespoke Premium',
      category: jasProduct ? jasProduct.category : 'Jasa Tailoring',
      price: 1850000,
      quantity: 1,
      unit: 'stel',
      color: 'Charcoal Gray',
      size: 'Custom',
      catatan: 'Fitting dada lingkar 100cm'
    },
    {
      order_id: insertedOrders.find(o => o.customer_name === 'Rina Kartika').id,
      product_id: kebayaProduct ? kebayaProduct.id : null,
      name: kebayaProduct ? kebayaProduct.name : 'Kebaya Pernikahan Modern Brokat Semi-Prancis',
      category: kebayaProduct ? kebayaProduct.category : 'Jasa Tailoring',
      price: 3200000,
      quantity: 1,
      unit: 'set',
      color: 'Champagne',
      size: 'Custom',
      catatan: 'Pola rok batik sidomukti'
    },
    {
      order_id: insertedOrders.find(o => o.customer_name === 'Bambang').id,
      product_id: batikProduct ? batikProduct.id : null,
      name: batikProduct ? batikProduct.name : 'Kemeja Batik Tulis Sutra Eksklusif',
      category: batikProduct ? batikProduct.category : 'Ready to Wear',
      price: 650000,
      quantity: 1,
      unit: 'pcs',
      color: 'Batik Klasik Cokelat',
      size: 'L',
      catatan: 'Batal - salah ukuran'
    }
  ];

  const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsList);
  if (itemsErr) throw itemsErr;
  console.log('Order items inserted.');

  console.log('Semua data real berhasil dimasukkan (Seeding Sukses). Website siap didemonstrasikan!');
}

main().catch(err => {
  console.error('Terjadi kesalahan fatal saat seeding:', err);
  process.exit(1);
});
