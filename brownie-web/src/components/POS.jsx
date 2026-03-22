import { useState } from 'react'
import useBrownieStore, { FLAVORS } from '../store/useStore'

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

  const [showConfirm, setShowConfirm] = useState(false)
  const [lastTotal, setLastTotal] = useState(0)

  const totals = getCartTotal()
  const isEmpty = totals.totalUnits === 0

  function handleComplete() {
    setLastTotal(totals.totalPrice)
    completeSale()
    setShowConfirm(true)
  }

  return (
    <div className="page flex-col gap-lg animate-in">
      <h1 className="page-title">Punto de Venta</h1>

      {/* Flavor Selection */}
      <div className="flex-col gap-sm">
        {FLAVORS.map(f => {
          const stock = inventory[f.id] || 0
          const inCart = cart[f.id] || 0
          return (
            <div
              key={f.id}
              className="card"
              style={{ borderColor: f.color, padding: '14px 16px' }}
            >
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
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => removeFromCart(f.id)}
                    disabled={inCart === 0}
                    style={{ padding: '6px 12px', fontSize: '1.1rem', fontWeight: 900 }}
                  >
                    −
                  </button>
                  <strong className="text-xl" style={{ minWidth: 28, textAlign: 'center' }}>{inCart}</strong>
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => addToCart(f.id)}
                    disabled={stock <= inCart}
                    style={{ padding: '6px 12px', fontSize: '1.1rem', fontWeight: 900 }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Cart Summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-md">
          <div className="flex items-center gap-sm">
            <span style={{ fontSize: '1.3rem' }}>🛒</span>
            <strong>Carrito</strong>
          </div>
          {!isEmpty && (
            <button className="text-danger text-sm font-bold" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={clearCart}>
              Vaciar
            </button>
          )}
        </div>

        {isEmpty ? (
          <p className="text-secondary text-center">Agrega brownies para empezar</p>
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
              <span>{totals.pairs} par(es) × $55</span>
              <strong>{formatMoney(totals.pairs * 55)}</strong>
            </div>
          )}
          {totals.singles > 0 && (
            <div className="flex justify-between text-sm" style={{ padding: '3px 0' }}>
              <span>{totals.singles} individual × $30</span>
              <strong>{formatMoney(30)}</strong>
            </div>
          )}
          {totals.discount > 0 && (
            <>
              <hr style={{ margin: '8px 0', borderColor: '#D7CCC8' }} />
              <div className="flex justify-between text-sm">
                <span>✨ Ahorro del cliente</span>
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

      {/* Complete Button */}
      {!isEmpty && (
        <button className="btn btn--primary btn--block" style={{ padding: '14px', fontSize: '1.1rem' }} onClick={handleComplete}>
          ✅ Cobrar {formatMoney(totals.totalPrice)}
        </button>
      )}

      {/* Confirmation Overlay */}
      {showConfirm && (
        <div className="overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal text-center animate-scale" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>✅</div>
            <h2 style={{ fontWeight: 900, marginBottom: 8 }}>¡Venta Registrada!</h2>
            <p className="text-2xl font-black text-primary" style={{ marginBottom: 20 }}>{formatMoney(lastTotal)}</p>
            <button className="btn btn--accent btn--block" onClick={() => setShowConfirm(false)}>Continuar</button>
          </div>
        </div>
      )}
    </div>
  )
}
