import SwiftUI
import SwiftData
import Observation

/// ViewModel for monthly report generation
@Observable
final class ReportViewModel {

    var currentReport: MonthlyReport?

    // MARK: - Report Generation

    static func generateReport(
        section: SectionMode,
        startDay: Int,
        categories: [Category],
        context: ModelContext
    ) -> MonthlyReport {
        let period = PeriodService.currentPeriod(startDay: startDay)
        let prevPeriod = PeriodService.previousPeriod(startDay: startDay)

        let currentExpenses = ExpenseViewModel.expenses(for: section, in: period, context: context)
        let previousExpenses = ExpenseViewModel.expenses(for: section, in: prevPeriod, context: context)

        let totalSpent = currentExpenses.reduce(0) { $0 + $1.amount }
        let previousTotal = previousExpenses.reduce(0) { $0 + $1.amount }

        // Category breakdown
        let categoryBreakdown: [(categoryName: String, amount: Double, percentage: Double)] = categories.compactMap { cat in
            let amount = currentExpenses.filter { $0.categoryId == cat.id }.reduce(0) { $0 + $1.amount }
            guard amount > 0 else { return nil }
            let pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0
            return (cat.name, amount, pct)
        }.sorted { $0.amount > $1.amount }

        let topCategory = categoryBreakdown.first?.categoryName ?? "N/A"

        // Budget compliance
        let globalBudget = BudgetViewModel.globalBudget(for: section, context: context)
        let budgetCompliance: Double = {
            guard let budget = globalBudget, budget.amount > 0 else { return 1.0 }
            return totalSpent / budget.amount
        }()

        // Insight generation
        let insight = generateInsight(
            section: section,
            totalSpent: totalSpent,
            previousTotal: previousTotal,
            topCategory: topCategory,
            budgetCompliance: budgetCompliance
        )

        // Business income
        var totalIncome: Double? = nil
        var estimatedMargin: Double? = nil
        if section == .business {
            let sectionRaw = section.rawValue
            let start = period.start
            let end = period.end
            let incomeDescriptor = FetchDescriptor<Income>(
                predicate: #Predicate {
                    $0.section == sectionRaw &&
                    $0.date >= start &&
                    $0.date <= end
                }
            )
            let incomes = (try? context.fetch(incomeDescriptor)) ?? []
            let incomeTotal = incomes.reduce(0) { $0 + $1.amount }
            totalIncome = incomeTotal
            if incomeTotal > 0 {
                estimatedMargin = (incomeTotal - totalSpent) / incomeTotal
            }
        }

        // Tips
        let categorySpending = categoryBreakdown.map { ($0.categoryName, $0.amount) }
        let previousCategorySpending: [(String, Double)] = categories.compactMap { cat in
            let amount = previousExpenses.filter { $0.categoryId == cat.id }.reduce(0) { $0 + $1.amount }
            guard amount > 0 else { return nil }
            return (cat.name, amount)
        }

        let tips = TipsEngine.generateTips(from: TipsEngine.SpendingContext(
            section: section,
            totalSpent: totalSpent,
            budgetTotal: globalBudget?.amount ?? 0,
            previousPeriodTotal: previousTotal,
            categorySpending: categorySpending,
            previousCategorySpending: previousCategorySpending,
            daysRemaining: 0,
            totalDays: PeriodService.totalDays(startDay: startDay),
            totalIncome: totalIncome
        ))

        return MonthlyReport(
            section: section,
            periodStart: period.start,
            periodEnd: period.end,
            totalSpent: totalSpent,
            previousPeriodTotal: previousTotal,
            categoryBreakdown: categoryBreakdown,
            topCategory: topCategory,
            budgetCompliance: budgetCompliance,
            insight: insight,
            tips: tips,
            totalIncome: totalIncome,
            estimatedMargin: estimatedMargin
        )
    }

    // MARK: - Insight Generation

    private static func generateInsight(
        section: SectionMode,
        totalSpent: Double,
        previousTotal: Double,
        topCategory: String,
        budgetCompliance: Double
    ) -> String {
        let change = previousTotal > 0 ? ((totalSpent - previousTotal) / previousTotal) * 100 : 0

        if section == .personal {
            if budgetCompliance <= 0.8 {
                return "Mes excelente. Mantuviste tus gastos bien por debajo del presupuesto. Tu categoría principal fue \(topCategory)."
            } else if budgetCompliance <= 1.0 {
                return "Cerraste dentro del presupuesto. \(topCategory) fue tu mayor gasto. \(change > 0 ? "Los gastos subieron \(Int(change))% vs el ciclo anterior." : "Redujiste gastos respecto al ciclo anterior.")"
            } else {
                return "Superaste el presupuesto este ciclo. \(topCategory) fue el área de mayor gasto. Revisa si puedes ajustar para el próximo periodo."
            }
        } else {
            if let _ = previousTotal > 0 ? change : nil {
                return "Los gastos operativos \(change > 0 ? "aumentaron" : "disminuyeron") \(Int(abs(change)))%. La categoría principal fue \(topCategory)."
            }
            return "Primer ciclo registrado. La categoría principal de gasto fue \(topCategory)."
        }
    }
}
