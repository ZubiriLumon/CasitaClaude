import SwiftUI

/// Toast notification shown after expense registration or important events
struct FeedbackToastView: View {
    let message: String
    let section: SectionMode

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "checkmark.circle.fill")
                .font(.title3)
                .foregroundStyle(AppTheme.success(for: section))

            Text(message)
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(AppTheme.textPrimary(for: section))
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
        .background(
            Capsule()
                .fill(.ultraThickMaterial)
                .shadow(color: .black.opacity(0.1), radius: 12, y: 4)
        )
        .padding(.horizontal, 24)
    }
}
