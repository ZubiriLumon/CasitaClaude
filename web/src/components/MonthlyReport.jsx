import useStore from '../store/useStore';
import { t, formatMoney } from '../theme';
import { currentPeriod, previousPeriod, formatPeriod, totalDays } from '../services/periodService';
import { generateTips, tipColors } from '../services/tipsEngine';
import Icon from './Icon';
import { useEffect } from 'react';

export default function MonthlyReport() {
  const { section, profile, getExpensesForPeriod, getCategoriesForSection, getGlobalBudget, getIncomesForPeriod, addXP, updateProfile, checkBadges } = useStore();
  const colors = t(section);
  const categories = getCategoriesForSection();
  const period = currentPeriod(profile.billingCycleStartDay);
  const prevPeriod = previousPeriod(profile.billingCycleStartDay);

  const expenses = getExpensesForPeriod(period.start, period.end);
  const prevExpenses = getExpensesForPeriod(prevPeriod.start, prevPeriod.end);
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const prevTotal = prevExpenses.reduce((s, e) => s + e.amount, 0);
  const budget = getGlobalBudget();

  // XP for viewing report
  useEffect(() => {
    addXP(15);
    updateProfile({ reportsViewed: (profile.reportsViewed || 0) + 1 });
    checkBadges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // Category breakdown
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

  const breakdown = Object.entries(catSpending)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({ name, amount, pct: totalSpent > 0 ? (amount / totalSpent) * 100 : 0 }));

  const topCategory = breakdown[0]?.name || 'N/A';
  const budgetCompliance = budget?.amount > 0 ? totalSpent / budget.amount : 1;
  const underBudget = budgetCompliance <= 1;
  const changeVsPrev = prevTotal > 0 ? ((totalSpent - prevTotal) / prevTotal) * 100 : 0;

  // Income (both sections)
  const incomes = getIncomesForPeriod(period.start, period.end);
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const margin = totalIncome > 0 ? (totalIncome - totalSpent) / totalIncome : null;

  // Tips
  const tips = generateTips({
    section, totalSpent, budgetTotal: budget?.amount || 0, prevTotal,
    categorySpending: catSpending, prevCategorySpending: prevCatSpending,
    daysRemaining: 0, totalDays: totalDays(profile.billingCycleStartDay),
    totalIncome,
  });

  // Insight
  let insight;
  if (section === 'personal') {
    if (budgetCompliance <= 0.8) insight = `Mes excelente. Mantuviste tus gastos bien por debajo del presupuesto. Tu categoría principal fue ${topCategory}.`;
    else if (budgetCompliance <= 1) insight = `Cerraste dentro del presupuesto. ${topCategory} fue tu mayor gasto.`;
    else insight = `Superaste el presupuesto este ciclo. ${topCategory} fue el área de mayor gasto.`;
  } else {
    insight = `Los gastos operativos ${changeVsPrev > 0 ? 'aumentaron' : 'disminuyeron'} ${Math.round(Math.abs(changeVsPrev))}%. La categoría principal fue ${topCategory}.`;
  }

  const compliancePct = Math.min(budgetCompliance, 1);
  const ringColor = underBudget ? colors.success : colors.danger;

  return (
    <div>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <div className="period-badge" style={{ background: `${colors.primary}15`, color: colors.primary, margin: '0 auto 12px' }}>
          <Icon name="CalendarCheck" size={14} />
          {formatPeriod(period.start, period.end)}
        </div>
        <h2 style={{ color: colors.text }}>Cierre de Ciclo</h2>
        <p style={{ color: colors.textSecondary }}>
          {section === 'personal' ? 'Vida Personal' : 'Brownies'}
        </p>
      </div>

      <div className="stack">
        {/* Total Spent */}
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: colors.textSecondary, fontSize: 14 }}>Total Gastado</p>
          <p style={{ fontSize: 36, fontWeight: 800, color: colors.text, margin: '8px 0', letterSpacing: -1 }}>
            {formatMoney(totalSpent)}
          </p>
          {prevTotal > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '5px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500,
              background: changeVsPrev >= 0 ? `${colors.danger}12` : `${colors.success}12`,
              color: changeVsPrev >= 0 ? colors.danger : colors.success,
            }}>
              <Icon name={changeVsPrev >= 0 ? 'TrendingUp' : 'TrendingDown'} size={14} />
              {changeVsPrev >= 0 ? '+' : ''}{changeVsPrev.toFixed(1)}% vs ciclo anterior
            </span>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: colors.text }}>Desglose por Categoría</span>
            <span style={{ fontSize: 12, color: colors.primary }}>Top: {topCategory}</span>
          </div>
          {breakdown.map((item, i) => (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < breakdown.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: colors.primary, color: '#fff', fontSize: 11, fontWeight: 700, opacity: 1 - i * 0.12,
              }}>
                {i + 1}
              </span>
              <span style={{ flex: 1, fontSize: 14, color: colors.text }}>{item.name}</span>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>{formatMoney(item.amount)}</p>
                <p style={{ fontSize: 11, color: colors.textSecondary }}>{item.pct.toFixed(1)}%</p>
              </div>
            </div>
          ))}
          {breakdown.length === 0 && (
            <p style={{ textAlign: 'center', color: colors.textSecondary, padding: 16, fontSize: 13 }}>
              Sin gastos registrados
            </p>
          )}
        </div>

        {/* Income vs Expenses Metrics */}
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: 16, color: colors.text, marginBottom: 16 }}>
            {section === 'business' ? 'Métricas de Negocio' : 'Ingresos vs Gastos'}
          </p>
          <div className="grid-3">
            <div>
              <p style={{ fontSize: 12, color: colors.textSecondary }}>Ingresos</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: colors.success }}>{formatMoney(totalIncome)}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: colors.textSecondary }}>Gastos</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: colors.danger }}>{formatMoney(totalSpent)}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: colors.textSecondary }}>
                {section === 'business' ? 'Margen' : 'Disponible'}
              </p>
              <p style={{ fontSize: 20, fontWeight: 700, color: margin != null && margin > 0 ? colors.success : colors.danger }}>
                {margin != null ? (section === 'business' ? `${(margin * 100).toFixed(1)}%` : formatMoney(totalIncome - totalSpent)) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Budget Compliance Ring */}
        {budget && (
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: 16, color: colors.text, marginBottom: 16 }}>
              Cumplimiento de Presupuesto
            </p>
            <div className="ring-container" style={{ margin: '0 auto' }}>
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="45" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="10" />
                <circle
                  cx="55" cy="55" r="45" fill="none"
                  stroke={ringColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${compliancePct * 283} 283`}
                  transform="rotate(-90 55 55)"
                  style={{ transition: 'stroke-dasharray 0.8s ease' }}
                />
              </svg>
              <div className="ring-text" style={{ color: colors.text }}>
                {Math.round(compliancePct * 100)}%
              </div>
            </div>
            <p style={{ fontWeight: 500, color: ringColor, marginTop: 12 }}>
              {underBudget ? 'Dentro del presupuesto' : 'Presupuesto excedido'}
            </p>
          </div>
        )}

        {/* Insight */}
        <div className="card" style={{ textAlign: 'center' }}>
          <Icon name="Brain" size={28} color={colors.primary} style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, marginBottom: 8 }}>
            Insight del Ciclo
          </p>
          <p style={{ fontSize: 15, color: colors.text, lineHeight: 1.6 }}>{insight}</p>
        </div>

        {/* Tips */}
        {tips.length > 0 && (
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: colors.text, marginBottom: 12 }}>Recomendaciones</p>
            {tips.slice(0, 4).map((tip, i) => {
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
      </div>
    </div>
  );
}
