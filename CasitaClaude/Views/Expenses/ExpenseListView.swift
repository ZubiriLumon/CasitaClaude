import SwiftUI
import SwiftData

/// Expense history list with grouped-by-date display
struct ExpenseListView: View {
    let profile: UserProfile

    @Environment(AppViewModel.self) private var appVM
    @Environment(\.modelContext) private var modelContext
    @Query private var categories: [Category]

    private var section: SectionMode { appVM.currentSection }

    private var period: (start: Date, end: Date) {
        PeriodService.currentPeriod(startDay: profile.billingCycleStartDay)
    }

    private var expenses: [Expense] {
        ExpenseViewModel.expenses(for: section, in: period, context: modelContext)
    }

    private var groupedExpenses: [(String, [Expense])] {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "es_MX")
        formatter.dateStyle = .medium

        let grouped = Dictionary(grouping: expenses) { expense in
            formatter.string(from: expense.date)
        }

        return grouped.sorted { pair1, pair2 in
            guard let d1 = pair1.value.first?.date, let d2 = pair2.value.first?.date else { return false }
            return d1 > d2
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: AppTheme.Spacing.md) {
                    PeriodBadgeView(startDay: profile.billingCycleStartDay, section: section)

                    if expenses.isEmpty {
                        emptyState
                    } else {
                        ForEach(groupedExpenses, id: \.0) { dateString, dayExpenses in
                            VStack(alignment: .leading, spacing: 8) {
                                Text(dateString)
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(AppTheme.textSecondary(for: section))
                                    .padding(.horizontal, 4)

                                ForEach(dayExpenses, id: \.id) { expense in
                                    expenseRow(expense)
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.md)
                .padding(.bottom, AppTheme.Spacing.xl)
            }
            .background(AppTheme.background(for: section).ignoresSafeArea())
            .navigationTitle("Gastos")
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

    // MARK: - Expense Row

    private func expenseRow(_ expense: Expense) -> some View {
        let category = categories.first { $0.id == expense.categoryId }

        return CardView(section: section) {
            HStack(spacing: 12) {
                // Category icon
                Image(systemName: category?.icon ?? "questionmark.circle")
                    .font(.title3)
                    .foregroundStyle(.white)
                    .frame(width: 40, height: 40)
                    .background(
                        Circle().fill(Color(hex: category?.colorHex ?? "6B7280"))
                    )

                // Info
                VStack(alignment: .leading, spacing: 3) {
                    Text(category?.name ?? "Sin categoría")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(AppTheme.textPrimary(for: section))

                    if !expense.expenseDescription.isEmpty {
                        Text(expense.expenseDescription)
                            .font(.caption)
                            .foregroundStyle(AppTheme.textSecondary(for: section))
                            .lineLimit(1)
                    }

                    HStack(spacing: 8) {
                        Label(expense.paymentMethod.rawValue, systemImage: expense.paymentMethod.icon)
                            .font(.caption2)
                            .foregroundStyle(AppTheme.textSecondary(for: section))

                        if !expense.tags.isEmpty {
                            Text(expense.tags.joined(separator: ", "))
                                .font(.caption2)
                                .foregroundStyle(AppTheme.primary(for: section).opacity(0.7))
                                .lineLimit(1)
                        }
                    }
                }

                Spacer()

                // Amount
                CurrencyText(
                    amount: expense.amount,
                    style: .subheadline,
                    weight: .bold,
                    color: AppTheme.textPrimary(for: section)
                )
            }
        }
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "tray")
                .font(.system(size: 48))
                .foregroundStyle(AppTheme.textSecondary(for: section).opacity(0.5))

            Text("Sin gastos en este ciclo")
                .font(.headline)
                .foregroundStyle(AppTheme.textSecondary(for: section))

            Text("Toca + para registrar tu primer gasto")
                .font(.subheadline)
                .foregroundStyle(AppTheme.textSecondary(for: section).opacity(0.7))

            Button {
                appVM.showExpenseSheet = true
            } label: {
                Label("Registrar Gasto", systemImage: "plus")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(
                        Capsule().fill(AppTheme.primary(for: section))
                    )
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }
}
