import SwiftUI
import SwiftData
import Observation

/// ViewModel for expense registration and management
@Observable
final class ExpenseViewModel {

    // MARK: - New Expense State (3-step flow)
    var step: Int = 1
    var amount: String = ""
    var selectedCategoryId: UUID?
    var expenseDescription: String = ""
    var selectedDate: Date = Date()
    var selectedPaymentMethod: PaymentMethod = .cash
    var tags: [String] = []
    var newTag: String = ""

    // MARK: - Computed

    var amountValue: Double {
        Double(amount.replacingOccurrences(of: ",", with: ".")) ?? 0
    }

    var canProceedStep1: Bool {
        amountValue > 0
    }

    var canProceedStep2: Bool {
        selectedCategoryId != nil
    }

    var canSave: Bool {
        canProceedStep1 && canProceedStep2
    }

    // MARK: - Navigation

    func nextStep() {
        withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
            step = min(step + 1, 3)
        }
    }

    func previousStep() {
        withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
            step = max(step - 1, 1)
        }
    }

    func reset() {
        step = 1
        amount = ""
        selectedCategoryId = nil
        expenseDescription = ""
        selectedDate = Date()
        selectedPaymentMethod = .cash
        tags = []
        newTag = ""
    }

    // MARK: - Tag Management

    func addTag() {
        let trimmed = newTag.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, !tags.contains(trimmed) else { return }
        tags.append(trimmed)
        newTag = ""
    }

    func removeTag(_ tag: String) {
        tags.removeAll { $0 == tag }
    }

    // MARK: - Persistence

    func saveExpense(section: SectionMode, context: ModelContext) -> Expense? {
        guard canSave, let categoryId = selectedCategoryId else { return nil }

        let expense = Expense(
            amount: amountValue,
            expenseDescription: expenseDescription,
            date: selectedDate,
            categoryId: categoryId,
            paymentMethod: selectedPaymentMethod,
            tags: tags,
            section: section
        )

        context.insert(expense)
        try? context.save()
        return expense
    }

    // MARK: - Queries

    static func expenses(
        for section: SectionMode,
        in range: (start: Date, end: Date),
        context: ModelContext
    ) -> [Expense] {
        let sectionRaw = section.rawValue
        let start = range.start
        let end = range.end
        let descriptor = FetchDescriptor<Expense>(
            predicate: #Predicate {
                $0.section == sectionRaw &&
                $0.date >= start &&
                $0.date <= end
            },
            sortBy: [SortDescriptor(\.date, order: .reverse)]
        )
        return (try? context.fetch(descriptor)) ?? []
    }

    static func totalSpent(
        for section: SectionMode,
        in range: (start: Date, end: Date),
        context: ModelContext
    ) -> Double {
        expenses(for: section, in: range, context: context)
            .reduce(0) { $0 + $1.amount }
    }

    static func spendingByCategory(
        for section: SectionMode,
        in range: (start: Date, end: Date),
        categories: [Category],
        context: ModelContext
    ) -> [(category: Category, amount: Double)] {
        let allExpenses = expenses(for: section, in: range, context: context)
        return categories.compactMap { cat in
            let total = allExpenses
                .filter { $0.categoryId == cat.id }
                .reduce(0) { $0 + $1.amount }
            guard total > 0 else { return nil }
            return (cat, total)
        }.sorted { $0.amount > $1.amount }
    }
}
