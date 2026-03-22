import useBrownieStore, { FLAVORS } from '../store/useStore'

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

export default function Dashboard() {
  const inventory = useBrownieStore(s => s.inventory)
  const getTodaySales = useBrownieStore(s => s.getTodaySales)
  const getLowStockFlavors = useBrownieStore(s => s.getLowStockFlavors)

  const todaySales = getTodaySales()
  const lowStock = getLowStockFlavors()

  const todayRevenue = todaySales.reduce((s, sale) => s + sale.totalAmount, 0)
  const todayProfit = todaySales.reduce((s, sale) => s + (sale.totalAmount - sale.totalCost), 0)
  const todaySold = todaySales.reduce((s, sale) => s + sale.totalBrownies, 0)

  return (
    <div className="page flex-col gap-lg animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900 }}>¡Hola, Chef! 👩‍🍳</h1>
          <p className="text-secondary text-sm">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <span style={{ fontSize: '2.5rem' }}>🍫</span>
      </div>

      {/* Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="card card--danger animate-in">
          <div className="flex items-center gap-sm mb-md">
            <span>⚠️</span>
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
      <div className="card">
        <div className="flex items-center gap-sm mb-md">
          <span style={{ fontSize: '1.3rem' }}>📊</span>
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
        {FLAVORS.map(f => (
          <div
            key={f.id}
            className="card card--sm flex-col items-center text-center"
            style={{ flex: 1, borderColor: f.color, padding: '12px 6px' }}
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
        <strong className="mb-md" style={{ display: 'block' }}>Ventas Recientes</strong>
        {todaySales.length === 0 ? (
          <div className="card card--subtle text-center text-secondary">
            <span style={{ fontSize: '1.5rem' }}>📭</span>
            <p className="mt-sm">No hay ventas hoy todavía</p>
          </div>
        ) : (
          <div className="flex-col gap-sm">
            {todaySales.slice(0, 5).map(sale => (
              <div key={sale.id} className="card card--sm flex items-center justify-between">
                <div>
                  <strong>{sale.totalBrownies} brownies</strong>
                  <p className="text-xs text-secondary">
                    {new Date(sale.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <strong className="text-primary text-lg">{formatMoney(sale.totalAmount)}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
