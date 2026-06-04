'use client';

import { Search } from 'lucide-react';

interface CatalogHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function CatalogHeader({
  searchQuery,
  setSearchQuery,
  categories,
  selectedCategory,
  setSelectedCategory,
}: CatalogHeaderProps) {
  return (
    <div className="mb-10">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div>
          <h1
            className="font-[family-name:var(--font-instrument-serif)] text-4xl md:text-5xl font-normal text-[#8B5E3C] mb-2"
            style={{ letterSpacing: '-0.02em' }}
          >
            Katalog <em className="not-italic italic">Kami</em>
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-slate-500 text-[15px]">
            Temukan kebutuhan material dan layanan tailoring premium Anda di sini.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            suppressHydrationWarning
            placeholder="Cari produk atau jasa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-200 bg-white shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C]
                       transition-all font-[family-name:var(--font-inter)] text-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={1.5} />
        </div>
      </div>

      {/* Filter Kategori */}
      <div className="flex overflow-x-auto gap-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => (
          <button
            key={category}
            suppressHydrationWarning
            onClick={() => setSelectedCategory(category)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full
                        font-[family-name:var(--font-inter)] font-semibold text-[13px]
                        transition-all duration-300 active:scale-95
                        ${selectedCategory === category
                          ? 'bg-[#8B5E3C] text-white shadow-md'
                          : 'bg-[#F0D8A1]/40 text-slate-600 hover:bg-[#F0D8A1]/70'
                        }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
