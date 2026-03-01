import SwiftUI
import SwiftData
import Observation

/// ViewModel for gamification: XP, levels, badges, streaks
@Observable
final class GamificationViewModel {

    var recentlyEarnedBadge: Badge?
    var showBadgeAnimation: Bool = false
    var showLevelUpAnimation: Bool = false
    var newLevel: Int = 0

    // MARK: - XP Awards

    enum XPAction {
        case logExpense           // +10 XP
        case dailyStreak          // +25 XP
        case viewReport           // +15 XP
        case stayUnderBudget      // +50 XP per month
        case setBudget            // +20 XP

        var points: Int {
            switch self {
            case .logExpense: return 10
            case .dailyStreak: return 25
            case .viewReport: return 15
            case .stayUnderBudget: return 50
            case .setBudget: return 20
            }
        }
    }

    func awardXP(_ action: XPAction, profile: UserProfile) {
        let previousLevel = profile.currentLevel
        profile.addXP(action.points)

        if profile.currentLevel > previousLevel {
            newLevel = profile.currentLevel
            withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) {
                showLevelUpAnimation = true
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) { [weak self] in
                withAnimation { self?.showLevelUpAnimation = false }
            }
        }
    }

    // MARK: - Streak Management

    func updateStreak(profile: UserProfile) {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())

        if let lastActive = profile.lastActiveDate {
            let lastDay = calendar.startOfDay(for: lastActive)
            let daysDiff = calendar.dateComponents([.day], from: lastDay, to: today).day ?? 0

            if daysDiff == 1 {
                profile.streakDays += 1
                awardXP(.dailyStreak, profile: profile)
            } else if daysDiff > 1 {
                profile.streakDays = 1
            }
            // daysDiff == 0: same day, no change
        } else {
            profile.streakDays = 1
        }

        profile.lastActiveDate = today
    }

    // MARK: - Badge Checking

    func checkBadges(
        profile: UserProfile,
        totalExpenses: Int,
        categoriesUsed: Int,
        reportsViewed: Int,
        budgetMonthsRespected: Int
    ) {
        for badge in Badge.allBadges {
            guard !profile.earnedBadgeIds.contains(badge.id) else { continue }

            let earned: Bool = {
                switch badge.requirement {
                case .expensesLogged(let count):
                    return totalExpenses >= count
                case .streakDays(let count):
                    return profile.streakDays >= count
                case .budgetRespected(let months):
                    return budgetMonthsRespected >= months
                case .levelReached(let level):
                    return profile.currentLevel >= level
                case .categoriesUsed(let count):
                    return categoriesUsed >= count
                case .monthlyReportViewed(let count):
                    return reportsViewed >= count
                }
            }()

            if earned {
                profile.earnedBadgeIds.append(badge.id)
                profile.addXP(badge.xpReward)
                var earnedBadge = badge
                earnedBadge.isEarned = true
                recentlyEarnedBadge = earnedBadge

                withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) {
                    showBadgeAnimation = true
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) { [weak self] in
                    withAnimation { self?.showBadgeAnimation = false }
                }
                break // Show one at a time
            }
        }
    }

    // MARK: - Badge List

    func allBadgesWithStatus(earnedIds: [String]) -> [Badge] {
        Badge.allBadges.map { badge in
            var b = badge
            b.isEarned = earnedIds.contains(badge.id)
            return b
        }
    }
}
