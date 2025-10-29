/**
 * Shopping Cart Hook
 * Global cart state management with localStorage persistence
 */

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, Product } from '@/types/product';
import { currencyRound, resolveProductPricing } from '@/utils/pricing';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, installationRequired?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('supremo-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('supremo-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    installationRequired: boolean = false
  ) => {
    console.log(
      '[Cart] Adding to cart:',
      product.name,
      'Qty:',
      quantity,
      'Installation:',
      installationRequired
    );

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingItemIndex > -1) {
        // Update quantity if already in cart
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        console.log(
          '[Cart] Updated quantity:',
          updatedCart[existingItemIndex].product.name,
          '->',
          updatedCart[existingItemIndex].quantity
        );
        return updatedCart;
      }

      // Add new item
      const newCart = [
        ...prevCart,
        {
          product,
          quantity,
          installationRequired,
        },
      ];
      console.log('[Cart] Item added. Total items:', newCart.length);
      return newCart;
    });
  };


  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity };
        }
        return item;
      });
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('supremo-cart');
  };

  const getCartTotal = () =>
    currencyRound(
      cart.reduce((total, item) => {
        const pricing = resolveProductPricing(item.product);
        return total + pricing.totalPrice * item.quantity;
      }, 0)
    );

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const isInCart = (productId: string) => {
    return cart.some((item) => item.product.id === productId);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
