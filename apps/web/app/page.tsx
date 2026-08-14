'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MagnifyingGlass,
  Fish,
  Snowflake,
  Flame,
  ShieldCheck,
  Truck,
  Plus,
  CheckCircle,
  Storefront,
  ArrowRight,
  Package,
} from '@phosphor-icons/react';
import { API_URL } from '@/lib/api';
import { useCart } from '@/context/CartContext';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart } = useCart();

  // Load Kategori
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories`);
        const json = await res.json();
        if (res.ok) setCategories(json.data);
      } catch (err) {
        console.error('Gagal load kategori', err);
      }
    };
    fetchCategories();
  }, []);

  // Load Produk dengan Debounce
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedCat) params.append('cat', selectedCat);
        if (selectedType !== 'all') params.append('type', selectedType);

        const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
        const json = await res.json();

        if (res.ok) {
          setProducts(json.data);
        }
      } catch (error) {
        console.error('Gagal load produk', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [search, selectedCat, selectedType]);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(number);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HERO SECTION - OCEAN FRESH THEME */}
      <section className="bg-gradient-to-br from-slate-900 via-sky-950 to-cyan-950 text-white py-16 md:py-24 px-4 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge Highlight */}
            <div className="inline-flex items-center gap-2 bg-sky-500/20 border border-sky-400/30 text-sky-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <Fish size={18} weight="fill" className="text-cyan-400" />
              <span>Ikan Segar Langsung dari Petani Mitra</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-tight">
              Ikan Segar & <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400">Frozen Quality</span> Dapur Anda.
            </h1>

            <p className="text-slate-300 text-base md:text-lg mb-10 leading-relaxed font-medium">
              PanenQu menyediakan ikan segar budidaya, fillet beku IQF, dan ikan marinasi siap olah yang dijamin bebas pengawet dengan pengiriman cepat cold-chain.
            </p>

            {/* SEARCH BAR */}
            <div className="bg-white p-2 rounded-2xl max-w-2xl mx-auto flex items-center shadow-2xl shadow-sky-950/50 border border-white/20">
              <div className="pl-4 text-sky-600">
                <MagnifyingGlass size={24} weight="bold" />
              </div>
              <input
                type="text"
                placeholder="Cari ikan (misal: Gurame, Fillet Patin, Udang)..."
                className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-slate-900 placeholder:text-slate-400 font-medium text-sm md:text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold hover:from-sky-700 hover:to-cyan-700 transition text-sm shadow-md">
                Cari Ikan
              </button>
            </div>

            {/* TRUST BADGES */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 mt-12 max-w-2xl mx-auto text-left border-t border-white/10 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck size={22} weight="fill" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">100% Segar</p>
                  <p className="text-[11px] text-slate-400">Bebas Pengawet</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center shrink-0">
                  <Snowflake size={22} weight="fill" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Teknologi IQF</p>
                  <p className="text-[11px] text-slate-400">Proses Pembekuan Cepat</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center shrink-0">
                  <Truck size={22} weight="fill" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Cold-Chain Delivery</p>
                  <p className="text-[11px] text-slate-400">Garansi Tiba Segar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT CATALOG SECTION */}
      <section className="py-12 px-4 container mx-auto max-w-6xl">
        {/* TABS FILTER TIPE PRODUK */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Fish size={28} className="text-sky-600" weight="fill" />
              <span>Katalog Hasil Panen Ikan</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">Pilih kategori ikan segar, beku, atau bumbu siap masak</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedType === 'all'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Semua Produk
            </button>
            <button
              onClick={() => setSelectedType('fresh')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                selectedType === 'fresh'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Ikan Segar
            </button>
            <button
              onClick={() => setSelectedType('frozen')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                selectedType === 'frozen'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Snowflake size={14} />
              Frozen IQF
            </button>
            <button
              onClick={() => setSelectedType('processed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                selectedType === 'processed'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Flame size={14} />
              Olahan & Bumbu
            </button>
          </div>
        </div>

        {/* KATEGORI CHIPS */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            <button
              onClick={() => setSelectedCat('')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedCat === ''
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(String(c.id))}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  selectedCat === String(c.id)
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* PRODUCT GRID */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-pulse">
                <div className="w-full h-48 bg-slate-200 rounded-xl mb-4" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
                <div className="h-8 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 my-8 shadow-sm">
            <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Fish size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Produk tidak ditemukan</h3>
            <p className="text-slate-500 text-sm">Coba kata kunci lain atau ubah filter kategori</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col group"
              >
                {/* Product Image & Badges */}
                <div className="relative h-52 bg-slate-100 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Fish size={48} />
                    </div>
                  )}

                  {/* Badge Tipe Products */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {product.isFresh && (
                      <span className="badge-fresh px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-sm">
                        Ikan Segar
                      </span>
                    )}
                    {product.isFrozen && (
                      <span className="badge-frozen px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-sm flex items-center gap-1">
                        <Snowflake size={12} /> Frozen IQF
                      </span>
                    )}
                    {product.isProcessed && (
                      <span className="badge-processed px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-sm flex items-center gap-1">
                        <Flame size={12} /> Bumbu Olah
                      </span>
                    )}
                  </div>

                  {/* Weight Tag */}
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    {product.weightGram ? `${product.weightGram}g` : '1 Kg'} / {product.unit || 'kg'}
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                      {product.category?.name || 'Hasil Panen'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1 line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-slate-500 text-xs mt-2 line-clamp-2">
                      {product.description || 'Ikan segar bermutu tinggi langsung dipanen dari kolam budidaya mitra PanenQu.'}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Harga Produk</span>
                      <span className="text-lg font-black text-slate-900">
                        {formatRupiah(product.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:from-sky-700 hover:to-cyan-700 transition shadow-md shadow-sky-600/20 active:scale-95"
                    >
                      <Plus size={16} weight="bold" />
                      <span>Tambah</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PROGRAM MITRA AGEN BANNER */}
      <section id="mitra" className="py-16 px-4 bg-gradient-to-r from-sky-900 to-cyan-900 text-white my-12 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase mb-4">
              <Storefront size={16} /> Program Mitra Agen PanenQu
            </div>
            <h2 className="text-2xl md:text-4xl font-black mb-3">
              Ingin Buka Usaha Jual Ikan Segar & Frozen?
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Bergabunglah menjadi Agen PanenQu di kota Anda. Dapatkan pasokan ikan berkualitas harga grosir langsung dari pembudidaya dengan dukungan pendingin cold-chain.
            </p>
          </div>

          <Link
            href="/register"
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-2xl font-black text-sm hover:from-orange-600 hover:to-amber-600 transition shadow-xl shadow-orange-950/30 flex items-center gap-2 shrink-0"
          >
            <span>Daftar Mitra Sekarang</span>
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>
      </section>
    </main>
  );
}
