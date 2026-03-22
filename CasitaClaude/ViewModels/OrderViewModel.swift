import Foundation
import SwiftData
import SwiftUI

/// ViewModel for managing pending orders (pedidos por adelantado)
@Observable
final class OrderViewModel {

    // MARK: - Form State

    var showAddOrder: Bool = false
    var customerName: String = ""
    var deliveryDate: Date = Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date()
    var orderDescription: String = ""
    var notes: String = ""
    var isPaid: Bool = false
    var totalAmount: String = ""

    var canSave: Bool {
        !customerName.trimmingCharacters(in: .whitespaces).isEmpty
        && !orderDescription.trimmingCharacters(in: .whitespaces).isEmpty
    }

    // MARK: - Actions

    func saveOrder(context: ModelContext) {
        guard canSave else { return }
        let order = PendingOrder(
            customerName: customerName.trimmingCharacters(in: .whitespaces),
            deliveryDate: deliveryDate,
            orderDescription: orderDescription.trimmingCharacters(in: .whitespaces),
            isPaid: isPaid,
            notes: notes.trimmingCharacters(in: .whitespaces),
            totalAmount: Double(totalAmount) ?? 0
        )
        context.insert(order)
        try? context.save()
        resetForm()
    }

    func togglePaid(order: PendingOrder, context: ModelContext) {
        order.isPaid.toggle()
        try? context.save()
    }

    func markDelivered(order: PendingOrder, context: ModelContext) {
        order.isDelivered = true
        try? context.save()
    }

    func deleteOrder(order: PendingOrder, context: ModelContext) {
        context.delete(order)
        try? context.save()
    }

    func resetForm() {
        customerName = ""
        deliveryDate = Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date()
        orderDescription = ""
        notes = ""
        isPaid = false
        totalAmount = ""
        showAddOrder = false
    }

    // MARK: - Queries

    /// All pending (not delivered) orders, sorted by delivery date
    static func pendingOrders(context: ModelContext) -> [PendingOrder] {
        let descriptor = FetchDescriptor<PendingOrder>(
            predicate: #Predicate { !$0.isDelivered },
            sortBy: [SortDescriptor(\.deliveryDate)]
        )
        return (try? context.fetch(descriptor)) ?? []
    }

    /// All delivered orders
    static func deliveredOrders(context: ModelContext) -> [PendingOrder] {
        let descriptor = FetchDescriptor<PendingOrder>(
            predicate: #Predicate { $0.isDelivered },
            sortBy: [SortDescriptor(\.deliveryDate, order: .reverse)]
        )
        return (try? context.fetch(descriptor)) ?? []
    }

    /// Count of overdue orders
    static func overdueCount(context: ModelContext) -> Int {
        let now = Date()
        let descriptor = FetchDescriptor<PendingOrder>(
            predicate: #Predicate { !$0.isDelivered && $0.deliveryDate < now }
        )
        return (try? context.fetch(descriptor))?.count ?? 0
    }

    /// Total expected revenue from unpaid pending orders
    static func pendingRevenue(context: ModelContext) -> Double {
        pendingOrders(context: context)
            .filter { !$0.isPaid }
            .reduce(0) { $0 + $1.totalAmount }
    }
}
