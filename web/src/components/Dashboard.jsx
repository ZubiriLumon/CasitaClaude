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

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ color: colors.text }}>
            {greeting}{profile.displayName ? `, ${profile.displayName}` : ''}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <div className="period-badge" style={{ background: `${colors.primary}12`, color: colors.primary }}>
            <Icon name="Calendar" size={14} />
            {formatPeriod(period.start, period.end)}
          </div>
          <span style={{ fontSize: 13, color: colors.textSecondary, fontWeight: 500 }}>
            {daysLeft} días restantes
          </span>
        </div>
      </div>

      <div className="stack">
        {/* Spending Summary — Hero Card */}
        <div
          className="card"
          style={{
            textAlign: 'center',
            background: colors.gradient,
            color: '#fff',
            padding: '32px 22px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 120, height: 120,
            borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
          }} />
          <div style={{
            position: 'absolute', bottom: -30, left: -20, width: 80, height: 80,
            borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
          }} />
          <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 6, fontWeight: 600 }}>
            Gasto del Ciclo
          </p>
          <p className="amount-display" style={{ fontSize: 42, fontWeight: 900, letterSpacing: -2 }}>
            {formatMoney(totalSpent)}
          </p>
          {budget && (
            <p style={{ fontSize: 13, opacity: 0.75, marginTop: 6 }}>
              de {formatMoney(budget.amount)} presupuestado
            </p>
          )}
        </div>

        {/* Budget Progress */}
        {budget && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>Presupuesto</span>
              <span style={{
                fontSize: 13, fontWeight: 800, color: '#fff',
                background: progressColor, padding: '3px 12px', borderRadius: 999,
              }}>
                {Math.round(budgetPct * 100)}%
              </span>
            </div>
            <div className="progress-track" style={{ height: 14 }}>
              <div
                className="progress-fill"
                style={{ width: `${Math.min(budgetPct * 100, 100)}%`, background: progressColor }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <span style={{ fontSize: 12, color: colors.textSecondary }}>{formatMoney(totalSpent)}</span>
              <span style={{ fontSize: 12, color: colors.textSecondary }}>{formatMoney(budget.amount)}</span>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid-3">
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: `${colors.accent}15`, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 10px',
            }}>
              <Icon name="Star" size={20} color={colors.accent} />
            </div>
            <p style={{ fontWeight: 800, fontSize: 20, color: colors.text }}>Nivel {profile.level}</p>
            <p style={{ fontSize: 11, color: colors.textSecondary, fontWeight: 500 }}>{getLevelTitle(profile.level)}</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: '#F9731615', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 10px',
            }}>
              <Icon name="Flame" size={20} color="#F97316" />
            </div>
            <p style={{ fontWeight: 800, fontSize: 20, color: colors.text }}>{profile.streakDays} días</p>
            <p style={{ fontSize: 11, color: colors.textSecondary, fontWeight: 500 }}>Racha activa</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: `${colors.primary}12`, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 10px',
            }}>
              <Icon name="Zap" size={20} color={colors.primary} />
            </div>
            <p style={{ fontWeight: 800, fontSize: 20, color: colors.text }}>{profile.xp} XP</p>
            <p style={{ fontSize: 11, color: colors.textSecondary, fontWeight: 500 }}>Total</p>
          </div>
        </div>

        {/* Top Categories */}
        <div className="card">
          <p style={{ fontWeight: 700, fontSize: 15, color: colors.text, marginBottom: 16 }}>Top Categorías</p>
          {topCategories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="wiggle" style={{ display: 'inline-block' }}>
                <Icon name="PieChart" size={36} color={`${colors.textSecondary}30`} />
              </div>
              <p style={{ fontSize: 13, color: colors.textSecondary, marginTop: 10 }}>
                Sin gastos en este ciclo
              </p>
            </div>
          ) : (
            topCategories.map(([name, amount], i) => {
              const cat = categories.find((c) => c.name === name);
              const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
              return (
                <div
                  key={name}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                    animation: `slideUp 0.3s ease ${i * 0.05}s both`,
                  }}
                >
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: cat?.color || '#6B7280',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 2px 8px ${cat?.color || '#6B7280'}30`,
                    }}
                  >
                    <Icon name={cat?.icon || 'Circle'} size={16} color="#fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{name}</span>
                    <div style={{ marginTop: 4, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: cat?.color || '#6B7280', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{formatMoney(amount)}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Tips */}
        {tips.length > 0 && (
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: colors.text, marginBottom: 12 }}>Tips del Ciclo</p>
            {tips.slice(0, 3).map((tip, i) => {
              const tipIcon = tip.type === 'warning' ? 'AlertTriangle' : tip.type === 'celebration' ? 'PartyPopper' : tip.type === 'suggestion' ? 'Sparkles' : 'Lightbulb';
              const tipColor = tipColors[tip.type]?.(colors) || colors.primary;
              return (
                <div key={i} className="tip-card" style={{ background: `${tipColor}10`, marginBottom: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: `${tipColor}18`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name={tipIcon} size={16} color={tipColor} />
                  </div>
                  <p style={{ color: colors.text }}>{tip.message}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick add — Empty state */}
        {expenses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div className="wiggle" style={{ display: 'inline-block', marginBottom: 16 }}>
              <Icon name="Wallet" size={48} color={`${colors.primary}40`} />
            </div>
            <p style={{ fontWeight: 600, color: colors.text, marginBottom: 4, fontSize: 16 }}>
              Registra tu primer gasto
            </p>
            <p style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 20 }}>
              Empieza a llevar el control de tus finanzas
            </p>
            <button
              className="btn btn-primary"
              style={{ background: colors.gradient, boxShadow: `0 4px 16px ${colors.primary}30` }}
              onClick={onAddExpense}
            >
              <Icon name="Plus" size={18} />
              Registrar primer gasto
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
