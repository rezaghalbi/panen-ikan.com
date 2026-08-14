import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { CartProvider } from '../context/CartContext';
import Navbar from '../components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PanenQu - Marketplace Ikan Segar & Frozen Quality',
  description: 'Platform jual beli ikan segar budidaya, fillet frozen IQF, dan olahan bumbu kualitas terbaik langsung dari petani mitra.',
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
      <body className={inter.className}>
        <CartProvider>
          <Navbar />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
