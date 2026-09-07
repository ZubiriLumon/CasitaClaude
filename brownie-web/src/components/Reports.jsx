import { useState } from 'react'
import useBrownieStore from '../store/useStore'
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
  const flavors = useBrownieStore(s => s.flavors)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const sales = getMonthSales(year, month)
  const expenses = getMonthExpenses(year, month)

  const totalRevenue = sales.reduce((s, sale) => s + sale.totalAmount, 0)
  const productionCost = sales.reduce((s, sale) => s + sale.totalCost, 0)
  const extraExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const grossProfit = totalRevenue - productionCost
  const netProfit = grossProfit - extraExpenses
  const totalBrownies = sales.reduce((s, sale) => s + sale.totalBrownies, 0)

  // Per-flavor profitability. A fixed-price flavor earned exactly its own
  // price, so it gets that; the deal portion of the sale is what gets split
  // between the flavors that took part in it, by unit share.
  const flavorStats = {}
  sales.forEach(sale => {
    const saleUnits = sale.totalBrownies || sale.items.reduce((s, i) => s + i.quantity, 0)
    if (saleUnits === 0) return

    const hasDealSplit = sale.dealTotal != null && sale.dealUnits > 0

    sale.items.forEach(item => {
      if (!flavorStats[item.flavorId]) {
        flavorStats[item.flavorId] = { units: 0, cost: 0, revenue: 0 }
      }
      // Sales made before per-flavor costs existed only carry a total, so
      // spread that evenly across their units.
      const unitCost = item.unitCost ?? (sale.totalCost / saleUnits)

      let revenue
      if (item.fixedUnitPrice != null) {
        revenue = item.quantity * item.fixedUnitPrice
      } else if (hasDealSplit) {
        revenue = sale.dealTotal * (item.quantity / sale.dealUnits)
      } else {
        // Sale predates fixed pricing: fall back to an even split.
        revenue = sale.totalAmount * (item.quantity / saleUnits)
      }

      const st = flavorStats[item.flavorId]
      st.units += item.quantity
      st.cost += item.quantity * unitCost
      st.revenue += revenue
    })
  })

  const flavorData = flavors
    .map(f => {
      const st = flavorStats[f.id] || { units: 0, cost: 0, revenue: 0 }
      return { ...f, quantity: st.units, cost: st.cost, revenue: st.revenue, margin: st.revenue - st.cost }
    })
    .sort((a, b) => b.quantity - a.quantity)
  const maxQty = Math.max(...flavorData.map(f => f.quantity), 1)
  const soldFlavors = flavorData.filter(f => f.quantity > 0)

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
          <WavyUnderline width={115} color="#FF8C42" />
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

      {/* Net Profit headline */}
      <div className={`card card--hero ${netProfit >= 0 ? 'card--success' : 'card--danger'} text-center`}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {netProfit > 0 && (
            <div className="doodle-wiggle" style={{ position: 'absolute', top: -18, right: -20 }}>
              <CrownDoodle size={30} />
            </div>
          )}
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>
            {netProfit >= 0 ? '📈' : '📉'}
          </div>
        </div>
        {netProfit > 0 && (
          <div className="doodle-sparkle" style={{ position: 'absolute', top: 8, right: 12 }}>
            <SparkleCluster size={30} />
          </div>
        )}
        <p className="text-secondary font-bold">Ganancia Neta</p>
        <strong
          className="text-2xl"
          style={{ color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)', display: 'block', margin: '8px 0' }}
        >
          {formatMoney(netProfit)}
        </strong>
        <p className="text-xs text-secondary">Lo que realmente te quedó este mes</p>
      </div>

      {/* Profit breakdown */}
      <div className="card">
        <div className="flex items-center gap-sm mb-md">
          <span>🧮</span>
          <strong>Desglose</strong>
        </div>

        <Row label="Ingresos por ventas" value={formatMoney(totalRevenue)} color="var(--primary)" />
        <Row label="− Costo de producción" value={formatMoney(productionCost)} color="var(--danger)" />

        <div
          className="flex justify-between"
          style={{ padding: '10px 0', borderTop: '2px solid #E3EDF5', borderBottom: '2px solid #E3EDF5', margin: '6px 0' }}
        >
          <strong>Ganancia Bruta</strong>
          <strong className="text-lg" style={{ color: grossProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {formatMoney(grossProfit)}
          </strong>
        </div>

        <Row label="− Gastos extraordinarios" value={formatMoney(extraExpenses)} color="var(--warning)" />

        <div className="flex justify-between" style={{ padding: '10px 0', borderTop: '2px solid #E3EDF5', marginTop: 6 }}>
          <strong>Ganancia Neta</strong>
          <strong className="text-lg" style={{ color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {formatMoney(netProfit)}
          </strong>
        </div>

        <p className="text-xs text-secondary" style={{ marginTop: 10, lineHeight: 1.4 }}>
          El costo de producción es lo que te dio Perla por brownie (ingredientes
          incluidos). Los gastos extraordinarios son aparte: bolsas, transporte,
          equipo — nada que ya venga en ese costo.
        </p>
      </div>

      {/* Volume */}
      <div className="card">
        <div className="flex items-center gap-sm mb-md">
          <span>💰</span>
          <strong>Ventas</strong>
        </div>
        <Row label="Brownies vendidos" value={`${totalBrownies}`} />
        <Row label="Número de ventas" value={`${sales.length}`} />
        {totalBrownies > 0 && (
          <>
            <Row label="Precio promedio/ud" value={formatMoney(totalRevenue / totalBrownies)} />
            <Row label="Costo promedio/ud" value={formatMoney(productionCost / totalBrownies)} />
            <Row
              label="Ganancia promedio/ud"
              value={formatMoney(grossProfit / totalBrownies)}
              color={grossProfit >= 0 ? 'var(--success)' : 'var(--danger)'}
            />
          </>
        )}
      </div>

      {/* Profit by flavor */}
      <div className="card">
        <div className="flex items-center gap-sm mb-md">
          <span>🥧</span>
          <strong>Ganancia por Sabor</strong>
        </div>
        {soldFlavors.length === 0 ? (
          <p className="text-secondary">Sin ventas este mes</p>
        ) : (
          <>
            {soldFlavors.map(f => (
              <div key={f.id} style={{ padding: '8px 0', borderBottom: '1px solid #E3EDF5' }}>
                <div className="flex items-center gap-sm" style={{ marginBottom: 6 }}>
                  <span>{f.icon}</span>
                  <span style={{ flex: 1, fontWeight: 700 }}>{f.name}</span>
                  <strong>{f.quantity} uds</strong>
                </div>
                <div className="progress-bar" style={{ marginBottom: 6 }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${(f.quantity / maxQty) * 100}%`, background: f.color, opacity: 0.7 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-secondary">
                  <span>
                    Ingreso {formatMoney(f.revenue)} · Costo {formatMoney(f.cost)}
                  </span>
                  <strong style={{ color: f.margin >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {formatMoney(f.margin)}
                  </strong>
                </div>
              </div>
            ))}
            <p className="text-xs text-secondary" style={{ marginTop: 10 }}>
              Los sabores con precio fijo cobran su propio precio. El resto se
              reparte el monto de la promo según cuántos brownies fueron, porque
              el 2×$50 aplica al conjunto.
            </p>
          </>
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
