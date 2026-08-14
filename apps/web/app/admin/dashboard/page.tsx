'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import {
  Fish,
  Package,
  Plus,
  Trash,
  CheckCircle,
  Truck,
  Clock,
  Pencil,
  PlusCircle,
} from '@phosphor-icons/react';
import { API_URL } from '@/lib/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State Tambah Produk
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [weightGram, setWeightGram] = useState('1000');
  const [unit, setUnit] = useState('kg');
  const [stock, setStock] = useState('50');
  const [categoryId, setCategoryId] = useState('');
  const [isFresh, setIsFresh] = useState(true);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const token = Cookies.get('token');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (!token) return router.push('/login');

      // Load Products
      const resP = await fetch(`${API_URL}/api/products`);
      const jsonP = await resP.json();
      if (resP.ok) setProducts(jsonP.data);

      // Load Categories
      const resC = await fetch(`${API_URL}/api/categories`);
      const jsonC = await resC.json();
      if (resC.ok) {
        setCategories(jsonC.data);
        if (jsonC.data.length > 0) setCategoryId(String(jsonC.data[0].id));
      }

      // Load Orders
      const resO = await fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jsonO = await resO.json();
      if (resO.ok) setOrders(jsonO.data);
    } catch (e) {
      console.error('Error loading admin data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          price,
          weightGram,
          unit,
          stock,
          categoryId,
          isFresh,
          isFrozen,
          isProcessed,
          imageUrl,
        }),
      });

      if (res.ok) {
        alert('✅ Produk berhasil ditambahkan!');
        setShowAddForm(false);
        setName('');
        setDescription('');
        setPrice('');
        fetchData();
      } else {
        const json = await res.json();
        alert(json.message || 'Gagal membuat produk');
      }
    } catch (e) {
      console.error(e);
      alert('Error koneksi server');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert('Produk berhasil dihapus');
        fetchData();
      } else {
        const json = await res.json();
        alert(json.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchData();
      } else {
        alert('Gagal update status pesanan');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
              <Fish className="text-sky-600" size={32} weight="fill" />
              <span>Admin Dashboard PanenQu</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Kelola stok katalog produk ikan dan status pengiriman pesanan
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${
                activeTab === 'products'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-white text-slate-700 border hover:bg-slate-50'
              }`}
            >
              Kelola Produk ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${
                activeTab === 'orders'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-white text-slate-700 border hover:bg-slate-50'
              }`}
            >
              Pesanan Masuk ({orders.length})
            </button>
          </div>
        </div>

        {/* TAB PRODUCTS */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Daftar Produk Ikan</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
              >
                <PlusCircle size={18} weight="bold" />
                <span>Tambah Produk Baru</span>
              </button>
            </div>

            {/* FORM TAMBAH PRODUK */}
            {showAddForm && (
              <form
                onSubmit={handleCreateProduct}
                className="bg-white p-6 rounded-3xl border border-sky-100 shadow-xl mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <h3 className="col-span-full font-bold text-lg text-slate-900 border-b pb-2">
                  Form Tambah Produk Ikan Baru
                </h3>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Nama Produk</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ikan Gurame Segar Utuh (1 Kg)"
                    className="w-full p-2.5 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-600 outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Kategori</label>
                  <select
                    className="w-full p-2.5 border rounded-xl text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-sky-600 outline-none"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="55000"
                    className="w-full p-2.5 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-600 outline-none"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Stok</label>
                  <input
                    type="number"
                    required
                    className="w-full p-2.5 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-600 outline-none"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Berat Gram</label>
                  <input
                    type="number"
                    className="w-full p-2.5 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-600 outline-none"
                    value={weightGram}
                    onChange={(e) => setWeightGram(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Satuan Unit</label>
                  <select
                    className="w-full p-2.5 border rounded-xl text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-sky-600 outline-none"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    <option value="kg">kg</option>
                    <option value="pack">pack</option>
                    <option value="paket">paket</option>
                  </select>
                </div>
                <div className="col-span-full">
                  <label className="text-xs font-bold text-slate-600 block mb-1">URL Gambar Produk</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-600 outline-none"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
                <div className="col-span-full">
                  <label className="text-xs font-bold text-slate-600 block mb-1">Deskripsi Produk</label>
                  <textarea
                    rows={2}
                    className="w-full p-2.5 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-600 outline-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="col-span-full flex gap-4 text-xs font-bold text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFresh}
                      onChange={(e) => setIsFresh(e.target.checked)}
                    />
                    <span>Ikan Segar</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFrozen}
                      onChange={(e) => setIsFrozen(e.target.checked)}
                    />
                    <span>Frozen IQF</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isProcessed}
                      onChange={(e) => setIsProcessed(e.target.checked)}
                    />
                    <span>Olahan & Bumbu</span>
                  </label>
                </div>

                <div className="col-span-full flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-sky-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-sky-700 transition"
                  >
                    Simpan Produk
                  </button>
                </div>
              </form>
            )}

            {/* TABEL PRODUK */}
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Produk</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Harga</th>
                    <th className="p-4">Stok</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Fish size={18} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {p.weightGram}g / {p.unit}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-600">{p.category?.name}</td>
                      <td className="p-4 font-bold text-slate-900">{formatRupiah(p.price)}</td>
                      <td className="p-4 font-bold text-sky-600">{p.stock}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="text-red-500 hover:text-red-700 p-1 font-bold"
                          title="Hapus Produk"
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Daftar Pesanan Pembeli</h2>
            {orders.map((o) => (
              <div key={o.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-3 pb-3 border-b">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">
                      Order #{o.id.slice(0, 8)} - {o.user?.name}
                    </span>
                    <p className="text-xs text-slate-400">Alamat: {o.shippingAddress || 'Tidak ada'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Update Status:</span>
                    <select
                      className="p-1.5 border rounded-lg text-xs font-bold bg-slate-50"
                      value={o.status}
                      onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600 mb-3">
                  {o.items.map((i: any) => (
                    <div key={i.id} className="flex justify-between">
                      <span>
                        • {i.product?.name} ({i.quantity}x)
                      </span>
                      <span className="font-bold">{formatRupiah(i.price * i.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t text-xs">
                  <span className="text-slate-500">Metode: {o.shippingMethod}</span>
                  <span className="font-black text-sky-600 text-sm">
                    Total: {formatRupiah(o.totalPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
