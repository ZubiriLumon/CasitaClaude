import Foundation
import SwiftData

// MARK: - Raw Material Category

enum RawMaterialCategory: String, Codable, CaseIterable, Identifiable {
    case harina = "Harina"
    case leche = "Leche"
    case huevo = "Huevo"
    case chocolate = "Chocolate"
    case mantequilla = "Mantequilla"
    case azucar = "Azúcar"
    case bolsas = "Bolsas"
    case stickers = "Stickers"
    case listones = "Listones"
    case galletas = "Galletas (Oreo/Chokis)"
    case otro = "Otro"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .harina: return "takeoutbag.and.cup.and.straw.fill"
        case .leche: return "cup.and.saucer.fill"
        case .huevo: return "oval.fill"
        case .chocolate: return "square.fill"
        case .mantequilla: return "cube.fill"
        case .azucar: return "sparkles"
        case .bolsas: return "bag.fill"
        case .stickers: return "star.circle.fill"
        case .listones: return "gift.fill"
        case .galletas: return "cookie.fill"
        case .otro: return "ellipsis.circle.fill"
        }
    }
}

// MARK: - Raw Material Expense

@Model
final class RawMaterialExpense {
    var id: UUID
    var amount: Double
    var materialCategory: String
    var expenseDescription: String
    var date: Date
    var createdAt: Date

    init(
        id: UUID = UUID(),
        amount: Double,
        category: RawMaterialCategory,
        expenseDescription: String = "",
        date: Date = Date()
    ) {
        self.id = id
        self.amount = amount
        self.materialCategory = category.rawValue
        self.expenseDescription = expenseDescription
        self.date = date
        self.createdAt = Date()
    }

    var category: RawMaterialCategory {
        RawMaterialCategory(rawValue: materialCategory) ?? .otro
    }
}
