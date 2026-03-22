import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Brownie flavors
export const FLAVORS = [
  { id: 'tripleChocolate', name: 'Triple Chocolate', icon: '🍫', color: '#3E2723' },
  { id: 'chokis', name: 'Chokis', icon: '🍪', color: '#A1887F' },
  { id: 'oreo', name: 'Oreo', icon: '🖤', color: '#37474F' },
]

// Raw material categories
export const MATERIAL_CATEGORIES = [
  'Harina', 'Leche', 'Huevo', 'Chocolate', 'Mantequilla',
  'Azúcar', 'Bolsas', 'Stickers', 'Listones', 'Galletas (Oreo/Chokis)', 'Otro'
]

// Pricing constants
const COST_PER_UNIT = 13.0
const PRICE_SINGLE = 30.0
const PRICE_PAIR = 55.0

/**
 * Discount formula: (total/2)*55 + (total%2)*30
 * 2x$55 applies to any flavor combination
 */
export function calculateTotal(totalUnits) {
  const pairs = Math.floor(totalUnits / 2)
  const remainder = totalUnits % 2
  return pairs * PRICE_PAIR + remainder * PRICE_SINGLE
}

export function calculateCost(totalUnits) {
  return totalUnits * COST_PER_UNIT
}

const useBrownieStore = create(
  persist(
    (set, get) => ({
      // ── Inventory ──
      inventory: {
        tripleChocolate: 0,
        chokis: 0,
        oreo: 0,
      },

      restockFlavor: (flavorId, quantity) => set(state => ({
        inventory: {
          ...state.inventory,
          [flavorId]: (state.inventory[flavorId] || 0) + quantity,
        }
      })),

      // ── Cart (POS) ──
      cart: {},

      addToCart: (flavorId) => set(state => {
        const currentInCart = state.cart[flavorId] || 0
        const stock = state.inventory[flavorId] || 0
        if (currentInCart >= stock) return state
        return { cart: { ...state.cart, [flavorId]: currentInCart + 1 } }
      }),

      removeFromCart: (flavorId) => set(state => {
        const current = state.cart[flavorId] || 0
        if (current <= 0) return state
        const newCart = { ...state.cart }
        if (current === 1) {
          delete newCart[flavorId]
        } else {
          newCart[flavorId] = current - 1
        }
        return { cart: newCart }
      }),

      clearCart: () => set({ cart: {} }),

      getCartTotal: () => {
        const { cart } = get()
        const totalUnits = Object.values(cart).reduce((sum, q) => sum + q, 0)
        return {
          totalUnits,
          totalPrice: calculateTotal(totalUnits),
          totalCost: calculateCost(totalUnits),
          profit: calculateTotal(totalUnits) - calculateCost(totalUnits),
          pairs: Math.floor(totalUnits / 2),
          singles: totalUnits % 2,
          discount: (totalUnits * PRICE_SINGLE) - calculateTotal(totalUnits),
        }
      },

      // ── Sales ──
      sales: [],

      completeSale: () => set(state => {
        const { cart, inventory } = state
        const totalUnits = Object.values(cart).reduce((sum, q) => sum + q, 0)
        if (totalUnits === 0) return state

        const items = Object.entries(cart)
          .filter(([, qty]) => qty > 0)
          .map(([flavorId, quantity]) => ({ flavorId, quantity }))

        const sale = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          items,
          totalAmount: calculateTotal(totalUnits),
          totalCost: calculateCost(totalUnits),
          totalBrownies: totalUnits,
        }

        // Deduct stock
        const newInventory = { ...inventory }
        for (const [flavorId, qty] of Object.entries(cart)) {
          newInventory[flavorId] = Math.max(0, (newInventory[flavorId] || 0) - qty)
        }

        return {
          sales: [sale, ...state.sales],
          inventory: newInventory,
          cart: {},
        }
      }),

      // ── Raw Material Expenses ──
      expenses: [],

      addExpense: (expense) => set(state => ({
        expenses: [
          { id: Date.now().toString(), date: new Date().toISOString(), ...expense },
          ...state.expenses,
        ]
      })),

      deleteExpense: (id) => set(state => ({
        expenses: state.expenses.filter(e => e.id !== id)
      })),

      // ── Pending Orders ──
      orders: [],

      addOrder: (order) => set(state => ({
        orders: [
          { id: Date.now().toString(), createdAt: new Date().toISOString(), isDelivered: false, ...order },
          ...state.orders,
        ]
      })),

      toggleOrderPaid: (id) => set(state => ({
        orders: state.orders.map(o => o.id === id ? { ...o, isPaid: !o.isPaid } : o)
      })),

      markOrderDelivered: (id) => set(state => ({
        orders: state.orders.map(o => o.id === id ? { ...o, isDelivered: true } : o)
      })),

      deleteOrder: (id) => set(state => ({
        orders: state.orders.filter(o => o.id !== id)
      })),

      // ── Helpers ──
      getTodaySales: () => {
        const { sales } = get()
        const today = new Date().toISOString().slice(0, 10)
        return sales.filter(s => s.date.slice(0, 10) === today)
      },

      getMonthSales: (year, month) => {
        const { sales } = get()
        return sales.filter(s => {
          const d = new Date(s.date)
          return d.getFullYear() === year && d.getMonth() === month
        })
      },

      getMonthExpenses: (year, month) => {
        const { expenses } = get()
        return expenses.filter(e => {
          const d = new Date(e.date)
          return d.getFullYear() === year && d.getMonth() === month
        })
      },

      getLowStockFlavors: () => {
        const { inventory } = get()
        return FLAVORS.filter(f => (inventory[f.id] || 0) < 5)
      },
    }),
    {
      name: 'brownie-master-storage',
    }
  )
)

export default useBrownieStore
