import { useState } from 'react'
import useBrownieStore, { DEFAULT_COST_PER_UNIT, PRICE_PAIR } from '../store/useStore'
import { playRestockSound, playDeleteSound } from '../services/sounds'

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n)
}

// Margin is measured against what a brownie actually fetches in the deal —
// half the pair price — since nearly everything goes out in pairs. Flavors
// with their own fixed price are measured against that price instead.
const DEAL_UNIT_PRICE = PRICE_PAIR / 2

export default function Costs() {
  const flavors = useBrownieStore(s => s.flavors)
  const costEntries = useBrownieStore(s => s.costEntries)
  const addCostEntry = useBrownieStore(s => s.addCostEntry)
  const deleteCostEntry = useBrownieStore(s => s.deleteCostEntry)
  const getLatestCostEntries = useBrownieStore(s => s.getLatestCostEntries)

  const [showForm, setShowForm] = useState(false)
  const [mode, setMode] = useState('batch')
  const [cFlavor, setCFlavor] = useState('')
  const [cPerUnit, setCPerUnit] = useState('')
  const [cBatchSize, setCBatchSize] = useState('12')
  const [cBatchTotal, setCBatchTotal] = useState('')
  const [cNote, setCNote] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const latest = getLatestCostEntries()

  // Resolved cost per unit from whichever input mode is active
  const batchSize = parseInt(cBatchSize) || 0
  const batchTotal = parseFloat(cBatchTotal) || 0
  const resolvedCost = mode === 'batch'
    ? (batchSize > 0 ? batchTotal / batchSize : 0)
    : (parseFloat(cPerUnit) || 0)
  const canSave = cFlavor && resolvedCost > 0

  function openForm(flavorId) {
    setCFlavor(flavorId || (flavors[0]?.id ?? ''))
    setMode('batch')
    setCPerUnit('')
    setCBatchSize('12')
    setCBatchTotal('')
    setCNote('')
    setShowForm(true)
  }

  function handleSave() {
    if (!canSave) return
    addCostEntry({
      flavorId: cFlavor,
      costPerUnit: Math.round(resolvedCost * 100) / 100,
      batchSize: mode === 'batch' ? batchSize : null,
      batchTotal: mode === 'batch' ? batchTotal : null,
      note: cNote,
    })
    playRestockSound()
    setShowForm(false)
  }

  function handleDelete(id) {
    deleteCostEntry(id)
    playDeleteSound()
    setConfirmDelete(null)
  }

  const avgCost = latest.length > 0
    ? latest.reduce((s, l) => s + l.costPerUnit, 0) / latest.length
    : DEFAULT_COST_PER_UNIT

  return (
    <>
      {/* Intro */}
      <div className="card card--accent">
        <div className="flex items-center justify-between mb-md">
          <div className="flex items-center gap-sm">
            <span style={{ fontSize: '1.4rem' }}>👩‍🍳</span>
            <div>
              <strong>Costos de Producción</strong>
              <p className="text-xs text-secondary">Lo que le costó a Perla hacer cada brownie</p>
            </div>
          </div>
          <div className="text-center">
            <strong className="text-lg">{formatMoney(avgCost)}</strong>
            <p className="text-xs text-secondary">promedio</p>
          </div>
        </div>
        <button className="btn btn--accent btn--sm btn--block" onClick={() => openForm(null)}>
          ➕ Registrar costo
        </button>
      </div>

      {/* Current cost per flavor */}
      {latest.map(({ flavor, entry, costPerUnit }) => {
        const refPrice = flavor.fixedPrice > 0 ? flavor.fixedPrice : DEAL_UNIT_PRICE
        const margin = refPrice - costPerUnit
        const marginPct = Math.round((margin / refPrice) * 100)
        return (
          <div key={flavor.id} className="card" style={{ borderColor: flavor.color }}>
            <div className="flex items-center justify-between mb-md">
              <div className="flex items-center gap-md">
                <span style={{ fontSize: '1.8rem' }}>{flavor.icon}</span>
                <div>
                  <strong>{flavor.name}</strong>
                  <p className="text-xs text-secondary">
                    {entry
                      ? `Actualizado ${new Date(entry.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`
                      : 'Sin registro · usando estimado'}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <strong className="text-xl">{formatMoney(costPerUnit)}</strong>
                <p className="text-xs text-secondary">por brownie</p>
              </div>
            </div>

            {entry?.batchSize && (
              <p className="text-xs text-secondary" style={{ marginBottom: 8 }}>
                Último lote: {entry.batchSize} brownies por {formatMoney(entry.batchTotal)}
                {entry.note && ` · ${entry.note}`}
              </p>
            )}

            <div
              className="flex items-center justify-between"
              style={{
                padding: '8px 10px', borderRadius: 10,
                background: margin > 0 ? 'rgba(30,142,90,0.08)' : 'rgba(214,69,69,0.08)',
              }}
            >
              <span className="text-xs text-secondary">
                Ganas por brownie {flavor.fixedPrice > 0 ? `(a $${flavor.fixedPrice} c/u)` : `(a 2×$${PRICE_PAIR})`}
              </span>
              <strong className="text-sm" style={{ color: margin > 0 ? 'var(--success)' : 'var(--danger)' }}>
                {formatMoney(margin)} · {marginPct}%
              </strong>
            </div>

            <button
              className="btn btn--ghost btn--sm btn--block"
              onClick={() => openForm(flavor.id)}
              style={{ marginTop: 10 }}
            >
              Actualizar costo
            </button>
          </div>
        )
      })}

      {/* History */}
      {costEntries.length > 0 && (
        <div className="card card--subtle">
          <strong className="mb-md" style={{ display: 'block' }}>Historial</strong>
          {costEntries.slice(0, 20).map(c => {
            const f = flavors.find(fl => fl.id === c.flavorId)
            return (
              <div
                key={c.id}
                className="flex items-center justify-between"
                style={{ padding: '8px 0', borderBottom: '1px solid #E3EDF5' }}
              >
                <div>
                  <span className="text-sm">
                    {f?.icon || '🍫'} <strong>{f?.name || 'Sabor eliminado'}</strong>
                  </span>
                  <p className="text-xs text-secondary">
                    {new Date(c.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    {c.batchSize ? ` · ${c.batchSize} uds por ${formatMoney(c.batchTotal)}` : ''}
                    {c.note ? ` · ${c.note}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-sm">
                  <strong className="text-sm">{formatMoney(c.costPerUnit)}</strong>
                  <button
                    onClick={() => setConfirmDelete(c.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                    title="Eliminar registro"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Cost form */}
      {showForm && (
        <div className="overlay" onClick={() => setShowForm(false)}>
          <div className="modal animate-scale" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 4, fontWeight: 800 }}>👩‍🍳 Registrar Costo</h3>
            <p className="text-xs text-secondary" style={{ marginBottom: 16 }}>
              ¿Cuánto costó hacer este sabor esta vez?
            </p>

            <div className="flex-col gap-md">
              <div>
                <label>Sabor</label>
                <select className="input select" value={cFlavor} onChange={e => setCFlavor(e.target.value)}>
                  {flavors.map(f => (
                    <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
                  ))}
                </select>
              </div>

              {/* Input mode */}
              <div className="flex gap-sm">
                <button
                  className={`btn btn--sm btn--block ${mode === 'batch' ? 'btn--primary' : 'btn--ghost'}`}
                  onClick={() => setMode('batch')}
                >
                  Por lote
                </button>
                <button
                  className={`btn btn--sm btn--block ${mode === 'unit' ? 'btn--primary' : 'btn--ghost'}`}
                  onClick={() => setMode('unit')}
                >
                  Por brownie
                </button>
              </div>

              {mode === 'batch' ? (
                <>
                  <div>
                    <label>¿Cuántos brownies salieron?</label>
                    <div className="flex gap-sm" style={{ marginBottom: 8, flexWrap: 'wrap' }}>
                      {[12, 24, 36, 48].map(n => (
                        <button
                          key={n}
                          onClick={() => setCBatchSize(String(n))}
                          className={`btn btn--sm ${parseInt(cBatchSize) === n ? 'btn--accent' : 'btn--ghost'}`}
                          style={{ padding: '4px 12px' }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <input
                      className="input" type="number" min="1" placeholder="12"
                      value={cBatchSize} onChange={e => setCBatchSize(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>¿Cuánto gastaste en total? ($)</label>
                    <input
                      className="input" type="number" min="0" step="0.5" placeholder="0"
                      value={cBatchTotal} onChange={e => setCBatchTotal(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label>Costo por brownie ($)</label>
                  <input
                    className="input" type="number" min="0" step="0.5" placeholder="8.00"
                    value={cPerUnit} onChange={e => setCPerUnit(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label>Nota (opcional)</label>
                <input
                  className="input" placeholder="Ej: subió el chocolate"
                  value={cNote} onChange={e => setCNote(e.target.value)}
                />
              </div>

              {/* Live preview */}
              <div
                style={{
                  padding: 12, borderRadius: 12, background: '#fff',
                  border: `2.5px solid ${resolvedCost > 0 ? 'var(--accent)' : '#C9DCEA'}`,
                }}
              >
                <div className="flex justify-between">
                  <span className="text-sm">Costo por brownie</span>
                  <strong className="text-lg">{resolvedCost > 0 ? formatMoney(resolvedCost) : '—'}</strong>
                </div>
                {resolvedCost > 0 && (
                  <div className="flex justify-between" style={{ marginTop: 4 }}>
                    <span className="text-xs text-secondary">Ganancia a 2×${PRICE_PAIR}</span>
                    <strong
                      className="text-sm"
                      style={{ color: DEAL_UNIT_PRICE - resolvedCost > 0 ? 'var(--success)' : 'var(--danger)' }}
                    >
                      {formatMoney(DEAL_UNIT_PRICE - resolvedCost)} por brownie
                    </strong>
                  </div>
                )}
              </div>

              <div className="flex gap-sm">
                <button className="btn btn--ghost btn--block" onClick={() => setShowForm(false)}>Cancelar</button>
                <button className="btn btn--accent btn--block" onClick={handleSave} disabled={!canSave}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal text-center animate-scale" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontWeight: 800, marginBottom: 8 }}>¿Eliminar este registro?</h3>
            <p className="text-sm text-secondary" style={{ marginBottom: 16 }}>
              Se volverá a usar el costo anterior de ese sabor. Las ventas ya hechas no cambian.
            </p>
            <div className="flex gap-sm">
              <button className="btn btn--ghost btn--block" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn--danger btn--block" onClick={() => handleDelete(confirmDelete)}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
