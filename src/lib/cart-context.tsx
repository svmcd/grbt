"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { track } from "./track";
import { MAX_QUANTITY, memleketDiscountCents, unitPriceCents } from "./cart-pricing";

// Checkout accepts at most MAX_QUANTITY of one line
// Same rule as the server: whole numbers from 1 to MAX_QUANTITY
const clampQuantity = (quantity: number) =>
  Number.isFinite(quantity) ? Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity))) : 1;

export type CartItem = {
  slug: string;
  city: string;
  color: string;
  size: string;
  productType: "tshirt" | "hoodie" | "sweater";
  price: number;
  image: string;
  quantity: number;
  personalization?: {
    method: "printed" | "embroidered";
    text: string;
    placement: string;
    font: string;
    color: string;
    cost: number;
  };
  giftPackage?: {
    included: boolean;
    cost: number;
    message?: string;
  };
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  justAdded: CartItem | null;
};

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | {
      type: "REMOVE_ITEM";
      payload: {
        slug: string;
        color: string;
        size: string;
        productType: "tshirt" | "hoodie" | "sweater";
        personalization?: any;
        giftPackage?: any;
      };
    }
  | {
      type: "UPDATE_QUANTITY";
      payload: {
        slug: string;
        color: string;
        size: string;
        productType: "tshirt" | "hoodie" | "sweater";
        quantity: number;
        personalization?: any;
        giftPackage?: any;
      };
    }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "ADD_ITEM_SUCCESS"; payload: CartItem };

// Load cart from localStorage on initialization
const loadCartFromStorage = (): CartState => {
  if (typeof window === "undefined") {
    return { items: [], isOpen: false, justAdded: null };
  }
  try {
    const stored = localStorage.getItem("cart");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migrate old cart items that don't have productType
      const migratedItems = (parsed.items || [])
        // Drop items whose product type no longer exists
        .filter((item: any) => item.productType !== "phonecase")
        .map((item: any) => ({
          ...item,
          productType: item.productType || "tshirt", // Default to tshirt for old items
          quantity: clampQuantity(item.quantity || 1),
        }));
      return {
        items: migratedItems,
        isOpen: false,
        justAdded: null,
      };
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }
  return { items: [], isOpen: false, justAdded: null };
};

const initialState: CartState = loadCartFromStorage();

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) =>
          item.slug === action.payload.slug &&
          item.color === action.payload.color &&
          item.size === action.payload.size &&
          item.productType === action.payload.productType &&
          JSON.stringify(item.personalization) ===
            JSON.stringify(action.payload.personalization) &&
          JSON.stringify(item.giftPackage) ===
            JSON.stringify(action.payload.giftPackage)
      );
      if (existingItem) {
        const updated = state.items.map((item) => {
          if (
            item.slug === action.payload.slug &&
            item.color === action.payload.color &&
            item.size === action.payload.size &&
            item.productType === action.payload.productType &&
            JSON.stringify(item.personalization) ===
              JSON.stringify(action.payload.personalization) &&
            JSON.stringify(item.giftPackage) ===
              JSON.stringify(action.payload.giftPackage)
          ) {
            return {
              ...item,
              quantity: clampQuantity(item.quantity + action.payload.quantity),
            };
          }
          return item;
        });
        return {
          ...state,
          items: updated,
          isOpen: true,
          justAdded: action.payload,
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: clampQuantity(action.payload.quantity) }],
        isOpen: true, // Auto-open cart
        justAdded: action.payload,
      };
    }
    case "UPDATE_QUANTITY": {
      const {
        slug,
        color,
        size,
        productType,
        quantity,
        personalization,
        giftPackage,
      } = action.payload;
      const updated = state.items
        .map((item) => {
          if (
            item.slug === slug &&
            item.color === color &&
            item.size === size &&
            item.productType === productType &&
            JSON.stringify(item.personalization) ===
              JSON.stringify(personalization) &&
            JSON.stringify(item.giftPackage) === JSON.stringify(giftPackage)
          ) {
            return { ...item, quantity: clampQuantity(quantity) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
      return { ...state, items: updated };
    }
    case "ADD_ITEM_SUCCESS": {
      return { ...state, justAdded: null };
    }
    case "REMOVE_ITEM": {
      const { slug, color, size, productType, personalization, giftPackage } =
        action.payload;
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(
              item.slug === slug &&
              item.color === color &&
              item.size === size &&
              item.productType === productType &&
              JSON.stringify(item.personalization) ===
                JSON.stringify(personalization) &&
              JSON.stringify(item.giftPackage) === JSON.stringify(giftPackage)
            )
        ),
      };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    case "OPEN_CART":
      return state.isOpen ? state : { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

type CartContextType = {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (
    slug: string,
    color: string,
    size: string,
    productType: "tshirt" | "hoodie" | "sweater",
    personalization?: any,
    giftPackage?: any
  ) => void;
  updateQuantity: (
    slug: string,
    color: string,
    size: string,
    productType: "tshirt" | "hoodie" | "sweater",
    quantity: number,
    personalization?: any,
    giftPackage?: any
  ) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  getMemleketSavings: () => number;
  clearJustAdded: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("cart", JSON.stringify({ items: state.items }));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [state.items]);

  const addItem = (item: CartItem) => {
    track("add_to_cart", { slug: item.slug, quantity: item.quantity, value: item.price * item.quantity });
    dispatch({ type: "ADD_ITEM", payload: item });
  };
  const removeItem = (
    slug: string,
    color: string,
    size: string,
    productType: "tshirt" | "hoodie" | "sweater",
    personalization?: any,
    giftPackage?: any
  ) => {
    track("remove_from_cart", { slug });
    dispatch({
      type: "REMOVE_ITEM",
      payload: { slug, color, size, productType, personalization, giftPackage },
    });
  };
  const updateQuantity = (
    slug: string,
    color: string,
    size: string,
    productType: "tshirt" | "hoodie" | "sweater",
    quantity: number,
    personalization?: any,
    giftPackage?: any
  ) =>
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: {
        slug,
        color,
        size,
        productType,
        quantity,
        personalization,
        giftPackage,
      },
    });
  // Stable identities, so effects can depend on them
  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
  const toggleCart = useCallback(() => dispatch({ type: "TOGGLE_CART" }), []);
  const openCart = useCallback(() => dispatch({ type: "OPEN_CART" }), []);
  const closeCart = useCallback(() => dispatch({ type: "CLOSE_CART" }), []);
  const clearJustAdded = () =>
    dispatch({ type: "ADD_ITEM_SUCCESS", payload: null as any });
  // Subtotal in cents, before discounts (including personalization and gift packaging).
  // Prices come from the catalog, the same rules /api/checkout charges.
  const getSubtotal = () =>
    state.items.reduce((sum, item) => sum + cartUnitCents(item) * item.quantity, 0);

  // Total in cents after the Memleket family discount, before shipping
  const getTotal = () => getSubtotal() - memleketDiscountCents(state.items);

  const getItemCount = () =>
    state.items.reduce((sum, item) => sum + item.quantity, 0);

  // Memleket family discount in euros (2 items: €5, 3 or more: €10)
  const getMemleketSavings = () => memleketDiscountCents(state.items) / 100;

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        getSubtotal,
        getTotal,
        getItemCount,
        getMemleketSavings,
        clearJustAdded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Unit price in cents from the catalog; the stored price only for an item the catalog no longer has
// (checkout refuses those, so the customer has to remove it).
export function cartUnitCents(item: CartItem): number {
  return unitPriceCents(item) ?? item.price;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
