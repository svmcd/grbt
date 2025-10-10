"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import { memleketSlugs } from "./catalog";

export type CartItem = {
  slug: string;
  city: string;
  color: string;
  size: string;
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
        quantity: number;
        personalization?: any;
        giftPackage?: any;
      };
    }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "CLOSE_CART" }
  | { type: "ADD_ITEM_SUCCESS"; payload: CartItem };

const initialState: CartState = {
  items: [],
  isOpen: false,
  justAdded: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) =>
          item.slug === action.payload.slug &&
          item.color === action.payload.color &&
          item.size === action.payload.size &&
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
            JSON.stringify(item.personalization) ===
              JSON.stringify(action.payload.personalization) &&
            JSON.stringify(item.giftPackage) ===
              JSON.stringify(action.payload.giftPackage)
          ) {
            return {
              ...item,
              quantity: item.quantity + action.payload.quantity,
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
        items: [...state.items, action.payload],
        isOpen: true, // Auto-open cart
        justAdded: action.payload,
      };
    }
    case "UPDATE_QUANTITY": {
      const { slug, color, size, quantity, personalization, giftPackage } =
        action.payload;
      const updated = state.items
        .map((item) => {
          if (
            item.slug === slug &&
            item.color === color &&
            item.size === size &&
            JSON.stringify(item.personalization) ===
              JSON.stringify(personalization) &&
            JSON.stringify(item.giftPackage) === JSON.stringify(giftPackage)
          ) {
            return { ...item, quantity };
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
      const { slug, color, size, personalization, giftPackage } =
        action.payload;
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(
              item.slug === slug &&
              item.color === color &&
              item.size === size &&
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
    personalization?: any,
    giftPackage?: any
  ) => void;
  updateQuantity: (
    slug: string,
    color: string,
    size: string,
    quantity: number,
    personalization?: any,
    giftPackage?: any
  ) => void;
  clearCart: () => void;
  toggleCart: () => void;
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

  const addItem = (item: CartItem) =>
    dispatch({ type: "ADD_ITEM", payload: item });
  const removeItem = (
    slug: string,
    color: string,
    size: string,
    personalization?: any,
    giftPackage?: any
  ) =>
    dispatch({
      type: "REMOVE_ITEM",
      payload: { slug, color, size, personalization, giftPackage },
    });
  const updateQuantity = (
    slug: string,
    color: string,
    size: string,
    quantity: number,
    personalization?: any,
    giftPackage?: any
  ) =>
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { slug, color, size, quantity, personalization, giftPackage },
    });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });
  const toggleCart = () => dispatch({ type: "TOGGLE_CART" });
  const closeCart = () => dispatch({ type: "CLOSE_CART" });
  const clearJustAdded = () =>
    dispatch({ type: "ADD_ITEM_SUCCESS", payload: null as any });
  const getSubtotal = () => {
    // Calculate subtotal for all items (including personalization and gift packages)
    return state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const getTotal = () => {
    const memleketItems = state.items.filter((item) =>
      memleketSlugs.includes(item.slug)
    );

    // Calculate subtotal for all items (including personalization and gift packages)
    const allItemsTotal = state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Calculate memleket quantity for family discount
    const memleketQuantity = memleketItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    // Apply family discount based on memleket quantity
    let familyDiscount = 0;
    if (memleketQuantity >= 3) {
      // 3+ memleket items: €10 discount
      familyDiscount = 10;
    } else if (memleketQuantity >= 2) {
      // 2 memleket items: €5 discount
      familyDiscount = 5;
    }

    const total = allItemsTotal - familyDiscount;
    console.log(
      `Cart total: allItemsTotal=${allItemsTotal}, memleketQuantity=${memleketQuantity}, familyDiscount=${familyDiscount}, total=${total}`
    );
    return total;
  };
  const getItemCount = () =>
    state.items.reduce((sum, item) => sum + item.quantity, 0);

  const getMemleketSavings = () => {
    const memleketItems = state.items.filter((item) =>
      memleketSlugs.includes(item.slug)
    );
    const memleketQuantity = memleketItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    if (memleketQuantity >= 3) {
      return 10; // €10 discount for 3+ items
    } else if (memleketQuantity >= 2) {
      return 5; // €5 discount for 2 items
    }

    return 0;
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
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

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
