import useStore from '../store/useStore';
import { t, formatMoney, paymentMethods } from '../theme';
import { currentPeriod, formatPeriod } from '../services/periodService';
import { playDelete } from '../services/sounds';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Icon from './Icon';

export default function ExpenseList({ onAddExpense }) {
  const { section, profile, getExpensesForPeriod, getCategoriesForSection, deleteExpense } = useStore();
  const colors = t(section);
  const categories = getCategoriesForSection();
  const period = currentPeriod(profile.billingCycleStartDay);
  const expenses = getExpensesForPeriod(period.start, period.end);

  // Group by date
  const grouped = {};
  expenses.forEach((e) => {
    const key = format(new Date(e.date), 'd MMMM yyyy', { locale: es });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  function handleDelete(id) {
    if (window.confirm('¿Eliminar este gasto?')) {
      playDelete();
      deleteExpense(id);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: colors.text }}>Gastos</h2>
          <button
            className="btn btn-primary btn-sm"
            style={{ background: colors.gradient, boxShadow: `0 3px 12px ${colors.primary}25` }}
            onClick={onAddExpense}
          >
            <Icon name="Plus" size={16} /> Nuevo
          </button>
        </div>
        <div className="period-badge" style={{ background: `${colors.primary}12`, color: colors.primary, marginTop: 8 }}>
          <Icon name="Calendar" size={14} />
          {formatPeriod(period.start, period.end)}
        </div>
      </div>

      {expenses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="wiggle" style={{ display: 'inline-block' }}>
            <Icon name="Inbox" size={52} color={`${colors.textSecondary}30`} />
          </div>
          <p style={{ color: colors.text, marginTop: 16, fontWeight: 600, fontSize: 16 }}>Sin gastos en este ciclo</p>
          <p style={{ color: `${colors.textSecondary}99`, marginTop: 4, fontSize: 14 }}>
            Toca + para registrar tu primer gasto
          </p>
          <button
            className="btn btn-primary"
            style={{ background: colors.gradient, marginTop: 20, boxShadow: `0 4px 16px ${colors.primary}30` }}
            onClick={onAddExpense}
          >
            <Icon name="Plus" size={16} /> Registrar Gasto
          </button>
        </div>
      ) : (
        <div className="stack">
          {Object.entries(grouped).map(([dateStr, dayExpenses]) => (
            <div key={dateStr}>
              <p style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, marginBottom: 10, textTransform: 'capitalize', letterSpacing: 0.3 }}>
                {dateStr}
              </p>
              <div className="card">
                {dayExpenses.map((exp, i) => {
                  const cat = categories.find((c) => c.id === exp.categoryId);
                  const pm = paymentMethods.find((m) => m.id === exp.paymentMethod);
                  return (
                    <div
                      key={exp.id}
                      className="expense-row"
                      style={{ animation: `slideUp 0.3s ease ${i * 0.04}s both` }}
                    >
                      <div className="expense-icon" style={{ background: cat?.color || '#6B7280' }}>
                        <Icon name={cat?.icon || 'Circle'} size={18} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: colors.text }}>
                          {cat?.name || 'Sin categoría'}
                        </p>
                        {exp.description && (
                          <p style={{ fontSize: 12, color: colors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {exp.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
                          {pm && (
                            <span style={{ fontSize: 11, color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
                              <Icon name={pm.icon} size={11} /> {pm.name}
                            </span>
                          )}
                          {exp.tags?.length > 0 && (
                            <span style={{ fontSize: 11, color: `${colors.primary}99`, fontWeight: 500 }}>
                              {exp.tags.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 800, fontSize: 15, color: colors.text }}>
                          {formatMoney(exp.amount)}
                        </p>
                      </div>
                      <button
                        className="btn-ghost"
                        style={{ color: colors.textSecondary, padding: 4 }}
                        onClick={() => handleDelete(exp.id)}
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

          {/* Total */}
          <div
            className="card"
            style={{
              textAlign: 'center',
              background: `linear-gradient(135deg, ${colors.primary}06, ${colors.accent}06)`,
              border: `2px solid ${colors.primary}10`,
            }}
          >
            <p style={{ fontSize: 13, color: colors.textSecondary, fontWeight: 600 }}>Total del ciclo</p>
            <p className="amount-display" style={{ fontSize: 30, fontWeight: 900, color: colors.text, letterSpacing: -1 }}>
              {formatMoney(expenses.reduce((s, e) => s + e.amount, 0))}
            </p>
            <p style={{ fontSize: 13, color: colors.textSecondary }}>
              {expenses.length} gasto{expenses.length !== 1 ? 's' : ''} registrado{expenses.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
