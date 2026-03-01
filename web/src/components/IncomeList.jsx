import useStore from '../store/useStore';
import { t, formatMoney } from '../theme';
import { currentPeriod, formatPeriod } from '../services/periodService';
import { playDelete, playPop } from '../services/sounds';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Icon from './Icon';

export default function IncomeList({ onAddIncome }) {
  const { section, profile, getIncomesForPeriod, getIncomeCategories, deleteIncome, recurringIncomes, deleteRecurringIncome, applyRecurringIncomes } = useStore();
  const colors = t(section);
  const isBusiness = section === 'business';
  const incomeCategories = getIncomeCategories();
  const period = currentPeriod(profile.billingCycleStartDay);
  const incomes = getIncomesForPeriod(period.start, period.end);

  // Apply recurring incomes on mount
  applyRecurringIncomes(period.start, period.end);

  // Section recurring incomes
  const sectionRecurring = recurringIncomes.filter((r) => r.section === section);

  // Group by date
  const grouped = {};
  incomes.forEach((inc) => {
    const key = format(new Date(inc.date), 'd MMMM yyyy', { locale: es });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(inc);
  });

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalBrownies = isBusiness ? incomes.reduce((s, i) => s + (i.quantity || 0), 0) : 0;

  function handleDelete(id) {
    if (window.confirm('¿Eliminar este ingreso?')) {
      playDelete();
      deleteIncome(id);
    }
  }

  function handleDeleteRecurring(id) {
    if (window.confirm('¿Eliminar este ingreso recurrente? Ya no se registrará automáticamente.')) {
      playDelete();
      deleteRecurringIncome(id);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: colors.text }}>Ingresos</h2>
          <button
            className="btn btn-primary btn-sm"
            style={{ background: `linear-gradient(135deg, ${colors.success}, #10B981)`, boxShadow: `0 3px 12px ${colors.success}25` }}
            onClick={onAddIncome}
          >
            <Icon name="Plus" size={16} /> {isBusiness ? 'Nueva Venta' : 'Nuevo Ingreso'}
          </button>
        </div>
        <div className="period-badge" style={{ background: `${colors.success}12`, color: colors.success, marginTop: 8 }}>
          <Icon name="Calendar" size={14} />
          {formatPeriod(period.start, period.end)}
        </div>
      </div>

      {/* Recurring Incomes */}
      {sectionRecurring.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: colors.textSecondary, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="Repeat" size={14} color={colors.primary} /> Ingresos Recurrentes
          </p>
          <div className="card">
            {sectionRecurring.map((rec) => {
              const cat = incomeCategories.find((c) => c.id === rec.incomeCategoryId);
              return (
                <div key={rec.id} className="expense-row">
                  <div className="expense-icon" style={{ background: cat?.color || colors.success }}>
                    <Icon name={cat?.icon || 'Repeat'} size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: colors.text }}>
                      {cat?.name || rec.source || 'Ingreso'}
                    </p>
                    <p style={{ fontSize: 12, color: colors.textSecondary }}>
                      Cada mes, día {rec.dayOfMonth}
                      {rec.description ? ` — ${rec.description}` : ''}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 800, fontSize: 15, color: colors.success }}>
                      +{formatMoney(rec.amount)}
                    </p>
                  </div>
                  <button
                    className="btn-ghost"
                    style={{ color: colors.textSecondary, padding: 4 }}
                    onClick={() => handleDeleteRecurring(rec.id)}
                    title="Eliminar recurrente"
                  >
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {incomes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="wiggle" style={{ display: 'inline-block' }}>
            <Icon name="TrendingUp" size={52} color={`${colors.textSecondary}30`} />
          </div>
          <p style={{ color: colors.text, marginTop: 16, fontWeight: 600, fontSize: 16 }}>
            {isBusiness ? 'Sin ventas en este ciclo' : 'Sin ingresos en este ciclo'}
          </p>
          <p style={{ color: `${colors.textSecondary}99`, marginTop: 4, fontSize: 14 }}>
            {isBusiness ? 'Registra tu primera venta de brownies' : 'Registra tu primer ingreso'}
          </p>
          <button
            className="btn btn-primary"
            style={{ background: `linear-gradient(135deg, ${colors.success}, #10B981)`, marginTop: 20, boxShadow: `0 4px 16px ${colors.success}30` }}
            onClick={onAddIncome}
          >
            <Icon name="Plus" size={16} /> {isBusiness ? 'Registrar Venta' : 'Registrar Ingreso'}
          </button>
        </div>
      ) : (
        <div className="stack">
          {Object.entries(grouped).map(([dateStr, dayIncomes]) => (
            <div key={dateStr}>
              <p style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, marginBottom: 10, textTransform: 'capitalize', letterSpacing: 0.3 }}>
                {dateStr}
              </p>
              <div className="card">
                {dayIncomes.map((inc, i) => {
                  const cat = incomeCategories.find((c) => c.id === inc.incomeCategoryId);
                  return (
                    <div
                      key={inc.id}
                      className="expense-row"
                      style={{ animation: `slideUp 0.3s ease ${i * 0.04}s both` }}
                    >
                      <div className="expense-icon" style={{ background: cat?.color || colors.success }}>
                        <Icon name={cat?.icon || 'TrendingUp'} size={18} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <p style={{ fontWeight: 700, fontSize: 14, color: colors.text }}>
                            {cat?.name || inc.source || 'Ingreso'}
                          </p>
                          {inc.recurring && (
                            <Icon name="Repeat" size={12} color={colors.primary} />
                          )}
                        </div>
                        {inc.description && (
                          <p style={{ fontSize: 12, color: colors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {inc.description}
                          </p>
                        )}
                        {isBusiness && inc.quantity > 0 && (
                          <span style={{ fontSize: 11, color: colors.textSecondary, fontWeight: 500 }}>
                            {inc.quantity} brownie{inc.quantity !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 800, fontSize: 15, color: colors.success }}>
                          +{formatMoney(inc.amount)}
                        </p>
                      </div>
                      <button
                        className="btn-ghost"
                        style={{ color: colors.textSecondary, padding: 4 }}
                        onClick={() => handleDelete(inc.id)}
                        title="Eliminar"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className={isBusiness && totalBrownies > 0 ? 'grid-2' : ''}>
            <div
              className="card"
              style={{
                textAlign: 'center',
                background: `linear-gradient(135deg, ${colors.success}08, ${colors.accent}08)`,
                border: `2px solid ${colors.success}10`,
              }}
            >
              <p style={{ fontSize: 13, color: colors.textSecondary, fontWeight: 600 }}>Total del ciclo</p>
              <p className="amount-display" style={{ fontSize: 26, fontWeight: 900, color: colors.success, letterSpacing: -1 }}>
                +{formatMoney(totalIncome)}
              </p>
              <p style={{ fontSize: 13, color: colors.textSecondary }}>
                {incomes.length} {isBusiness ? 'venta' : 'ingreso'}{incomes.length !== 1 ? 's' : ''}
              </p>
            </div>
            {isBusiness && totalBrownies > 0 && (
              <div
                className="card"
                style={{
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${colors.accent}08, ${colors.primary}08)`,
                  border: `2px solid ${colors.accent}10`,
                }}
              >
                <p style={{ fontSize: 13, color: colors.textSecondary, fontWeight: 600 }}>Brownies vendidos</p>
                <p className="amount-display" style={{ fontSize: 26, fontWeight: 900, color: colors.accent, letterSpacing: -1 }}>
                  {totalBrownies}
                </p>
                <p style={{ fontSize: 13, color: colors.textSecondary }}>
                  este ciclo
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
