import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Default flavors (used only on first launch)
export const DEFAULT_FLAVORS = [
  { id: 'tripleChocolate', name: 'Triple Chocolate', icon: '🍫', color: '#3E2723' },
  { id: 'chokis', name: 'Chokis', icon: '🍪', color: '#A1887F' },
  { id: 'oreo', name: 'Oreo', icon: '🖤', color: '#37474F' },
]

// Emoji options for flavor picker
export const FLAVOR_ICONS = [
  '🍫', '🍪', '🖤', '🤍', '🍓', '🫐', '🥜', '🍌', '🍑', '🧁',
  '🎂', '🍰', '☕', '🍵', '🥛', '🍯', '🌰', '🟤', '⬛', '🔵',
  '🟣', '🟢', '🩷', '🩵', '💛', '❤️', '✨', '⭐', '💜', '🤎',
]

// Color options for flavor picker
export const FLAVOR_COLORS = [
  '#3E2723', '#4E342E', '#5D4037', '#6D4C41', '#795548',
  '#8D6E63', '#A1887F', '#37474F', '#455A64', '#546E7A',
  '#880E4F', '#AD1457', '#C62828', '#D84315', '#E65100',
  '#F57F17', '#827717', '#33691E', '#1B5E20', '#004D40',
  '#006064', '#01579B', '#1A237E', '#311B92', '#4A148C',
]

// Raw material categories
export const MATERIAL_CATEGORIES = [
  'Harina', 'Leche', 'Huevo', 'Chocolate', 'Mantequilla',
  'Azúcar', 'Bolsas', 'Stickers', 'Listones', 'Galletas (Oreo/Chokis)', 'Otro'
]

// Pricing constants
const COST_PER_UNIT = 8.0
const PRICE_SINGLE = 30.0
const PRICE_PAIR = 55.0

// Preset promo prices for quick selection
export const PROMO_PRESETS = [
  { label: '2×$55', pairPrice: 55, singlePrice: 30 },
  { label: '2×$50', pairPrice: 50, singlePrice: 25 },
  { label: '2×$45', pairPrice: 45, singlePrice: 25 },
  { label: '2×$40', pairPrice: 40, singlePrice: 20 },
]

export function calculateTotal(totalUnits, pairPrice = PRICE_PAIR, singlePrice = PRICE_SINGLE) {
  const pairs = Math.floor(totalUnits / 2)
  const remainder = totalUnits % 2
  return pairs * pairPrice + remainder * singlePrice
}

export function calculateCost(totalUnits) {
  return totalUnits * COST_PER_UNIT
}

const useBrownieStore = create(
  persist(
    (set, get) => ({
      // ── Flavors (dynamic) ──
      flavors: DEFAULT_FLAVORS,

      addFlavor: (flavor) => set(state => {
        const id = flavor.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()
        const newFlavor = { id, ...flavor }
        return {
          flavors: [...state.flavors, newFlavor],
          inventory: { ...state.inventory, [id]: 0 },
        }
      }),

      updateFlavor: (id, updates) => set(state => ({
        flavors: state.flavors.map(f => f.id === id ? { ...f, ...updates } : f),
      })),

      deleteFlavor: (id) => set(state => {
        const newInventory = { ...state.inventory }
        delete newInventory[id]
        // Also clean from cart
        const newCart = { ...state.cart }
        delete newCart[id]
        return {
          flavors: state.flavors.filter(f => f.id !== id),
          inventory: newInventory,
          cart: newCart,
        }
      }),

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

      setStock: (flavorId, quantity) => set(state => ({
        inventory: {
          ...state.inventory,
          [flavorId]: Math.max(0, quantity),
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

      getCartTotal: (pairPrice = PRICE_PAIR, singlePrice = PRICE_SINGLE) => {
        const { cart } = get()
        const totalUnits = Object.values(cart).reduce((sum, q) => sum + q, 0)
        const price = calculateTotal(totalUnits, pairPrice, singlePrice)
        return {
          totalUnits,
          totalPrice: price,
          totalCost: calculateCost(totalUnits),
          profit: price - calculateCost(totalUnits),
          pairs: Math.floor(totalUnits / 2),
          singles: totalUnits % 2,
          discount: (totalUnits * PRICE_SINGLE) - price,
          pairPrice,
          singlePrice,
        }
      },

      // ── Sales ──
      sales: [],

      completeSale: (pairPrice = PRICE_PAIR, singlePrice = PRICE_SINGLE) => set(state => {
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
          totalAmount: calculateTotal(totalUnits, pairPrice, singlePrice),
          totalCost: calculateCost(totalUnits),
          totalBrownies: totalUnits,
        }

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

      deleteSale: (id) => set(state => {
        const sale = state.sales.find(s => s.id === id)
        if (!sale) return state
        const newInventory = { ...state.inventory }
        for (const item of sale.items) {
          newInventory[item.flavorId] = (newInventory[item.flavorId] || 0) + item.quantity
        }
        return {
          sales: state.sales.filter(s => s.id !== id),
          inventory: newInventory,
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
        const { inventory, flavors } = get()
        return flavors.filter(f => (inventory[f.id] || 0) < 5)
      },
    }),
    {
      name: 'brownie-master-storage',
    }
  )
)

export default useBrownieStore
