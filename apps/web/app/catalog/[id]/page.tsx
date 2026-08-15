'use client';

import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { API_URL } from '@/lib/api';
import {
  Fish,
  ShoppingCart,
  ArrowLeft,
  CheckCircle,
  Package,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
  Lightning,
} from '@phosphor-icons/react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  weightGram: number;
  unit: string;
  stock: number;
  imageUrl: string;
  isFresh: boolean;
  isFrozen: boolean;
  isProcessed: boolean;
  category?: { name: string };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/api/products/${id}`);
        const data = await res.json();

        if (res.ok && data.data) {
          setProduct(data.data);
        } else {
          // Fallback fetch all products and find
          const allRes = await fetch(`${API_URL}/api/products`);
          const allData = await allRes.json();
          const found = (allData.data || []).find((p: Product) => p.id === id);
          if (found) {
            setProduct(found);
          } else {
            setError('Produk tidak ditemukan');
          }
        }
      } catch (err: any) {
        setError('Gagal memuat produk');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock <= 0) return;
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (product.stock <= 0) return;
    // replaceIfExists=true: jika produk sudah ada di keranjang, SET ke qty yang dipilih (bukan tambah)
    addToCart(product, quantity, true);
    router.push('/cart');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-600">Memuat Detail Ikan Segar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <Fish size={64} className="text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Produk Tidak Ditemukan</h2>
          <p className="text-slate-500 text-sm mb-6">Produk ikan ini mungkin telah dihapus atau tidak tersedia.</p>
          <Link
            href="/catalog"
            className="bg-sky-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-sky-700 transition"
          >
            Kembali ke Katalog Ikan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      <main className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link href="/" className="hover:text-sky-600">Beranda</Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-sky-600">Katalog</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* MAIN PRODUCT CARD */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden grid md:grid-cols-2 gap-8 p-6 md:p-10 mb-12">
          {/* LEFT: IMAGE & BADGES */}
          <div className="flex flex-col gap-4">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
              <Image
                src={product.imageUrl || 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=800&q=80'}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isFresh && (
                  <span className="bg-emerald-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                    🐟 Segar Terjamin
                  </span>
                )}
                {product.isFrozen && (
                  <span className="bg-cyan-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                    ❄️ Frozen IQF
                  </span>
                )}
                {product.isProcessed && (
                  <span className="bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                    🍳 Ready to Cook
                  </span>
                )}
              </div>
            </div>

            {/* TRUST HIGHLIGHTS */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-sky-50/60 border border-sky-100 p-3 rounded-xl flex items-center gap-2.5">
                <Truck size={22} className="text-sky-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700">Cold-Chain Instant</span>
              </div>
              <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-xl flex items-center gap-2.5">
                <ShieldCheck size={22} className="text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700">Garansi Segar 100%</span>
              </div>
            </div>
          </div>

          {/* RIGHT: DETAILS & ACTIONS */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-lg border border-sky-100">
                  {product.category?.name || 'Ikan Segar'}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Stok: <span className="text-slate-900 font-extrabold">{product.stock} {product.unit}</span>
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* HARGA */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 flex items-baseline gap-2">
                <span className="text-3xl font-black text-sky-600">
                  Rp {product.price.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  / {product.unit} ({product.weightGram}g)
                </span>
              </div>

              {/* DESKRIPSI */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Deskripsi Produk
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {product.description ||
                    'Ikan segar pilihan berkualitass tinggi yang dikemas higienis dengan jaminan rantai dingin (*cold-chain*) dari petambak mitra PanenQu.'}
                </p>
              </div>
            </div>

            {/* QUANTITY & BUTTONS */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              {product.stock <= 0 ? (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl font-bold text-center">
                  ❌ Stok Habis — Produk Sedang Tidak Tersedia
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Jumlah Pembelian:</span>
                  <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200 transition shadow-sm"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-extrabold text-sm text-slate-900 w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200 transition shadow-sm"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}
              {isAdded && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle size={18} />
                  <span>Berhasil ditambahkan ke keranjang belanja!</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="w-full bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold py-3.5 rounded-2xl transition border border-sky-200 flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={20} />
                  <span>+ Keranjang</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="w-full bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Lightning size={20} weight="fill" />
                  <span>Beli Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
