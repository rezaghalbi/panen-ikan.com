'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  CreditCard,
  Fish,
  Printer,
  X,
  ArrowsCounterClockwise,
  Prohibit,
} from '@phosphor-icons/react';
import { API_URL } from '@/lib/api';

export default function UserDashboard() {
  const router = useRouter();
  const { toastSuccess, toastError, toastInfo } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);

  const fetchMyOrders = async (showRefreshState = false) => {
    const token = Cookies.get('token');
    if (!token) return router.push('/login');

    if (showRefreshState) setIsRefreshing(true);

    try {
      const res = await fetch(`${API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (res.ok && json.data) {
        setOrders(json.data);
      }
    } catch (error) {
      console.error('Gagal ambil pesanan', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
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
            <CheckCircle size={14} weight="bold" /> Terbayar / Siap Dikemas
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
          toastSuccess('Pembayaran Berhasil! Pesanan Anda segera diproses.');
          fetchMyOrders(true);
        },
        onPending: function () {
          toastInfo('Pesanan dibuat. Silakan selesaikan pembayaran!');
          fetchMyOrders(true);
        },
        onError: function () {
          toastError('Pembayaran Gagal! Silakan coba beberapa saat lagi.');
          fetchMyOrders(true);
        },
        onClose: function () {
          fetchMyOrders(true);
        },
      });
    } else {
      toastInfo('Fitur pembayaran Midtrans Snap aktif.');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Yakin ingin membatalkan pesanan ini? Stok akan dikembalikan.')) return;
    const token = Cookies.get('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        toastSuccess('Pesanan berhasil dibatalkan dan stok dikembalikan.');
        fetchMyOrders(true);
      } else {
        toastError(json.message || 'Gagal membatalkan pesanan.');
      }
    } catch (e) {
      toastError('Terjadi kesalahan koneksi server.');
    }
  };

  const handlePrintReceipt = (order: any) => {
    setActiveReceipt(order);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
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

          <button
            onClick={() => fetchMyOrders(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-xl border border-slate-200 text-xs transition shadow-sm"
          >
            <ArrowsCounterClockwise size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Memperbarui...' : 'Refresh Status'}</span>
          </button>
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
                      <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
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

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handlePrintReceipt(order)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-200"
                    >
                      <Printer size={16} />
                      <span>Cetak Struk</span>
                    </button>

                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition border border-red-200"
                        >
                          <Prohibit size={16} />
                          <span>Batalkan</span>
                        </button>

                        <button
                          onClick={() => handlePaySnap(order)}
                          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-1.5 hover:from-orange-600 hover:to-amber-600 transition"
                        >
                          <CreditCard size={16} weight="bold" />
                          <span>Bayar Sekarang</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL PRINT RECEIPT */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setActiveReceipt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={20} />
            </button>

            {/* RECEIPT CONTENT */}
            <div id="printable-receipt" className="space-y-4 font-sans text-slate-800">
              <div className="text-center pb-4 border-b border-dashed border-slate-300">
                <div className="inline-flex items-center gap-1 font-black text-xl text-sky-700">
                  <Fish size={24} weight="fill" />
                  <span>Panen<span className="text-orange-600">Qu</span></span>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  Struk Pembelian Ikan Segar
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  ID: #{activeReceipt.id}
                </p>
              </div>

              <div className="text-xs space-y-1 text-slate-600">
                <p><span className="font-bold text-slate-900">Tanggal:</span> {new Date(activeReceipt.createdAt).toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
                <p><span className="font-bold text-slate-900">Status:</span> {activeReceipt.status}</p>
                <p><span className="font-bold text-slate-900">Alamat:</span> {activeReceipt.shippingAddress}</p>
              </div>

              <div className="border-t border-b border-dashed border-slate-300 py-3 space-y-2 text-xs">
                {activeReceipt.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">{item.product?.name}</p>
                      <p className="text-[10px] text-slate-500">{item.quantity} x {formatRupiah(item.price)}</p>
                    </div>
                    <span className="font-extrabold text-slate-800">{formatRupiah(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-black text-sm text-slate-900">Total Pembayaran</span>
                <span className="font-black text-base text-sky-600">{formatRupiah(activeReceipt.totalPrice)}</span>
              </div>

              <div className="text-center pt-4 text-[10px] text-slate-400">
                <p>Terima kasih telah berbelanja di PanenQu!</p>
                <p>Jaminan 100% Ikan Segar & Cold-Chain Delivery</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setActiveReceipt(null)}
                className="w-1/2 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="w-1/2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <Printer size={16} />
                <span>Cetak (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
