import Login from '@/components/admin/login';

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ornamen */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#F0D8A1]/40 rounded-full blur-3xl opacity-50 pointer-events-none -z-10" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#A47251]/5 rounded-full blur-3xl opacity-50 pointer-events-none -z-10" />

      <Login />
    </main>
  );
}
