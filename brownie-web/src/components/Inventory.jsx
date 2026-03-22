import { useState } from 'react'
import useBrownieStore, { FLAVORS, MATERIAL_CATEGORIES } from '../store/useStore'

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

export default function Inventory() {
  const inventory = useBrownieStore(s => s.inventory)
  const expenses = useBrownieStore(s => s.expenses)
  const restockFlavor = useBrownieStore(s => s.restockFlavor)
  const addExpense = useBrownieStore(s => s.addExpense)
  const deleteExpense = useBrownieStore(s => s.deleteExpense)

  const [tab, setTab] = useState('stock')
  const [showRestock, setShowRestock] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [rFlavor, setRFlavor] = useState('tripleChocolate')
  const [rQty, setRQty] = useState('')

  // Expense form
  const [eAmount, setEAmount] = useState('')
  const [eCat, setECat] = useState('Harina')
  const [eDesc, setEDesc] = useState('')

  const totalStock = Object.values(inventory).reduce((s, v) => s + v, 0)

  // Current month expenses
  const now = new Date()
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.date)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0)

  // Group by category
  const byCategory = {}
  monthExpenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount
  })

  function handleRestock() {
    const qty = parseInt(rQty)
    if (qty > 0) {
      restockFlavor(rFlavor, qty)
      setRQty('')
      setShowRestock(false)
    }
  }

  function handleAddExpense() {
    const amount = parseFloat(eAmount)
    if (amount > 0) {
      addExpense({ amount, category: eCat, description: eDesc })
      setEAmount('')
      setEDesc('')
      setShowAddExpense(false)
    }
  }

  return (
    <div className="page flex-col gap-lg animate-in">
      <h1 className="page-title">Inventario</h1>

      {/* Tabs */}
      <div className="flex gap-sm">
        <button
          className={`btn btn--sm ${tab === 'stock' ? 'btn--primary' : 'btn--ghost'}`}
          onClick={() => setTab('stock')}
          style={{ flex: 1 }}
        >
          📦 Stock
        </button>
        <button
          className={`btn btn--sm ${tab === 'expenses' ? 'btn--primary' : 'btn--ghost'}`}
          onClick={() => setTab('expenses')}
          style={{ flex: 1 }}
        >
          🧾 Materia Prima
        </button>
      </div>

      {tab === 'stock' ? (
        <>
          {/* Total + Restock button */}
          <div className="card flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary">Stock Total</p>
              <strong className="text-xl">{totalStock} unidades</strong>
            </div>
            <button className="btn btn--accent btn--sm" onClick={() => setShowRestock(true)}>
              ➕ Resurtir
            </button>
          </div>

          {/* Per-flavor cards */}
          {FLAVORS.map(f => {
            const stock = inventory[f.id] || 0
            const isLow = stock < 5
            return (
              <div key={f.id} className="card" style={{ borderColor: f.color }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-md">
                    <span style={{ fontSize: '2rem' }}>{f.icon}</span>
                    <div>
                      <strong>{f.name}</strong>
                      <p className="text-xs text-secondary">Costo: $13/ud</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <strong className="text-xl" style={{ color: isLow ? 'var(--danger)' : 'var(--text)' }}>
                      {stock}
                    </strong>
                    {isLow && <span className="badge badge--danger" style={{ display: 'block', marginTop: 4 }}>¡Bajo!</span>}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Restock Modal */}
          {showRestock && (
            <div className="overlay" onClick={() => setShowRestock(false)}>
              <div className="modal animate-scale" onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: 16, fontWeight: 800 }}>📦 Resurtir Stock</h3>
                <div className="flex-col gap-md">
                  <div>
                    <label>Sabor</label>
                    <select className="input select" value={rFlavor} onChange={e => setRFlavor(e.target.value)}>
                      {FLAVORS.map(f => (
                        <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Cantidad</label>
                    <input className="input" type="number" placeholder="Unidades" value={rQty} onChange={e => setRQty(e.target.value)} min="1" />
                  </div>
                  <div className="flex gap-sm">
                    <button className="btn btn--ghost btn--block" onClick={() => setShowRestock(false)}>Cancelar</button>
                    <button className="btn btn--accent btn--block" onClick={handleRestock} disabled={!rQty || parseInt(rQty) <= 0}>Agregar</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Month total + Add button */}
          <div className="card card--orange flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary">Gastos del Mes</p>
              <strong className="text-xl">{formatMoney(monthTotal)}</strong>
            </div>
            <button className="btn btn--orange btn--sm" onClick={() => setShowAddExpense(true)}>
              ➕ Agregar
            </button>
          </div>

          {/* Breakdown by category */}
          {Object.keys(byCategory).length > 0 && (
            <div className="card card--sm">
              <strong className="mb-md" style={{ display: 'block' }}>Por Categoría</strong>
              {Object.entries(byCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, total]) => (
                  <div key={cat} className="flex justify-between" style={{ padding: '4px 0' }}>
                    <span>{cat}</span>
                    <strong className="text-secondary">{formatMoney(total)}</strong>
                  </div>
                ))}
            </div>
          )}

          {/* Expense list */}
          {monthExpenses.length === 0 ? (
            <div className="card card--subtle text-center text-secondary">
              <p>Sin gastos de materia prima este mes</p>
            </div>
          ) : (
            monthExpenses.map(e => (
              <div key={e.id} className="card card--sm flex items-center justify-between">
                <div>
                  <strong>{e.category}</strong>
                  {e.description && <p className="text-xs text-secondary">{e.description}</p>}
                  <p className="text-xs text-secondary">
                    {new Date(e.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="flex items-center gap-sm">
                  <strong className="text-danger">{formatMoney(e.amount)}</strong>
                  <button
                    onClick={() => deleteExpense(e.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Add Expense Modal */}
          {showAddExpense && (
            <div className="overlay" onClick={() => setShowAddExpense(false)}>
              <div className="modal animate-scale" onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: 16, fontWeight: 800 }}>🧾 Gasto de Materia Prima</h3>
                <div className="flex-col gap-md">
                  <div>
                    <label>Categoría</label>
                    <select className="input select" value={eCat} onChange={e => setECat(e.target.value)}>
                      {MATERIAL_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Monto ($)</label>
                    <input className="input" type="number" placeholder="0" value={eAmount} onChange={e => setEAmount(e.target.value)} min="0" step="0.5" />
                  </div>
                  <div>
                    <label>Descripción (opcional)</label>
                    <input className="input" placeholder="Ej: 2kg harina Tres Estrellas" value={eDesc} onChange={e => setEDesc(e.target.value)} />
                  </div>
                  <div className="flex gap-sm">
                    <button className="btn btn--ghost btn--block" onClick={() => setShowAddExpense(false)}>Cancelar</button>
                    <button className="btn btn--orange btn--block" onClick={handleAddExpense} disabled={!eAmount || parseFloat(eAmount) <= 0}>Guardar</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
