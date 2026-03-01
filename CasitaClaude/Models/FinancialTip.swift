import Foundation

struct FinancialTip: Identifiable {
    let id = UUID()
    let message: String
    let type: TipType
    let section: SectionMode
    let priority: TipPriority
}

enum TipType {
    case insight        // Pattern-based analysis
    case warning        // Budget-related alerts
    case celebration    // Positive reinforcement
    case suggestion     // Actionable advice

    var icon: String {
        switch self {
        case .insight: return "lightbulb.fill"
        case .warning: return "exclamationmark.triangle.fill"
        case .celebration: return "party.popper.fill"
        case .suggestion: return "sparkles"
        }
    }
}

enum TipPriority: Int, Comparable {
    case low = 0
    case medium = 1
    case high = 2

    static func < (lhs: TipPriority, rhs: TipPriority) -> Bool {
        lhs.rawValue < rhs.rawValue
    }
}

// MARK: - Monthly Report Model

struct MonthlyReport: Identifiable {
    let id = UUID()
    let section: SectionMode
    let periodStart: Date
    let periodEnd: Date
    let totalSpent: Double
    let previousPeriodTotal: Double
    let categoryBreakdown: [(categoryName: String, amount: Double, percentage: Double)]
    let topCategory: String
    let budgetCompliance: Double  // 0.0 to 1.0+
    let insight: String
    let tips: [FinancialTip]

    // Business-specific
    let totalIncome: Double?
    let estimatedMargin: Double?

    var percentageChange: Double {
        guard previousPeriodTotal > 0 else { return 0 }
        return ((totalSpent - previousPeriodTotal) / previousPeriodTotal) * 100
    }

    var isUnderBudget: Bool {
        budgetCompliance <= 1.0
    }
}
