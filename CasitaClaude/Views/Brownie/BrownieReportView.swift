import SwiftUI
import SwiftData

/// Reportes Mensuales — Ventas totales - (Inversión + Gastos) = Ganancia Real
struct BrownieReportView: View {
    @Environment(\.modelContext) private var modelContext
    @State private var selectedMonth: Date = Date()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: AppTheme.Spacing.lg) {
                    monthPicker
                    profitCard
                    revenueBreakdown
                    expenseBreakdown
                    salesByFlavor
                }
                .padding()
            }
            .background(AppTheme.Business.background)
            .navigationTitle("Reportes")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    // MARK: - Month Picker

    private var monthPicker: some View {
        HStack {
            Button {
                withAnimation {
                    selectedMonth = Calendar.current.date(byAdding: .month, value: -1, to: selectedMonth) ?? selectedMonth
                }
            } label: {
                Image(systemName: "chevron.left.circle.fill")
                    .font(.title2)
                    .foregroundStyle(AppTheme.Business.primary)
            }

            Spacer()

            Text(selectedMonth.formatted(.dateTime.month(.wide).year()))
                .font(.system(.title3, design: .rounded, weight: .bold))
                .foregroundStyle(AppTheme.Business.textPrimary)

            Spacer()

            Button {
                withAnimation {
                    selectedMonth = Calendar.current.date(byAdding: .month, value: 1, to: selectedMonth) ?? selectedMonth
                }
            } label: {
                Image(systemName: "chevron.right.circle.fill")
                    .font(.title2)
                    .foregroundStyle(AppTheme.Business.primary)
            }
        }
    }

    // MARK: - Report Data

    private var reportData: MonthlyBrownieReport {
        generateReport()
    }

    // MARK: - Profit Card

    private var profitCard: some View {
        let report = reportData

        return NeubrutalCard(
            borderColor: report.realProfit >= 0 ? AppTheme.Business.success : AppTheme.Business.danger
        ) {
            VStack(spacing: 12) {
                Image(systemName: report.realProfit >= 0 ? "chart.line.uptrend.xyaxis" : "chart.line.downtrend.xyaxis")
                    .symbolRenderingMode(.multicolor)
                    .font(.system(size: 40))
                    .foregroundStyle(report.realProfit >= 0 ? AppTheme.Business.success : AppTheme.Business.danger)

                Text("Ganancia Real")
                    .font(.system(.headline, design: .rounded))
                    .foregroundStyle(AppTheme.Business.textSecondary)

                Text(formatCurrency(report.realProfit))
                    .font(.system(.largeTitle, design: .rounded, weight: .bold))
                    .foregroundStyle(report.realProfit >= 0 ? AppTheme.Business.success : AppTheme.Business.danger)

                Text("Ventas - (Producción + Materia Prima)")
                    .font(.system(.caption, design: .rounded))
                    .foregroundStyle(AppTheme.Business.textSecondary)
            }
            .padding()
            .frame(maxWidth: .infinity)
        }
    }

    // MARK: - Revenue Breakdown

    private var revenueBreakdown: some View {
        let report = reportData

        return NeubrutalCard(borderColor: AppTheme.Business.primary) {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Image(systemName: "dollarsign.circle.fill")
                        .symbolRenderingMode(.multicolor)
                        .font(.title3)
                    Text("Ingresos")
                        .font(.system(.headline, design: .rounded, weight: .bold))
                        .foregroundStyle(AppTheme.Business.textPrimary)
                }

                reportRow("Ventas totales", value: report.totalRevenue, color: AppTheme.Business.primary)
                reportRow("Brownies vendidos", count: report.totalBrowniesSold)
                reportRow("Número de ventas", count: report.totalSalesCount)

                if report.totalBrowniesSold > 0 {
                    reportRow(
                        "Precio promedio/ud",
                        value: report.totalRevenue / Double(report.totalBrowniesSold),
                        color: AppTheme.Business.textSecondary
                    )
                }
            }
            .padding()
        }
    }

    // MARK: - Expense Breakdown

    private var expenseBreakdown: some View {
        let report = reportData

        return NeubrutalCard(borderColor: AppTheme.Business.accentOrange) {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Image(systemName: "cart.fill")
                        .symbolRenderingMode(.multicolor)
                        .font(.title3)
                    Text("Gastos")
                        .font(.system(.headline, design: .rounded, weight: .bold))
                        .foregroundStyle(AppTheme.Business.textPrimary)
                }

                reportRow("Costo de producción", value: report.productionCost, color: AppTheme.Business.danger)
                reportRow("Materia prima extra", value: report.rawMaterialExpenses, color: AppTheme.Business.warning)

                Divider()

                HStack {
                    Text("Total gastos")
                        .font(.system(.body, design: .rounded, weight: .bold))
                        .foregroundStyle(AppTheme.Business.textPrimary)
                    Spacer()
                    Text(formatCurrency(report.totalExpenses))
                        .font(.system(.title3, design: .rounded, weight: .bold))
                        .foregroundStyle(AppTheme.Business.danger)
                }
            }
            .padding()
        }
    }

    // MARK: - Sales by Flavor

    private var salesByFlavor: some View {
        let report = reportData

        return NeubrutalCard(borderColor: AppTheme.Business.secondary) {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Image(systemName: "chart.pie.fill")
                        .symbolRenderingMode(.multicolor)
                        .font(.title3)
                    Text("Ventas por Sabor")
                        .font(.system(.headline, design: .rounded, weight: .bold))
                        .foregroundStyle(AppTheme.Business.textPrimary)
                }

                if report.salesByFlavor.isEmpty {
                    Text("Sin ventas este mes")
                        .font(.system(.body, design: .rounded))
                        .foregroundStyle(AppTheme.Business.textSecondary)
                } else {
                    ForEach(report.salesByFlavor, id: \.flavor) { item in
                        HStack {
                            Image(systemName: item.flavor.icon)
                                .symbolRenderingMode(.multicolor)
                                .symbolVariant(.fill)
                                .frame(width: 24)
                            Text(item.flavor.rawValue)
                                .font(.system(.body, design: .rounded))
                                .foregroundStyle(AppTheme.Business.textPrimary)
                            Spacer()
                            Text("\(item.quantity) uds")
                                .font(.system(.body, design: .rounded, weight: .semibold))
                                .foregroundStyle(AppTheme.Business.textSecondary)

                            // Progress bar
                            let maxQty = report.salesByFlavor.map(\.quantity).max() ?? 1
                            GeometryReader { geo in
                                RoundedRectangle(cornerRadius: 4)
                                    .fill(Color(hex: item.flavor.colorHex).opacity(0.6))
                                    .frame(
                                        width: geo.size.width * CGFloat(item.quantity) / CGFloat(max(maxQty, 1)),
                                        height: geo.size.height
                                    )
                            }
                            .frame(width: 60, height: 12)
                            .background(Color.gray.opacity(0.1))
                            .clipShape(RoundedRectangle(cornerRadius: 4))
                        }
                    }
                }
            }
            .padding()
        }
    }

    // MARK: - Helper Views

    private func reportRow(_ label: String, value: Double, color: Color) -> some View {
        HStack {
            Text(label)
                .font(.system(.body, design: .rounded))
                .foregroundStyle(AppTheme.Business.textPrimary)
            Spacer()
            Text(formatCurrency(value))
                .font(.system(.body, design: .rounded, weight: .semibold))
                .foregroundStyle(color)
        }
    }

    private func reportRow(_ label: String, count: Int) -> some View {
        HStack {
            Text(label)
                .font(.system(.body, design: .rounded))
                .foregroundStyle(AppTheme.Business.textPrimary)
            Spacer()
            Text("\(count)")
                .font(.system(.body, design: .rounded, weight: .semibold))
                .foregroundStyle(AppTheme.Business.textSecondary)
        }
    }

    // MARK: - Report Generation

    private func generateReport() -> MonthlyBrownieReport {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.year, .month], from: selectedMonth)
        let year = components.year ?? 2026
        let month = components.month ?? 1

        // Get sales for month
        let sales = SalesViewModel.salesForMonth(year: year, month: month, context: modelContext)

        let totalRevenue = sales.reduce(0) { $0 + $1.totalAmount }
        let productionCost = sales.reduce(0) { $0 + $1.totalCost }
        let totalBrownies = sales.reduce(0) { $0 + $1.totalBrownies }

        // Get raw material expenses for month
        var startComponents = DateComponents()
        startComponents.year = year
        startComponents.month = month
        startComponents.day = 1
        let start = calendar.date(from: startComponents)!
        let end = calendar.date(byAdding: .month, value: 1, to: start)!

        let expDescriptor = FetchDescriptor<RawMaterialExpense>(
            predicate: #Predicate { $0.date >= start && $0.date < end }
        )
        let rawExpenses = (try? modelContext.fetch(expDescriptor)) ?? []
        let rawMaterialTotal = rawExpenses.reduce(0) { $0 + $1.amount }

        // Sales by flavor
        var flavorCounts: [String: Int] = [:]
        for sale in sales {
            for item in sale.items {
                flavorCounts[item.flavor, default: 0] += item.quantity
            }
        }
        let salesByFlavor = flavorCounts.compactMap { key, qty -> FlavorSalesData? in
            guard let flavor = BrownieFlavor(rawValue: key) else { return nil }
            return FlavorSalesData(flavor: flavor, quantity: qty)
        }.sorted { $0.quantity > $1.quantity }

        return MonthlyBrownieReport(
            totalRevenue: totalRevenue,
            productionCost: productionCost,
            rawMaterialExpenses: rawMaterialTotal,
            totalBrowniesSold: totalBrownies,
            totalSalesCount: sales.count,
            salesByFlavor: salesByFlavor
        )
    }

    private func formatCurrency(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "es_MX")
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: value)) ?? "$0"
    }
}

// MARK: - Report Data Structs

struct MonthlyBrownieReport {
    let totalRevenue: Double
    let productionCost: Double
    let rawMaterialExpenses: Double
    let totalBrowniesSold: Int
    let totalSalesCount: Int
    let salesByFlavor: [FlavorSalesData]

    var totalExpenses: Double { productionCost + rawMaterialExpenses }
    var realProfit: Double { totalRevenue - totalExpenses }
}

struct FlavorSalesData {
    let flavor: BrownieFlavor
    let quantity: Int
}
