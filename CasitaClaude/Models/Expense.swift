import Foundation
import SwiftData

@Model
final class Expense {
    var id: UUID
    var amount: Double
    var expenseDescription: String
    var date: Date
    var categoryId: UUID
    var paymentMethod: PaymentMethod
    var tags: [String]
    var section: String // "personal" or "business"
    var createdAt: Date

    init(
        id: UUID = UUID(),
        amount: Double,
        expenseDescription: String = "",
        date: Date = Date(),
        categoryId: UUID,
        paymentMethod: PaymentMethod = .cash,
        tags: [String] = [],
        section: SectionMode = .personal
    ) {
        self.id = id
        self.amount = amount
        self.expenseDescription = expenseDescription
        self.date = date
        self.categoryId = categoryId
        self.paymentMethod = paymentMethod
        self.tags = tags
        self.section = section.rawValue
        self.createdAt = Date()
    }

    var sectionMode: SectionMode {
        SectionMode(rawValue: section) ?? .personal
    }
}

// MARK: - Payment Method

enum PaymentMethod: String, Codable, CaseIterable, Identifiable {
    case cash = "Efectivo"
    case debitCard = "Débito"
    case creditCard = "Crédito"
    case transfer = "Transferencia"
    case digitalWallet = "Wallet Digital"
    case other = "Otro"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .cash: return "banknote"
        case .debitCard: return "creditcard"
        case .creditCard: return "creditcard.fill"
        case .transfer: return "arrow.left.arrow.right"
        case .digitalWallet: return "iphone"
        case .other: return "ellipsis.circle"
        }
    }
}
