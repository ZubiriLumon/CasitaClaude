import Foundation
import SwiftData

// MARK: - Brownie Flavor

enum BrownieFlavor: String, Codable, CaseIterable, Identifiable {
    case tripleChocolate = "Triple Chocolate"
    case chokis = "Chokis"
    case oreo = "Oreo"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .tripleChocolate: return "birthday.cake.fill"
        case .chokis: return "cookie.fill"
        case .oreo: return "circle.bottomhalf.filled"
        }
    }

    var colorHex: String {
        switch self {
        case .tripleChocolate: return "3E2723"
        case .chokis: return "A1887F"
        case .oreo: return "37474F"
        }
    }

    var emoji: String {
        switch self {
        case .tripleChocolate: return "🍫"
        case .chokis: return "🍪"
        case .oreo: return "🖤"
        }
    }
}

// MARK: - Brownie Product (Inventory)

@Model
final class BrownieProduct {
    var id: UUID
    var flavor: String
    var stock: Int
    var costPerUnit: Double
    var pricePerUnit: Double
    var lastRestocked: Date

    init(
        id: UUID = UUID(),
        flavor: BrownieFlavor,
        stock: Int = 0,
        costPerUnit: Double = 13.0,
        pricePerUnit: Double = 30.0
    ) {
        self.id = id
        self.flavor = flavor.rawValue
        self.stock = stock
        self.costPerUnit = costPerUnit
        self.pricePerUnit = pricePerUnit
        self.lastRestocked = Date()
    }

    var brownieFlavor: BrownieFlavor {
        BrownieFlavor(rawValue: flavor) ?? .tripleChocolate
    }

    /// Stock is critically low (less than 5 units)
    var isLowStock: Bool {
        stock < 5
    }
}
