import SwiftUI
import SwiftData

/// Dashboard principal de Brownie Master — resumen del día con alertas de stock
struct BrownieDashboardView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var products: [BrownieProduct]
    @Query(
        filter: #Predicate<Sale> { sale in
            sale.date >= Date().addingTimeInterval(-86400)
        },
        sort: \Sale.date, order: .reverse
    ) private var recentSales: [Sale]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: AppTheme.Spacing.lg) {
                    headerSection
                    stockAlerts
                    todaySummaryCard
                    quickStatsRow
                    recentSalesSection
                }
                .padding()
            }
            .background(AppTheme.Business.background)
            .navigationTitle("Brownie Master")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    // MARK: - Header

    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("¡Hola, Chef!")
                    .font(.system(.title2, design: .rounded, weight: .bold))
                    .foregroundStyle(AppTheme.Business.textPrimary)
                Text(Date().formatted(.dateTime.weekday(.wide).day().month(.wide)))
                    .font(.system(.subheadline, design: .rounded))
                    .foregroundStyle(AppTheme.Business.textSecondary)
            }
            Spacer()
            Image(systemName: "birthday.cake.fill")
                .symbolRenderingMode(.multicolor)
                .symbolVariant(.fill)
                .font(.system(size: 40))
        }
    }

    // MARK: - Stock Alerts

    @ViewBuilder
    private var stockAlerts: some View {
        let lowStock = products.filter { $0.isLowStock }
        if !lowStock.isEmpty {
            NeubrutalCard(borderColor: AppTheme.Business.danger) {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .symbolRenderingMode(.multicolor)
                            .font(.title3)
                        Text("Alertas de Stock")
                            .font(.system(.headline, design: .rounded, weight: .bold))
                    }
                    .foregroundStyle(.red)

                    ForEach(lowStock, id: \.id) { product in
                        HStack {
                            Image(systemName: product.brownieFlavor.icon)
                                .symbolRenderingMode(.multicolor)
                                .symbolVariant(.fill)
                            Text(product.brownieFlavor.rawValue)
                                .font(.system(.body, design: .rounded))
                            Spacer()
                            Text("\(product.stock) uds")
                                .font(.system(.body, design: .rounded, weight: .bold))
                                .foregroundStyle(.red)
                        }
                    }
                }
                .padding()
            }
        }
    }

    // MARK: - Today Summary

    private var todaySummaryCard: some View {
        NeubrutalCard {
            VStack(spacing: 12) {
                HStack {
                    Image(systemName: "chart.line.uptrend.xyaxis")
                        .symbolRenderingMode(.multicolor)
                        .font(.title2)
                    Text("Resumen del Día")
                        .font(.system(.headline, design: .rounded, weight: .bold))
                        .foregroundStyle(AppTheme.Business.textPrimary)
                    Spacer()
                }

                let todayRevenue = SalesViewModel.todayRevenue(context: modelContext)
                let todayProfit = SalesViewModel.todayProfit(context: modelContext)
                let todaySold = SalesViewModel.todayBrowniesSold(context: modelContext)

                HStack(spacing: 16) {
                    summaryItem(
                        title: "Ventas",
                        value: formatCurrency(todayRevenue),
                        icon: "dollarsign.circle.fill",
                        color: AppTheme.Business.primary
                    )
                    summaryItem(
                        title: "Ganancia",
                        value: formatCurrency(todayProfit),
                        icon: "arrow.up.circle.fill",
                        color: AppTheme.Business.success
                    )
                    summaryItem(
                        title: "Vendidos",
                        value: "\(todaySold)",
                        icon: "bag.fill",
                        color: AppTheme.Business.accent
                    )
                }
            }
            .padding()
        }
    }

    private func summaryItem(title: String, value: String, icon: String, color: Color) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .symbolRenderingMode(.multicolor)
                .symbolVariant(.fill)
                .font(.title2)
                .foregroundStyle(color)
            Text(value)
                .font(.system(.title3, design: .rounded, weight: .bold))
                .foregroundStyle(AppTheme.Business.textPrimary)
            Text(title)
                .font(.system(.caption, design: .rounded))
                .foregroundStyle(AppTheme.Business.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Quick Stats

    private var quickStatsRow: some View {
        HStack(spacing: 12) {
            ForEach(products, id: \.id) { product in
                NeubrutalCard(
                    borderColor: Color(hex: product.brownieFlavor.colorHex),
                    shadowOffset: 3
                ) {
                    VStack(spacing: 6) {
                        Image(systemName: product.brownieFlavor.icon)
                            .symbolRenderingMode(.multicolor)
                            .symbolVariant(.fill)
                            .font(.title2)
                        Text("\(product.stock)")
                            .font(.system(.title2, design: .rounded, weight: .bold))
                            .foregroundStyle(product.isLowStock ? .red : AppTheme.Business.textPrimary)
                        Text(product.brownieFlavor.rawValue)
                            .font(.system(.caption2, design: .rounded, weight: .medium))
                            .foregroundStyle(AppTheme.Business.textSecondary)
                            .lineLimit(1)
                            .minimumScaleFactor(0.8)
                    }
                    .padding(.vertical, 12)
                    .padding(.horizontal, 8)
                    .frame(maxWidth: .infinity)
                }
            }
        }
    }

    // MARK: - Recent Sales

    private var recentSalesSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Ventas Recientes")
                .font(.system(.headline, design: .rounded, weight: .bold))
                .foregroundStyle(AppTheme.Business.textPrimary)

            let todaySalesList = SalesViewModel.todaySales(context: modelContext)
            if todaySalesList.isEmpty {
                NeubrutalCard(borderColor: AppTheme.Business.textSecondary.opacity(0.3)) {
                    HStack {
                        Image(systemName: "tray")
                            .font(.title2)
                            .foregroundStyle(AppTheme.Business.textSecondary)
                        Text("No hay ventas hoy todavía")
                            .font(.system(.body, design: .rounded))
                            .foregroundStyle(AppTheme.Business.textSecondary)
                        Spacer()
                    }
                    .padding()
                }
            } else {
                ForEach(todaySalesList, id: \.id) { sale in
                    NeubrutalCard(shadowOffset: 2) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("\(sale.totalBrownies) brownies")
                                    .font(.system(.body, design: .rounded, weight: .semibold))
                                    .foregroundStyle(AppTheme.Business.textPrimary)
                                Text(sale.date.formatted(.dateTime.hour().minute()))
                                    .font(.system(.caption, design: .rounded))
                                    .foregroundStyle(AppTheme.Business.textSecondary)
                            }
                            Spacer()
                            Text(formatCurrency(sale.totalAmount))
                                .font(.system(.title3, design: .rounded, weight: .bold))
                                .foregroundStyle(AppTheme.Business.primary)
                        }
                        .padding()
                    }
                }
            }
        }
    }

    // MARK: - Helpers

    private func formatCurrency(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "es_MX")
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: value)) ?? "$0"
    }
}
