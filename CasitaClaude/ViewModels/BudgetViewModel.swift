import SwiftUI
import SwiftData
import Observation

/// ViewModel for budget/limit management
@Observable
final class BudgetViewModel {

    var editingBudgetId: UUID?
    var editAmount: String = ""

    // MARK: - Queries

    static func budgets(for section: SectionMode, context: ModelContext) -> [Budget] {
        let sectionRaw = section.rawValue
        let descriptor = FetchDescriptor<Budget>(
            predicate: #Predicate { $0.section == sectionRaw && $0.isActive },
            sortBy: [SortDescriptor(\.amount, order: .reverse)]
        )
        return (try? context.fetch(descriptor)) ?? []
    }

    static func globalBudget(for section: SectionMode, context: ModelContext) -> Budget? {
        budgets(for: section, context: context).first { $0.isGlobalBudget }
    }

    static func categoryBudget(for categoryId: UUID, section: SectionMode, context: ModelContext) -> Budget? {
        budgets(for: section, context: context).first { $0.categoryId == categoryId }
    }

    // MARK: - Budget Progress

    struct BudgetProgress: Identifiable {
        let id = UUID()
        let categoryName: String
        let categoryIcon: String
        let categoryColorHex: String
        let budgetAmount: Double
        let spentAmount: Double
        let isGlobal: Bool

        var percentage: Double {
            guard budgetAmount > 0 else { return 0 }
            return spentAmount / budgetAmount
        }

        var remaining: Double {
            max(0, budgetAmount - spentAmount)
        }

        var isOverBudget: Bool {
            spentAmount > budgetAmount
        }

        var isNearLimit: Bool {
            percentage >= 0.85 && !isOverBudget
        }

        var statusColor: String {
            if isOverBudget { return "EF4444" }
            if isNearLimit { return "F59E0B" }
            return "10B981"
        }
    }

    static func allProgress(
        for section: SectionMode,
        categories: [Category],
        period: (start: Date, end: Date),
        context: ModelContext
    ) -> [BudgetProgress] {
        let budgets = budgets(for: section, context: context)
        let expenses = ExpenseViewModel.expenses(for: section, in: period, context: context)
        var progressList: [BudgetProgress] = []

        // Global budget
        if let global = budgets.first(where: { $0.isGlobalBudget }) {
            let totalSpent = expenses.reduce(0) { $0 + $1.amount }
            progressList.append(BudgetProgress(
                categoryName: "Presupuesto Total",
                categoryIcon: "chart.pie.fill",
                categoryColorHex: section == .personal ? "6C63FF" : "0F766E",
                budgetAmount: global.amount,
                spentAmount: totalSpent,
                isGlobal: true
            ))
        }

        // Category budgets
        for budget in budgets where budget.categoryId != nil {
            guard let category = categories.first(where: { $0.id == budget.categoryId }) else { continue }
            let spent = expenses
                .filter { $0.categoryId == category.id }
                .reduce(0) { $0 + $1.amount }

            progressList.append(BudgetProgress(
                categoryName: category.name,
                categoryIcon: category.icon,
                categoryColorHex: category.colorHex,
                budgetAmount: budget.amount,
                spentAmount: spent,
                isGlobal: false
            ))
        }

        return progressList
    }

    // MARK: - CRUD

    func saveBudget(
        categoryId: UUID?,
        amount: Double,
        section: SectionMode,
        context: ModelContext
    ) {
        // Remove existing budget for same category/global
        let existing = BudgetViewModel.budgets(for: section, context: context)
        if let old = existing.first(where: { $0.categoryId == categoryId }) {
            context.delete(old)
        }

        let budget = Budget(
            categoryId: categoryId,
            amount: amount,
            section: section
        )
        context.insert(budget)
        try? context.save()
    }

    func deleteBudget(_ budget: Budget, context: ModelContext) {
        context.delete(budget)
        try? context.save()
    }
}
