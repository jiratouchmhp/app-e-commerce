import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartState } from '@/types/cart'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.productId === product.productId)

          if (existingItem) {
            // Update quantity if item exists
            const newQuantity = existingItem.quantity + quantity
            // Don't exceed stock
            if (newQuantity > product.stock) {
              return state
            }

            return {
              items: state.items.map((item) =>
                item.productId === product.productId
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            }
          }

          // Add new item
          return {
            items: [
              ...state.items,
              {
                ...product,
                quantity,
              },
            ],
          }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            return {
              items: state.items.filter((item) => item.productId !== productId),
            }
          }

          return {
            items: state.items.map((item) => {
              if (item.productId === productId) {
                // Don't exceed stock
                const newQuantity = Math.min(quantity, item.stock)
                return { ...item, quantity: newQuantity }
              }
              return item
            }),
          }
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
