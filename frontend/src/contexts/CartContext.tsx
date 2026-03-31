"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { cartAPI, Cart } from "@/lib/api";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await cartAPI.get();
      setCart(data);
    } catch {
      // Cart might not exist yet for anonymous users
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart, isAuthenticated]);

  const addItem = async (productId: number, quantity = 1) => {
    const data = await cartAPI.addItem(productId, quantity);
    setCart(data);
  };

  const updateItem = async (itemId: number, quantity: number) => {
    const data = await cartAPI.updateItem(itemId, quantity);
    setCart(data);
  };

  const removeItem = async (itemId: number) => {
    const data = await cartAPI.removeItem(itemId);
    setCart(data);
  };

  const clearCart = async () => {
    const data = await cartAPI.clear();
    setCart(data);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        itemCount: cart?.item_count ?? 0,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
