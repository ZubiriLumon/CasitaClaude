import Foundation
import SwiftData

@Model
final class UserProfile {
    var id: UUID
    var displayName: String
    var billingCycleStartDay: Int  // 1-28
    var currentLevel: Int
    var totalXP: Int
    var streakDays: Int
    var lastActiveDate: Date?
    var earnedBadgeIds: [String]

    init(
        id: UUID = UUID(),
        displayName: String = "",
        billingCycleStartDay: Int = 1,
        currentLevel: Int = 1,
        totalXP: Int = 0,
        streakDays: Int = 0,
        earnedBadgeIds: [String] = []
    ) {
        self.id = id
        self.displayName = displayName
        self.billingCycleStartDay = billingCycleStartDay
        self.currentLevel = currentLevel
        self.totalXP = totalXP
        self.streakDays = streakDays
        self.earnedBadgeIds = earnedBadgeIds
    }

    // MARK: - XP & Level Logic

    var xpForNextLevel: Int {
        currentLevel * 150
    }

    var levelProgress: Double {
        let xpInCurrentLevel = totalXP - xpAccumulatedForLevel(currentLevel)
        return Double(xpInCurrentLevel) / Double(xpForNextLevel)
    }

    var levelTitle: String {
        switch currentLevel {
        case 1...3: return "Principiante"
        case 4...6: return "Organizado"
        case 7...10: return "Estratega"
        case 11...15: return "Experto"
        case 16...20: return "Maestro Financiero"
        default: return "Leyenda"
        }
    }

    func addXP(_ points: Int) {
        totalXP += points
        while totalXP >= xpAccumulatedForLevel(currentLevel) + xpForNextLevel {
            currentLevel += 1
        }
    }

    private func xpAccumulatedForLevel(_ level: Int) -> Int {
        (0..<level).reduce(0) { acc, lvl in acc + lvl * 150 }
    }
}
