'use client';

import { WhatsappLogo, X } from '@phosphor-icons/react';
import { useState } from 'react';

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(true);
  const adminNumber = '6281234567890'; // WhatsApp CS PanenQu
  const defaultMessage = encodeURIComponent('Halo CS PanenQu! Saya ingin bertanya mengenai pasokan ikan segar / pemesanan.');

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
      {isOpen && (
        <div className="bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-300 relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1"
          >
            <X size={14} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">
              <WhatsappLogo size={20} weight="fill" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Bantuan CS PanenQu 🐟</p>
              <p className="text-[10px] text-emerald-600 font-semibold">● Online Siap Membantu</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Ada pertanyaan produk atau order partai besar? Chat langsung dengan Admin CS kami!
          </p>
          <a
            href={`https://wa.me/${adminNumber}?text=${defaultMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-3 rounded-xl text-xs text-center shadow-md transition"
          >
            Chat WhatsApp CS
          </a>
        </div>
      )}

      <a
        href={`https://wa.me/${adminNumber}?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition duration-300 border-2 border-white group"
        title="Chat CS WhatsApp PanenQu"
      >
        <WhatsappLogo size={32} weight="fill" className="group-hover:rotate-12 transition duration-300" />
      </a>
    </div>
  );
}
