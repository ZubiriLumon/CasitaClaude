import SwiftUI
import SwiftData

/// 3-step expense registration flow: Amount → Category → Details
struct AddExpenseView: View {
    let profile: UserProfile

    @Environment(AppViewModel.self) private var appVM
    @Environment(GamificationViewModel.self) private var gamificationVM
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Query private var categories: [Category]

    @State private var vm = ExpenseViewModel()

    private var section: SectionMode { appVM.currentSection }

    private var sectionCategories: [Category] {
        categories.filter { $0.sectionMode == section }
            .sorted { $0.sortOrder < $1.sortOrder }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.background(for: section).ignoresSafeArea()

                VStack(spacing: 0) {
                    // Step indicator
                    stepIndicator

                    // Step content
                    TabView(selection: $vm.step) {
                        step1AmountView.tag(1)
                        step2CategoryView.tag(2)
                        step3DetailsView.tag(3)
                    }
                    .tabViewStyle(.page(indexDisplayMode: .never))
                    .animation(.spring(response: 0.35, dampingFraction: 0.85), value: vm.step)

                    // Bottom action
                    bottomButton
                }
            }
            .navigationTitle("Nuevo Gasto")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { dismiss() }
                }
            }
        }
        .presentationDetents([.large])
    }

    // MARK: - Step Indicator

    private var stepIndicator: some View {
        HStack(spacing: 8) {
            ForEach(1...3, id: \.self) { step in
                Capsule()
                    .fill(vm.step >= step
                          ? AppTheme.primary(for: section)
                          : Color.gray.opacity(0.2))
                    .frame(height: 4)
                    .animation(.easeInOut(duration: 0.3), value: vm.step)
            }
        }
        .padding(.horizontal, AppTheme.Spacing.lg)
        .padding(.top, AppTheme.Spacing.md)
    }

    // MARK: - Step 1: Amount

    private var step1AmountView: some View {
        VStack(spacing: 24) {
            Spacer()

            Text("¿Cuánto gastaste?")
                .font(.title3.weight(.semibold))
                .foregroundStyle(AppTheme.textPrimary(for: section))

            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text("$")
                    .font(.system(size: 40, weight: .light))
                    .foregroundStyle(AppTheme.textSecondary(for: section))

                TextField("0.00", text: $vm.amount)
                    .font(.system(size: 56, weight: .bold, design: .rounded))
                    .foregroundStyle(AppTheme.textPrimary(for: section))
                    .keyboardType(.decimalPad)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: 250)
            }

            // Payment method selector
            VStack(spacing: 8) {
                Text("Método de pago")
                    .font(.caption)
                    .foregroundStyle(AppTheme.textSecondary(for: section))

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 10) {
                        ForEach(PaymentMethod.allCases) { method in
                            Button {
                                withAnimation(.spring(response: 0.3)) {
                                    vm.selectedPaymentMethod = method
                                }
                            } label: {
                                VStack(spacing: 4) {
                                    Image(systemName: method.icon)
                                        .font(.title3)
                                    Text(method.rawValue)
                                        .font(.caption2)
                                }
                                .padding(.horizontal, 14)
                                .padding(.vertical, 10)
                                .background(
                                    RoundedRectangle(cornerRadius: AppTheme.CornerRadius.sm)
                                        .fill(vm.selectedPaymentMethod == method
                                              ? AppTheme.primary(for: section)
                                              : Color.gray.opacity(0.1))
                                )
                                .foregroundStyle(vm.selectedPaymentMethod == method
                                                 ? .white
                                                 : AppTheme.textSecondary(for: section))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, AppTheme.Spacing.lg)
                }
            }

            Spacer()
        }
        .padding(.horizontal, AppTheme.Spacing.lg)
    }

    // MARK: - Step 2: Category

    private var step2CategoryView: some View {
        VStack(spacing: 16) {
            Text("¿En qué categoría?")
                .font(.title3.weight(.semibold))
                .foregroundStyle(AppTheme.textPrimary(for: section))
                .padding(.top, AppTheme.Spacing.lg)

            let columns = [
                GridItem(.adaptive(minimum: 90), spacing: 12)
            ]

            ScrollView {
                LazyVGrid(columns: columns, spacing: 12) {
                    ForEach(sectionCategories) { category in
                        Button {
                            withAnimation(.spring(response: 0.3)) {
                                vm.selectedCategoryId = category.id
                            }
                        } label: {
                            VStack(spacing: 8) {
                                ZStack {
                                    Circle()
                                        .fill(Color(hex: category.colorHex).opacity(
                                            vm.selectedCategoryId == category.id ? 1.0 : 0.15
                                        ))
                                        .frame(width: 48, height: 48)

                                    Image(systemName: category.icon)
                                        .font(.title3)
                                        .foregroundStyle(
                                            vm.selectedCategoryId == category.id
                                            ? .white
                                            : Color(hex: category.colorHex)
                                        )
                                }
                                .scaleEffect(vm.selectedCategoryId == category.id ? 1.1 : 1.0)

                                Text(category.name)
                                    .font(.caption2)
                                    .foregroundStyle(AppTheme.textPrimary(for: section))
                                    .lineLimit(1)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.lg)
            }
        }
    }

    // MARK: - Step 3: Details (Optional)

    private var step3DetailsView: some View {
        ScrollView {
            VStack(spacing: 20) {
                Text("Detalles (opcional)")
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(AppTheme.textPrimary(for: section))
                    .padding(.top, AppTheme.Spacing.lg)

                // Description
                VStack(alignment: .leading, spacing: 6) {
                    Text("Descripción")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(AppTheme.textSecondary(for: section))
                    TextField("¿En qué lo gastaste?", text: $vm.expenseDescription)
                        .textFieldStyle(.roundedBorder)
                }

                // Date
                VStack(alignment: .leading, spacing: 6) {
                    Text("Fecha")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(AppTheme.textSecondary(for: section))
                    DatePicker("", selection: $vm.selectedDate, displayedComponents: .date)
                        .labelsHidden()
                }

                // Tags
                VStack(alignment: .leading, spacing: 6) {
                    Text("Etiquetas")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(AppTheme.textSecondary(for: section))

                    HStack {
                        TextField("Agregar etiqueta", text: $vm.newTag)
                            .textFieldStyle(.roundedBorder)
                            .onSubmit { vm.addTag() }
                        Button {
                            vm.addTag()
                        } label: {
                            Image(systemName: "plus.circle.fill")
                                .foregroundStyle(AppTheme.primary(for: section))
                        }
                    }

                    if !vm.tags.isEmpty {
                        FlowLayout(spacing: 6) {
                            ForEach(vm.tags, id: \.self) { tag in
                                HStack(spacing: 4) {
                                    Text(tag)
                                        .font(.caption)
                                    Button {
                                        vm.removeTag(tag)
                                    } label: {
                                        Image(systemName: "xmark.circle.fill")
                                            .font(.caption2)
                                    }
                                }
                                .padding(.horizontal, 10)
                                .padding(.vertical, 5)
                                .background(
                                    Capsule()
                                        .fill(AppTheme.primary(for: section).opacity(0.1))
                                )
                                .foregroundStyle(AppTheme.primary(for: section))
                            }
                        }
                    }
                }

                // Summary
                summaryCard
            }
            .padding(.horizontal, AppTheme.Spacing.lg)
        }
    }

    // MARK: - Summary Card

    private var summaryCard: some View {
        let selectedCategory = sectionCategories.first { $0.id == vm.selectedCategoryId }

        return CardView(section: section) {
            VStack(spacing: 10) {
                Text("Resumen")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(AppTheme.textSecondary(for: section))

                CurrencyText(
                    amount: vm.amountValue,
                    style: .title2,
                    color: AppTheme.textPrimary(for: section)
                )

                if let cat = selectedCategory {
                    HStack(spacing: 6) {
                        Image(systemName: cat.icon)
                        Text(cat.name)
                    }
                    .font(.subheadline)
                    .foregroundStyle(Color(hex: cat.colorHex))
                }

                HStack(spacing: 6) {
                    Image(systemName: vm.selectedPaymentMethod.icon)
                    Text(vm.selectedPaymentMethod.rawValue)
                }
                .font(.caption)
                .foregroundStyle(AppTheme.textSecondary(for: section))
            }
            .frame(maxWidth: .infinity)
        }
    }

    // MARK: - Bottom Button

    private var bottomButton: some View {
        Button {
            handleAction()
        } label: {
            Text(vm.step == 3 ? "Guardar Gasto" : "Siguiente")
                .font(.headline)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                        .fill(canProceed
                              ? AppTheme.primary(for: section)
                              : Color.gray.opacity(0.3))
                )
        }
        .disabled(!canProceed)
        .padding(.horizontal, AppTheme.Spacing.lg)
        .padding(.bottom, AppTheme.Spacing.lg)
    }

    private var canProceed: Bool {
        switch vm.step {
        case 1: return vm.canProceedStep1
        case 2: return vm.canProceedStep2
        case 3: return vm.canSave
        default: return false
        }
    }

    private func handleAction() {
        if vm.step < 3 {
            vm.nextStep()
        } else {
            saveAndDismiss()
        }
    }

    private func saveAndDismiss() {
        guard let expense = vm.saveExpense(section: section, context: modelContext) else { return }

        // XP + streak
        gamificationVM.awardXP(.logExpense, profile: profile)
        gamificationVM.updateStreak(profile: profile)

        // Feedback message
        let period = PeriodService.currentPeriod(startDay: profile.billingCycleStartDay)
        let totalSpent = ExpenseViewModel.totalSpent(for: section, in: period, context: modelContext)
        let budget = BudgetViewModel.globalBudget(for: section, context: modelContext)?.amount ?? 0
        let feedback = TipsEngine.expenseRegisteredFeedback(totalSpent: totalSpent, budget: budget)
        appVM.showFeedbackMessage(feedback)

        // Check badges
        let allExpenses = ExpenseViewModel.expenses(
            for: section,
            in: (Date.distantPast, Date.distantFuture),
            context: modelContext
        )
        let uniqueCategories = Set(allExpenses.map { $0.categoryId }).count
        gamificationVM.checkBadges(
            profile: profile,
            totalExpenses: allExpenses.count,
            categoriesUsed: uniqueCategories,
            reportsViewed: 0,
            budgetMonthsRespected: 0
        )

        // Haptic feedback
        let generator = UIImpactFeedbackGenerator(style: .medium)
        generator.impactOccurred()

        dismiss()
    }
}

// MARK: - Flow Layout for Tags

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, positions: [CGPoint]) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth, x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }

        return (CGSize(width: maxWidth, height: y + rowHeight), positions)
    }
}
