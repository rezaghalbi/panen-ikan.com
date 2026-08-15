'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useCart } from '../../context/CartContext';
import { API_URL } from '@/lib/api';
import {
  Trash,
  Minus,
  Plus,
  ShoppingCart,
  ArrowRight,
  Truck,
  MapPin,
  ShieldCheck,
} from '@phosphor-icons/react';

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingMethod, setShippingMethod] = useState('Instant Cold-Chain');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(number);
  };

  const handleCheckout = async () => {
    const token = Cookies.get('token');
    if (!token) {
      alert('Silakan login terlebih dahulu untuk checkout!');
      return router.push('/login');
    }
    if (items.length === 0) return alert('Keranjang belanja Anda kosong!');
    if (!shippingAddress.trim()) {
      return alert('Harap isi alamat lengkap pengiriman!');
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress,
          shippingMethod,
          notes,
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        }),
      });

      const json = await res.json();

      if (res.ok) {
        clearCart();

        // Jika ada Midtrans Snap Token & Window Snap tersedia
        if (json.snapToken && typeof window !== 'undefined' && (window as any).snap) {
          (window as any).snap.pay(json.snapToken, {
            onSuccess: function (result: any) {
              alert('✅ Pembayaran Berhasil!');
              router.push('/user');
            },
            onPending: function (result: any) {
              alert('⏳ Pesanan dibuat! Menunggu pembayaran.');
              router.push('/user');
            },
            onError: function (result: any) {
              alert('❌ Pembayaran gagal!');
              router.push('/user');
            },
            onClose: function () {
              router.push('/user');
            },
          });
        } else {
          alert('✅ Pesanan Berhasil Dibuat!');
          router.push('/user');
        }
      } else {
        alert(json.message || 'Gagal membuat pesanan');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan koneksi server');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-4">
        <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mb-4 text-sky-600">
          <ShoppingCart size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-2">Keranjang Belanja Kosong</h1>
        <p className="text-slate-500 mb-6 max-w-sm text-sm">
          Belum ada produk ikan segar atau frozen yang dipilih.
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-sky-600/20 hover:from-sky-700 hover:to-cyan-700 transition"
        >
          Lihat Katalog Ikan Segar
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <ShoppingCart weight="fill" className="text-sky-600" /> Keranjang Belanja PanenQu
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* DAFTAR ITEM KERANJANG */}
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap sm:flex-nowrap gap-4 items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-xl overflow-hidden relative shrink-0 border border-slate-200">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingCart size={24} />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatRupiah(item.price)} / {item.unit || 'kg'}
                    </p>
                    <p className="text-xs font-bold text-sky-600 mt-1">
                      Subtotal: {formatRupiah(item.price * item.quantity)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Control Qty */}
                  <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 hover:text-sky-600 text-slate-600"
                    >
                      <Minus weight="bold" size={14} />
                    </button>
                    <span className="font-bold text-xs w-6 text-center text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 hover:text-sky-600 text-slate-600"
                    >
                      <Plus weight="bold" size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-300 hover:text-red-500 transition p-2"
                    title="Hapus"
                  >
                    <Trash size={20} weight="bold" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* CHECKOUT SUMMARY CARD */}
          <div className="w-full lg:w-96">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 sticky top-24">
              <h3 className="font-bold text-lg text-slate-900 mb-4 pb-3 border-b">
                Informasi Pengiriman
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5 mb-1.5">
                    <MapPin size={16} className="text-sky-600" /> Alamat Lengkap
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Masukkan jalan, no. rumah, kecamatan, kota..."
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-600 outline-none"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5 mb-1.5">
                    <Truck size={16} className="text-sky-600" /> Metode Pengiriman
                  </label>
                  <select
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-sky-600 outline-none"
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                  >
                    <option value="Instant Cold-Chain">Instant Cold-Chain (Garansi 2 Jam Segar)</option>
                    <option value="Sameday Delivery">Sameday Delivery (Tiba Hari Ini)</option>
                    <option value="Reguler Express">Reguler Express (1-2 Hari)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase block mb-1">
                    Catatan Pesanan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Bersihkan insang & potong 4..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-600 outline-none"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Total Summary */}
              <div className="space-y-2.5 text-xs mb-6 border-t pt-4 border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal Produk</span>
                  <span className="font-bold text-slate-800">{formatRupiah(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimasi Ongkir</span>
                  <span className="font-bold text-emerald-600">Gratis / Promo Cold-Chain</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t">
                  <span>Total Pembayaran</span>
                  <span className="text-sky-600">{formatRupiah(cartTotal)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-sky-600 to-cyan-600 text-white py-4 rounded-xl font-bold hover:from-sky-700 hover:to-cyan-700 transition flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Memproses Pesanan...</span>
                ) : (
                  <>
                    <span>Bayar Sekarang (Midtrans)</span>
                    <ArrowRight weight="bold" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
