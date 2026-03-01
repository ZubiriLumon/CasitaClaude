import Foundation
import SwiftData

@Model
final class Budget {
    var id: UUID
    var categoryId: UUID?       // nil = total monthly budget
    var amount: Double
    var section: String
    var isActive: Bool

    init(
        id: UUID = UUID(),
        categoryId: UUID? = nil,
        amount: Double,
        section: SectionMode = .personal,
        isActive: Bool = true
    ) {
        self.id = id
        self.categoryId = categoryId
        self.amount = amount
        self.section = section.rawValue
        self.isActive = isActive
    }

    var sectionMode: SectionMode {
        SectionMode(rawValue: section) ?? .personal
    }

    var isGlobalBudget: Bool {
        categoryId == nil
    }
}
