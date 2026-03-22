import SwiftUI
import SwiftData

/// Pedidos Pendientes — lista de pedidos por adelantado
struct PendingOrdersView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(
        filter: #Predicate<PendingOrder> { !$0.isDelivered },
        sort: \PendingOrder.deliveryDate
    ) private var pendingOrders: [PendingOrder]
    @Query(
        filter: #Predicate<PendingOrder> { $0.isDelivered },
        sort: \PendingOrder.deliveryDate, order: .reverse
    ) private var deliveredOrders: [PendingOrder]
    @State private var orderVM = OrderViewModel()
    @State private var showDelivered: Bool = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: AppTheme.Spacing.md) {
                    summaryCard
                    pendingSection
                    deliveredSection
                }
                .padding()
            }
            .background(AppTheme.Business.background)
            .navigationTitle("Pedidos")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        orderVM.showAddOrder = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .symbolRenderingMode(.multicolor)
                            .font(.title2)
                    }
                }
            }
            .sheet(isPresented: $orderVM.showAddOrder) {
                addOrderSheet
            }
        }
    }

    // MARK: - Summary

    private var summaryCard: some View {
        NeubrutalCard(borderColor: AppTheme.Business.accent) {
            HStack(spacing: 16) {
                VStack(spacing: 4) {
                    Text("\(pendingOrders.count)")
                        .font(.system(.title, design: .rounded, weight: .bold))
                        .foregroundStyle(AppTheme.Business.primary)
                    Text("Pendientes")
                        .font(.system(.caption, design: .rounded))
                        .foregroundStyle(AppTheme.Business.textSecondary)
                }
                .frame(maxWidth: .infinity)

                let overdueCount = pendingOrders.filter { $0.isOverdue }.count
                VStack(spacing: 4) {
                    Text("\(overdueCount)")
                        .font(.system(.title, design: .rounded, weight: .bold))
                        .foregroundStyle(overdueCount > 0 ? .red : AppTheme.Business.success)
                    Text("Atrasados")
                        .font(.system(.caption, design: .rounded))
                        .foregroundStyle(AppTheme.Business.textSecondary)
                }
                .frame(maxWidth: .infinity)

                let unpaidRevenue = pendingOrders.filter { !$0.isPaid }.reduce(0) { $0 + $1.totalAmount }
                VStack(spacing: 4) {
                    Text(formatCurrency(unpaidRevenue))
                        .font(.system(.title3, design: .rounded, weight: .bold))
                        .foregroundStyle(AppTheme.Business.accentOrange)
                    Text("Por cobrar")
                        .font(.system(.caption, design: .rounded))
                        .foregroundStyle(AppTheme.Business.textSecondary)
                }
                .frame(maxWidth: .infinity)
            }
            .padding()
        }
    }

    // MARK: - Pending Orders

    private var pendingSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Pedidos Pendientes")
                .font(.system(.headline, design: .rounded, weight: .bold))
                .foregroundStyle(AppTheme.Business.textPrimary)

            if pendingOrders.isEmpty {
                NeubrutalCard(borderColor: AppTheme.Business.textSecondary.opacity(0.3)) {
                    HStack {
                        Image(systemName: "checkmark.circle")
                            .font(.title2)
                        Text("No hay pedidos pendientes")
                            .font(.system(.body, design: .rounded))
                    }
                    .foregroundStyle(AppTheme.Business.textSecondary)
                    .padding()
                    .frame(maxWidth: .infinity)
                }
            } else {
                ForEach(pendingOrders, id: \.id) { order in
                    orderCard(order)
                }
            }
        }
    }

    // MARK: - Delivered Orders

    private var deliveredSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Button {
                withAnimation { showDelivered.toggle() }
            } label: {
                HStack {
                    Text("Entregados (\(deliveredOrders.count))")
                        .font(.system(.headline, design: .rounded, weight: .bold))
                        .foregroundStyle(AppTheme.Business.textSecondary)
                    Image(systemName: showDelivered ? "chevron.up" : "chevron.down")
                        .foregroundStyle(AppTheme.Business.textSecondary)
                }
            }

            if showDelivered {
                ForEach(deliveredOrders.prefix(10), id: \.id) { order in
                    orderCard(order)
                        .opacity(0.7)
                }
            }
        }
    }

    // MARK: - Order Card

    private func orderCard(_ order: PendingOrder) -> some View {
        NeubrutalCard(
            borderColor: order.isOverdue ? AppTheme.Business.danger : AppTheme.Business.secondary,
            shadowOffset: 3
        ) {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "person.fill")
                        .symbolRenderingMode(.multicolor)
                        .symbolVariant(.fill)
                    Text(order.customerName)
                        .font(.system(.headline, design: .rounded, weight: .bold))
                        .foregroundStyle(AppTheme.Business.textPrimary)
                    Spacer()

                    // Payment badge
                    Text(order.isPaid ? "Pagado" : "Pendiente")
                        .font(.system(.caption, design: .rounded, weight: .bold))
                        .foregroundStyle(order.isPaid ? AppTheme.Business.success : AppTheme.Business.accentOrange)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(
                            (order.isPaid ? AppTheme.Business.success : AppTheme.Business.accentOrange).opacity(0.15)
                        )
                        .clipShape(Capsule())
                }

                Text(order.orderDescription)
                    .font(.system(.body, design: .rounded))
                    .foregroundStyle(AppTheme.Business.textPrimary)

                HStack {
                    Image(systemName: "calendar")
                        .foregroundStyle(AppTheme.Business.textSecondary)
                    Text(order.deliveryDate.formatted(.dateTime.day().month().year()))
                        .font(.system(.caption, design: .rounded))
                        .foregroundStyle(order.isOverdue ? .red : AppTheme.Business.textSecondary)

                    if order.isOverdue && !order.isDelivered {
                        Text("¡ATRASADO!")
                            .font(.system(.caption2, design: .rounded, weight: .bold))
                            .foregroundStyle(.red)
                    }

                    Spacer()

                    if order.totalAmount > 0 {
                        Text(formatCurrency(order.totalAmount))
                            .font(.system(.body, design: .rounded, weight: .bold))
                            .foregroundStyle(AppTheme.Business.primary)
                    }
                }

                if !order.notes.isEmpty {
                    Text(order.notes)
                        .font(.system(.caption, design: .rounded))
                        .foregroundStyle(AppTheme.Business.textSecondary)
                        .italic()
                }

                // Action buttons
                if !order.isDelivered {
                    Divider()
                    HStack(spacing: 12) {
                        Button {
                            withAnimation { orderVM.togglePaid(order: order, context: modelContext) }
                        } label: {
                            HStack(spacing: 4) {
                                Image(systemName: order.isPaid ? "xmark.circle" : "dollarsign.circle.fill")
                                Text(order.isPaid ? "Desmarcar pago" : "Marcar pagado")
                            }
                            .font(.system(.caption, design: .rounded, weight: .semibold))
                        }

                        Spacer()

                        Button {
                            withAnimation { orderVM.markDelivered(order: order, context: modelContext) }
                        } label: {
                            HStack(spacing: 4) {
                                Image(systemName: "checkmark.circle.fill")
                                Text("Entregado")
                            }
                            .font(.system(.caption, design: .rounded, weight: .semibold))
                            .foregroundStyle(AppTheme.Business.success)
                        }
                    }
                }
            }
            .padding()
        }
    }

    // MARK: - Add Order Sheet

    private var addOrderSheet: some View {
        NavigationStack {
            Form {
                Section("Cliente") {
                    TextField("Nombre del cliente", text: $orderVM.customerName)
                        .font(.system(.body, design: .rounded))
                }

                Section("Pedido") {
                    TextField("Descripción (ej: 6 Triple Chocolate, 4 Oreo)", text: $orderVM.orderDescription)
                        .font(.system(.body, design: .rounded))
                    TextField("Monto total ($)", text: $orderVM.totalAmount)
                        .keyboardType(.decimalPad)
                        .font(.system(.body, design: .rounded))
                    DatePicker("Fecha de entrega", selection: $orderVM.deliveryDate, displayedComponents: .date)
                        .font(.system(.body, design: .rounded))
                }

                Section("Estado") {
                    Toggle("Ya está pagado", isOn: $orderVM.isPaid)
                        .font(.system(.body, design: .rounded))
                }

                Section("Notas") {
                    TextField("Notas adicionales (opcional)", text: $orderVM.notes, axis: .vertical)
                        .font(.system(.body, design: .rounded))
                        .lineLimit(3...6)
                }
            }
            .navigationTitle("Nuevo Pedido")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { orderVM.resetForm() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Guardar") {
                        orderVM.saveOrder(context: modelContext)
                    }
                    .font(.system(.body, design: .rounded, weight: .bold))
                    .disabled(!orderVM.canSave)
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
