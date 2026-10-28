import type { CartItem } from "./CartItem";

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: { id: number; name: string; price: number; image: string }) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  totalItems: number;
  totalPrice: number;
}