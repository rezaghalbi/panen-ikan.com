'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useState } from 'react';
import {
  Storefront,
  Sparkle,
  Truck,
  ShieldCheck,
  Scales,
  Clock,
  ArrowRight,
  CheckCircle,
} from '@phosphor-icons/react';

export default function MitraPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {/* HERO BANNER COMING SOON */}
      <section className="bg-gradient-to-b from-sky-900 via-sky-800 to-slate-900 text-white py-20 px-4 relative overflow-hidden">
        {/* Glowing Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-400/30 mb-6 backdrop-blur-md">
            <Sparkle size={16} weight="fill" className="text-yellow-300 animate-pulse" />
            <span>Program Kemitraan Reseller & Agen Ikan PanenQu</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            Menjadi Agen Mitra PanenQu & <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-sky-300">
              Raih Keuntungan Grosir Ikan Segar
            </span>
          </h1>

          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Dapatkan akses harga grosir langsung dari petambak/pembudidaya mitra,
            pasokan rutin terjamin, serta jaminan rantai dingin (*cold-chain*) 100% segar sampai di lokasi Anda.
          </p>

          {/* BADGE COMING SOON */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl text-yellow-300 font-black text-sm tracking-wide shadow-2xl mb-12">
            <Clock size={20} weight="bold" />
            <span>PROGRAM INI AKAN SEGERA DILUNCURKAN (COMING SOON)</span>
          </div>
        </div>
      </section>

      {/* BENENFITS GRID */}
      <section className="py-16 px-4 container mx-auto max-w-6xl -mt-10 relative z-20">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 transition hover:-translate-y-1">
            <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mb-6">
              <Scales size={32} weight="fill" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Harga Grosir Spesial</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Margin keuntungan kompetitif langsung dari sumber pertama tanpa perantara tengkulak.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 transition hover:-translate-y-1">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <Truck size={32} weight="fill" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Logistik Cold-Chain</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Pengiriman berpendingin khusus memastikan suhu ikan terjaga tetap segar sempurna.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 transition hover:-translate-y-1">
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck size={32} weight="fill" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Garansi 100% Segar</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Jaminan ganti baru atau kembalikan dana jika kualitas pasokan tidak memenuhi standar higienis.
            </p>
          </div>
        </div>
      </section>

      {/* EARLY ACCESS FORM */}
      <section className="py-12 px-4 container mx-auto max-w-3xl mb-16">
        <div className="bg-gradient-to-tr from-sky-600 to-cyan-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-black mb-3">Dapatkan Akses Prioritas Agen</h2>
            <p className="text-sky-100 text-xs md:text-sm mb-8">
              Jadilah agen mitra pertama di kota Anda saat pendaftaran resmi dibuka.
            </p>

            {isSubmitted ? (
              <div className="bg-white text-slate-900 p-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-3">
                <CheckCircle size={24} className="text-emerald-500" />
                <span>Terima kasih! Kami akan mengabari Anda begitu program rilis.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="email"
                    required
                    placeholder="Email Anda"
                    className="w-full px-4 py-3 rounded-xl text-slate-900 text-sm outline-none font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Nomor WhatsApp"
                    className="w-full px-4 py-3 rounded-xl text-slate-900 text-sm outline-none font-medium"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Kota / Kabupaten Tempat Usaha Anda"
                  className="w-full px-4 py-3 rounded-xl text-slate-900 text-sm outline-none font-medium"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition shadow-lg text-sm flex items-center justify-center gap-2"
                >
                  <span>Daftar Minat Mitra Agen</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 px-4 border-t border-slate-800 text-center text-xs">
        <p>© 2026 PanenQu E-Commerce. Hak Cipta Dilindungi.</p>
      </footer>
    </div>
  );
}
