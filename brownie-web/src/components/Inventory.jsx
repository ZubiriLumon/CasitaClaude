import { useState } from 'react'
import useBrownieStore, { MATERIAL_CATEGORIES, FLAVOR_ICONS, FLAVOR_COLORS, TRAY_PRESETS } from '../store/useStore'
import { playRestockSound, playExpenseSound, playDeleteSound } from '../services/sounds'
import { BoxDoodle, WavyUnderline, SparkleCluster } from './Doodles'
import Costs from './Costs'
import { IconBasket, IconBox, IconChefHat, IconReceipt, IconPlus, IconRefresh, IconPencil, IconTrash, IconAlert } from './Icons'

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
  const basket = useBrownieStore(s => s.basket)
  const setBasketConfig = useBrownieStore(s => s.setBasketConfig)
  const loadBasket = useBrownieStore(s => s.loadBasket)
  const resetBasket = useBrownieStore(s => s.resetBasket)
  const getBasketStats = useBrownieStore(s => s.getBasketStats)
  const getCostMap = useBrownieStore(s => s.getCostMap)
  const costMap = getCostMap()

  const [tab, setTab] = useState('stock')
  const [showRestock, setShowRestock] = useState(false)

  // Basket loading
  const [showLoadBasket, setShowLoadBasket] = useState(false)
  const [loadout, setLoadout] = useState({})
  const [loadMode, setLoadMode] = useState('replace')
  const [confirmResetBasket, setConfirmResetBasket] = useState(false)
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
  const stats = getBasketStats()
  const loadoutTotal = flavors.reduce((s, f) => s + (loadout[f.id] || 0), 0)

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

  function openLoadBasket() {
    // Pre-fill one full tray per flavor — that's how we bake: one flavor per tray.
    const preset = {}
    flavors.forEach(f => { preset[f.id] = basket.perTray })
    setLoadout(preset)
    setLoadMode('replace')
    setShowLoadBasket(true)
  }

  function setLoadQty(flavorId, qty) {
    setLoadout(prev => ({ ...prev, [flavorId]: Math.max(0, qty) }))
  }

  function fillAllTrays(qty) {
    const preset = {}
    flavors.forEach(f => { preset[f.id] = qty })
    setLoadout(preset)
  }

  function handleLoadBasket() {
    if (loadoutTotal === 0 && loadMode === 'add') return
    loadBasket(loadout, loadMode)
    playRestockSound()
    setShowLoadBasket(false)
  }

  function handleResetBasket() {
    resetBasket()
    playDeleteSound()
    setConfirmResetBasket(false)
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
          style={{ flex: 1, padding: '6px 8px' }}
        >
          <IconBox size={16} /> Stock
        </button>
        <button
          className={`btn btn--sm ${tab === 'costs' ? 'btn--primary' : 'btn--ghost'}`}
          onClick={() => setTab('costs')}
          style={{ flex: 1, padding: '6px 8px' }}
        >
          <IconChefHat size={16} /> Costos
        </button>
        <button
          className={`btn btn--sm ${tab === 'expenses' ? 'btn--primary' : 'btn--ghost'}`}
          onClick={() => setTab('expenses')}
          style={{ flex: 1, padding: '6px 8px' }}
        >
          <IconReceipt size={16} /> Gastos
        </button>
      </div>

      {tab === 'costs' ? (
        <Costs />
      ) : tab === 'stock' ? (
        <>
          {/* Basket progress */}
          <div className="card card--accent">
            <div className="flex items-center justify-between mb-md">
              <div className="flex items-center gap-sm">
                <span style={{ color: 'var(--primary)', display: 'flex' }}><IconBasket size={24} /></span>
                <div>
                  <strong className="font-display" style={{ fontSize: '1.05rem' }}>Canasta de Hoy</strong>
                  <p className="text-xs text-secondary">
                    {basket.trays} charolas × {basket.perTray} = {stats.target} brownies
                  </p>
                </div>
              </div>
              <div className="text-center">
                <strong className="text-xl">{totalStock}</strong>
                <p className="text-xs text-secondary">en canasta</p>
              </div>
            </div>

            {stats.loaded > 0 ? (
              <>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${stats.pct}%`,
                      background: stats.pct >= 100 ? 'var(--success)' : 'var(--accent)',
                    }}
                  />
                </div>
                <div className="flex justify-between" style={{ marginTop: 8 }}>
                  <span className="text-sm">
                    Vendidos <strong>{stats.sold}</strong> de <strong>{stats.loaded}</strong>
                  </span>
                  <span className="text-sm" style={{ fontWeight: 800, color: stats.remaining === 0 ? 'var(--success)' : 'var(--secondary)' }}>
                    {stats.remaining === 0 ? '¡Todo vendido!' : `Faltan ${stats.remaining}`}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-secondary text-center" style={{ padding: '8px 0' }}>
                Carga la canasta para empezar a llevar la cuenta
              </p>
            )}

            <div className="flex gap-sm" style={{ marginTop: 12 }}>
              <button className="btn btn--accent btn--sm btn--block" onClick={openLoadBasket}>
                <IconBasket size={16} /> Cargar canasta
              </button>
              <button
                className="btn btn--ghost btn--sm btn--block"
                onClick={() => { setShowRestock(true); if (!rFlavor && flavors.length > 0) setRFlavor(flavors[0].id) }}
              >
                <IconPlus size={16} /> Resurtir uno
              </button>
            </div>
            {stats.loaded > 0 && (
              <button
                className="btn btn--ghost btn--sm btn--block"
                onClick={() => setConfirmResetBasket(true)}
                style={{ marginTop: 8 }}
              >
                <IconRefresh size={16} /> Terminar salida
              </button>
            )}
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
                      <p className="text-xs text-secondary">Costo: ${costMap[f.id]?.toFixed(2) ?? '8.00'}/ud</p>
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
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-secondary)', display: 'flex' }}
                          title="Corregir stock"
                        >
                          <IconPencil size={17} />
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
              <button className="btn btn--primary btn--sm" onClick={() => setShowAddFlavor(true)}><IconPlus size={15} /> Nuevo sabor</button>
            </div>
            {flavors.map(f => (
              <div key={f.id} className="flex items-center justify-between" style={{ padding: '6px 0', borderBottom: '1px solid #EFEBE9' }}>
                <div className="flex items-center gap-sm">
                  <span style={{ fontSize: '1.4rem' }}>{f.icon}</span>
                  <span style={{ fontWeight: 700 }}>{f.name}</span>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: f.color, display: 'inline-block', border: '1.5px solid #0002' }} />
                </div>
                <div className="flex items-center gap-sm">
                  <button onClick={() => openEditFlavor(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }} title="Editar sabor"><IconPencil size={16} /></button>
                  <button onClick={() => setConfirmDeleteFlavor(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }} title="Eliminar sabor"><IconTrash size={16} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Flavor Modal */}
          {showAddFlavor && (
            <div className="overlay" onClick={() => setShowAddFlavor(false)}>
              <div className="modal animate-scale" onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: 16, fontWeight: 800 }}>Nuevo Sabor</h3>
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
                <h3 style={{ marginBottom: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}><IconPencil size={20} /> Editar Sabor</h3>
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
                <div style={{ color: 'var(--danger)', display: 'flex', justifyContent: 'center', marginBottom: 12 }}><IconAlert size={42} /></div>
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

          {/* Load Basket Modal */}
          {showLoadBasket && (
            <div className="overlay" onClick={() => setShowLoadBasket(false)}>
              <div className="modal animate-scale" onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: 4, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}><IconBasket size={22} /> Cargar Canasta</h3>
                <p className="text-xs text-secondary" style={{ marginBottom: 16 }}>
                  Una charola = un sabor. Ya viene prellenado con {basket.perTray} de cada uno.
                </p>

                {/* Tray config */}
                <div className="card card--subtle card--sm" style={{ marginBottom: 12 }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Charolas</span>
                    <div className="flex items-center gap-sm">
                      <button className="btn btn--ghost btn--sm" style={{ padding: '2px 10px' }}
                        onClick={() => setBasketConfig({ trays: basket.trays - 1 })}>−</button>
                      <strong style={{ minWidth: 24, textAlign: 'center' }}>{basket.trays}</strong>
                      <button className="btn btn--ghost btn--sm" style={{ padding: '2px 10px' }}
                        onClick={() => setBasketConfig({ trays: basket.trays + 1 })}>+</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
                    <span className="text-sm">Brownies por charola</span>
                    <div className="flex items-center gap-sm">
                      <button className="btn btn--ghost btn--sm" style={{ padding: '2px 10px' }}
                        onClick={() => setBasketConfig({ perTray: basket.perTray - 1 })}>−</button>
                      <strong style={{ minWidth: 24, textAlign: 'center' }}>{basket.perTray}</strong>
                      <button className="btn btn--ghost btn--sm" style={{ padding: '2px 10px' }}
                        onClick={() => setBasketConfig({ perTray: basket.perTray + 1 })}>+</button>
                    </div>
                  </div>
                </div>

                {/* Quick fills */}
                <div className="flex gap-sm" style={{ marginBottom: 12, flexWrap: 'wrap' }}>
                  <button className="btn btn--accent btn--sm" onClick={() => fillAllTrays(basket.perTray)}>
                    1 charola c/u
                  </button>
                  <button className="btn btn--ghost btn--sm" onClick={() => fillAllTrays(Math.floor(basket.perTray / 2))}>
                    ½ charola c/u
                  </button>
                  <button className="btn btn--ghost btn--sm" onClick={() => fillAllTrays(0)}>
                    Vaciar
                  </button>
                </div>

                {/* Per-flavor steppers */}
                <div className="flex-col gap-sm" style={{ maxHeight: '40vh', overflowY: 'auto', marginBottom: 12 }}>
                  {flavors.map(f => {
                    const qty = loadout[f.id] || 0
                    return (
                      <div key={f.id} className="card card--sm" style={{ borderColor: f.color, padding: 10 }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-sm">
                            <span style={{ fontSize: '1.4rem' }}>{f.icon}</span>
                            <div>
                              <strong className="text-sm">{f.name}</strong>
                              <p className="text-xs text-secondary">
                                {qty === 0 ? 'sin charola' : `${(qty / basket.perTray).toFixed(qty % basket.perTray === 0 ? 0 : 1)} charola${qty > basket.perTray ? 's' : ''}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-sm">
                            <button className="btn btn--ghost btn--sm" style={{ padding: '4px 10px' }}
                              onClick={() => setLoadQty(f.id, qty - 1)}>−</button>
                            <input
                              className="input"
                              type="number"
                              value={qty}
                              onChange={e => setLoadQty(f.id, parseInt(e.target.value) || 0)}
                              min="0"
                              style={{ width: 56, textAlign: 'center', padding: 4, fontSize: '1rem', fontWeight: 800 }}
                            />
                            <button className="btn btn--ghost btn--sm" style={{ padding: '4px 10px' }}
                              onClick={() => setLoadQty(f.id, qty + 1)}>+</button>
                          </div>
                        </div>
                        <div className="flex gap-sm" style={{ marginTop: 6, flexWrap: 'wrap' }}>
                          {TRAY_PRESETS.map(p => (
                            <button
                              key={p}
                              onClick={() => setLoadQty(f.id, p)}
                              className={`btn btn--sm ${qty === p ? 'btn--accent' : 'btn--ghost'}`}
                              style={{ padding: '2px 10px', fontSize: '0.72rem' }}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Total vs target */}
                <div
                  className="flex items-center justify-between"
                  style={{
                    padding: 10, borderRadius: 12, marginBottom: 12,
                    border: `2.5px solid ${loadoutTotal === stats.target ? 'var(--success)' : 'var(--accent-orange)'}`,
                    background: '#fff',
                  }}
                >
                  <span className="text-sm">Total a cargar</span>
                  <strong className="text-lg" style={{ color: loadoutTotal === stats.target ? 'var(--success)' : 'var(--text)' }}>
                    {loadoutTotal} / {stats.target}
                  </strong>
                </div>

                {/* Mode */}
                <div className="flex gap-sm" style={{ marginBottom: 12 }}>
                  <button
                    className={`btn btn--sm btn--block ${loadMode === 'replace' ? 'btn--primary' : 'btn--ghost'}`}
                    onClick={() => setLoadMode('replace')}
                  >
                    Nueva salida
                  </button>
                  <button
                    className={`btn btn--sm btn--block ${loadMode === 'add' ? 'btn--primary' : 'btn--ghost'}`}
                    onClick={() => setLoadMode('add')}
                  >
                    Sumar al stock
                  </button>
                </div>
                <p className="text-xs text-secondary" style={{ marginBottom: 12 }}>
                  {loadMode === 'replace'
                    ? 'Reemplaza el stock actual y reinicia el contador de la canasta.'
                    : 'Suma estas cantidades a lo que ya traes, sin reiniciar el contador.'}
                </p>

                <div className="flex gap-sm">
                  <button className="btn btn--ghost btn--block" onClick={() => setShowLoadBasket(false)}>Cancelar</button>
                  <button
                    className="btn btn--accent btn--block"
                    onClick={handleLoadBasket}
                    disabled={loadMode === 'add' && loadoutTotal === 0}
                  >
                    Cargar {loadoutTotal}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reset Basket Confirmation */}
          {confirmResetBasket && (
            <div className="overlay" onClick={() => setConfirmResetBasket(false)}>
              <div className="modal text-center animate-scale" onClick={e => e.stopPropagation()}>
                <div style={{ color: 'var(--primary)', display: 'flex', justifyContent: 'center', marginBottom: 12 }}><IconBasket size={42} /></div>
                <h3 style={{ fontWeight: 800, marginBottom: 8 }}>¿Terminar la salida?</h3>
                <p className="text-sm text-secondary" style={{ marginBottom: 16 }}>
                  Se reinicia el contador de la canasta. El stock que sobró y tus ventas no se tocan.
                </p>
                <div className="flex gap-sm">
                  <button className="btn btn--ghost btn--block" onClick={() => setConfirmResetBasket(false)}>Cancelar</button>
                  <button className="btn btn--primary btn--block" onClick={handleResetBasket}>Sí, terminar</button>
                </div>
              </div>
            </div>
          )}

          {/* Restock Modal */}
          {showRestock && (
            <div className="overlay" onClick={() => setShowRestock(false)}>
              <div className="modal animate-scale" onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}><IconBox size={20} /> Resurtir Stock</h3>
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
                    <div className="flex gap-sm" style={{ marginBottom: 8, flexWrap: 'wrap' }}>
                      {TRAY_PRESETS.map(p => (
                        <button
                          key={p}
                          onClick={() => setRQty(String(p))}
                          className={`btn btn--sm ${parseInt(rQty) === p ? 'btn--accent' : 'btn--ghost'}`}
                          style={{ padding: '4px 12px' }}
                        >
                          {p === basket.perTray ? `${p} (1 charola)` : p}
                        </button>
                      ))}
                    </div>
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
              <IconPlus size={16} /> Agregar
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
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                    title="Eliminar"
                  >
                    <IconTrash size={17} />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Add Expense Modal */}
          {showAddExpense && (
            <div className="overlay" onClick={() => setShowAddExpense(false)}>
              <div className="modal animate-scale" onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}><IconReceipt size={20} /> Gasto de Materia Prima</h3>
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
