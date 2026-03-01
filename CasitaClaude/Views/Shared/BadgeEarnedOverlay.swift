import SwiftUI

/// Full-screen overlay shown when a badge is earned
struct BadgeEarnedOverlay: View {
    let badge: Badge
    let section: SectionMode

    @State private var scaleEffect: CGFloat = 0.5
    @State private var opacity: Double = 0

    var body: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()

            VStack(spacing: 20) {
                Image(systemName: badge.icon)
                    .font(.system(size: 60))
                    .foregroundStyle(AppTheme.accent(for: section))
                    .scaleEffect(scaleEffect)

                Text("Badge Desbloqueado!")
                    .font(.title2.bold())
                    .foregroundStyle(.white)

                Text(badge.name)
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(AppTheme.accent(for: section))

                Text(badge.description)
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.8))
                    .multilineTextAlignment(.center)

                Text("+\(badge.xpReward) XP")
                    .font(.headline)
                    .foregroundStyle(AppTheme.accent(for: section))
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(
                        Capsule()
                            .fill(AppTheme.accent(for: section).opacity(0.2))
                    )
            }
            .padding(40)
            .opacity(opacity)
        }
        .onAppear {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) {
                scaleEffect = 1.0
                opacity = 1.0
            }
        }
    }
}

/// Full-screen overlay shown on level up
struct LevelUpOverlay: View {
    let level: Int
    let section: SectionMode

    @State private var scaleEffect: CGFloat = 0.5
    @State private var opacity: Double = 0

    var body: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()

            VStack(spacing: 20) {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 60))
                    .foregroundStyle(AppTheme.primary(for: section))
                    .scaleEffect(scaleEffect)

                Text("Nivel \(level)!")
                    .font(.largeTitle.bold())
                    .foregroundStyle(.white)

                Text("Sigue así, estás progresando")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.8))
            }
            .padding(40)
            .opacity(opacity)
        }
        .onAppear {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) {
                scaleEffect = 1.0
                opacity = 1.0
            }
        }
    }
}
