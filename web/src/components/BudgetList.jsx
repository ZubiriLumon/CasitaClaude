import { useState } from 'react';
import useStore from '../store/useStore';
import { t, formatMoney } from '../theme';
import { currentPeriod, formatPeriod } from '../services/periodService';
import Icon from './Icon';

export default function BudgetList() {
  const { section, profile, getBudgetsForSection, getCategoriesForSection, getExpensesForPeriod, setBudget, deleteBudget } = useStore();
  const colors = t(section);
  const categories = getCategoriesForSection();
  const budgets = getBudgetsForSection();
  const period = currentPeriod(profile.billingCycleStartDay);
  const expenses = getExpensesForPeriod(period.start, period.end);
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

  const [showModal, setShowModal] = useState(false);
  const [isGlobal, setIsGlobal] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [budgetAmount, setBudgetAmount] = useState('');

  function handleSave() {
    const amount = parseFloat(budgetAmount.replace(',', '.'));
    if (!amount || amount <= 0) return;
    if (!isGlobal && !selectedCatId) return;
    setBudget(isGlobal ? null : selectedCatId, amount, section);
    setBudgetAmount('');
    setSelectedCatId(null);
    setShowModal(false);
  }

  // Build progress items
  const progressItems = budgets.map((b) => {
    if (b.categoryId === null) {
      return {
        ...b,
        name: 'Presupuesto Total',
        icon: 'PieChart',
        color: colors.primary,
        spent: totalSpent,
        isGlobal: true,
      };
    }
    const cat = categories.find((c) => c.id === b.categoryId);
    if (!cat) return null;
    const spent = expenses.filter((e) => e.categoryId === b.categoryId).reduce((s, e) => s + e.amount, 0);
    return {
      ...b,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      spent,
      isGlobal: false,
    };
  }).filter(Boolean);

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: colors.text }}>Control de Límites</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-primary btn-sm"
              style={{ background: colors.primary }}
              onClick={() => { setIsGlobal(true); setShowModal(true); }}
            >
              <Icon name="PieChart" size={14} /> Total
            </button>
            <button
              className="btn btn-outline btn-sm"
              style={{ borderColor: colors.primary, color: colors.primary }}
              onClick={() => { setIsGlobal(false); setShowModal(true); }}
            >
              <Icon name="LayoutGrid" size={14} /> Categoría
            </button>
          </div>
        </div>
        <div className="period-badge" style={{ background: `${colors.primary}15`, color: colors.primary, marginTop: 8 }}>
          <Icon name="Calendar" size={14} />
          {formatPeriod(period.start, period.end)}
        </div>
      </div>

      {progressItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Icon name="Gauge" size={48} color={`${colors.textSecondary}40`} style={{ margin: '0 auto' }} />
          <p style={{ color: colors.textSecondary, marginTop: 16, fontWeight: 500 }}>
            Sin límites configurados
          </p>
          <p style={{ color: `${colors.textSecondary}99`, marginTop: 4, fontSize: 14 }}>
            Establece presupuestos para controlar tus gastos
          </p>
        </div>
      ) : (
        <div className="stack">
          {progressItems.map((item) => {
            const pct = item.amount > 0 ? item.spent / item.amount : 0;
            const isOver = pct > 1;
            const isNear = pct >= 0.85 && !isOver;
            const barColor = isOver ? colors.danger : isNear ? colors.warning : colors.success;
            const statusText = isOver ? 'Excedido' : isNear ? 'Alerta' : 'OK';

            return (
              <div key={item.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Icon name={item.icon} size={18} color="#fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 15, color: colors.text }}>{item.name}</p>
                    {item.isGlobal && (
                      <p style={{ fontSize: 11, color: colors.textSecondary }}>Presupuesto mensual general</p>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 11, fontWeight: 700, color: '#fff',
                      padding: '3px 10px', borderRadius: 999, background: barColor,
                    }}
                  >
                    {statusText}
                  </span>
                  <button
                    className="btn-ghost"
                    style={{ color: colors.textSecondary, padding: 4 }}
                    onClick={() => deleteBudget(item.id)}
                    title="Eliminar límite"
                  >
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>

                <div className="progress-track" style={{ height: 14 }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(pct * 100, 100)}%`, background: barColor }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                  <div>
                    <p style={{ fontSize: 11, color: colors.textSecondary }}>Gastado</p>
                    <p style={{ fontWeight: 600, color: barColor }}>{formatMoney(item.spent)}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: barColor }}>{Math.round(pct * 100)}%</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 11, color: colors.textSecondary }}>Límite</p>
                    <p style={{ fontWeight: 600, color: colors.text }}>{formatMoney(item.amount)}</p>
                  </div>
                </div>

                {isOver ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, marginTop: 10,
                    padding: '6px 12px', borderRadius: 999, background: `${colors.danger}12`,
                    color: colors.danger, fontSize: 13, fontWeight: 500, width: 'fit-content',
                  }}>
                    <Icon name="AlertTriangle" size={14} />
                    Excedido por {formatMoney(item.spent - item.amount)}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: colors.success, marginTop: 10 }}>
                    Disponible: {formatMoney(Math.max(0, item.amount - item.spent))}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Budget Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: colors.text, margin: 0 }}>
                {isGlobal ? 'Presupuesto Total' : 'Límite por Categoría'}
              </h3>
              <button className="btn-ghost" onClick={() => setShowModal(false)} style={{ color: colors.textSecondary }}>
                <Icon name="X" size={20} />
              </button>
            </div>

            {!isGlobal && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 10 }}>
                  Selecciona categoría
                </p>
                <div className="cat-grid">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className={`cat-item ${selectedCatId === cat.id ? 'selected' : ''}`}
                      style={{ color: cat.color, borderColor: selectedCatId === cat.id ? cat.color : 'transparent' }}
                      onClick={() => setSelectedCatId(cat.id)}
                    >
                      <div
                        className="cat-icon"
                        style={{ background: selectedCatId === cat.id ? cat.color : `${cat.color}20` }}
                      >
                        <Icon name={cat.icon} size={18} color={selectedCatId === cat.id ? '#fff' : cat.color} />
                      </div>
                      <span className="cat-label" style={{ color: colors.text }}>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 8 }}>
                {isGlobal ? 'Presupuesto mensual total' : 'Límite para esta categoría'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 16, background: '#f5f5f5', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: 22, color: colors.textSecondary }}>$</span>
                <input
                  className="input-big"
                  style={{ color: colors.text, fontSize: 28, textAlign: 'left' }}
                  placeholder="0.00"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  type="text"
                  inputMode="decimal"
                  autoFocus
                />
              </div>
            </div>

            <button className="btn btn-primary btn-full" style={{ background: colors.primary }} onClick={handleSave}>
              Guardar Límite
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
