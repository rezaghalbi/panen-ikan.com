import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import FloatingWhatsApp from '../components/FloatingWhatsApp';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PanenQu - Marketplace Ikan Segar & Seafood Quality',
  description: 'Platform jual beli ikan segar budidaya, fillet frozen IQF, dan olahan bumbu kualitas terbaik langsung dari petambak mitra.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const snapUrl =
    process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL ||
    'https://app.sandbox.midtrans.com/snap/snap.js';
  const clientKey =
    process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-demo-key';

  return (
    <html lang="id">
      <head>
        <Script
          src={snapUrl}
          data-client-key={clientKey}
          strategy="lazyOnload"
        />
      </head>
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white`}>
        <ToastProvider>
          <CartProvider>
            <Navbar />
            {children}
            <FloatingWhatsApp />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
