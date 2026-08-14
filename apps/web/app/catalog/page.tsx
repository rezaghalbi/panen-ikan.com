'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, MagnifyingGlass, Fish, Snowflake, Flame, Plus, Eye } from '@phosphor-icons/react';
import { useCart } from '../../context/CartContext';
import { API_URL } from '@/lib/api';

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const json = await res.json();
        if (res.ok) setProducts(json.data);
      } catch (error) {
        console.error('Gagal fetch katalog', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(number);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (selectedType === 'fresh') return matchesSearch && p.isFresh;
    if (selectedType === 'frozen') return matchesSearch && p.isFrozen;
    if (selectedType === 'processed') return matchesSearch && p.isProcessed;
    return matchesSearch;
  });

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
      <div className="container mx-auto max-w-6xl">
        {/* HEADER & SEARCH BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
              <Fish className="text-sky-600" size={32} weight="fill" />
              <span>Katalog Ikan & Seafood PanenQu</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Pilihan lengkap ikan segar panen langsung, fillet frozen, dan olahan bumbu
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <MagnifyingGlass
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari Ikan Gurame, Patin, Udang..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-sky-600 outline-none text-sm font-medium bg-white shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* TABS FILTER */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedType === 'all'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua Produk
          </button>
          <button
            onClick={() => setSelectedType('fresh')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedType === 'fresh'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Ikan Segar
          </button>
          <button
            onClick={() => setSelectedType('frozen')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedType === 'frozen'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Frozen IQF
          </button>
          <button
            onClick={() => setSelectedType('processed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedType === 'processed'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Olahan & Bumbu
          </button>
        </div>

        {/* GRID PRODUK */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm animate-pulse">
                <div className="h-40 bg-slate-200 rounded-xl mb-3" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
                <div className="h-8 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 my-8 shadow-sm">
            <Fish size={40} className="text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Tidak ada produk yang cocok</h3>
            <p className="text-slate-500 text-xs mt-1">Coba sesuaikan pencarian atau filter tipe produk</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition group overflow-hidden flex flex-col"
              >
                <Link href={`/catalog/${product.id}`} className="relative h-48 w-full bg-slate-100 block">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Fish size={40} />
                    </div>
                  )}

                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                    {product.isFresh && (
                      <span className="badge-fresh px-2 py-0.5 rounded-md text-[10px] font-bold">
                        Segar
                      </span>
                    )}
                    {product.isFrozen && (
                      <span className="badge-frozen px-2 py-0.5 rounded-md text-[10px] font-bold">
                        Frozen
                      </span>
                    )}
                  </div>
                </Link>

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
                      {product.category?.name || 'Hasil Panen'}
                    </span>
                    <Link
                      href={`/catalog/${product.id}`}
                      className="font-bold text-slate-900 text-sm line-clamp-2 mt-0.5 hover:text-sky-600 transition"
                    >
                      {product.name}
                    </Link>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-sm font-black text-slate-900 block">
                        {formatRupiah(product.price)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        per {product.unit || 'kg'} ({product.weightGram || 1000}g)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/catalog/${product.id}`}
                        className="bg-slate-100 text-slate-600 p-2.5 rounded-xl hover:bg-slate-200 transition"
                        title="Lihat Detail"
                      >
                        <Eye size={18} />
                      </Link>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-sky-600 text-white p-2.5 rounded-xl hover:bg-sky-700 transition shadow-md shadow-sky-600/20 active:scale-95"
                        title="Tambah ke Keranjang"
                      >
                        <Plus size={18} weight="bold" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
