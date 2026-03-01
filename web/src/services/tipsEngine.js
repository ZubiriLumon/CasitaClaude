import { formatMoney } from '../theme';

export function generateTips({ section, totalSpent, budgetTotal, prevTotal, categorySpending, prevCategorySpending, daysRemaining: daysRem, totalDays: totDays, totalIncome }) {
  const tips = [];

  // Budget utilization
  if (budgetTotal > 0) {
    const util = totalSpent / budgetTotal;
    const dayProgress = (totDays - daysRem) / totDays;

    if (util > 1.0) {
      tips.push({ message: `Has superado tu presupuesto por ${formatMoney(totalSpent - budgetTotal)}. Intenta reducir gastos los próximos ${daysRem} días.`, type: 'warning', priority: 2 });
    } else if (util > 0.85) {
      tips.push({ message: `Estás al ${Math.round(util * 100)}% de tu presupuesto con ${daysRem} días restantes. ¡Cuidado!`, type: 'warning', priority: 2 });
    } else if (util < dayProgress * 0.7 && util > 0) {
      tips.push({ message: `¡Excelente control! Vas al ${Math.round(util * 100)}% del presupuesto. A este ritmo cerrarás muy por debajo del límite.`, type: 'celebration', priority: 1 });
    }
  }

  // Period comparison
  if (prevTotal > 0) {
    const change = ((totalSpent - prevTotal) / prevTotal) * 100;
    if (change > 20) {
      tips.push({ message: `Tus gastos aumentaron ${Math.round(change)}% respecto al ciclo anterior. Revisa dónde puedes ajustar.`, type: 'insight', priority: 1 });
    } else if (change < -10) {
      tips.push({ message: `¡Bien hecho! Redujiste tus gastos ${Math.round(Math.abs(change))}% respecto al ciclo anterior.`, type: 'celebration', priority: 1 });
    }
  }

  // Category insights
  for (const [name, amount] of Object.entries(categorySpending || {})) {
    const prev = (prevCategorySpending || {})[name] || 0;
    if (prev > 0) {
      const change = ((amount - prev) / prev) * 100;
      if (change > 25) {
        tips.push({ message: `Tus gastos en ${name} aumentaron ${Math.round(change)}% respecto al ciclo anterior.`, type: 'insight', priority: 1 });
      }
    }
  }

  // Top category concentration
  const entries = Object.entries(categorySpending || {});
  if (entries.length > 0 && totalSpent > 0) {
    const top = entries.sort((a, b) => b[1] - a[1])[0];
    const pct = (top[1] / totalSpent) * 100;
    if (pct > 40) {
      tips.push({ message: `${top[0]} representa el ${Math.round(pct)}% de tu gasto total. ¿Puedes diversificar?`, type: 'suggestion', priority: 0 });
    }
  }

  // Business margin
  if (section === 'business' && totalIncome > 0) {
    const margin = (totalIncome - totalSpent) / totalIncome;
    if (margin < 0.1) {
      tips.push({ message: `Tu margen operativo es del ${Math.round(margin * 100)}%. Considera reducir costos o aumentar ingresos.`, type: 'warning', priority: 2 });
    } else if (margin > 0.3) {
      tips.push({ message: `Tu margen operativo es saludable (${Math.round(margin * 100)}%). Buen momento para reinvertir.`, type: 'celebration', priority: 0 });
    }
  }

  return tips.sort((a, b) => b.priority - a.priority);
}

export function expenseFeedback(totalSpent, budget) {
  if (!budget || budget <= 0) return 'Gasto registrado ✓';
  const ratio = totalSpent / budget;
  if (ratio < 0.5) return '¡Buen control este mes! 👏';
  if (ratio < 0.75) return 'Gasto registrado. Vas bien este ciclo 💪';
  if (ratio < 0.9) return 'Registrado. Estás llegando al 90% del presupuesto 📊';
  if (ratio < 1.0) return '⚠️ Cuidado, estás muy cerca del límite';
  return '⚠️ Has superado el presupuesto de este ciclo';
}

export const tipIcons = {
  insight: 'Lightbulb',
  warning: 'AlertTriangle',
  celebration: 'PartyPopper',
  suggestion: 'Sparkles',
};

export const tipColors = {
  insight: (t) => t.primary,
  warning: (t) => t.warning,
  celebration: (t) => t.success,
  suggestion: (t) => t.accent,
};
