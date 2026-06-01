import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#F0D8A1]/20 text-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center">

        {/* Logo */}
        <div className="mb-6">
          <span
            className="font-[family-name:var(--font-instrument-serif)] text-4xl font-normal text-[#A47251]"
            style={{ letterSpacing: '-0.02em' }}
          >
            TailorCraft
          </span>
        </div>

        {/* Deskripsi */}
        <p className="font-[family-name:var(--font-inter)] text-center max-w-xl text-slate-500 text-sm leading-relaxed">
          Mewujudkan busana impian Anda dengan presisi tingkat tinggi dan material premium. Dedikasi kami untuk keanggunan gaya Anda di setiap jahitan.
        </p>
      </div>

      {/* Hak Cipta */}
      <div className="border-t border-[#A47251]/10">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center font-[family-name:var(--font-inter)] text-sm text-slate-400">
          <Link href="/" className="font-semibold text-[#A47251] hover:text-[#DD9E59] transition-colors">
            TailorCraft
          </Link>{" "}
          © 2026. Hak Cipta Dilindungi.
        </div>
      </div>
    </footer>
  );
}
