import SwiftUI
import SwiftData

/// Budget limits view with visual progress bars and alerts
struct BudgetListView: View {
    let profile: UserProfile

    @Environment(AppViewModel.self) private var appVM
    @Environment(\.modelContext) private var modelContext
    @Query private var categories: [Category]

    @State private var budgetVM = BudgetViewModel()
    @State private var showAddBudget = false
    @State private var selectedCategoryForBudget: UUID? = nil
    @State private var isGlobalBudget = false
    @State private var budgetAmountText = ""

    private var section: SectionMode { appVM.currentSection }

    private var sectionCategories: [Category] {
        categories.filter { $0.sectionMode == section }
    }

    private var period: (start: Date, end: Date) {
        PeriodService.currentPeriod(startDay: profile.billingCycleStartDay)
    }

    private var progressItems: [BudgetViewModel.BudgetProgress] {
        BudgetViewModel.allProgress(
            for: section,
            categories: sectionCategories,
            period: period,
            context: modelContext
        )
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: AppTheme.Spacing.md) {
                    PeriodBadgeView(startDay: profile.billingCycleStartDay, section: section)

                    if progressItems.isEmpty {
                        emptyState
                    } else {
                        ForEach(progressItems) { item in
                            budgetCard(item)
                        }
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.md)
                .padding(.bottom, AppTheme.Spacing.xl)
            }
            .background(AppTheme.background(for: section).ignoresSafeArea())
            .navigationTitle("Control de Límites")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button {
                            isGlobalBudget = true
                            showAddBudget = true
                        } label: {
                            Label("Presupuesto Total", systemImage: "chart.pie.fill")
                        }

                        Button {
                            isGlobalBudget = false
                            showAddBudget = true
                        } label: {
                            Label("Presupuesto por Categoría", systemImage: "square.grid.2x2.fill")
                        }
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title3)
                            .foregroundStyle(AppTheme.primary(for: section))
                    }
                }
            }
            .sheet(isPresented: $showAddBudget) {
                addBudgetSheet
            }
        }
    }

    // MARK: - Budget Card

    private func budgetCard(_ item: BudgetViewModel.BudgetProgress) -> some View {
        CardView(section: section) {
            VStack(alignment: .leading, spacing: 12) {
                // Header
                HStack(spacing: 10) {
                    Image(systemName: item.categoryIcon)
                        .font(.title3)
                        .foregroundStyle(.white)
                        .frame(width: 36, height: 36)
                        .background(
                            Circle().fill(Color(hex: item.categoryColorHex))
                        )

                    VStack(alignment: .leading, spacing: 2) {
                        Text(item.categoryName)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(AppTheme.textPrimary(for: section))

                        if item.isGlobal {
                            Text("Presupuesto mensual general")
                                .font(.caption2)
                                .foregroundStyle(AppTheme.textSecondary(for: section))
                        }
                    }

                    Spacer()

                    // Status badge
                    statusBadge(item)
                }

                // Progress bar
                ProgressBarView(
                    progress: item.percentage,
                    section: section,
                    height: 14
                )

                // Amounts
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Gastado")
                            .font(.caption2)
                            .foregroundStyle(AppTheme.textSecondary(for: section))
                        CurrencyText(
                            amount: item.spentAmount,
                            style: .subheadline,
                            weight: .semibold,
                            color: Color(hex: item.statusColor)
                        )
                    }

                    Spacer()

                    VStack(alignment: .center, spacing: 2) {
                        Text("\(Int(item.percentage * 100))%")
                            .font(.title3.weight(.bold))
                            .foregroundStyle(Color(hex: item.statusColor))
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: 2) {
                        Text("Límite")
                            .font(.caption2)
                            .foregroundStyle(AppTheme.textSecondary(for: section))
                        CurrencyText(
                            amount: item.budgetAmount,
                            style: .subheadline,
                            weight: .semibold,
                            color: AppTheme.textPrimary(for: section)
                        )
                    }
                }

                // Remaining or exceeded
                if item.isOverBudget {
                    HStack(spacing: 6) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.caption)
                        Text("Excedido por \(formatCurrency(item.spentAmount - item.budgetAmount))")
                            .font(.caption.weight(.medium))
                    }
                    .foregroundStyle(AppTheme.danger(for: section))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(
                        Capsule()
                            .fill(AppTheme.danger(for: section).opacity(0.1))
                    )
                } else {
                    Text("Disponible: \(formatCurrency(item.remaining))")
                        .font(.caption)
                        .foregroundStyle(AppTheme.success(for: section))
                }
            }
        }
    }

    // MARK: - Status Badge

    private func statusBadge(_ item: BudgetViewModel.BudgetProgress) -> some View {
        Text(item.isOverBudget ? "Excedido" : item.isNearLimit ? "Alerta" : "OK")
            .font(.caption2.weight(.bold))
            .foregroundStyle(.white)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(
                Capsule().fill(Color(hex: item.statusColor))
            )
    }

    // MARK: - Add Budget Sheet

    private var addBudgetSheet: some View {
        NavigationStack {
            VStack(spacing: 24) {
                if !isGlobalBudget {
                    // Category picker
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Selecciona categoría")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(AppTheme.textPrimary(for: section))

                        ScrollView {
                            LazyVGrid(columns: [GridItem(.adaptive(minimum: 90))], spacing: 10) {
                                ForEach(sectionCategories) { cat in
                                    Button {
                                        selectedCategoryForBudget = cat.id
                                    } label: {
                                        VStack(spacing: 6) {
                                            Image(systemName: cat.icon)
                                                .font(.title3)
                                                .foregroundStyle(
                                                    selectedCategoryForBudget == cat.id
                                                    ? .white
                                                    : Color(hex: cat.colorHex)
                                                )
                                                .frame(width: 40, height: 40)
                                                .background(
                                                    Circle().fill(
                                                        selectedCategoryForBudget == cat.id
                                                        ? Color(hex: cat.colorHex)
                                                        : Color(hex: cat.colorHex).opacity(0.15)
                                                    )
                                                )
                                            Text(cat.name)
                                                .font(.caption2)
                                                .foregroundStyle(AppTheme.textPrimary(for: section))
                                        }
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                        .frame(maxHeight: 200)
                    }
                }

                // Amount input
                VStack(alignment: .leading, spacing: 8) {
                    Text(isGlobalBudget ? "Presupuesto mensual total" : "Límite para esta categoría")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(AppTheme.textPrimary(for: section))

                    HStack {
                        Text("$")
                            .font(.title2)
                            .foregroundStyle(AppTheme.textSecondary(for: section))
                        TextField("0.00", text: $budgetAmountText)
                            .font(.title2.weight(.bold))
                            .keyboardType(.decimalPad)
                    }
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                            .fill(Color.gray.opacity(0.08))
                    )
                }

                Spacer()

                Button {
                    saveBudget()
                } label: {
                    Text("Guardar Límite")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(
                            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                                .fill(AppTheme.primary(for: section))
                        )
                }
            }
            .padding(AppTheme.Spacing.lg)
            .navigationTitle(isGlobalBudget ? "Presupuesto Total" : "Límite por Categoría")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { showAddBudget = false }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "gauge.with.needle")
                .font(.system(size: 48))
                .foregroundStyle(AppTheme.textSecondary(for: section).opacity(0.5))

            Text("Sin límites configurados")
                .font(.headline)
                .foregroundStyle(AppTheme.textSecondary(for: section))

            Text("Establece presupuestos para controlar tus gastos")
                .font(.subheadline)
                .foregroundStyle(AppTheme.textSecondary(for: section).opacity(0.7))
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }

    // MARK: - Actions

    private func saveBudget() {
        guard let amount = Double(budgetAmountText.replacingOccurrences(of: ",", with: ".")),
              amount > 0 else { return }

        let categoryId = isGlobalBudget ? nil : selectedCategoryForBudget
        guard isGlobalBudget || categoryId != nil else { return }

        budgetVM.saveBudget(
            categoryId: categoryId,
            amount: amount,
            section: section,
            context: modelContext
        )

        budgetAmountText = ""
        selectedCategoryForBudget = nil
        showAddBudget = false
    }

    private func formatCurrency(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "es_MX")
        return formatter.string(from: NSNumber(value: value)) ?? "$0"
    }
}
