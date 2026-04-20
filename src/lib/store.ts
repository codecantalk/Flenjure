import { create } from "zustand";

export interface CartItem {
  id: string;
  name: string;
  price: string;
  size: string;
  image: string;
  quantity: number;
}

interface CartStore {
  isOpen: boolean;
  items: CartItem[];
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantityDelta: number) => void;
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
}));
