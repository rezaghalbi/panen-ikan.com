'use client';

import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import {
  UserCircle,
  EnvelopeSimple,
  Phone,
  MapPin,
  FloppyDisk,
  CheckCircle,
  Key,
} from '@phosphor-icons/react';

export default function UserProfilePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        setName(user.name || '');
        setEmail(user.email || '');
        setPhone(user.phone || '081234567890');
        setAddress(user.address || 'Jl. Ikan Mas No. 12, Jakarta');
      } catch (e) {}
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const existingUser = Cookies.get('user') ? JSON.parse(Cookies.get('user')!) : {};
    const updatedUser = {
      ...existingUser,
      name,
      phone,
      address,
    };
    Cookies.set('user', JSON.stringify(updatedUser), { expires: 7, path: '/' });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-10">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 bg-gradient-to-tr from-sky-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-sky-600/30">
              {name ? name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Pengaturan Profil Saya</h1>
              <p className="text-xs text-slate-500 mt-1">
                Kelola informasi akun dan alamat pengiriman pesanan PanenQu
              </p>
            </div>
          </div>

          {savedSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-4 rounded-xl mb-6 font-bold flex items-center gap-3">
              <CheckCircle size={20} />
              <span>Profil berhasil diperbarui!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <UserCircle size={18} className="text-sky-600" />
                  <span>Nama Lengkap</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-600 outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <EnvelopeSimple size={18} className="text-sky-600" />
                  <span>Email (Akun)</span>
                </label>
                <input
                  type="email"
                  disabled
                  className="w-full border border-slate-200 bg-slate-100 text-slate-500 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                  value={email}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Phone size={18} className="text-sky-600" />
                <span>Nomor Telepon / WhatsApp</span>
              </label>
              <input
                type="tel"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-600 outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
                <MapPin size={18} className="text-sky-600" />
                <span>Alamat Pengiriman Utama</span>
              </label>
              <textarea
                rows={3}
                className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-sky-600 outline-none"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat lengkap tujuan pengiriman ikan segar..."
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-sky-600/20 text-sm flex items-center gap-2"
              >
                <FloppyDisk size={20} />
                <span>Simpan Perubahan Profil</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
