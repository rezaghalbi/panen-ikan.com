'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Fish } from '@phosphor-icons/react';
import { API_URL } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorDetail, setErrorDetail] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setErrorDetail('');

    console.log('🚀 Sending Register Request to API:', `${API_URL}/api/auth/register`);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      console.log('📥 Register Response:', data);

      if (!res.ok) {
        if (data.errorDetail) setErrorDetail(String(data.errorDetail));
        throw new Error(data.message || 'Gagal mendaftar');
      }

      alert('✅ Registrasi Berhasil! Silakan Login.');
      router.push('/login');
    } catch (err: any) {
      console.error('❌ Register Frontend Error:', err);
      setError(err.message || 'Gagal terhubung ke API backend');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white mb-4 shadow-lg shadow-sky-600/30">
            <Fish size={32} weight="fill" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Daftar Akun PanenQu</h1>
          <p className="text-slate-500 text-xs mt-1">
            Bergabunglah untuk membeli ikan segar & seafood berkualitas
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 text-center font-bold border border-red-100 space-y-1">
            <p>{error}</p>
            {errorDetail && (
              <p className="text-[10px] text-red-400 font-mono font-normal">
                Detail Error: {errorDetail}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-600 outline-none"
              placeholder="Siti Rahma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-600 outline-none"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-600 outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-bold py-3.5 rounded-xl hover:from-sky-700 hover:to-cyan-700 transition disabled:opacity-50 shadow-lg shadow-sky-600/20 text-sm"
          >
            {isLoading ? 'Memproses...' : 'Daftar Akun'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-sky-600 font-bold hover:underline">
            Masuk Sekarang
          </Link>
        </p>
      </div>
    </main>
  );
}
