'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Fish } from '@phosphor-icons/react';
import { API_URL } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    const userCookie = Cookies.get('user');

    if (token && userCookie) {
      try {
        const user = JSON.parse(userCookie);
        if (user.role === 'ADMIN') {
          router.replace('/admin');
        } else {
          router.replace('/user');
        }
      } catch (e) {
        // Cookie parse error fallback
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const responseJson = await res.json();

      if (!res.ok) {
        throw new Error(responseJson.message || 'Gagal login. Periksa email/password.');
      }

      const dataRoot = responseJson.data || responseJson;
      let token = dataRoot.accessToken || dataRoot.token || responseJson.accessToken || responseJson.token;
      let userData = dataRoot.user || (dataRoot.role ? dataRoot : null) || (responseJson.role ? responseJson : null);

      if (!token) throw new Error('Token tidak ditemukan di respons Backend!');
      if (!userData) throw new Error('Data User tidak ditemukan di respons Backend!');

      const cleanUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };

      if (typeof token === 'string') token = token.replace(/"/g, '');

      Cookies.set('token', token, { expires: 1, path: '/' });
      Cookies.set('user', JSON.stringify(cleanUser), { expires: 1, path: '/' });

      if (cleanUser.role === 'ADMIN') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/user';
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white mb-4 shadow-lg shadow-sky-600/30">
            <Fish size={32} weight="fill" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Masuk Akun PanenQu</h1>
          <p className="text-slate-500 text-xs mt-1">
            Belanja ikan segar langsung dari pembudidaya mitra
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs mb-6 text-center font-bold border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-600 outline-none transition"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-600 outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-bold py-3.5 rounded-xl hover:from-sky-700 hover:to-cyan-700 transition disabled:opacity-50 shadow-lg shadow-sky-600/20 text-sm"
          >
            {isLoading ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Belum punya akun?{' '}
          <Link href="/register" className="text-sky-600 font-bold hover:underline">
            Daftar Pembeli Baru
          </Link>
        </p>
      </div>
    </main>
  );
}
