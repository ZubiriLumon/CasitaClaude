import Foundation
import SwiftData

@Model
final class Category {
    var id: UUID
    var name: String
    var icon: String
    var colorHex: String
    var section: String // "personal" or "business"
    var isDefault: Bool
    var sortOrder: Int

    init(
        id: UUID = UUID(),
        name: String,
        icon: String,
        colorHex: String,
        section: SectionMode = .personal,
        isDefault: Bool = false,
        sortOrder: Int = 0
    ) {
        self.id = id
        self.name = name
        self.icon = icon
        self.colorHex = colorHex
        self.section = section.rawValue
        self.isDefault = isDefault
        self.sortOrder = sortOrder
    }

    var sectionMode: SectionMode {
        SectionMode(rawValue: section) ?? .personal
    }

    // MARK: - Default Personal Categories

    static let defaultPersonal: [(String, String, String)] = [
        ("Alimentación", "fork.knife", "F59E0B"),
        ("Transporte", "car.fill", "3B82F6"),
        ("Entretenimiento", "gamecontroller.fill", "8B5CF6"),
        ("Salud", "heart.fill", "EF4444"),
        ("Hogar", "house.fill", "10B981"),
        ("Educación", "book.fill", "6366F1"),
        ("Ropa", "tshirt.fill", "EC4899"),
        ("Servicios", "bolt.fill", "F97316"),
        ("Suscripciones", "repeat", "06B6D4"),
        ("Otros", "ellipsis.circle.fill", "6B7280"),
    ]

    // MARK: - Default Business Categories

    static let defaultBusiness: [(String, String, String)] = [
        ("Ingredientes", "basket.fill", "D97706"),
        ("Chocolate", "cup.and.saucer.fill", "78350F"),
        ("Empaque", "shippingbox.fill", "14B8A6"),
        ("Delivery/Envíos", "box.truck.fill", "3B82F6"),
        ("Gas/Electricidad", "bolt.fill", "F59E0B"),
        ("Marketing", "megaphone.fill", "8B5CF6"),
        ("Equipo de Cocina", "frying.pan.fill", "0F766E"),
        ("Renta/Local", "building.2.fill", "6366F1"),
        ("Impuestos", "doc.text.fill", "DC2626"),
        ("Otros", "ellipsis.circle.fill", "6B7280"),
    ]

    // MARK: - Default Income Categories

    static let defaultIncomeCategories: [(String, String, String)] = [
        ("Venta Individual", "bag.fill", "059669"),
        ("Pedidos Especiales", "star.fill", "D97706"),
        ("Ventas por Mayor", "shippingbox.fill", "0F766E"),
        ("Eventos/Ferias", "party.popper.fill", "8B5CF6"),
        ("Delivery", "box.truck.fill", "3B82F6"),
        ("Otros Ingresos", "ellipsis.circle.fill", "6B7280"),
    ]
}
