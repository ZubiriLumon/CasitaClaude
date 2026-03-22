import SwiftUI
import SwiftData

/// Gestión de Inventario — stock por sabor + gastos de materia prima
struct InventoryView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var products: [BrownieProduct]
    @Query(sort: \RawMaterialExpense.date, order: .reverse) private var expenses: [RawMaterialExpense]
    @State private var inventoryVM = InventoryViewModel()
    @State private var selectedSegment: InventorySegment = .stock

    enum InventorySegment: String, CaseIterable {
        case stock = "Stock"
        case expenses = "Materia Prima"
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                segmentPicker
                ScrollView {
                    VStack(spacing: AppTheme.Spacing.md) {
                        switch selectedSegment {
                        case .stock:
                            stockSection
                        case .expenses:
                            expensesSection
                        }
                    }
                    .padding()
                }
            }
            .background(AppTheme.Business.background)
            .navigationTitle("Inventario")
            .navigationBarTitleDisplayMode(.large)
            .sheet(isPresented: $inventoryVM.showRestock) {
                restockSheet
            }
            .sheet(isPresented: $inventoryVM.showAddExpense) {
                addExpenseSheet
            }
        }
    }

    // MARK: - Segment Picker

    private var segmentPicker: some View {
        Picker("", selection: $selectedSegment) {
            ForEach(InventorySegment.allCases, id: \.self) { segment in
                Text(segment.rawValue).tag(segment)
            }
        }
        .pickerStyle(.segmented)
        .padding(.horizontal)
        .padding(.vertical, 8)
    }

    // MARK: - Stock Section

    private var stockSection: some View {
        VStack(spacing: 12) {
            // Total stock card
            NeubrutalCard {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Stock Total")
                            .font(.system(.subheadline, design: .rounded))
                            .foregroundStyle(AppTheme.Business.textSecondary)
                        Text("\(products.reduce(0) { $0 + $1.stock }) unidades")
                            .font(.system(.title2, design: .rounded, weight: .bold))
                            .foregroundStyle(AppTheme.Business.textPrimary)
                    }
                    Spacer()
                    Button {
                        inventoryVM.showRestock = true
                    } label: {
                        HStack {
                            Image(systemName: "plus.circle.fill")
                            Text("Resurtir")
                        }
                    }
                    .buttonStyle(NeubrutalButtonStyle(color: AppTheme.Business.accent))
                }
                .padding()
            }

            // Per-flavor cards
            ForEach(products, id: \.id) { product in
                NeubrutalCard(borderColor: Color(hex: product.brownieFlavor.colorHex)) {
                    HStack {
                        Image(systemName: product.brownieFlavor.icon)
                            .symbolRenderingMode(.multicolor)
                            .symbolVariant(.fill)
                            .font(.system(size: 32))

                        VStack(alignment: .leading, spacing: 4) {
                            Text(product.brownieFlavor.rawValue)
                                .font(.system(.headline, design: .rounded, weight: .bold))
                                .foregroundStyle(AppTheme.Business.textPrimary)
                            Text("Costo: $\(String(format: "%.0f", product.costPerUnit))/ud")
                                .font(.system(.caption, design: .rounded))
                                .foregroundStyle(AppTheme.Business.textSecondary)
                        }

                        Spacer()

                        VStack(alignment: .trailing, spacing: 4) {
                            Text("\(product.stock)")
                                .font(.system(.title, design: .rounded, weight: .bold))
                                .foregroundStyle(product.isLowStock ? .red : AppTheme.Business.textPrimary)
                            if product.isLowStock {
                                Text("¡Bajo!")
                                    .font(.system(.caption2, design: .rounded, weight: .bold))
                                    .foregroundStyle(.red)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(.red.opacity(0.1))
                                    .clipShape(Capsule())
                            }
                        }
                    }
                    .padding()
                }
            }
        }
    }

    // MARK: - Expenses Section

    private var expensesSection: some View {
        VStack(spacing: 12) {
            // Monthly total
            NeubrutalCard(borderColor: AppTheme.Business.accentOrange) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Gastos del Mes")
                            .font(.system(.subheadline, design: .rounded))
                            .foregroundStyle(AppTheme.Business.textSecondary)
                        Text(formatCurrency(InventoryViewModel.currentMonthTotal(context: modelContext)))
                            .font(.system(.title2, design: .rounded, weight: .bold))
                            .foregroundStyle(AppTheme.Business.textPrimary)
                    }
                    Spacer()
                    Button {
                        inventoryVM.showAddExpense = true
                    } label: {
                        HStack {
                            Image(systemName: "plus.circle.fill")
                            Text("Agregar")
                        }
                    }
                    .buttonStyle(NeubrutalButtonStyle(color: AppTheme.Business.accentOrange, textColor: .white))
                }
                .padding()
            }

            // Breakdown by category
            let breakdown = InventoryViewModel.spendingByCategory(context: modelContext)
            if !breakdown.isEmpty {
                NeubrutalCard(shadowOffset: 2) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Por Categoría")
                            .font(.system(.subheadline, design: .rounded, weight: .bold))
                            .foregroundStyle(AppTheme.Business.textPrimary)
                        ForEach(breakdown, id: \.category) { item in
                            HStack {
                                Image(systemName: item.category.icon)
                                    .symbolRenderingMode(.multicolor)
                                    .symbolVariant(.fill)
                                    .frame(width: 24)
                                Text(item.category.rawValue)
                                    .font(.system(.body, design: .rounded))
                                    .foregroundStyle(AppTheme.Business.textPrimary)
                                Spacer()
                                Text(formatCurrency(item.total))
                                    .font(.system(.body, design: .rounded, weight: .semibold))
                                    .foregroundStyle(AppTheme.Business.textSecondary)
                            }
                        }
                    }
                    .padding()
                }
            }

            // Recent expenses list
            let monthExpenses = InventoryViewModel.currentMonthExpenses(context: modelContext)
            ForEach(monthExpenses, id: \.id) { expense in
                NeubrutalCard(shadowOffset: 2) {
                    HStack {
                        Image(systemName: expense.category.icon)
                            .symbolRenderingMode(.multicolor)
                            .symbolVariant(.fill)
                            .font(.title3)
                            .frame(width: 30)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(expense.category.rawValue)
                                .font(.system(.body, design: .rounded, weight: .medium))
                                .foregroundStyle(AppTheme.Business.textPrimary)
                            if !expense.expenseDescription.isEmpty {
                                Text(expense.expenseDescription)
                                    .font(.system(.caption, design: .rounded))
                                    .foregroundStyle(AppTheme.Business.textSecondary)
                            }
                            Text(expense.date.formatted(.dateTime.day().month()))
                                .font(.system(.caption2, design: .rounded))
                                .foregroundStyle(AppTheme.Business.textSecondary)
                        }

                        Spacer()

                        Text(formatCurrency(expense.amount))
                            .font(.system(.body, design: .rounded, weight: .bold))
                            .foregroundStyle(AppTheme.Business.danger)
                    }
                    .padding()
                }
            }

            if monthExpenses.isEmpty {
                NeubrutalCard(borderColor: AppTheme.Business.textSecondary.opacity(0.3)) {
                    HStack {
                        Image(systemName: "tray")
                            .font(.title2)
                        Text("Sin gastos de materia prima este mes")
                            .font(.system(.body, design: .rounded))
                    }
                    .foregroundStyle(AppTheme.Business.textSecondary)
                    .padding()
                }
            }
        }
    }

    // MARK: - Restock Sheet

    private var restockSheet: some View {
        NavigationStack {
            Form {
                Section("Sabor") {
                    Picker("Sabor", selection: $inventoryVM.restockFlavor) {
                        ForEach(BrownieFlavor.allCases) { flavor in
                            HStack {
                                Image(systemName: flavor.icon)
                                    .symbolRenderingMode(.multicolor)
                                    .symbolVariant(.fill)
                                Text(flavor.rawValue)
                            }
                            .tag(flavor)
                        }
                    }
                    .pickerStyle(.inline)
                }

                Section("Cantidad") {
                    TextField("Unidades a agregar", text: $inventoryVM.restockQuantity)
                        .keyboardType(.numberPad)
                        .font(.system(.body, design: .rounded))
                }
            }
            .navigationTitle("Resurtir Stock")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { inventoryVM.resetRestockForm() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Agregar") {
                        inventoryVM.restockProduct(context: modelContext)
                    }
                    .font(.system(.body, design: .rounded, weight: .bold))
                    .disabled(Int(inventoryVM.restockQuantity) ?? 0 <= 0)
                }
            }
        }
        .presentationDetents([.medium])
    }

    // MARK: - Add Expense Sheet

    private var addExpenseSheet: some View {
        NavigationStack {
            Form {
                Section("Categoría") {
                    Picker("Material", selection: $inventoryVM.expenseCategory) {
                        ForEach(RawMaterialCategory.allCases) { cat in
                            HStack {
                                Image(systemName: cat.icon)
                                    .symbolRenderingMode(.multicolor)
                                    .symbolVariant(.fill)
                                Text(cat.rawValue)
                            }
                            .tag(cat)
                        }
                    }
                    .pickerStyle(.inline)
                }

                Section("Detalle") {
                    TextField("Monto ($)", text: $inventoryVM.expenseAmount)
                        .keyboardType(.decimalPad)
                        .font(.system(.body, design: .rounded))

                    TextField("Descripción (opcional)", text: $inventoryVM.expenseDescription)
                        .font(.system(.body, design: .rounded))

                    DatePicker("Fecha", selection: $inventoryVM.expenseDate, displayedComponents: .date)
                        .font(.system(.body, design: .rounded))
                }
            }
            .navigationTitle("Gasto de Materia Prima")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { inventoryVM.resetExpenseForm() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Guardar") {
                        inventoryVM.saveExpense(context: modelContext)
                    }
                    .font(.system(.body, design: .rounded, weight: .bold))
                    .disabled(Double(inventoryVM.expenseAmount) ?? 0 <= 0)
                }
            }
        }
        .presentationDetents([.large])
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
