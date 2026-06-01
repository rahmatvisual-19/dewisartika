export default function AdminDashboardPage() {
  return (
    <div>
      <h1
        className="font-[family-name:var(--font-instrument-serif)] text-4xl font-normal text-[#A47251] mb-2"
        style={{ letterSpacing: '-0.02em' }}
      >
        Selamat Datang, <em className="not-italic italic">Admin</em>
      </h1>
      <p className="font-[family-name:var(--font-inter)] text-slate-500 text-[15px] mb-8">
        Pilih menu di samping untuk mulai mengelola konten website Anda.
      </p>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Produk',    value: '24'  },
          { label: 'Ulasan Masuk',    value: '156' },
          { label: 'Klien Portfolio', value: '12'  },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 font-medium mb-1">
              {label}
            </p>
            <p className="font-[family-name:var(--font-inter)] text-3xl font-bold text-slate-800">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
