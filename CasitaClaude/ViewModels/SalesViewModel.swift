import Foundation
import SwiftData
import SwiftUI

/// ViewModel for the Point of Sale (POS) system
/// Handles cart management, pricing with 2x$55 discount, and sale completion
@Observable
final class SalesViewModel {

    // MARK: - Cart State

    var cartItems: [BrownieFlavor: Int] = [:]
    var showConfirmation: Bool = false
    var lastSaleTotal: Double = 0

    // MARK: - Cart Computed Properties

    /// Total brownies in cart
    var totalBrowniesInCart: Int {
        cartItems.values.reduce(0, +)
    }

    /// Cart total using discount formula: (total/2)*55 + (total%2)*30
    var cartTotal: Double {
        let total = totalBrowniesInCart
        let pairs = total / 2
        let remainder = total % 2
        return Double(pairs) * 55.0 + Double(remainder) * 30.0
    }

    /// Production cost at $13/unit
    var cartCost: Double {
        Double(totalBrowniesInCart) * 13.0
    }

    /// Net profit if sale completes
    var cartProfit: Double {
        cartTotal - cartCost
    }

    /// Price per unit considering discount
    var effectivePricePerUnit: Double {
        guard totalBrowniesInCart > 0 else { return 30.0 }
        return cartTotal / Double(totalBrowniesInCart)
    }

    /// How many are at $55/pair vs $30 single
    var pairsCount: Int { totalBrowniesInCart / 2 }
    var singlesCount: Int { totalBrowniesInCart % 2 }

    /// Discount saved by customer
    var discountSaved: Double {
        let fullPrice = Double(totalBrowniesInCart) * 30.0
        return fullPrice - cartTotal
    }

    var isCartEmpty: Bool { totalBrowniesInCart == 0 }

    // MARK: - Cart Actions

    func addToCart(flavor: BrownieFlavor) {
        cartItems[flavor, default: 0] += 1
    }

    func removeFromCart(flavor: BrownieFlavor) {
        guard let current = cartItems[flavor], current > 0 else { return }
        if current == 1 {
            cartItems.removeValue(forKey: flavor)
        } else {
            cartItems[flavor] = current - 1
        }
    }

    func quantityInCart(for flavor: BrownieFlavor) -> Int {
        cartItems[flavor] ?? 0
    }

    func clearCart() {
        cartItems = [:]
    }

    // MARK: - Complete Sale

    /// Completes the sale: creates Sale record, deducts stock, records income
    func completeSale(context: ModelContext) {
        guard !isCartEmpty else { return }

        // Build sale items
        let items = cartItems.compactMap { (flavor, qty) -> SaleItem? in
            guard qty > 0 else { return nil }
            return SaleItem(flavor: flavor, quantity: qty)
        }

        // Create and persist the sale
        let sale = Sale(items: items)
        context.insert(sale)

        // Deduct stock from inventory
        for (flavor, qty) in cartItems {
            deductStock(flavor: flavor, quantity: qty, context: context)
        }

        // Also record as Income for existing report system
        let income = Income(
            amount: sale.totalAmount,
            incomeDescription: "Venta: \(sale.totalBrownies) brownies",
            source: "Venta POS"
        )
        context.insert(income)

        try? context.save()

        // Show confirmation
        lastSaleTotal = sale.totalAmount
        showConfirmation = true
        clearCart()
    }

    private func deductStock(flavor: BrownieFlavor, quantity: Int, context: ModelContext) {
        let flavorRaw = flavor.rawValue
        let descriptor = FetchDescriptor<BrownieProduct>(
            predicate: #Predicate { $0.flavor == flavorRaw }
        )
        guard let product = try? context.fetch(descriptor).first else { return }
        product.stock = max(0, product.stock - quantity)
    }

    // MARK: - Query Helpers

    /// Today's sales
    static func todaySales(context: ModelContext) -> [Sale] {
        let startOfDay = Calendar.current.startOfDay(for: Date())
        let descriptor = FetchDescriptor<Sale>(
            predicate: #Predicate { $0.date >= startOfDay },
            sortBy: [SortDescriptor(\.date, order: .reverse)]
        )
        return (try? context.fetch(descriptor)) ?? []
    }

    /// Sales for a given month
    static func salesForMonth(year: Int, month: Int, context: ModelContext) -> [Sale] {
        var components = DateComponents()
        components.year = year
        components.month = month
        components.day = 1
        guard let start = Calendar.current.date(from: components),
              let end = Calendar.current.date(byAdding: .month, value: 1, to: start) else {
            return []
        }
        let descriptor = FetchDescriptor<Sale>(
            predicate: #Predicate { $0.date >= start && $0.date < end },
            sortBy: [SortDescriptor(\.date, order: .reverse)]
        )
        return (try? context.fetch(descriptor)) ?? []
    }

    /// Total revenue for today
    static func todayRevenue(context: ModelContext) -> Double {
        todaySales(context: context).reduce(0) { $0 + $1.totalAmount }
    }

    /// Total profit for today (revenue - production cost)
    static func todayProfit(context: ModelContext) -> Double {
        todaySales(context: context).reduce(0) { $0 + $1.profit }
    }

    /// Total brownies sold today
    static func todayBrowniesSold(context: ModelContext) -> Int {
        todaySales(context: context).reduce(0) { $0 + $1.totalBrownies }
    }
}
