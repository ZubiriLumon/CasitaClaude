import { useState } from 'react'
import useBrownieStore, { PROMO_PRESETS } from '../store/useStore'
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
  const getBasketStats = useBrownieStore(s => s.getBasketStats)
  const basket = getBasketStats()

  const [showConfirm, setShowConfirm] = useState(false)
  const [lastTotal, setLastTotal] = useState(0)
  const [lastChange, setLastChange] = useState(null)

  // Change calculator
  const [paidWith, setPaidWith] = useState('')
  const [showChangeCalc, setShowChangeCalc] = useState(false)

  // Promo pricing
  const [promoActive, setPromoActive] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState(1)
  const [customPairPrice, setCustomPairPrice] = useState('')
  const [customSinglePrice, setCustomSinglePrice] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  let activePairPrice = 55
  let activeSinglePrice = 30
  if (promoActive) {
    if (useCustom) {
      activePairPrice = parseFloat(customPairPrice) || 55
      activeSinglePrice = parseFloat(customSinglePrice) || 30
    } else {
      activePairPrice = PROMO_PRESETS[selectedPreset].pairPrice
      activeSinglePrice = PROMO_PRESETS[selectedPreset].singlePrice
    }
  }

  const totals = getCartTotal(activePairPrice, activeSinglePrice)
  const isEmpty = totals.totalUnits === 0

  const paidAmount = parseFloat(paidWith) || 0
  const changeAmount = paidAmount - totals.totalPrice
  const canComplete = isEmpty ? false : (!showChangeCalc || paidAmount >= totals.totalPrice)

  function handleComplete() {
    setLastTotal(totals.totalPrice)
    setLastChange(showChangeCalc && paidAmount > totals.totalPrice ? changeAmount : null)
    completeSale(activePairPrice, activeSinglePrice)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Punto de Venta</h1>
          <WavyUnderline width={160} color="#7ECFB3" />
        </div>
        <button
          className={`btn btn--sm ${promoActive ? 'btn--orange' : 'btn--ghost'}`}
          onClick={() => setPromoActive(!promoActive)}
          style={{ whiteSpace: 'nowrap' }}
        >
          🔥 {promoActive ? 'Remate ON' : 'Remate'}
        </button>
      </div>

      {/* Basket progress — how many left to sell */}
      {basket.loaded > 0 && (
        <div className="card card--sm" style={{ borderColor: 'var(--accent)', padding: 12 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
            <span className="text-sm">🧺 Faltan <strong>{basket.remaining}</strong> por vender</span>
            <span className="text-xs text-secondary">{basket.sold}/{basket.loaded}</span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div
              className="progress-fill"
              style={{
                width: `${basket.pct}%`,
                background: basket.pct >= 100 ? 'var(--success)' : 'var(--accent)',
              }}
            />
          </div>
        </div>
      )}

      {/* Promo Config */}
      {promoActive && (
        <div className="card" style={{ borderColor: 'var(--accent-orange)', background: 'rgba(255,176,103,0.08)' }}>
          <div className="flex items-center gap-sm mb-md">
            <span>🔥</span>
            <strong style={{ color: '#E65100' }}>Modo Remate</strong>
          </div>
          <div className="flex gap-sm" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
            {PROMO_PRESETS.map((preset, i) => (
              <button
                key={i}
                className={`btn btn--sm ${!useCustom && selectedPreset === i ? 'btn--orange' : 'btn--ghost'}`}
                onClick={() => { setSelectedPreset(i); setUseCustom(false) }}
                style={{ flex: '1 0 auto', minWidth: 'fit-content' }}
              >
                {preset.label}
              </button>
            ))}
            <button
              className={`btn btn--sm ${useCustom ? 'btn--orange' : 'btn--ghost'}`}
              onClick={() => setUseCustom(true)}
              style={{ flex: '1 0 auto' }}
            >
              Otro
            </button>
          </div>
          {useCustom && (
            <div className="flex gap-sm mt-sm">
              <div style={{ flex: 1 }}>
                <label>Precio par ($)</label>
                <input className="input" type="number" placeholder="50" value={customPairPrice} onChange={e => setCustomPairPrice(e.target.value)} min="0" />
              </div>
              <div style={{ flex: 1 }}>
                <label>Individual ($)</label>
                <input className="input" type="number" placeholder="25" value={customSinglePrice} onChange={e => setCustomSinglePrice(e.target.value)} min="0" />
              </div>
            </div>
          )}
          <p className="text-xs text-secondary mt-sm">
            Vendiendo a: <strong>2×${activePairPrice}</strong> / individual <strong>${activeSinglePrice}</strong>
          </p>
        </div>
      )}

      {/* Flavor Selection */}
      <div className="flex-col gap-sm">
        {flavors.map(f => {
          const stock = inventory[f.id] || 0
          const inCart = cart[f.id] || 0
          return (
            <div key={f.id} className="card" style={{ borderColor: f.color, padding: '14px 16px' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-md">
                  <span style={{ fontSize: '2rem' }}>{f.icon}</span>
                  <div>
                    <strong>{f.name}</strong>
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
            {promoActive && <span className="badge badge--orange">🔥 Remate</span>}
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
              <span>{totals.pairs} par(es) × ${activePairPrice}</span>
              <strong>{formatMoney(totals.pairs * activePairPrice)}</strong>
            </div>
          )}
          {totals.singles > 0 && (
            <div className="flex justify-between text-sm" style={{ padding: '3px 0' }}>
              <span>{totals.singles} individual × ${activeSinglePrice}</span>
              <strong>{formatMoney(activeSinglePrice)}</strong>
            </div>
          )}
          {totals.discount > 0 && (
            <>
              <hr style={{ margin: '8px 0', borderColor: '#D7CCC8' }} />
              <div className="flex justify-between text-sm">
                <span>✨ Ahorro vs precio normal</span>
                <strong className="text-success">-{formatMoney(totals.discount)}</strong>
              </div>
            </>
          )}
          <hr style={{ margin: '8px 0', borderColor: '#D7CCC8' }} />
          <div className="flex justify-between">
            <span>Tu ganancia neta</span>
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
                <div className="card text-center" style={{ borderColor: changeAmount >= 0 ? 'var(--success)' : 'var(--danger)', background: changeAmount >= 0 ? 'rgba(46,125,50,0.06)' : 'rgba(211,47,47,0.06)', padding: '12px' }}>
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
              <WavyUnderline width={180} color="#7ECFB3" />
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
