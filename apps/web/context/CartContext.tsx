'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
  unit: string;
  weightGram?: number;
  isFresh?: boolean;
  isFrozen?: boolean;
  isProcessed?: boolean;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: any, qtyToAdd?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // 1. Load dari LocalStorage saat awal render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('panenqu_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Error reading cart from localStorage', e);
    }
  }, []);

  // 2. Simpan ke LocalStorage saat items berubah
  useEffect(() => {
    try {
      localStorage.setItem('panenqu_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [items]);

  // Tambah Produk ke Keranjang dengan Kuantitas Kustom
  const addToCart = (product: any, qtyToAdd: number = 1) => {
    setItems((prev) => {
      const productId = String(product.id);
      const existing = prev.find((item) => item.id === productId);
      const addQty = Math.max(1, Number(qtyToAdd) || 1);
      const maxStock = Number(product.stock || 999);

      if (existing) {
        const newTotalQty = Math.min(maxStock, existing.quantity + addQty);
        return prev.map((item) =>
          item.id === productId
            ? { ...item, quantity: newTotalQty }
            : item
        );
      }

      return [
        ...prev,
        {
          id: productId,
          name: product.name,
          price: Number(product.price),
          imageUrl: product.imageUrl || '',
          quantity: Math.min(maxStock, addQty),
          stock: maxStock,
          unit: product.unit || 'kg',
          weightGram: product.weightGram,
          isFresh: product.isFresh,
          isFrozen: product.isFrozen,
          isProcessed: product.isProcessed,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== String(id)));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === String(id)) {
          const newQty = item.quantity + delta;
          if (newQty > item.stock) return item;
          if (newQty < 1) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => setItems([]);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
