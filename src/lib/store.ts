import { create } from "zustand";

export interface CartItem {
  id: string;
  name: string;
  price: string;
  size: string;
  image: string;
  quantity: number;
  isCafe?: boolean;
}

interface CartStore {
  isOpen: boolean;
  items: CartItem[];
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantityDelta: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  isOpen: false,
  items: [],
  setIsOpen: (isOpen) => set({ isOpen }),
  addItem: (item) =>
    set((state) => {
      const existingItem = state.items.find(
        (i) => i.id === item.id && i.size === item.size
      );
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.id === item.id && i.size === item.size
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
          isOpen: true, // Auto open cart on add
        };
      }
      return { items: [...state.items, item], isOpen: true };
    }),
  removeItem: (id, size) =>
    set((state) => ({
      items: state.items.filter((i) => !(i.id === id && i.size === size)),
    })),
  updateQuantity: (id, size, delta) => 
    set((state) => ({
      items: state.items.map((i) => {
        if (i.id === id && i.size === size) {
          const newQuantity = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQuantity };
        }
        return i;
      })
    })),
  clearCart: () => set({ items: [] }),
}));

export interface CurrencyStore {
  currency: 'USD' | 'EUR' | 'GBP';
  symbol: string;
  rate: number;
  initCurrency: () => Promise<void>;
  formatPrice: (usdPrice: number | string) => string;
}

export const useCurrencyStore = create<CurrencyStore>((set, get) => ({
  currency: 'USD',
  symbol: '$',
  rate: 1,
  initCurrency: async () => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      let currency: 'USD' | 'EUR' | 'GBP' = 'USD';
      let symbol = '$';
      const rate = 1; // 1-to-1 parity as requested by the client

      if (tz === 'Europe/London' || tz === 'Europe/Belfast') {
        currency = 'GBP';
        symbol = '£';
      } else if (tz.startsWith('Europe/')) {
        currency = 'EUR';
        symbol = '€';
      }

      // Immediately set the currency, symbol, and 1-to-1 rate
      set({ currency, symbol, rate });
    } catch (e) {
      console.error("Failed to init currency", e);
    }
  },
  formatPrice: (usdPrice: number | string) => {
    const { symbol, rate } = get();
    const num = typeof usdPrice === 'string' ? parseFloat(usdPrice.replace(/[^0-9.-]+/g, '')) : usdPrice;
    if (isNaN(num)) return `${symbol}0.00`;
    return `${symbol}${(num * rate).toFixed(2)}`;
  }
}));
