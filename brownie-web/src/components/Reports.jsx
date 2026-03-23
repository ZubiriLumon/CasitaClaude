import { useState } from 'react'
import useBrownieStore, { FLAVORS, calculateTotal, calculateCost } from '../store/useStore'
import { ChartDoodle, WavyUnderline, CrownDoodle, SparkleCluster } from './Doodles'

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function Reports() {
  const getMonthSales = useBrownieStore(s => s.getMonthSales)
  const getMonthExpenses = useBrownieStore(s => s.getMonthExpenses)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const sales = getMonthSales(year, month)
  const expenses = getMonthExpenses(year, month)

  const totalRevenue = sales.reduce((s, sale) => s + sale.totalAmount, 0)
  const productionCost = sales.reduce((s, sale) => s + sale.totalCost, 0)
  const rawMaterialExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const totalExpenses = productionCost + rawMaterialExpenses
  const realProfit = totalRevenue - totalExpenses
  const totalBrownies = sales.reduce((s, sale) => s + sale.totalBrownies, 0)

  // Sales by flavor
  const flavorCounts = {}
  sales.forEach(sale => {
    sale.items.forEach(item => {
      flavorCounts[item.flavorId] = (flavorCounts[item.flavorId] || 0) + item.quantity
    })
  })
  const flavorData = FLAVORS
    .map(f => ({ ...f, quantity: flavorCounts[f.id] || 0 }))
    .sort((a, b) => b.quantity - a.quantity)
  const maxQty = Math.max(...flavorData.map(f => f.quantity), 1)

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="page flex-col gap-lg animate-in">
      <div className="section-header">
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Reportes</h1>
          <WavyUnderline width={115} color="#7ECFB3" />
        </div>
        <div className="doodle-float section-header__doodle">
          <ChartDoodle size={55} />
        </div>
      </div>

      {/* Month Picker */}
      <div className="flex items-center justify-between">
        <button className="btn btn--ghost btn--sm" onClick={prevMonth}>◀</button>
        <strong className="text-lg">{MONTH_NAMES[month]} {year}</strong>
        <button className="btn btn--ghost btn--sm" onClick={nextMonth}>▶</button>
      </div>

      {/* Profit Card */}
      <div className={`card ${realProfit >= 0 ? 'card--success' : 'card--danger'} text-center`}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {realProfit > 0 && (
            <div className="doodle-wiggle" style={{ position: 'absolute', top: -18, right: -20 }}>
              <CrownDoodle size={30} />
            </div>
          )}
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>
            {realProfit >= 0 ? '📈' : '📉'}
          </div>
        </div>
        {realProfit > 0 && (
          <div className="doodle-sparkle" style={{ position: 'absolute', top: 8, right: 12 }}>
            <SparkleCluster size={30} />
          </div>
        )}
        <p className="text-secondary font-bold">Ganancia Real</p>
        <strong
          className="text-2xl"
          style={{ color: realProfit >= 0 ? 'var(--success)' : 'var(--danger)', display: 'block', margin: '8px 0' }}
        >
          {formatMoney(realProfit)}
        </strong>
        <p className="text-xs text-secondary">Ventas − (Producción + Materia Prima)</p>
      </div>

      {/* Revenue */}
      <div className="card">
        <div className="flex items-center gap-sm mb-md">
          <span>💰</span>
          <strong>Ingresos</strong>
        </div>
        <Row label="Ventas totales" value={formatMoney(totalRevenue)} color="var(--primary)" />
        <Row label="Brownies vendidos" value={`${totalBrownies}`} />
        <Row label="Número de ventas" value={`${sales.length}`} />
        {totalBrownies > 0 && (
          <Row label="Precio promedio/ud" value={formatMoney(totalRevenue / totalBrownies)} />
        )}
      </div>

      {/* Expenses */}
      <div className="card card--orange">
        <div className="flex items-center gap-sm mb-md">
          <span>🛒</span>
          <strong>Gastos</strong>
        </div>
        <Row label="Costo de producción" value={formatMoney(productionCost)} color="var(--danger)" />
        <Row label="Materia prima extra" value={formatMoney(rawMaterialExpenses)} color="var(--warning)" />
        <hr style={{ margin: '8px 0', borderColor: '#EFEBE9' }} />
        <div className="flex justify-between">
          <strong>Total gastos</strong>
          <strong className="text-lg" style={{ color: 'var(--danger)' }}>{formatMoney(totalExpenses)}</strong>
        </div>
      </div>

      {/* Sales by Flavor */}
      <div className="card">
        <div className="flex items-center gap-sm mb-md">
          <span>🥧</span>
          <strong>Ventas por Sabor</strong>
        </div>
        {flavorData.every(f => f.quantity === 0) ? (
          <p className="text-secondary">Sin ventas este mes</p>
        ) : (
          flavorData.map(f => (
            <div key={f.id} className="flex items-center gap-sm" style={{ padding: '6px 0' }}>
              <span>{f.icon}</span>
              <span style={{ minWidth: 110 }}>{f.name}</span>
              <div className="progress-bar" style={{ flex: 1 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${(f.quantity / maxQty) * 100}%`,
                    background: f.color,
                    opacity: 0.7,
                  }}
                />
              </div>
              <strong style={{ minWidth: 40, textAlign: 'right' }}>{f.quantity}</strong>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function Row({ label, value, color }) {
  return (
    <div className="flex justify-between" style={{ padding: '4px 0' }}>
      <span>{label}</span>
      <strong style={{ color: color || 'var(--text-secondary)' }}>{value}</strong>
    </div>
  )
}
