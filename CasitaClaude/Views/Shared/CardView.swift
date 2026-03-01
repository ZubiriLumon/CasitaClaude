import SwiftUI

/// Reusable card container with section-aware styling
struct CardView<Content: View>: View {
    let section: SectionMode
    @ViewBuilder let content: () -> Content

    var body: some View {
        content()
            .padding(AppTheme.Spacing.md)
            .background(
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                    .fill(AppTheme.primary(for: section) == AppTheme.Personal.primary
                          ? AppTheme.Personal.cardBackground
                          : AppTheme.Business.cardBackground)
                    .shadow(color: .black.opacity(0.04), radius: 8, y: 2)
            )
    }
}

/// Progress bar component
struct ProgressBarView: View {
    let progress: Double // 0.0 to 1.0+
    let section: SectionMode
    var height: CGFloat = 10

    private var clampedProgress: Double {
        min(max(progress, 0), 1.0)
    }

    private var progressColor: Color {
        if progress > 1.0 { return AppTheme.danger(for: section) }
        if progress > 0.85 { return AppTheme.warning(for: section) }
        return AppTheme.success(for: section)
    }

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(Color.gray.opacity(0.15))
                    .frame(height: height)

                Capsule()
                    .fill(progressColor)
                    .frame(width: geo.size.width * clampedProgress, height: height)
                    .animation(.spring(response: 0.6, dampingFraction: 0.8), value: progress)
            }
        }
        .frame(height: height)
    }
}

/// Currency display helper
struct CurrencyText: View {
    let amount: Double
    var style: Font = .title2
    var weight: Font.Weight = .bold
    var color: Color = .primary

    var body: some View {
        Text(formatted)
            .font(style)
            .fontWeight(weight)
            .foregroundStyle(color)
    }

    private var formatted: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "es_MX")
        formatter.maximumFractionDigits = 2
        return formatter.string(from: NSNumber(value: amount)) ?? "$0.00"
    }
}

/// Period badge showing the active billing cycle range
struct PeriodBadgeView: View {
    let startDay: Int
    let section: SectionMode

    var body: some View {
        let period = PeriodService.currentPeriod(startDay: startDay)
        HStack(spacing: 6) {
            Image(systemName: "calendar")
                .font(.caption)
            Text(PeriodService.formatPeriod(period.start, period.end))
                .font(.system(size: 13, weight: .medium))
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(
            Capsule()
                .fill(AppTheme.primary(for: section).opacity(0.1))
        )
        .foregroundStyle(AppTheme.primary(for: section))
    }
}
