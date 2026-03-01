import Foundation

struct Badge: Identifiable, Codable {
    let id: String
    let name: String
    let description: String
    let icon: String
    let xpReward: Int
    let requirement: BadgeRequirement

    var isEarned: Bool = false
}

enum BadgeRequirement: Codable {
    case expensesLogged(count: Int)
    case streakDays(count: Int)
    case budgetRespected(months: Int)
    case levelReached(level: Int)
    case categoriesUsed(count: Int)
    case monthlyReportViewed(count: Int)

    var progressDescription: String {
        switch self {
        case .expensesLogged(let count): return "Registra \(count) gastos"
        case .streakDays(let count): return "Racha de \(count) días"
        case .budgetRespected(let months): return "Respeta tu presupuesto \(months) meses"
        case .levelReached(let level): return "Alcanza nivel \(level)"
        case .categoriesUsed(let count): return "Usa \(count) categorías"
        case .monthlyReportViewed(let count): return "Revisa \(count) reportes mensuales"
        }
    }
}

// MARK: - Default Badges

extension Badge {
    static let allBadges: [Badge] = [
        Badge(
            id: "first_expense",
            name: "Primer Paso",
            description: "Registra tu primer gasto",
            icon: "star.fill",
            xpReward: 50,
            requirement: .expensesLogged(count: 1)
        ),
        Badge(
            id: "ten_expenses",
            name: "En Racha",
            description: "Registra 10 gastos",
            icon: "flame.fill",
            xpReward: 100,
            requirement: .expensesLogged(count: 10)
        ),
        Badge(
            id: "fifty_expenses",
            name: "Registrador Pro",
            description: "Registra 50 gastos",
            icon: "trophy.fill",
            xpReward: 250,
            requirement: .expensesLogged(count: 50)
        ),
        Badge(
            id: "streak_7",
            name: "Semana Perfecta",
            description: "7 días seguidos registrando",
            icon: "calendar.badge.checkmark",
            xpReward: 150,
            requirement: .streakDays(count: 7)
        ),
        Badge(
            id: "streak_30",
            name: "Mes Disciplinado",
            description: "30 días seguidos registrando",
            icon: "calendar.badge.clock",
            xpReward: 500,
            requirement: .streakDays(count: 30)
        ),
        Badge(
            id: "budget_1",
            name: "Presupuesto Cumplido",
            description: "Respeta tu presupuesto por 1 mes",
            icon: "checkmark.shield.fill",
            xpReward: 200,
            requirement: .budgetRespected(months: 1)
        ),
        Badge(
            id: "budget_3",
            name: "Control Total",
            description: "Respeta tu presupuesto 3 meses seguidos",
            icon: "lock.shield.fill",
            xpReward: 500,
            requirement: .budgetRespected(months: 3)
        ),
        Badge(
            id: "level_5",
            name: "Organizador",
            description: "Alcanza el nivel 5",
            icon: "star.circle.fill",
            xpReward: 100,
            requirement: .levelReached(level: 5)
        ),
        Badge(
            id: "level_10",
            name: "Estratega Financiero",
            description: "Alcanza el nivel 10",
            icon: "crown.fill",
            xpReward: 300,
            requirement: .levelReached(level: 10)
        ),
        Badge(
            id: "categories_5",
            name: "Diversificador",
            description: "Usa 5 categorías diferentes",
            icon: "square.grid.3x3.fill",
            xpReward: 75,
            requirement: .categoriesUsed(count: 5)
        ),
        Badge(
            id: "report_1",
            name: "Analista",
            description: "Revisa tu primer reporte mensual",
            icon: "chart.bar.fill",
            xpReward: 100,
            requirement: .monthlyReportViewed(count: 1)
        ),
    ]
}
