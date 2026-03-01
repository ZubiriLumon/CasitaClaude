import SwiftUI
import SwiftData

/// Settings view for configuring billing cycle, profile, and app preferences
struct SettingsView: View {
    let profile: UserProfile

    @Environment(AppViewModel.self) private var appVM
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @State private var displayName: String = ""
    @State private var selectedStartDay: Int = 1
    @State private var showResetConfirmation = false

    private var section: SectionMode { appVM.currentSection }

    var body: some View {
        NavigationStack {
            Form {
                // Profile Section
                Section {
                    HStack {
                        Text("Nombre")
                        Spacer()
                        TextField("Tu nombre", text: $displayName)
                            .multilineTextAlignment(.trailing)
                            .foregroundStyle(AppTheme.textSecondary(for: section))
                    }
                } header: {
                    Text("Perfil")
                }

                // Billing Cycle
                Section {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("El ciclo financiero inicia el día que elijas de cada mes. Ideal para alinear con tu fecha de corte de tarjeta de crédito.")
                            .font(.caption)
                            .foregroundStyle(AppTheme.textSecondary(for: section))

                        Picker("Día de inicio", selection: $selectedStartDay) {
                            ForEach(1...28, id: \.self) { day in
                                Text("Día \(day)").tag(day)
                            }
                        }
                        .pickerStyle(.wheel)
                        .frame(height: 120)

                        // Preview
                        let period = PeriodService.currentPeriod(startDay: selectedStartDay)
                        HStack {
                            Image(systemName: "calendar")
                                .foregroundStyle(AppTheme.primary(for: section))
                            Text("Ciclo actual: \(PeriodService.formatPeriod(period.start, period.end))")
                                .font(.subheadline.weight(.medium))
                                .foregroundStyle(AppTheme.textPrimary(for: section))
                        }
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(
                            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.sm)
                                .fill(AppTheme.primary(for: section).opacity(0.08))
                        )
                    }
                } header: {
                    Text("Ciclo Financiero")
                }

                // App Info
                Section {
                    HStack {
                        Text("Versión")
                        Spacer()
                        Text("1.0.0")
                            .foregroundStyle(AppTheme.textSecondary(for: section))
                    }
                    HStack {
                        Text("Base de datos")
                        Spacer()
                        Text("SwiftData")
                            .foregroundStyle(AppTheme.textSecondary(for: section))
                    }
                } header: {
                    Text("Información")
                }

                // Danger Zone
                Section {
                    Button(role: .destructive) {
                        showResetConfirmation = true
                    } label: {
                        Label("Restablecer datos", systemImage: "trash")
                    }
                } header: {
                    Text("Zona de peligro")
                }
            }
            .navigationTitle("Configuración")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Guardar") { saveSettings() }
                        .fontWeight(.semibold)
                }
            }
            .onAppear {
                displayName = profile.displayName
                selectedStartDay = profile.billingCycleStartDay
            }
            .alert("¿Restablecer todos los datos?", isPresented: $showResetConfirmation) {
                Button("Cancelar", role: .cancel) {}
                Button("Restablecer", role: .destructive) { resetData() }
            } message: {
                Text("Esta acción eliminará todos los gastos, presupuestos e ingresos. No se puede deshacer.")
            }
        }
    }

    // MARK: - Actions

    private func saveSettings() {
        profile.displayName = displayName
        profile.billingCycleStartDay = selectedStartDay
        try? modelContext.save()
        dismiss()
    }

    private func resetData() {
        try? modelContext.delete(model: Expense.self)
        try? modelContext.delete(model: Budget.self)
        try? modelContext.delete(model: Income.self)
        profile.totalXP = 0
        profile.currentLevel = 1
        profile.streakDays = 0
        profile.earnedBadgeIds = []
        try? modelContext.save()
        dismiss()
    }
}
