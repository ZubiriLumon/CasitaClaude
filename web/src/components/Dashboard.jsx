import useStore from '../store/useStore';
import { t, formatMoney, getLevelTitle } from '../theme';
import { currentPeriod, previousPeriod, formatPeriod, daysRemaining, totalDays } from '../services/periodService';
import { generateTips, tipColors } from '../services/tipsEngine';
import Icon from './Icon';

export default function Dashboard({ onAddExpense }) {
  const { section, profile, getExpensesForPeriod, getCategoriesForSection, getGlobalBudget } = useStore();
  const colors = t(section);
  const period = currentPeriod(profile.billingCycleStartDay);
  const prevPeriod = previousPeriod(profile.billingCycleStartDay);

  const expenses = getExpensesForPeriod(period.start, period.end);
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const categories = getCategoriesForSection();
  const budget = getGlobalBudget();
  const daysLeft = daysRemaining(profile.billingCycleStartDay);
  const totDays = totalDays(profile.billingCycleStartDay);

  // Previous period
  const prevExpenses = getExpensesForPeriod(prevPeriod.start, prevPeriod.end);
  const prevTotal = prevExpenses.reduce((s, e) => s + e.amount, 0);

  // Category spending
  const catSpending = {};
  const prevCatSpending = {};
  expenses.forEach((e) => {
    const cat = categories.find((c) => c.id === e.categoryId);
    if (cat) catSpending[cat.name] = (catSpending[cat.name] || 0) + e.amount;
  });
  prevExpenses.forEach((e) => {
    const cat = categories.find((c) => c.id === e.categoryId);
    if (cat) prevCatSpending[cat.name] = (prevCatSpending[cat.name] || 0) + e.amount;
  });

  const topCategories = Object.entries(catSpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const tips = generateTips({
    section, totalSpent,
    budgetTotal: budget?.amount || 0,
    prevTotal,
    categorySpending: catSpending,
    prevCategorySpending: prevCatSpending,
    daysRemaining: daysLeft,
    totalDays: totDays,
  });

  const budgetPct = budget?.amount > 0 ? totalSpent / budget.amount : 0;
  const progressColor = budgetPct > 1 ? colors.danger : budgetPct > 0.85 ? colors.warning : colors.success;

  return (
    <div>
      <div className="page-header">
        <h2 style={{ color: colors.text }}>
          {section === 'personal' ? 'Vida Personal' : 'Negocios'}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <div className="period-badge" style={{ background: `${colors.primary}15`, color: colors.primary }}>
            <Icon name="Calendar" size={14} />
            {formatPeriod(period.start, period.end)}
          </div>
          <span style={{ fontSize: 13, color: colors.textSecondary }}>{daysLeft} días restantes</span>
        </div>
      </div>

      <div className="stack">
        {/* Spending Summary */}
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 8 }}>Gasto del Ciclo</p>
          <p style={{ fontSize: 36, fontWeight: 800, color: colors.text, letterSpacing: -1 }}>
            {formatMoney(totalSpent)}
          </p>
          {budget && (
            <p style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
              de {formatMoney(budget.amount)} presupuestado
            </p>
          )}
        </div>

        {/* Budget Progress */}
        {budget && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Presupuesto</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: progressColor }}>
                {Math.round(budgetPct * 100)}%
              </span>
            </div>
            <div className="progress-track" style={{ height: 12 }}>
              <div
                className="progress-fill"
                style={{ width: `${Math.min(budgetPct * 100, 100)}%`, background: progressColor }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: colors.textSecondary }}>{formatMoney(totalSpent)}</span>
              <span style={{ fontSize: 12, color: colors.textSecondary }}>{formatMoney(budget.amount)}</span>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid-3">
          <div className="card" style={{ textAlign: 'center' }}>
            <Icon name="Star" size={22} color={colors.accent} style={{ margin: '0 auto 6px' }} />
            <p style={{ fontWeight: 700, fontSize: 18, color: colors.text }}>Nivel {profile.level}</p>
            <p style={{ fontSize: 11, color: colors.textSecondary }}>{getLevelTitle(profile.level)}</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <Icon name="Flame" size={22} color="#F97316" style={{ margin: '0 auto 6px' }} />
            <p style={{ fontWeight: 700, fontSize: 18, color: colors.text }}>{profile.streakDays} días</p>
            <p style={{ fontSize: 11, color: colors.textSecondary }}>Racha activa</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <Icon name="Zap" size={22} color={colors.primary} style={{ margin: '0 auto 6px' }} />
            <p style={{ fontWeight: 700, fontSize: 18, color: colors.text }}>{profile.xp} XP</p>
            <p style={{ fontSize: 11, color: colors.textSecondary }}>Total</p>
          </div>
        </div>

        {/* Top Categories */}
        <div className="card">
          <p style={{ fontWeight: 600, fontSize: 14, color: colors.text, marginBottom: 14 }}>Top Categorías</p>
          {topCategories.length === 0 ? (
            <p style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', padding: '16px 0' }}>
              Sin gastos en este ciclo
            </p>
          ) : (
            topCategories.map(([name, amount]) => {
              const cat = categories.find((c) => c.name === name);
              return (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: cat?.color || '#6B7280',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Icon name={cat?.icon || 'Circle'} size={16} color="#fff" />
                  </div>
                  <span style={{ fontSize: 14, color: colors.text, flex: 1 }}>{name}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{formatMoney(amount)}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Tips */}
        {tips.length > 0 && (
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, color: colors.text, marginBottom: 12 }}>Tips del Ciclo</p>
            {tips.slice(0, 3).map((tip, i) => {
              const tipIcon = tip.type === 'warning' ? 'AlertTriangle' : tip.type === 'celebration' ? 'PartyPopper' : tip.type === 'suggestion' ? 'Sparkles' : 'Lightbulb';
              const tipColor = tipColors[tip.type]?.(colors) || colors.primary;
              return (
                <div key={i} className="tip-card" style={{ background: `${tipColor}10`, marginBottom: 8 }}>
                  <Icon name={tipIcon} size={18} color={tipColor} />
                  <p style={{ color: colors.text }}>{tip.message}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick add */}
        {expenses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <button className="btn btn-primary" style={{ background: colors.primary }} onClick={onAddExpense}>
              <Icon name="Plus" size={18} />
              Registrar primer gasto
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
