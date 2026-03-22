import SwiftUI
import SwiftData

/// Punto de Venta — interfaz para crear ventas con carrito y descuento automático
struct POSView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var products: [BrownieProduct]
    @State private var salesVM = SalesViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: AppTheme.Spacing.lg) {
                    flavorSelectionGrid
                    cartSummary
                    if !salesVM.isCartEmpty {
                        pricingBreakdown
                        completeButton
                    }
                }
                .padding()
            }
            .background(AppTheme.Business.background)
            .navigationTitle("Punto de Venta")
            .navigationBarTitleDisplayMode(.large)
            .overlay {
                if salesVM.showConfirmation {
                    saleConfirmationOverlay
                }
            }
        }
    }

    // MARK: - Flavor Selection Grid

    private var flavorSelectionGrid: some View {
        VStack(spacing: 12) {
            ForEach(BrownieFlavor.allCases) { flavor in
                let product = products.first { $0.brownieFlavor == flavor }
                let stock = product?.stock ?? 0
                let inCart = salesVM.quantityInCart(for: flavor)

                NeubrutalCard(borderColor: Color(hex: flavor.colorHex)) {
                    HStack(spacing: 16) {
                        // Flavor icon and info
                        VStack {
                            Image(systemName: flavor.icon)
                                .symbolRenderingMode(.multicolor)
                                .symbolVariant(.fill)
                                .font(.system(size: 36))
                        }
                        .frame(width: 50)

                        VStack(alignment: .leading, spacing: 4) {
                            Text(flavor.rawValue)
                                .font(.system(.headline, design: .rounded, weight: .bold))
                                .foregroundStyle(AppTheme.Business.textPrimary)
                            Text("Stock: \(stock)")
                                .font(.system(.caption, design: .rounded))
                                .foregroundStyle(stock < 5 ? .red : AppTheme.Business.textSecondary)
                        }

                        Spacer()

                        // Quantity controls
                        HStack(spacing: 12) {
                            Button {
                                withAnimation(.spring(duration: 0.2)) {
                                    salesVM.removeFromCart(flavor: flavor)
                                }
                            } label: {
                                Image(systemName: "minus.circle.fill")
                                    .font(.system(size: 32))
                                    .foregroundStyle(inCart > 0 ? AppTheme.Business.danger : .gray.opacity(0.3))
                            }
                            .disabled(inCart == 0)

                            Text("\(inCart)")
                                .font(.system(.title2, design: .rounded, weight: .bold))
                                .foregroundStyle(AppTheme.Business.textPrimary)
                                .frame(minWidth: 30)

                            Button {
                                withAnimation(.spring(duration: 0.2)) {
                                    salesVM.addToCart(flavor: flavor)
                                }
                            } label: {
                                Image(systemName: "plus.circle.fill")
                                    .font(.system(size: 32))
                                    .foregroundStyle(stock > inCart ? AppTheme.Business.accent : .gray.opacity(0.3))
                            }
                            .disabled(stock <= inCart)
                        }
                    }
                    .padding()
                }
            }
        }
    }

    // MARK: - Cart Summary

    private var cartSummary: some View {
        NeubrutalCard(borderColor: AppTheme.Business.primary) {
            VStack(spacing: 12) {
                HStack {
                    Image(systemName: "cart.fill")
                        .symbolRenderingMode(.multicolor)
                        .symbolVariant(.fill)
                        .font(.title2)
                    Text("Carrito")
                        .font(.system(.headline, design: .rounded, weight: .bold))
                        .foregroundStyle(AppTheme.Business.textPrimary)
                    Spacer()
                    if !salesVM.isCartEmpty {
                        Button("Vaciar") {
                            withAnimation { salesVM.clearCart() }
                        }
                        .font(.system(.caption, design: .rounded, weight: .semibold))
                        .foregroundStyle(AppTheme.Business.danger)
                    }
                }

                if salesVM.isCartEmpty {
                    Text("Agrega brownies para empezar")
                        .font(.system(.body, design: .rounded))
                        .foregroundStyle(AppTheme.Business.textSecondary)
                        .padding(.vertical, 8)
                } else {
                    HStack {
                        Text("\(salesVM.totalBrowniesInCart) brownies")
                            .font(.system(.body, design: .rounded, weight: .medium))
                            .foregroundStyle(AppTheme.Business.textPrimary)
                        Spacer()
                        Text(formatCurrency(salesVM.cartTotal))
                            .font(.system(.title2, design: .rounded, weight: .bold))
                            .foregroundStyle(AppTheme.Business.primary)
                    }
                }
            }
            .padding()
        }
    }

    // MARK: - Pricing Breakdown

    private var pricingBreakdown: some View {
        NeubrutalCard(borderColor: AppTheme.Business.accent, shadowOffset: 3) {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "tag.fill")
                        .symbolRenderingMode(.multicolor)
                        .font(.body)
                    Text("Desglose de Precio")
                        .font(.system(.subheadline, design: .rounded, weight: .bold))
                        .foregroundStyle(AppTheme.Business.textPrimary)
                }

                if salesVM.pairsCount > 0 {
                    HStack {
                        Text("\(salesVM.pairsCount) par(es) × $55")
                            .font(.system(.body, design: .rounded))
                        Spacer()
                        Text(formatCurrency(Double(salesVM.pairsCount) * 55))
                            .font(.system(.body, design: .rounded, weight: .semibold))
                    }
                    .foregroundStyle(AppTheme.Business.textPrimary)
                }

                if salesVM.singlesCount > 0 {
                    HStack {
                        Text("\(salesVM.singlesCount) individual × $30")
                            .font(.system(.body, design: .rounded))
                        Spacer()
                        Text(formatCurrency(30))
                            .font(.system(.body, design: .rounded, weight: .semibold))
                    }
                    .foregroundStyle(AppTheme.Business.textPrimary)
                }

                if salesVM.discountSaved > 0 {
                    Divider()
                    HStack {
                        Image(systemName: "sparkles")
                            .foregroundStyle(AppTheme.Business.accentOrange)
                        Text("Ahorro del cliente")
                            .font(.system(.body, design: .rounded))
                        Spacer()
                        Text("-\(formatCurrency(salesVM.discountSaved))")
                            .font(.system(.body, design: .rounded, weight: .bold))
                            .foregroundStyle(AppTheme.Business.success)
                    }
                }

                Divider()

                HStack {
                    Text("Tu ganancia neta")
                        .font(.system(.body, design: .rounded, weight: .medium))
                    Spacer()
                    Text(formatCurrency(salesVM.cartProfit))
                        .font(.system(.title3, design: .rounded, weight: .bold))
                        .foregroundStyle(AppTheme.Business.success)
                }
            }
            .padding()
        }
    }

    // MARK: - Complete Button

    private var completeButton: some View {
        Button {
            withAnimation(.spring) {
                salesVM.completeSale(context: modelContext)
            }
        } label: {
            HStack {
                Image(systemName: "checkmark.circle.fill")
                Text("Cobrar \(formatCurrency(salesVM.cartTotal))")
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(NeubrutalButtonStyle(color: AppTheme.Business.primary))
        .padding(.top, 4)
    }

    // MARK: - Sale Confirmation Overlay

    private var saleConfirmationOverlay: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()
                .onTapGesture {
                    withAnimation { salesVM.showConfirmation = false }
                }

            NeubrutalCard(borderColor: AppTheme.Business.success) {
                VStack(spacing: 16) {
                    Image(systemName: "checkmark.seal.fill")
                        .symbolRenderingMode(.multicolor)
                        .font(.system(size: 60))
                        .foregroundStyle(AppTheme.Business.success)

                    Text("¡Venta Registrada!")
                        .font(.system(.title2, design: .rounded, weight: .bold))
                        .foregroundStyle(AppTheme.Business.textPrimary)

                    Text(formatCurrency(salesVM.lastSaleTotal))
                        .font(.system(.largeTitle, design: .rounded, weight: .bold))
                        .foregroundStyle(AppTheme.Business.primary)

                    Button("Continuar") {
                        withAnimation { salesVM.showConfirmation = false }
                    }
                    .buttonStyle(NeubrutalButtonStyle(color: AppTheme.Business.accent))
                }
                .padding(24)
            }
            .padding(40)
            .transition(.scale.combined(with: .opacity))
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
