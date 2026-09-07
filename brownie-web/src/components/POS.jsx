import { useState } from 'react'
import useBrownieStore, { PRICE_PAIR, PRICE_SINGLE } from '../store/useStore'
import { playCashSound, playAddSound, playRemoveSound } from '../services/sounds'
import { CelebrationDoodle, EmptyCartDoodle, SparkleCluster, WavyUnderline } from './Doodles'

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

export default function POS() {
  const inventory = useBrownieStore(s => s.inventory)
  const cart = useBrownieStore(s => s.cart)
  const addToCart = useBrownieStore(s => s.addToCart)
  const removeFromCart = useBrownieStore(s => s.removeFromCart)
  const clearCart = useBrownieStore(s => s.clearCart)
  const completeSale = useBrownieStore(s => s.completeSale)
  const getCartTotal = useBrownieStore(s => s.getCartTotal)
  const flavors = useBrownieStore(s => s.flavors)

  const [showConfirm, setShowConfirm] = useState(false)
  const [lastTotal, setLastTotal] = useState(0)
  const [lastChange, setLastChange] = useState(null)

  // Change calculator
  const [paidWith, setPaidWith] = useState('')
  const [showChangeCalc, setShowChangeCalc] = useState(false)

  const totals = getCartTotal()
  const isEmpty = totals.totalUnits === 0

  const paidAmount = parseFloat(paidWith) || 0
  const changeAmount = paidAmount - totals.totalPrice
  const canComplete = isEmpty ? false : (!showChangeCalc || paidAmount >= totals.totalPrice)

  function handleComplete() {
    setLastTotal(totals.totalPrice)
    setLastChange(showChangeCalc && paidAmount > totals.totalPrice ? changeAmount : null)
    completeSale()
    playCashSound()
    setShowConfirm(true)
    setPaidWith('')
  }

  function handleAdd(flavorId) {
    addToCart(flavorId)
    playAddSound()
  }

  function handleRemove(flavorId) {
    removeFromCart(flavorId)
    playRemoveSound()
  }

  return (
    <div className="page flex-col gap-lg animate-in">
      <div>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Punto de Venta</h1>
        <WavyUnderline width={160} color="#FF8C42" />
      </div>

      {/* Price reminder */}
      <div className="card card--accent" style={{ padding: '10px 14px' }}>
        <div className="flex items-center justify-between text-sm">
          <span>🏷️ <strong>2 × ${PRICE_PAIR}</strong> · 1 × ${PRICE_SINGLE}</span>
          <span className="text-xs text-secondary">Cheesecake precio fijo</span>
        </div>
      </div>

      {/* Flavor Selection */}
      <div className="flex-col gap-sm">
        {flavors.map(f => {
          const stock = inventory[f.id] || 0
          const inCart = cart[f.id] || 0
          const isFixed = f.fixedPrice != null && f.fixedPrice > 0
          return (
            <div key={f.id} className="card" style={{ borderColor: f.color, padding: '14px 16px' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-md">
                  <span style={{ fontSize: '2rem' }}>{f.icon}</span>
                  <div>
                    <div className="flex items-center gap-sm">
                      <strong>{f.name}</strong>
                      {isFixed && <span className="badge badge--orange">${f.fixedPrice} c/u</span>}
                    </div>
                    <p className="text-xs" style={{ color: stock < 5 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                      Stock: {stock}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-md">
                  <button className="btn btn--ghost btn--sm" onClick={() => handleRemove(f.id)} disabled={inCart === 0} style={{ padding: '6px 12px', fontSize: '1.1rem', fontWeight: 900 }}>−</button>
                  <strong className="text-xl" style={{ minWidth: 28, textAlign: 'center' }}>{inCart}</strong>
                  <button className="btn btn--primary btn--sm" onClick={() => handleAdd(f.id)} disabled={stock <= inCart} style={{ padding: '6px 12px', fontSize: '1.1rem', fontWeight: 900 }}>+</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Cart Summary */}
      <div className="card" style={{ position: 'relative', overflow: 'visible' }}>
        {!isEmpty && (
          <div className="doodle-corner doodle-corner--tr doodle-sparkle" style={{ top: -12, right: -8 }}>
            <SparkleCluster size={30} />
          </div>
        )}
        <div className="flex items-center justify-between mb-md">
          <div className="flex items-center gap-sm">
            <span style={{ fontSize: '1.3rem' }}>🛒</span>
            <strong>Carrito</strong>
          </div>
          {!isEmpty && (
            <button className="text-danger text-sm font-bold" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={clearCart}>Vaciar</button>
          )}
        </div>
        {isEmpty ? (
          <div className="empty-state" style={{ padding: '12px 0' }}>
            <EmptyCartDoodle size={90} />
            <p className="text-secondary text-sm">Agrega brownies para empezar</p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span>{totals.totalUnits} brownies</span>
            <strong className="text-2xl text-primary">{formatMoney(totals.totalPrice)}</strong>
          </div>
        )}
      </div>

      {/* Pricing Breakdown */}
      {!isEmpty && (
        <div className="card card--accent">
          <div className="flex items-center gap-sm mb-md">
            <span>🏷️</span>
            <strong>Desglose de Precio</strong>
          </div>

          {totals.pairs > 0 && (
            <div className="flex justify-between text-sm" style={{ padding: '3px 0' }}>
              <span>{totals.pairs} par(es) × ${PRICE_PAIR}</span>
              <strong>{formatMoney(totals.pairs * PRICE_PAIR)}</strong>
            </div>
          )}
          {totals.singles > 0 && (
            <div className="flex justify-between text-sm" style={{ padding: '3px 0' }}>
              <span>{totals.singles} individual × ${PRICE_SINGLE}</span>
              <strong>{formatMoney(totals.singles * PRICE_SINGLE)}</strong>
            </div>
          )}

          {/* Fixed-price flavors are charged apart from the deal */}
          {totals.fixedLines.map(line => (
            <div key={line.flavorId} className="flex justify-between text-sm" style={{ padding: '3px 0' }}>
              <span>{line.icon} {line.qty} × ${line.unitPrice} <span className="text-xs text-secondary">(sin promo)</span></span>
              <strong>{formatMoney(line.total)}</strong>
            </div>
          ))}

          {totals.discount > 0 && (
            <>
              <hr style={{ margin: '8px 0', borderColor: '#C9DCEA' }} />
              <div className="flex justify-between text-sm">
                <span>✨ Ahorro por la promo</span>
                <strong className="text-success">-{formatMoney(totals.discount)}</strong>
              </div>
            </>
          )}

          <hr style={{ margin: '8px 0', borderColor: '#C9DCEA' }} />
          <div className="flex justify-between">
            <span>Tu ganancia</span>
            <strong className="text-lg text-success">{formatMoney(totals.profit)}</strong>
          </div>
        </div>
      )}

      {/* Change Calculator */}
      {!isEmpty && (
        <div className="card card--subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <span>💵</span>
              <strong className="text-sm">Calcular cambio</strong>
            </div>
            <button onClick={() => { setShowChangeCalc(!showChangeCalc); setPaidWith('') }} className="text-sm font-bold" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
              {showChangeCalc ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {showChangeCalc && (
            <div className="mt-sm flex-col gap-sm">
              <div>
                <label>El cliente paga con:</label>
                <input className="input" type="number" placeholder="$0" value={paidWith} onChange={e => setPaidWith(e.target.value)} min="0" style={{ fontSize: '1.2rem', fontWeight: 800, textAlign: 'center' }} />
              </div>
              {paidAmount > 0 && (
                <div className="card text-center" style={{ borderColor: changeAmount >= 0 ? 'var(--success)' : 'var(--danger)', background: changeAmount >= 0 ? 'rgba(30,142,90,0.06)' : 'rgba(214,69,69,0.06)', padding: '12px' }}>
                  {changeAmount >= 0 ? (
                    <>
                      <p className="text-sm text-secondary">Cambio a entregar:</p>
                      <strong className="text-2xl text-success">{formatMoney(changeAmount)}</strong>
                    </>
                  ) : (
                    <p className="text-sm text-danger font-bold">Faltan {formatMoney(Math.abs(changeAmount))}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Complete Button */}
      {!isEmpty && (
        <button className="btn btn--primary btn--block" style={{ padding: '14px', fontSize: '1.1rem' }} onClick={handleComplete} disabled={!canComplete}>
          ✅ Cobrar {formatMoney(totals.totalPrice)}
        </button>
      )}

      {/* Confirmation Overlay */}
      {showConfirm && (
        <div className="overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal text-center animate-scale" onClick={e => e.stopPropagation()} style={{ position: 'relative', overflow: 'visible' }}>
            <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)' }}>
              <CelebrationDoodle size={90} />
            </div>
            <div style={{ marginTop: 40 }}>
              <h2 style={{ fontWeight: 900, marginBottom: 8 }}>¡Venta Registrada!</h2>
              <WavyUnderline width={180} color="#FF8C42" />
            </div>
            <p className="text-2xl font-black text-primary" style={{ margin: '12px 0 8px' }}>{formatMoney(lastTotal)}</p>
            {lastChange !== null && (
              <div style={{ marginBottom: 16 }}>
                <p className="text-sm text-secondary">Cambio:</p>
                <strong className="text-xl text-success">{formatMoney(lastChange)}</strong>
              </div>
            )}
            <button className="btn btn--accent btn--block" onClick={() => setShowConfirm(false)} style={{ marginTop: lastChange === null ? 16 : 0 }}>Continuar</button>
          </div>
        </div>
      )}
    </div>
  )
}
