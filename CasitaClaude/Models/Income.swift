import Foundation
import SwiftData

/// Income tracking for business section margin calculations
@Model
final class Income {
    var id: UUID
    var amount: Double
    var incomeDescription: String
    var date: Date
    var source: String
    var section: String

    init(
        id: UUID = UUID(),
        amount: Double,
        incomeDescription: String = "",
        date: Date = Date(),
        source: String = "",
        section: SectionMode = .business
    ) {
        self.id = id
        self.amount = amount
        self.incomeDescription = incomeDescription
        self.date = date
        self.source = source
        self.section = section.rawValue
    }

    var sectionMode: SectionMode {
        SectionMode(rawValue: section) ?? .business
    }
}
