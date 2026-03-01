import SwiftUI
import SwiftData

/// Main dashboard view with spending summary, quick stats, and tips
struct DashboardView: View {
    let profile: UserProfile

    @Environment(AppViewModel.self) private var appVM
    @Environment(GamificationViewModel.self) private var gamificationVM
    @Environment(\.modelContext) private var modelContext
    @Query private var categories: [Category]

    private var section: SectionMode { appVM.currentSection }

    private var period: (start: Date, end: Date) {
        PeriodService.currentPeriod(startDay: profile.billingCycleStartDay)
    }

    private var sectionCategories: [Category] {
        categories.filter { $0.sectionMode == section }
    }

    private var totalSpent: Double {
        ExpenseViewModel.totalSpent(for: section, in: period, context: modelContext)
    }

    private var globalBudget: Budget? {
        BudgetViewModel.globalBudget(for: section, context: modelContext)
    }

    private var tips: [FinancialTip] {
        let prevPeriod = PeriodService.previousPeriod(startDay: profile.billingCycleStartDay)
        let prevTotal = ExpenseViewModel.totalSpent(for: section, in: prevPeriod, context: modelContext)
        let catSpending = ExpenseViewModel.spendingByCategory(for: section, in: period, categories: sectionCategories, context: modelContext)
        let prevCatSpending = ExpenseViewModel.spendingByCategory(for: section, in: prevPeriod, categories: sectionCategories, context: modelContext)

        return TipsEngine.generateTips(from: TipsEngine.SpendingContext(
            section: section,
            totalSpent: totalSpent,
            budgetTotal: globalBudget?.amount ?? 0,
            previousPeriodTotal: prevTotal,
            categorySpending: catSpending.map { ($0.category.name, $0.amount) },
            previousCategorySpending: prevCatSpending.map { ($0.category.name, $0.amount) },
            daysRemaining: PeriodService.daysRemaining(startDay: profile.billingCycleStartDay),
            totalDays: PeriodService.totalDays(startDay: profile.billingCycleStartDay),
            totalIncome: nil
        ))
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: AppTheme.Spacing.md) {
                    // Period Header
                    PeriodBadgeView(startDay: profile.billingCycleStartDay, section: section)

                    // Spending Summary Card
                    spendingSummaryCard

                    // Quick Budget Progress
                    if let budget = globalBudget {
                        budgetProgressCard(budget: budget)
                    }

                    // Level & Streak Row
                    gamificationRow

                    // Top Categories
                    topCategoriesCard

                    // Tips
                    if !tips.isEmpty {
                        tipsSection
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.md)
                .padding(.bottom, AppTheme.Spacing.xl)
            }
            .background(AppTheme.background(for: section).ignoresSafeArea())
            .navigationTitle(section.displayName)
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        appVM.showExpenseSheet = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title3)
                            .foregroundStyle(AppTheme.primary(for: section))
                    }
                }
            }
            .sheet(isPresented: Bindable(appVM).showExpenseSheet) {
                AddExpenseView(profile: profile)
            }
        }
    }

    // MARK: - Spending Summary

    private var spendingSummaryCard: some View {
        CardView(section: section) {
            VStack(spacing: 12) {
                Text("Gasto del Ciclo")
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.textSecondary(for: section))

                CurrencyText(
                    amount: totalSpent,
                    style: .largeTitle,
                    color: AppTheme.textPrimary(for: section)
                )

                HStack(spacing: 16) {
                    Label("\(PeriodService.daysRemaining(startDay: profile.billingCycleStartDay)) días restantes",
                          systemImage: "clock")
                    .font(.caption)
                    .foregroundStyle(AppTheme.textSecondary(for: section))

                    if let budget = globalBudget {
                        Label("de \(formatCurrency(budget.amount))",
                              systemImage: "target")
                        .font(.caption)
                        .foregroundStyle(AppTheme.textSecondary(for: section))
                    }
                }
            }
            .frame(maxWidth: .infinity)
        }
    }

    // MARK: - Budget Progress

    private func budgetProgressCard(budget: Budget) -> some View {
        CardView(section: section) {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("Presupuesto")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(AppTheme.textPrimary(for: section))
                    Spacer()
                    Text("\(Int((totalSpent / budget.amount) * 100))%")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(AppTheme.primary(for: section))
                }

                ProgressBarView(
                    progress: budget.amount > 0 ? totalSpent / budget.amount : 0,
                    section: section,
                    height: 12
                )

                HStack {
                    Text(formatCurrency(totalSpent))
                        .font(.caption)
                    Spacer()
                    Text(formatCurrency(budget.amount))
                        .font(.caption)
                }
                .foregroundStyle(AppTheme.textSecondary(for: section))
            }
        }
    }

    // MARK: - Gamification Row

    private var gamificationRow: some View {
        HStack(spacing: 12) {
            // Level
            CardView(section: section) {
                VStack(spacing: 6) {
                    Image(systemName: "star.circle.fill")
                        .font(.title2)
                        .foregroundStyle(AppTheme.accent(for: section))
                    Text("Nivel \(profile.currentLevel)")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(AppTheme.textPrimary(for: section))
                    Text(profile.levelTitle)
                        .font(.caption2)
                        .foregroundStyle(AppTheme.textSecondary(for: section))
                }
                .frame(maxWidth: .infinity)
            }

            // Streak
            CardView(section: section) {
                VStack(spacing: 6) {
                    Image(systemName: "flame.fill")
                        .font(.title2)
                        .foregroundStyle(.orange)
                    Text("\(profile.streakDays) días")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(AppTheme.textPrimary(for: section))
                    Text("Racha activa")
                        .font(.caption2)
                        .foregroundStyle(AppTheme.textSecondary(for: section))
                }
                .frame(maxWidth: .infinity)
            }

            // XP
            CardView(section: section) {
                VStack(spacing: 6) {
                    Image(systemName: "bolt.fill")
                        .font(.title2)
                        .foregroundStyle(AppTheme.primary(for: section))
                    Text("\(profile.totalXP) XP")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(AppTheme.textPrimary(for: section))
                    Text("Total")
                        .font(.caption2)
                        .foregroundStyle(AppTheme.textSecondary(for: section))
                }
                .frame(maxWidth: .infinity)
            }
        }
    }

    // MARK: - Top Categories

    private var topCategoriesCard: some View {
        let spending = ExpenseViewModel.spendingByCategory(
            for: section, in: period, categories: sectionCategories, context: modelContext
        ).prefix(5)

        return CardView(section: section) {
            VStack(alignment: .leading, spacing: 12) {
                Text("Top Categorías")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(AppTheme.textPrimary(for: section))

                if spending.isEmpty {
                    Text("Sin gastos registrados en este ciclo")
                        .font(.caption)
                        .foregroundStyle(AppTheme.textSecondary(for: section))
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.vertical, 8)
                } else {
                    ForEach(Array(spending.enumerated()), id: \.offset) { _, item in
                        HStack(spacing: 12) {
                            Image(systemName: item.category.icon)
                                .font(.caption)
                                .foregroundStyle(.white)
                                .frame(width: 28, height: 28)
                                .background(Circle().fill(Color(hex: item.category.colorHex)))

                            Text(item.category.name)
                                .font(.subheadline)
                                .foregroundStyle(AppTheme.textPrimary(for: section))

                            Spacer()

                            CurrencyText(
                                amount: item.amount,
                                style: .subheadline,
                                weight: .semibold,
                                color: AppTheme.textPrimary(for: section)
                            )
                        }
                    }
                }
            }
        }
    }

    // MARK: - Tips Section

    private var tipsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Tips del Ciclo")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(AppTheme.textPrimary(for: section))

            ForEach(tips.prefix(3)) { tip in
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: tip.type.icon)
                        .font(.subheadline)
                        .foregroundStyle(tipColor(for: tip.type))

                    Text(tip.message)
                        .font(.caption)
                        .foregroundStyle(AppTheme.textPrimary(for: section))
                }
                .padding(12)
                .background(
                    RoundedRectangle(cornerRadius: AppTheme.CornerRadius.sm)
                        .fill(tipColor(for: tip.type).opacity(0.08))
                )
            }
        }
    }

    // MARK: - Helpers

    private func tipColor(for type: TipType) -> Color {
        switch type {
        case .celebration: return AppTheme.success(for: section)
        case .warning: return AppTheme.warning(for: section)
        case .insight: return AppTheme.primary(for: section)
        case .suggestion: return AppTheme.accent(for: section)
        }
    }

    private func formatCurrency(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "es_MX")
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: value)) ?? "$0"
    }
}
