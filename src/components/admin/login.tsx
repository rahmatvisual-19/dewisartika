'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message === 'Invalid login credentials' 
          ? 'Email atau kata sandi salah.' 
          : authError.message
        );
        setIsLoading(false);
      } else if (data.session) {
        router.push('/admin');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan koneksi.');
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-3 h-12 rounded-xl border border-slate-200 bg-slate-50/50 " +
    "font-[family-name:var(--font-inter)] text-sm text-slate-800 placeholder:text-slate-400 " +
    "focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C] " +
    "transition-all duration-200";

  return (
    <div className="w-full max-w-md mx-auto">

      {/* Kembali */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 font-[family-name:var(--font-inter)] text-[13px]
                   text-slate-500 hover:text-[#8B5E3C] transition-colors mb-6 ml-1"
      >
        <ArrowLeft size={15} strokeWidth={1.5} /> Kembali ke Beranda
      </Link>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white rounded-[2rem] border border-slate-100 p-8 sm:p-10
                   shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="font-[family-name:var(--font-instrument-serif)] text-4xl font-normal text-[#8B5E3C] mb-1"
            style={{ letterSpacing: '-0.02em' }}
          >
            TailorCraft
          </h1>
          <h2 className="font-[family-name:var(--font-inter)] text-[16px] font-bold text-slate-800">
            Admin Portal
          </h2>
          <p className="font-[family-name:var(--font-inter)] text-[13px] text-slate-500 mt-1.5">
            Silakan masuk untuk mengelola katalog dan pesanan.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5" suppressHydrationWarning>

          {/* Pesan error */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100
                            font-[family-name:var(--font-inter)] text-[13px] text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email"
              className="block font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <input
                type="email" id="email"
                placeholder="Masukkan email admin"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                suppressHydrationWarning
                className={inputClass}
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={1.5} />
            </div>
          </div>

          <div>
            <label htmlFor="password"
              className="block font-[family-name:var(--font-inter)] text-[13px] font-semibold text-slate-700 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type="password" id="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                suppressHydrationWarning
                className={inputClass}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={1.5} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            suppressHydrationWarning
            className="w-full h-12 inline-flex items-center justify-center gap-2 mt-2
                       font-[family-name:var(--font-inter)] text-[14px] font-semibold
                       bg-[#8B5E3C] text-white rounded-xl
                       hover:bg-[#DD9E59] disabled:opacity-70 disabled:cursor-not-allowed
                       transition-all duration-300 active:scale-[0.98]
                       shadow-[0_4px_16px_rgba(164,114,81,0.25)]"
          >
            {isLoading
              ? <><Loader2 size={16} className="animate-spin" /> Memproses...</>
              : 'Masuk ke Dashboard'
            }
          </button>

          <p className="font-[family-name:var(--font-inter)] text-[11.5px] text-center text-slate-400">
            Gunakan akun email admin yang sudah Anda buat di dasbor Supabase.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
