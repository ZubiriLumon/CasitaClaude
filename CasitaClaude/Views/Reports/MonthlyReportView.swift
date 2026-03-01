import SwiftUI
import SwiftData

/// Monthly report view — the "season finale" of each financial cycle
struct MonthlyReportView: View {
    let profile: UserProfile

    @Environment(AppViewModel.self) private var appVM
    @Environment(GamificationViewModel.self) private var gamificationVM
    @Environment(\.modelContext) private var modelContext
    @Query private var categories: [Category]

    @State private var report: MonthlyReport?
    @State private var showShareSheet = false

    private var section: SectionMode { appVM.currentSection }

    private var sectionCategories: [Category] {
        categories.filter { $0.sectionMode == section }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                if let report {
                    VStack(spacing: AppTheme.Spacing.lg) {
                        reportHeader(report)
                        spendingSummarySection(report)
                        categoryBreakdownSection(report)
                        if section == .business {
                            businessMetricsSection(report)
                        }
                        budgetComplianceSection(report)
                        insightSection(report)
                        tipsSection(report)
                    }
                    .padding(.horizontal, AppTheme.Spacing.md)
                    .padding(.bottom, AppTheme.Spacing.xxl)
                } else {
                    loadingState
                }
            }
            .background(AppTheme.background(for: section).ignoresSafeArea())
            .navigationTitle("Reporte Mensual")
            .navigationBarTitleDisplayMode(.large)
            .onAppear { generateReport() }
            .onChange(of: appVM.currentSection) { _, _ in generateReport() }
        }
    }

    // MARK: - Report Header

    private func reportHeader(_ report: MonthlyReport) -> some View {
        VStack(spacing: 12) {
            // Period
            HStack(spacing: 8) {
                Image(systemName: "calendar.badge.checkmark")
                    .foregroundStyle(AppTheme.primary(for: section))
                Text(PeriodService.formatPeriod(report.periodStart, report.periodEnd))
                    .font(.headline)
                    .foregroundStyle(AppTheme.textPrimary(for: section))
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .background(
                Capsule()
                    .fill(AppTheme.primary(for: section).opacity(0.1))
            )

            Text("Cierre de Ciclo")
                .font(.title.weight(.bold))
                .foregroundStyle(AppTheme.textPrimary(for: section))

            Text(section == .personal ? "Vida Personal" : "Negocios")
                .font(.subheadline)
                .foregroundStyle(AppTheme.textSecondary(for: section))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, AppTheme.Spacing.lg)
    }

    // MARK: - Spending Summary

    private func spendingSummarySection(_ report: MonthlyReport) -> some View {
        CardView(section: section) {
            VStack(spacing: 16) {
                Text("Total Gastado")
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.textSecondary(for: section))

                CurrencyText(
                    amount: report.totalSpent,
                    style: .largeTitle,
                    color: AppTheme.textPrimary(for: section)
                )

                // Comparison with previous period
                if report.previousPeriodTotal > 0 {
                    let change = report.percentageChange
                    HStack(spacing: 6) {
                        Image(systemName: change >= 0 ? "arrow.up.right" : "arrow.down.right")
                            .font(.caption)
                        Text("\(change >= 0 ? "+" : "")\(String(format: "%.1f", change))% vs ciclo anterior")
                            .font(.caption.weight(.medium))
                    }
                    .foregroundStyle(change >= 0
                                     ? AppTheme.danger(for: section)
                                     : AppTheme.success(for: section))
                    .padding(.horizontal, 14)
                    .padding(.vertical, 6)
                    .background(
                        Capsule()
                            .fill((change >= 0
                                   ? AppTheme.danger(for: section)
                                   : AppTheme.success(for: section)).opacity(0.1))
                    )
                }
            }
            .frame(maxWidth: .infinity)
        }
    }

    // MARK: - Category Breakdown

    private func categoryBreakdownSection(_ report: MonthlyReport) -> some View {
        CardView(section: section) {
            VStack(alignment: .leading, spacing: 14) {
                HStack {
                    Text("Desglose por Categoría")
                        .font(.headline)
                        .foregroundStyle(AppTheme.textPrimary(for: section))
                    Spacer()
                    Text("Top: \(report.topCategory)")
                        .font(.caption)
                        .foregroundStyle(AppTheme.primary(for: section))
                }

                ForEach(Array(report.categoryBreakdown.enumerated()), id: \.offset) { index, item in
                    HStack(spacing: 12) {
                        Text("\(index + 1)")
                            .font(.caption2.weight(.bold))
                            .foregroundStyle(.white)
                            .frame(width: 22, height: 22)
                            .background(Circle().fill(AppTheme.primary(for: section).opacity(
                                1.0 - Double(index) * 0.15
                            )))

                        Text(item.categoryName)
                            .font(.subheadline)
                            .foregroundStyle(AppTheme.textPrimary(for: section))

                        Spacer()

                        VStack(alignment: .trailing, spacing: 2) {
                            CurrencyText(
                                amount: item.amount,
                                style: .subheadline,
                                weight: .semibold,
                                color: AppTheme.textPrimary(for: section)
                            )
                            Text("\(String(format: "%.1f", item.percentage))%")
                                .font(.caption2)
                                .foregroundStyle(AppTheme.textSecondary(for: section))
                        }
                    }

                    if index < report.categoryBreakdown.count - 1 {
                        Divider()
                    }
                }
            }
        }
    }

    // MARK: - Business Metrics

    private func businessMetricsSection(_ report: MonthlyReport) -> some View {
        CardView(section: section) {
            VStack(spacing: 16) {
                Text("Métricas de Negocio")
                    .font(.headline)
                    .foregroundStyle(AppTheme.textPrimary(for: section))

                HStack(spacing: 20) {
                    if let income = report.totalIncome {
                        VStack(spacing: 4) {
                            Text("Ingresos")
                                .font(.caption)
                                .foregroundStyle(AppTheme.textSecondary(for: section))
                            CurrencyText(
                                amount: income,
                                style: .title3,
                                color: AppTheme.success(for: section)
                            )
                        }
                    }

                    VStack(spacing: 4) {
                        Text("Gastos")
                            .font(.caption)
                            .foregroundStyle(AppTheme.textSecondary(for: section))
                        CurrencyText(
                            amount: report.totalSpent,
                            style: .title3,
                            color: AppTheme.danger(for: section)
                        )
                    }

                    if let margin = report.estimatedMargin {
                        VStack(spacing: 4) {
                            Text("Margen")
                                .font(.caption)
                                .foregroundStyle(AppTheme.textSecondary(for: section))
                            Text("\(String(format: "%.1f", margin * 100))%")
                                .font(.title3.weight(.bold))
                                .foregroundStyle(margin > 0
                                                 ? AppTheme.success(for: section)
                                                 : AppTheme.danger(for: section))
                        }
                    }
                }
            }
            .frame(maxWidth: .infinity)
        }
    }

    // MARK: - Budget Compliance

    private func budgetComplianceSection(_ report: MonthlyReport) -> some View {
        CardView(section: section) {
            VStack(spacing: 12) {
                Text("Cumplimiento de Presupuesto")
                    .font(.headline)
                    .foregroundStyle(AppTheme.textPrimary(for: section))

                ZStack {
                    Circle()
                        .stroke(Color.gray.opacity(0.15), lineWidth: 12)
                        .frame(width: 100, height: 100)

                    Circle()
                        .trim(from: 0, to: min(report.budgetCompliance, 1.0))
                        .stroke(
                            report.isUnderBudget
                            ? AppTheme.success(for: section)
                            : AppTheme.danger(for: section),
                            style: StrokeStyle(lineWidth: 12, lineCap: .round)
                        )
                        .frame(width: 100, height: 100)
                        .rotationEffect(.degrees(-90))

                    Text("\(Int(min(report.budgetCompliance, 1.0) * 100))%")
                        .font(.title3.weight(.bold))
                        .foregroundStyle(AppTheme.textPrimary(for: section))
                }

                Text(report.isUnderBudget
                     ? "Dentro del presupuesto"
                     : "Presupuesto excedido")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(report.isUnderBudget
                                     ? AppTheme.success(for: section)
                                     : AppTheme.danger(for: section))
            }
            .frame(maxWidth: .infinity)
        }
    }

    // MARK: - Insight

    private func insightSection(_ report: MonthlyReport) -> some View {
        CardView(section: section) {
            VStack(spacing: 10) {
                Image(systemName: "brain.head.profile.fill")
                    .font(.title2)
                    .foregroundStyle(AppTheme.primary(for: section))

                Text("Insight del Ciclo")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(AppTheme.textSecondary(for: section))

                Text(report.insight)
                    .font(.body)
                    .foregroundStyle(AppTheme.textPrimary(for: section))
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)
        }
    }

    // MARK: - Tips

    private func tipsSection(_ report: MonthlyReport) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Recomendaciones")
                .font(.headline)
                .foregroundStyle(AppTheme.textPrimary(for: section))

            ForEach(report.tips.prefix(4)) { tip in
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: tip.type.icon)
                        .font(.subheadline)
                        .foregroundStyle(tipColor(for: tip.type))

                    Text(tip.message)
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.textPrimary(for: section))
                }
                .padding(14)
                .background(
                    RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                        .fill(tipColor(for: tip.type).opacity(0.06))
                )
            }
        }
    }

    // MARK: - Loading

    private var loadingState: some View {
        VStack(spacing: 16) {
            ProgressView()
            Text("Generando reporte...")
                .font(.subheadline)
                .foregroundStyle(AppTheme.textSecondary(for: section))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 100)
    }

    // MARK: - Helpers

    private func generateReport() {
        report = ReportViewModel.generateReport(
            section: section,
            startDay: profile.billingCycleStartDay,
            categories: sectionCategories,
            context: modelContext
        )

        // Award XP for viewing report
        gamificationVM.awardXP(.viewReport, profile: profile)
    }

    private func tipColor(for type: TipType) -> Color {
        switch type {
        case .celebration: return AppTheme.success(for: section)
        case .warning: return AppTheme.warning(for: section)
        case .insight: return AppTheme.primary(for: section)
        case .suggestion: return AppTheme.accent(for: section)
        }
    }
}
