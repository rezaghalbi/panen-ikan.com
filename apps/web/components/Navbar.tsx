'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  User,
  SignOut,
  List,
  X,
  Fish,
  Package,
  UserGear,
  Storefront,
} from '@phosphor-icons/react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('');
  const [userName, setUserName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { cartCount } = useCart();

  useEffect(() => {
    const checkLogin = () => {
      const token = Cookies.get('token');
      const userCookie = Cookies.get('user');

      if (token && userCookie) {
        setIsLoggedIn(true);
        try {
          const user = JSON.parse(userCookie);
          setRole(user.role);
          setUserName(user.name || 'Pelanggan');
        } catch (e) {
          console.error(e);
        }
      } else {
        setIsLoggedIn(false);
      }
    };
    checkLogin();
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    window.location.href = '/login';
  };

  const dashboardLink = role === 'ADMIN' ? '/admin' : '/user';

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-sky-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        {/* LOGO PANENQU */}
        <Link
          href="/"
          className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-2.5 group"
        >
          <div className="w-11 h-11 bg-gradient-to-tr from-sky-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-600/30 group-hover:scale-105 transition">
            <Fish size={26} weight="fill" />
          </div>
          <div className="flex flex-col">
            <span className="leading-none text-xl font-extrabold tracking-tight">
              Panen<span className="text-orange-600">Qu</span>
            </span>
            <span className="text-[10px] font-bold text-sky-600 tracking-wider uppercase mt-0.5">
              Fresh Seafood & Fish
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="font-semibold text-slate-700 hover:text-sky-600 transition"
          >
            Beranda
          </Link>
          <Link
            href="/catalog"
            className="font-semibold text-slate-700 hover:text-sky-600 transition"
          >
            Katalog Ikan
          </Link>
          <Link
            href="/#mitra"
            className="font-semibold text-slate-700 hover:text-sky-600 transition flex items-center gap-1"
          >
            <Storefront size={18} className="text-emerald-500" />
            <span>Mitra Agen</span>
          </Link>

          {/* KERANJANG BELANJA */}
          {role !== 'ADMIN' && (
            <Link
              href="/cart"
              className="relative p-2.5 text-slate-700 hover:text-sky-600 transition bg-sky-50 rounded-xl hover:bg-sky-100 border border-sky-100"
              title="Keranjang Belanja"
            >
              <ShoppingCart size={22} weight="bold" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-md">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {isLoggedIn ? (
            <div className="flex items-center gap-4 border-l pl-6 border-slate-200">
              <Link
                href={dashboardLink}
                className="flex items-center gap-2 font-bold text-slate-700 hover:text-sky-600 transition"
              >
                <Package size={20} weight="fill" className="text-sky-600" />
                <span>{role === 'ADMIN' ? 'Admin Panel' : 'Pesanan Saya'}</span>
              </Link>

              <div className="flex items-center gap-2 bg-slate-100 py-1.5 px-3 rounded-full border border-slate-200">
                <div className="w-7 h-7 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate">
                  {userName}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-600 transition p-1"
                title="Keluar"
              >
                <SignOut size={22} />
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/login"
                className="font-bold text-slate-800 hover:text-sky-600 transition px-4 py-2.5 text-sm"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-6 py-2.5 rounded-xl font-bold hover:from-sky-700 hover:to-cyan-700 transition shadow-lg shadow-sky-600/20 text-sm"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU TRIGGER */}
        <button
          className="md:hidden text-slate-900 p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <List size={28} />}
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {isOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-4 shadow-xl absolute w-full z-40">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="block font-bold py-2 text-slate-700"
          >
            Beranda
          </Link>
          <Link
            href="/catalog"
            onClick={() => setIsOpen(false)}
            className="block font-bold py-2 text-slate-700"
          >
            Katalog Ikan
          </Link>

          {role !== 'ADMIN' && (
            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between font-bold py-2 text-slate-700 border-t pt-3"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-sky-600" /> Keranjang Belanja
              </span>
              {cartCount > 0 && (
                <span className="bg-orange-600 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                  {cartCount} Item
                </span>
              )}
            </Link>
          )}

          {isLoggedIn ? (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center gap-3 px-2 mb-3">
                <div className="w-9 h-9 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">{userName}</p>
                  <p className="text-xs text-sky-600 font-semibold">{role}</p>
                </div>
              </div>
              <Link
                href={dashboardLink}
                onClick={() => setIsOpen(false)}
                className="block bg-sky-50 text-sky-700 p-3 rounded-xl font-bold text-center border border-sky-100"
              >
                {role === 'ADMIN' ? 'Admin Dashboard' : 'Pesanan Saya'}
              </Link>
              <button
                onClick={handleLogout}
                className="w-full bg-red-50 text-red-600 p-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <SignOut size={20} /> Keluar
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center font-bold py-2.5 border rounded-xl text-slate-800"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="block text-center font-bold py-2.5 bg-sky-600 text-white rounded-xl shadow-md shadow-sky-600/20"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
