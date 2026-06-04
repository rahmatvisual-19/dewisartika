/**
 * Utility to validate, compress, and convert images to WebP client-side.
 * 
 * Requirements:
 * 1. Limit original upload size to 2MB (2 * 1024 * 1024 bytes).
 * 2. Compress the image to a target size of 20KB - 50KB.
 * 3. Convert the image file type/extension to WebP (image/webp).
 */
export async function compressAndConvertToWebp(file: File): Promise<File> {
  const maxOriginalSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxOriginalSize) {
    throw new Error("Ukuran file gambar melebihi batas maksimal 2MB.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File yang diunggah harus berupa gambar.");
  }

  // Load image
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gagal membaca file gambar."));
  });

  const minTargetSize = 20 * 1024; // 20KB
  const maxTargetSize = 50 * 1024; // 50KB

  let maxDimension = 1200;
  let quality = 0.8;
  let resultBlob: Blob | null = null;
  let attempts = 0;
  const maxAttempts = 7;

  while (attempts < maxAttempts) {
    attempts++;

    let width = image.width;
    let height = image.height;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Gagal memproses gambar.");
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);

    const currentBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/webp", quality);
    });

    if (!currentBlob) {
      throw new Error("Gagal mengonversi gambar ke format WebP.");
    }

    resultBlob = currentBlob;

    // Evaluasi ukuran file
    if (resultBlob.size >= minTargetSize && resultBlob.size <= maxTargetSize) {
      break;
    }

    if (resultBlob.size > maxTargetSize) {
      // Terlalu besar: kurangi kualitas atau kurangi resolusi jika kualitas sudah rendah
      if (quality > 0.3) {
        quality -= 0.15;
      } else {
        maxDimension = Math.round(maxDimension * 0.7);
        quality = 0.5; // Reset kualitas ke nilai sedang
      }
    } else {
      // Terlalu kecil: naikkan kualitas jika belum maksimal
      if (quality < 0.95) {
        quality = Math.min(0.95, quality + 0.15);
      } else {
        // Jika kualitas sudah maksimal dan gambar masih di bawah 20KB,
        // tidak apa-apa karena untuk gambar polos / sederhana kita tidak ingin memaksakan kompresi berlebih.
        break;
      }
    }
  }

  URL.revokeObjectURL(image.src);

  if (!resultBlob) {
    throw new Error("Gagal mengompres gambar.");
  }

  // Ganti ekstensi file menjadi .webp
  const lastDotIndex = file.name.lastIndexOf('.');
  const baseName = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name;
  const newFileName = `${baseName}.webp`;

  return new File([resultBlob], newFileName, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}
