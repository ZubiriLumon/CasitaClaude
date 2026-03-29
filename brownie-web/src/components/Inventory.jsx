import { useState } from 'react'
import useBrownieStore, { MATERIAL_CATEGORIES, FLAVOR_ICONS, FLAVOR_COLORS } from '../store/useStore'
import { playRestockSound, playExpenseSound, playDeleteSound } from '../services/sounds'
import { BoxDoodle, WavyUnderline, SparkleCluster } from './Doodles'

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

export default function Inventory() {
  const inventory = useBrownieStore(s => s.inventory)
  const expenses = useBrownieStore(s => s.expenses)
  const flavors = useBrownieStore(s => s.flavors)
  const restockFlavor = useBrownieStore(s => s.restockFlavor)
  const setStock = useBrownieStore(s => s.setStock)
  const addExpense = useBrownieStore(s => s.addExpense)
  const deleteExpense = useBrownieStore(s => s.deleteExpense)
  const addFlavor = useBrownieStore(s => s.addFlavor)
  const updateFlavor = useBrownieStore(s => s.updateFlavor)
  const deleteFlavor = useBrownieStore(s => s.deleteFlavor)

  const [tab, setTab] = useState('stock')
  const [showRestock, setShowRestock] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [rFlavor, setRFlavor] = useState('')
  const [rQty, setRQty] = useState('')

  // Edit stock
  const [editingFlavor, setEditingFlavor] = useState(null)
  const [editQty, setEditQty] = useState('')

  // Expense form
  const [eAmount, setEAmount] = useState('')
  const [eCat, setECat] = useState('Harina')
  const [eDesc, setEDesc] = useState('')

  // Flavor management
  const [showAddFlavor, setShowAddFlavor] = useState(false)
  const [showEditFlavor, setShowEditFlavor] = useState(null)
  const [fName, setFName] = useState('')
  const [fIcon, setFIcon] = useState('🍫')
  const [fColor, setFColor] = useState('#5D4037')
  const [confirmDeleteFlavor, setConfirmDeleteFlavor] = useState(null)

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
    if (qty > 0 && rFlavor) {
      restockFlavor(rFlavor, qty)
      playRestockSound()
      setRQty('')
      setRFlavor('')
      setShowRestock(false)
    }
  }

  function handleAddFlavor() {
    if (!fName.trim()) return
    addFlavor({ name: fName.trim(), icon: fIcon, color: fColor })
    playRestockSound()
    setFName(''); setFIcon('🍫'); setFColor('#5D4037')
    setShowAddFlavor(false)
  }

  function openEditFlavor(f) {
    setShowEditFlavor(f.id)
    setFName(f.name)
    setFIcon(f.icon)
    setFColor(f.color)
  }

  function handleUpdateFlavor() {
    if (!fName.trim() || !showEditFlavor) return
    updateFlavor(showEditFlavor, { name: fName.trim(), icon: fIcon, color: fColor })
    setFName(''); setFIcon('🍫'); setFColor('#5D4037')
    setShowEditFlavor(null)
  }

  function handleDeleteFlavor(id) {
    deleteFlavor(id)
    playDeleteSound()
    setConfirmDeleteFlavor(null)
  }

  function handleEditStock(flavorId) {
    setEditingFlavor(flavorId)
    setEditQty(String(inventory[flavorId] || 0))
  }

  function handleSaveStock() {
    const qty = parseInt(editQty)
    if (!isNaN(qty) && qty >= 0) {
      setStock(editingFlavor, qty)
      playRestockSound()
    }
    setEditingFlavor(null)
    setEditQty('')
  }

  function handleAddExpense() {
    const amount = parseFloat(eAmount)
    if (amount > 0) {
      addExpense({ amount, category: eCat, description: eDesc })
      playExpenseSound()
      setEAmount('')
      setEDesc('')
      setShowAddExpense(false)
    }
  }

  function handleDeleteExpense(id) {
    deleteExpense(id)
    playDeleteSound()
  }

  return (
    <div className="page flex-col gap-lg animate-in">
      <div className="section-header">
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Inventario</h1>
          <WavyUnderline width={130} color="#8B5E3C" />
        </div>
        <div className="doodle-float section-header__doodle">
          <BoxDoodle size={55} />
        </div>
      </div>

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
            <button className="btn btn--accent btn--sm" onClick={() => { setShowRestock(true); if (!rFlavor && flavors.length > 0) setRFlavor(flavors[0].id) }}>
              ➕ Resurtir
            </button>
          </div>

          {/* Per-flavor cards */}
          {flavors.map(f => {
            const stock = inventory[f.id] || 0
            const isLow = stock < 5
            const isEditing = editingFlavor === f.id
            return (
              <div key={f.id} className="card" style={{ borderColor: f.color }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-md">
                    <span style={{ fontSize: '2rem' }}>{f.icon}</span>
                    <div>
                      <strong>{f.name}</strong>
                      <p className="text-xs text-secondary">Costo: $8/ud</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm">
                    {isEditing ? (
                      <>
                        <input
                          className="input"
                          type="number"
                          value={editQty}
                          onChange={e => setEditQty(e.target.value)}
                          min="0"
                          style={{ width: 70, textAlign: 'center', padding: '6px', fontSize: '1.1rem', fontWeight: 800 }}
                          autoFocus
                          onKeyDown={e => e.key === 'Enter' && handleSaveStock()}
                        />
                        <button className="btn btn--success btn--sm" onClick={handleSaveStock} style={{ padding: '6px 10px' }}>✓</button>
                        <button className="btn btn--ghost btn--sm" onClick={() => setEditingFlavor(null)} style={{ padding: '6px 10px' }}>✕</button>
                      </>
                    ) : (
                      <>
                        <div className="text-center">
                          <strong className="text-xl" style={{ color: isLow ? 'var(--danger)' : 'var(--text)' }}>
                            {stock}
                          </strong>
                          {isLow && <span className="badge badge--danger" style={{ display: 'block', marginTop: 4 }}>¡Bajo!</span>}
                        </div>
                        <button
                          onClick={() => handleEditStock(f.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', padding: '4px' }}
                          title="Corregir stock"
                        >
                          ✏️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Flavor Management */}
          <div className="card card--subtle">
            <div className="flex items-center justify-between mb-md">
              <strong>Sabores</strong>
              <button className="btn btn--primary btn--sm" onClick={() => setShowAddFlavor(true)}>➕ Nuevo sabor</button>
            </div>
            {flavors.map(f => (
              <div key={f.id} className="flex items-center justify-between" style={{ padding: '6px 0', borderBottom: '1px solid #EFEBE9' }}>
                <div className="flex items-center gap-sm">
                  <span style={{ fontSize: '1.4rem' }}>{f.icon}</span>
                  <span style={{ fontWeight: 700 }}>{f.name}</span>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: f.color, display: 'inline-block', border: '1.5px solid #0002' }} />
                </div>
                <div className="flex items-center gap-sm">
                  <button onClick={() => openEditFlavor(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }} title="Editar sabor">✏️</button>
                  <button onClick={() => setConfirmDeleteFlavor(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }} title="Eliminar sabor">🗑️</button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Flavor Modal */}
          {showAddFlavor && (
            <div className="overlay" onClick={() => setShowAddFlavor(false)}>
              <div className="modal animate-scale" onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: 16, fontWeight: 800 }}>🍫 Nuevo Sabor</h3>
                <div className="flex-col gap-md">
                  <div>
                    <label>Nombre</label>
                    <input className="input" placeholder="Ej: Oreo de Vainilla" value={fName} onChange={e => setFName(e.target.value)} />
                  </div>
                  <div>
                    <label>Ícono</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {FLAVOR_ICONS.map(icon => (
                        <button
                          key={icon}
                          onClick={() => setFIcon(icon)}
                          style={{
                            fontSize: '1.4rem', padding: '4px 6px', borderRadius: 8, cursor: 'pointer',
                            border: fIcon === icon ? '2.5px solid var(--primary)' : '2px solid transparent',
                            background: fIcon === icon ? 'rgba(126,207,179,0.15)' : 'none',
                          }}
                        >{icon}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label>Color</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {FLAVOR_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setFColor(color)}
                          style={{
                            width: 28, height: 28, borderRadius: 8, cursor: 'pointer',
                            background: color,
                            border: fColor === color ? '3px solid var(--primary)' : '2px solid #0002',
                            boxShadow: fColor === color ? '0 0 0 2px var(--primary)' : 'none',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: 8, padding: 12, borderRadius: 12, border: `2.5px solid ${fColor}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.8rem' }}>{fIcon}</span>
                    <strong>{fName || 'Vista previa'}</strong>
                  </div>
                  <div className="flex gap-sm">
                    <button className="btn btn--ghost btn--block" onClick={() => { setShowAddFlavor(false); setFName(''); setFIcon('🍫'); setFColor('#5D4037') }}>Cancelar</button>
                    <button className="btn btn--primary btn--block" onClick={handleAddFlavor} disabled={!fName.trim()}>Crear Sabor</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Flavor Modal */}
          {showEditFlavor && (
            <div className="overlay" onClick={() => { setShowEditFlavor(null); setFName(''); setFIcon('🍫'); setFColor('#5D4037') }}>
              <div className="modal animate-scale" onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: 16, fontWeight: 800 }}>✏️ Editar Sabor</h3>
                <div className="flex-col gap-md">
                  <div>
                    <label>Nombre</label>
                    <input className="input" value={fName} onChange={e => setFName(e.target.value)} />
                  </div>
                  <div>
                    <label>Ícono</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {FLAVOR_ICONS.map(icon => (
                        <button
                          key={icon}
                          onClick={() => setFIcon(icon)}
                          style={{
                            fontSize: '1.4rem', padding: '4px 6px', borderRadius: 8, cursor: 'pointer',
                            border: fIcon === icon ? '2.5px solid var(--primary)' : '2px solid transparent',
                            background: fIcon === icon ? 'rgba(126,207,179,0.15)' : 'none',
                          }}
                        >{icon}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label>Color</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {FLAVOR_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setFColor(color)}
                          style={{
                            width: 28, height: 28, borderRadius: 8, cursor: 'pointer',
                            background: color,
                            border: fColor === color ? '3px solid var(--primary)' : '2px solid #0002',
                            boxShadow: fColor === color ? '0 0 0 2px var(--primary)' : 'none',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: 8, padding: 12, borderRadius: 12, border: `2.5px solid ${fColor}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.8rem' }}>{fIcon}</span>
                    <strong>{fName || 'Vista previa'}</strong>
                  </div>
                  <div className="flex gap-sm">
                    <button className="btn btn--ghost btn--block" onClick={() => { setShowEditFlavor(null); setFName(''); setFIcon('🍫'); setFColor('#5D4037') }}>Cancelar</button>
                    <button className="btn btn--primary btn--block" onClick={handleUpdateFlavor} disabled={!fName.trim()}>Guardar</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Flavor Confirmation */}
          {confirmDeleteFlavor && (
            <div className="overlay" onClick={() => setConfirmDeleteFlavor(null)}>
              <div className="modal text-center animate-scale" onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠️</div>
                <h3 style={{ fontWeight: 800, marginBottom: 8 }}>¿Eliminar este sabor?</h3>
                <p className="text-sm text-secondary" style={{ marginBottom: 16 }}>
                  Se eliminará el sabor, su stock y cualquier referencia en el carrito. Las ventas pasadas no se afectan.
                </p>
                <div className="flex gap-sm">
                  <button className="btn btn--ghost btn--block" onClick={() => setConfirmDeleteFlavor(null)}>Cancelar</button>
                  <button className="btn btn--danger btn--block" onClick={() => handleDeleteFlavor(confirmDeleteFlavor)}>Sí, eliminar</button>
                </div>
              </div>
            </div>
          )}

          {/* Restock Modal */}
          {showRestock && (
            <div className="overlay" onClick={() => setShowRestock(false)}>
              <div className="modal animate-scale" onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: 16, fontWeight: 800 }}>📦 Resurtir Stock</h3>
                <div className="flex-col gap-md">
                  <div>
                    <label>Sabor</label>
                    <select className="input select" value={rFlavor} onChange={e => setRFlavor(e.target.value)}>
                      {!rFlavor && <option value="">Selecciona sabor...</option>}
                      {flavors.map(f => (
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
                    onClick={() => handleDeleteExpense(e.id)}
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
