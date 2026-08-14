'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Package, Clock, CheckCircle, Truck, XCircle, CreditCard, Fish } from '@phosphor-icons/react';
import { API_URL } from '@/lib/api';

export default function UserDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) return router.push('/login');

    const fetchMyOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();

        if (res.ok) {
          setOrders(json.data);
        }
      } catch (error) {
        console.error('Gagal ambil pesanan', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyOrders();
  }, [router]);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(number);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock size={14} weight="bold" /> Menunggu Pembayaran
          </span>
        );
      case 'PAID':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle size={14} weight="bold" /> Lunas / Terbayar
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="bg-sky-100 text-sky-800 border border-sky-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Package size={14} weight="bold" /> Diproses & Dikemas Cold-Chain
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Truck size={14} weight="bold" /> Dalam Pengiriman Kurir
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle size={14} weight="bold" /> Selesai / Diterima
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <XCircle size={14} weight="bold" /> Dibatalkan
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  const handlePaySnap = (order: any) => {
    if (order.snapToken && typeof window !== 'undefined' && (window as any).snap) {
      (window as any).snap.pay(order.snapToken, {
        onSuccess: function () {
          alert('✅ Pembayaran Berhasil!');
          window.location.reload();
        },
        onPending: function () {
          alert('⏳ Silakan selesaikan pembayaran!');
        },
        onError: function () {
          alert('❌ Pembayaran Gagal!');
        },
      });
    } else {
      alert('Fitur pembayaran Midtrans Sandbox / Manual Transfer dapat diakses.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2">
              <Fish className="text-sky-600" size={32} weight="fill" />
              <span>Pesanan Saya</span>
            </h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              Riwayat belanja ikan segar dan seafood di PanenQu
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Memuat riwayat pesanan...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-slate-100 shadow-sm">
              <Package size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-800 font-bold text-base mb-1">Belum Ada Pesanan</p>
              <p className="text-slate-500 text-xs mb-6">Yuk belanja ikan segar favoritmu sekarang!</p>
              <button
                onClick={() => router.push('/')}
                className="bg-sky-600 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-md"
              >
                Mulai Belanja Ikan
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition"
              >
                {/* Header Order */}
                <div className="flex flex-wrap justify-between items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase block">
                      Order #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                        {item.product?.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Fish size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                          {item.product?.name || 'Produk Ikan'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {item.quantity} x {formatRupiah(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Order */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Total Pembayaran</span>
                    <span className="text-lg font-black text-sky-600">
                      {formatRupiah(order.totalPrice)}
                    </span>
                  </div>

                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handlePaySnap(order)}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-1.5 hover:from-orange-600 hover:to-amber-600 transition"
                    >
                      <CreditCard size={16} weight="bold" />
                      <span>Bayar Sekarang</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
