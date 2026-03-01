import Foundation

/// Analyzes spending patterns and generates contextual financial tips
struct TipsEngine {

    struct SpendingContext {
        let section: SectionMode
        let totalSpent: Double
        let budgetTotal: Double
        let previousPeriodTotal: Double
        let categorySpending: [(name: String, amount: Double)]
        let previousCategorySpending: [(name: String, amount: Double)]
        let daysRemaining: Int
        let totalDays: Int
        let totalIncome: Double? // Business only
    }

    static func generateTips(from context: SpendingContext) -> [FinancialTip] {
        var tips: [FinancialTip] = []

        // Budget utilization analysis
        if context.budgetTotal > 0 {
            let utilization = context.totalSpent / context.budgetTotal
            let dayProgress = Double(context.totalDays - context.daysRemaining) / Double(context.totalDays)

            if utilization > 1.0 {
                tips.append(FinancialTip(
                    message: "Has superado tu presupuesto por \(formatCurrency(context.totalSpent - context.budgetTotal)). Intenta reducir gastos los próximos \(context.daysRemaining) días.",
                    type: .warning,
                    section: context.section,
                    priority: .high
                ))
            } else if utilization > 0.85 {
                tips.append(FinancialTip(
                    message: "Estás al \(Int(utilization * 100))% de tu presupuesto con \(context.daysRemaining) días restantes. ¡Cuidado!",
                    type: .warning,
                    section: context.section,
                    priority: .high
                ))
            } else if utilization < dayProgress * 0.7 {
                tips.append(FinancialTip(
                    message: "¡Excelente control! Vas al \(Int(utilization * 100))% del presupuesto. A este ritmo cerrarás muy por debajo del límite.",
                    type: .celebration,
                    section: context.section,
                    priority: .medium
                ))
            }
        }

        // Period-over-period comparison
        if context.previousPeriodTotal > 0 {
            let change = ((context.totalSpent - context.previousPeriodTotal) / context.previousPeriodTotal) * 100

            if change > 20 {
                tips.append(FinancialTip(
                    message: "Tus gastos aumentaron \(Int(change))% respecto al ciclo anterior. Revisa dónde puedes ajustar.",
                    type: .insight,
                    section: context.section,
                    priority: .medium
                ))
            } else if change < -10 {
                tips.append(FinancialTip(
                    message: "¡Bien hecho! Redujiste tus gastos \(Int(abs(change)))% respecto al ciclo anterior.",
                    type: .celebration,
                    section: context.section,
                    priority: .medium
                ))
            }
        }

        // Category-specific insights
        tips.append(contentsOf: generateCategoryTips(context: context))

        // Business-specific tips
        if context.section == .business, let income = context.totalIncome, income > 0 {
            let margin = (income - context.totalSpent) / income
            if margin < 0.1 {
                tips.append(FinancialTip(
                    message: "Tu margen operativo es del \(Int(margin * 100))%. Considera reducir costos o aumentar ingresos.",
                    type: .warning,
                    section: .business,
                    priority: .high
                ))
            } else if margin > 0.3 {
                tips.append(FinancialTip(
                    message: "Tu margen operativo es saludable (\(Int(margin * 100))%). Buen momento para reinvertir.",
                    type: .celebration,
                    section: .business,
                    priority: .low
                ))
            }
        }

        return tips.sorted { $0.priority > $1.priority }
    }

    // MARK: - Quick Feedback Messages

    static func expenseRegisteredFeedback(totalSpent: Double, budget: Double) -> String {
        guard budget > 0 else { return "Gasto registrado ✓" }
        let ratio = totalSpent / budget

        switch ratio {
        case ..<0.5:
            return "¡Buen control este mes! 👏"
        case 0.5..<0.75:
            return "Gasto registrado. Vas bien este ciclo 💪"
        case 0.75..<0.9:
            return "Registrado. Estás llegando al 90% del presupuesto 📊"
        case 0.9..<1.0:
            return "⚠️ Cuidado, estás muy cerca del límite"
        default:
            return "⚠️ Has superado el presupuesto de este ciclo"
        }
    }

    // MARK: - Private Helpers

    private static func generateCategoryTips(context: SpendingContext) -> [FinancialTip] {
        var tips: [FinancialTip] = []

        for (name, amount) in context.categorySpending {
            let previousAmount = context.previousCategorySpending.first { $0.name == name }?.amount ?? 0

            guard previousAmount > 0 else { continue }
            let change = ((amount - previousAmount) / previousAmount) * 100

            if change > 25 {
                tips.append(FinancialTip(
                    message: "Tus gastos en \(name) aumentaron \(Int(change))% respecto al ciclo anterior.",
                    type: .insight,
                    section: context.section,
                    priority: .medium
                ))
            }
        }

        // Identify top spending category
        if let top = context.categorySpending.max(by: { $0.amount < $1.amount }),
           context.totalSpent > 0 {
            let percentage = (top.amount / context.totalSpent) * 100
            if percentage > 40 {
                tips.append(FinancialTip(
                    message: "\(top.name) representa el \(Int(percentage))% de tu gasto total. ¿Puedes diversificar?",
                    type: .suggestion,
                    section: context.section,
                    priority: .low
                ))
            }
        }

        return tips
    }

    private static func formatCurrency(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "es_MX")
        return formatter.string(from: NSNumber(value: value)) ?? "$\(value)"
    }
}
