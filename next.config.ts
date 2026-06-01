import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Kompresi gzip/brotli otomatis
  compress: true,

  // Optimasi gambar
  images: {
    // Format modern — browser yang support akan dapat WebP/AVIF otomatis
    formats: ["image/avif", "image/webp"],
    // Ukuran breakpoint untuk srcset otomatis
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimasi kualitas untuk jaringan rendah (default 75)
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 hari cache
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "svgl.app" },
    ],
  },

  // Header HTTP untuk caching aset statis
  async headers() {
    return [
      {
        // Cache font dan gambar statis selama 1 tahun
        source: "/:path*\\.(woff|woff2|ttf|otf|eot|ico|png|jpg|jpeg|svg|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache JS/CSS chunks selama 1 tahun (Next.js sudah hash nama file)
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Halaman HTML — revalidate setiap kunjungan tapi gunakan cache jika tidak berubah
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
