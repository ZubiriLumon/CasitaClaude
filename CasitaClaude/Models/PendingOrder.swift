import Foundation
import SwiftData

// MARK: - Pending Order (Pedido por Adelantado)

@Model
final class PendingOrder {
    var id: UUID
    var customerName: String
    var deliveryDate: Date
    var orderDescription: String
    var isPaid: Bool
    var isDelivered: Bool
    var notes: String
    var totalAmount: Double
    var createdAt: Date

    init(
        id: UUID = UUID(),
        customerName: String,
        deliveryDate: Date,
        orderDescription: String = "",
        isPaid: Bool = false,
        isDelivered: Bool = false,
        notes: String = "",
        totalAmount: Double = 0
    ) {
        self.id = id
        self.customerName = customerName
        self.deliveryDate = deliveryDate
        self.orderDescription = orderDescription
        self.isPaid = isPaid
        self.isDelivered = isDelivered
        self.notes = notes
        self.totalAmount = totalAmount
        self.createdAt = Date()
    }

    /// Order is overdue if delivery date has passed and not delivered
    var isOverdue: Bool {
        !isDelivered && deliveryDate < Date()
    }

    /// Days until delivery
    var daysUntilDelivery: Int {
        Calendar.current.dateComponents([.day], from: Date(), to: deliveryDate).day ?? 0
    }
}
