import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from 'firebase/auth';
import { mockProducts } from './data';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  images?: string[];
  beforeImageUrl?: string; // For before/after slider
  afterImageUrl?: string;
  features: string[];
  creator?: string;
  fileUrl?: string;
  aeCompatible?: boolean; // Compatible with Adobe After Effects 2023 or newer
}

interface CartItem extends Product {
  quantity: number;
}

export interface Purchase {
  id: string;
  userEmail: string;
  date: string;
  title: string;
  price: number;
  status: string;
  productId: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage?: number;
  discountFixed?: number;
  startDate?: string;
  expiryDate?: string;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface AppState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  user: User | null;
  setUser: (user: User | null) => void;

  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  updateProduct: (product: Product) => void;

  purchases: Purchase[];
  addPurchase: (purchase: Purchase) => void;

  reviews: Review[];
  addReview: (review: Review) => void;

  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  clearWishlist: () => void;
  
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  removeCoupon: (id: string) => void;
  
  currency: string;
  setCurrency: (currency: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      user: null,
      setUser: (user) => set({ user }),

      cart: [],
      addToCart: (product) => set((state) => {
        const existingItem = state.cart.find((item) => item.id === product.id);
        if (existingItem) {
          return {
            cart: state.cart.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          };
        }
        return { cart: [...state.cart, { ...product, quantity: 1 }] };
      }),
      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter((item) => item.id !== productId),
      })),
      clearCart: () => set({ cart: [] }),

      products: mockProducts,
      setProducts: (products) => set({ products }),
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      removeProduct: (productId) => set((state) => ({
        products: state.products.filter((p) => p.id !== productId)
      })),

      updateProduct: (product) => set((state) => ({ products: state.products.map(p => p.id === product.id ? product : p) })),
      purchases: [],
      addPurchase: (purchase) => set((state) => ({ purchases: [...state.purchases, purchase] })),

      reviews: [],
      addReview: (review) => set((state) => ({ reviews: [...state.reviews, review] })),

      wishlist: [],
      toggleWishlist: (productId) => set((state) => ({
        wishlist: state.wishlist.includes(productId) 
          ? state.wishlist.filter(id => id !== productId)
          : [...state.wishlist, productId]
      })),
      clearWishlist: () => set({ wishlist: [] }),
      
      coupons: [],
      addCoupon: (coupon) => set((state) => ({ coupons: [...state.coupons, coupon] })),
      removeCoupon: (id) => set((state) => ({ coupons: state.coupons.filter(c => c.id !== id) })),
      
      currency: 'INR',
      setCurrency: (currency) => set({ currency }),

    }),
    {
      name: 'firewood-storage',
      partialize: (state) => ({ theme: state.theme, cart: state.cart, products: state.products, purchases: state.purchases, reviews: state.reviews, wishlist: state.wishlist, coupons: state.coupons,   }),
    }
  )
);
