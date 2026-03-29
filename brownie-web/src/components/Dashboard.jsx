import { useState } from 'react'
import useBrownieStore from '../store/useStore'
import { playDeleteSound } from '../services/sounds'
import { BrownieDoodle, CrownDoodle, SparkleCluster, WavyUnderline, SleepyFace, MoneyDoodle } from './Doodles'

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

export default function Dashboard() {
  const inventory = useBrownieStore(s => s.inventory)
  const getTodaySales = useBrownieStore(s => s.getTodaySales)
  const getLowStockFlavors = useBrownieStore(s => s.getLowStockFlavors)
  const deleteSale = useBrownieStore(s => s.deleteSale)
  const flavors = useBrownieStore(s => s.flavors)

  const [confirmDelete, setConfirmDelete] = useState(null)

  const todaySales = getTodaySales()
  const lowStock = getLowStockFlavors()

  const todayRevenue = todaySales.reduce((s, sale) => s + sale.totalAmount, 0)
  const todayProfit = todaySales.reduce((s, sale) => s + (sale.totalAmount - sale.totalCost), 0)
  const todaySold = todaySales.reduce((s, sale) => s + sale.totalBrownies, 0)

  function handleDeleteSale(id) {
    deleteSale(id)
    playDeleteSound()
    setConfirmDelete(null)
  }

  return (
    <div className="page flex-col gap-lg animate-in">
      {/* Header with doodles */}
      <div className="section-header">
        <div>
          <div className="flex items-center gap-sm">
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900 }}>¡Hola, Chef!</h1>
            <div className="doodle-wiggle">
              <CrownDoodle size={36} />
            </div>
          </div>
          <WavyUnderline width={180} color="#FFB067" />
          <p className="text-secondary text-sm" style={{ marginTop: 4 }}>
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="doodle-float section-header__doodle">
          <BrownieDoodle size={75} />
        </div>
      </div>

      {/* Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="card card--danger animate-in">
          <div className="flex items-center gap-sm mb-md">
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <strong style={{ color: 'var(--danger)' }}>Alertas de Stock</strong>
          </div>
          {lowStock.map(f => (
            <div key={f.id} className="flex items-center justify-between" style={{ padding: '4px 0' }}>
              <span>{f.icon} {f.name}</span>
              <strong style={{ color: 'var(--danger)' }}>{inventory[f.id] || 0} uds</strong>
            </div>
          ))}
        </div>
      )}

      {/* Today Summary */}
      <div className="card" style={{ position: 'relative', overflow: 'visible' }}>
        <div className="doodle-corner doodle-corner--tr doodle-sparkle">
          <SparkleCluster size={35} />
        </div>
        <div className="flex items-center gap-sm mb-md">
          <MoneyDoodle size={28} />
          <strong>Resumen del Día</strong>
        </div>
        <div className="flex justify-between text-center">
          <div className="flex-col items-center">
            <span style={{ fontSize: '1.4rem' }}>💰</span>
            <strong className="text-lg">{formatMoney(todayRevenue)}</strong>
            <span className="text-xs text-secondary">Ventas</span>
          </div>
          <div className="flex-col items-center">
            <span style={{ fontSize: '1.4rem' }}>📈</span>
            <strong className="text-lg text-success">{formatMoney(todayProfit)}</strong>
            <span className="text-xs text-secondary">Ganancia</span>
          </div>
          <div className="flex-col items-center">
            <span style={{ fontSize: '1.4rem' }}>🛍️</span>
            <strong className="text-lg">{todaySold}</strong>
            <span className="text-xs text-secondary">Vendidos</span>
          </div>
        </div>
      </div>

      {/* Stock per Flavor */}
      <div className="flex gap-sm">
        {flavors.map((f, i) => (
          <div
            key={f.id}
            className="card card--sm flex-col items-center text-center"
            style={{ flex: 1, borderColor: f.color, padding: '12px 6px', animationDelay: `${i * 0.1}s` }}
          >
            <span style={{ fontSize: '1.8rem' }}>{f.icon}</span>
            <strong
              className="text-xl"
              style={{ color: (inventory[f.id] || 0) < 5 ? 'var(--danger)' : 'var(--text)' }}
            >
              {inventory[f.id] || 0}
            </strong>
            <span className="text-xs text-secondary" style={{ lineHeight: 1.2 }}>{f.name}</span>
          </div>
        ))}
      </div>

      {/* Recent Sales */}
      <div>
        <div className="flex items-center gap-sm mb-md">
          <strong>Ventas Recientes</strong>
          <div className="doodle-sparkle" style={{ opacity: 0.6 }}>
            <SparkleCluster size={20} />
          </div>
        </div>
        {todaySales.length === 0 ? (
          <div className="card card--subtle">
            <div className="empty-state">
              <SleepyFace size={70} />
              <p className="empty-state__text">No hay ventas hoy todavía</p>
              <p className="text-xs text-secondary">¡Ve al Punto de Venta para empezar!</p>
            </div>
          </div>
        ) : (
          <div className="flex-col gap-sm">
            {todaySales.slice(0, 10).map(sale => (
              <div key={sale.id} className="card card--sm">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>{sale.totalBrownies} brownies</strong>
                    <p className="text-xs text-secondary">
                      {new Date(sale.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      {' · '}
                      {sale.items.map(i => {
                        const f = flavors.find(fl => fl.id === i.flavorId)
                        return `${f?.icon || ''} ${i.quantity}`
                      }).join('  ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-sm">
                    <strong className="text-primary text-lg">{formatMoney(sale.totalAmount)}</strong>
                    <button
                      onClick={() => setConfirmDelete(sale.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', padding: '4px' }}
                      title="Cancelar venta"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal text-center animate-scale" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontWeight: 800, marginBottom: 8 }}>¿Cancelar esta venta?</h3>
            <p className="text-sm text-secondary" style={{ marginBottom: 16 }}>
              Se eliminará la venta y el stock se restaurará automáticamente.
            </p>
            <div className="flex gap-sm">
              <button className="btn btn--ghost btn--block" onClick={() => setConfirmDelete(null)}>No, mantener</button>
              <button className="btn btn--danger btn--block" onClick={() => handleDeleteSale(confirmDelete)}>Sí, cancelar venta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
