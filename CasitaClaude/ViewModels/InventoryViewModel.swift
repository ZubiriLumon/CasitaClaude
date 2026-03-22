import Foundation
import SwiftData
import SwiftUI

/// ViewModel for inventory management and raw material expenses
@Observable
final class InventoryViewModel {

    // MARK: - Expense Form State

    var showAddExpense: Bool = false
    var expenseAmount: String = ""
    var expenseCategory: RawMaterialCategory = .harina
    var expenseDescription: String = ""
    var expenseDate: Date = Date()

    // MARK: - Restock Form State

    var showRestock: Bool = false
    var restockFlavor: BrownieFlavor = .tripleChocolate
    var restockQuantity: String = ""

    // MARK: - Stock Queries

    /// Fetch all brownie products
    static func allProducts(context: ModelContext) -> [BrownieProduct] {
        let descriptor = FetchDescriptor<BrownieProduct>(
            sortBy: [SortDescriptor(\.flavor)]
        )
        return (try? context.fetch(descriptor)) ?? []
    }

    /// Products with low stock (< 5 units)
    static func lowStockProducts(context: ModelContext) -> [BrownieProduct] {
        let threshold = 5
        let descriptor = FetchDescriptor<BrownieProduct>(
            predicate: #Predicate { $0.stock < threshold }
        )
        return (try? context.fetch(descriptor)) ?? []
    }

    /// Total stock across all flavors
    static func totalStock(context: ModelContext) -> Int {
        allProducts(context: context).reduce(0) { $0 + $1.stock }
    }

    // MARK: - Stock Actions

    func restockProduct(context: ModelContext) {
        guard let qty = Int(restockQuantity), qty > 0 else { return }
        let flavorRaw = restockFlavor.rawValue
        let descriptor = FetchDescriptor<BrownieProduct>(
            predicate: #Predicate { $0.flavor == flavorRaw }
        )
        guard let product = try? context.fetch(descriptor).first else { return }
        product.stock += qty
        product.lastRestocked = Date()
        try? context.save()
        resetRestockForm()
    }

    func resetRestockForm() {
        restockQuantity = ""
        showRestock = false
    }

    // MARK: - Raw Material Expense Actions

    func saveExpense(context: ModelContext) {
        guard let amount = Double(expenseAmount), amount > 0 else { return }
        let expense = RawMaterialExpense(
            amount: amount,
            category: expenseCategory,
            expenseDescription: expenseDescription,
            date: expenseDate
        )
        context.insert(expense)

        // Also record as a business Expense for the existing report system
        let categories = (try? context.fetch(FetchDescriptor<Category>())) ?? []
        let materiaCat = categories.first { $0.name == "Materia prima" && $0.sectionMode == .business }
        if let catId = materiaCat?.id {
            let businessExpense = Expense(
                amount: amount,
                expenseDescription: "Materia prima: \(expenseCategory.rawValue)",
                categoryId: catId,
                section: .business
            )
            context.insert(businessExpense)
        }

        try? context.save()
        resetExpenseForm()
    }

    func resetExpenseForm() {
        expenseAmount = ""
        expenseCategory = .harina
        expenseDescription = ""
        expenseDate = Date()
        showAddExpense = false
    }

    // MARK: - Expense Queries

    /// All raw material expenses for the current month
    static func currentMonthExpenses(context: ModelContext) -> [RawMaterialExpense] {
        let calendar = Calendar.current
        let now = Date()
        let start = calendar.date(from: calendar.dateComponents([.year, .month], from: now))!
        let end = calendar.date(byAdding: .month, value: 1, to: start)!
        let descriptor = FetchDescriptor<RawMaterialExpense>(
            predicate: #Predicate { $0.date >= start && $0.date < end },
            sortBy: [SortDescriptor(\.date, order: .reverse)]
        )
        return (try? context.fetch(descriptor)) ?? []
    }

    /// Total raw material spending this month
    static func currentMonthTotal(context: ModelContext) -> Double {
        currentMonthExpenses(context: context).reduce(0) { $0 + $1.amount }
    }

    /// Spending breakdown by material category this month
    static func spendingByCategory(context: ModelContext) -> [(category: RawMaterialCategory, total: Double)] {
        let expenses = currentMonthExpenses(context: context)
        var grouped: [String: Double] = [:]
        for expense in expenses {
            grouped[expense.materialCategory, default: 0] += expense.amount
        }
        return grouped.compactMap { key, value in
            guard let cat = RawMaterialCategory(rawValue: key) else { return nil }
            return (category: cat, total: value)
        }.sorted { $0.total > $1.total }
    }
}
