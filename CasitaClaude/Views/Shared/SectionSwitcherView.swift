import SwiftUI

/// Animated section switcher between Personal and Business modes
struct SectionSwitcherView: View {
    @Environment(AppViewModel.self) private var appVM

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            ForEach(SectionMode.allCases, id: \.self) { mode in
                Button {
                    appVM.switchTo(mode)
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: mode.icon)
                            .font(.system(size: 14, weight: .semibold))
                        Text(mode.displayName)
                            .font(.system(size: 14, weight: .semibold))
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(
                        Capsule()
                            .fill(appVM.currentSection == mode
                                  ? AppTheme.primary(for: mode)
                                  : Color.clear)
                    )
                    .foregroundStyle(
                        appVM.currentSection == mode
                        ? .white
                        : AppTheme.textSecondary(for: appVM.currentSection)
                    )
                }
                .buttonStyle(.plain)
            }
        }
        .padding(4)
        .background(
            Capsule()
                .fill(.ultraThinMaterial)
                .shadow(color: .black.opacity(0.05), radius: 8, y: 2)
        )
        .padding(.horizontal, AppTheme.Spacing.lg)
        .padding(.vertical, AppTheme.Spacing.sm)
    }
}
