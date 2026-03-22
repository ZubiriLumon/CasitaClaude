import Foundation
import SwiftData

// MARK: - Sale

@Model
final class Sale {
    var id: UUID
    var date: Date
    var totalAmount: Double
    var totalCost: Double
    var itemsData: Data?

    init(
        id: UUID = UUID(),
        date: Date = Date(),
        items: [SaleItem] = []
    ) {
        self.id = id
        self.date = date
        self.totalAmount = Sale.calculateTotal(items: items)
        self.totalCost = Sale.calculateCost(items: items)
        self.itemsData = try? JSONEncoder().encode(items)
    }

    /// Decoded sale items
    var items: [SaleItem] {
        guard let data = itemsData else { return [] }
        return (try? JSONDecoder().decode([SaleItem].self, from: data)) ?? []
    }

    /// Total brownie count in this sale
    var totalBrownies: Int {
        items.reduce(0) { $0 + $1.quantity }
    }

    /// Net profit for this sale
    var profit: Double {
        totalAmount - totalCost
    }

    // MARK: - Pricing Logic

    /// Formula: (total / 2) * 55 + (total % 2) * 30
    /// 2x$55 promo applies to any flavor combination
    static func calculateTotal(items: [SaleItem]) -> Double {
        let totalUnits = items.reduce(0) { $0 + $1.quantity }
        let pairs = totalUnits / 2
        let remainder = totalUnits % 2
        return Double(pairs) * 55.0 + Double(remainder) * 30.0
    }

    /// Production cost: $13 per unit
    static func calculateCost(items: [SaleItem], costPerUnit: Double = 8.0) -> Double {
        let totalUnits = items.reduce(0) { $0 + $1.quantity }
        return Double(totalUnits) * costPerUnit
    }
}

// MARK: - Sale Item (Codable, stored as JSON in Sale)

struct SaleItem: Codable, Identifiable, Hashable {
    var id: UUID
    var flavor: String
    var quantity: Int

    init(id: UUID = UUID(), flavor: BrownieFlavor, quantity: Int) {
        self.id = id
        self.flavor = flavor.rawValue
        self.quantity = quantity
    }

    var brownieFlavor: BrownieFlavor {
        BrownieFlavor(rawValue: flavor) ?? .tripleChocolate
    }
}
