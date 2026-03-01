import SwiftUI
import SwiftData

/// Profile view with gamification stats, badges, and settings access
struct ProfileView: View {
    let profile: UserProfile

    @Environment(AppViewModel.self) private var appVM
    @Environment(GamificationViewModel.self) private var gamificationVM
    @Environment(\.modelContext) private var modelContext

    @State private var showSettings = false

    private var section: SectionMode { appVM.currentSection }

    private var badges: [Badge] {
        gamificationVM.allBadgesWithStatus(earnedIds: profile.earnedBadgeIds)
    }

    private var earnedCount: Int {
        badges.filter(\.isEarned).count
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: AppTheme.Spacing.lg) {
                    // Profile Header
                    profileHeader

                    // Level Progress
                    levelCard

                    // Stats Row
                    statsRow

                    // Badges Grid
                    badgesSection
                }
                .padding(.horizontal, AppTheme.Spacing.md)
                .padding(.bottom, AppTheme.Spacing.xxl)
            }
            .background(AppTheme.background(for: section).ignoresSafeArea())
            .navigationTitle("Mi Perfil")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showSettings = true
                    } label: {
                        Image(systemName: "gearshape.fill")
                            .foregroundStyle(AppTheme.primary(for: section))
                    }
                }
            }
            .sheet(isPresented: $showSettings) {
                SettingsView(profile: profile)
            }
        }
    }

    // MARK: - Profile Header

    private var profileHeader: some View {
        VStack(spacing: 16) {
            // Avatar
            ZStack {
                Circle()
                    .fill(AppTheme.gradient(for: section))
                    .frame(width: 90, height: 90)

                Image(systemName: "person.fill")
                    .font(.system(size: 36))
                    .foregroundStyle(.white)
            }

            if !profile.displayName.isEmpty {
                Text(profile.displayName)
                    .font(.title2.weight(.bold))
                    .foregroundStyle(AppTheme.textPrimary(for: section))
            }

            Text(profile.levelTitle)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(AppTheme.primary(for: section))
                .padding(.horizontal, 16)
                .padding(.vertical, 6)
                .background(
                    Capsule()
                        .fill(AppTheme.primary(for: section).opacity(0.1))
                )
        }
        .frame(maxWidth: .infinity)
        .padding(.top, AppTheme.Spacing.lg)
    }

    // MARK: - Level Card

    private var levelCard: some View {
        CardView(section: section) {
            VStack(spacing: 14) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Nivel \(profile.currentLevel)")
                            .font(.title3.weight(.bold))
                            .foregroundStyle(AppTheme.textPrimary(for: section))
                        Text("\(profile.totalXP) XP Total")
                            .font(.caption)
                            .foregroundStyle(AppTheme.textSecondary(for: section))
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: 4) {
                        Text("Siguiente nivel")
                            .font(.caption)
                            .foregroundStyle(AppTheme.textSecondary(for: section))
                        Text("\(profile.xpForNextLevel - Int(profile.levelProgress * Double(profile.xpForNextLevel))) XP")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(AppTheme.primary(for: section))
                    }
                }

                ProgressBarView(
                    progress: profile.levelProgress,
                    section: section,
                    height: 10
                )
            }
        }
    }

    // MARK: - Stats Row

    private var statsRow: some View {
        HStack(spacing: 12) {
            statCard(
                icon: "flame.fill",
                value: "\(profile.streakDays)",
                label: "Racha",
                color: .orange
            )

            statCard(
                icon: "rosette",
                value: "\(earnedCount)/\(badges.count)",
                label: "Badges",
                color: AppTheme.accent(for: section)
            )

            statCard(
                icon: "bolt.fill",
                value: "\(profile.totalXP)",
                label: "XP Total",
                color: AppTheme.primary(for: section)
            )
        }
    }

    private func statCard(icon: String, value: String, label: String, color: Color) -> some View {
        CardView(section: section) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundStyle(color)

                Text(value)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(AppTheme.textPrimary(for: section))

                Text(label)
                    .font(.caption2)
                    .foregroundStyle(AppTheme.textSecondary(for: section))
            }
            .frame(maxWidth: .infinity)
        }
    }

    // MARK: - Badges Section

    private var badgesSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Badges")
                .font(.headline)
                .foregroundStyle(AppTheme.textPrimary(for: section))

            let columns = [GridItem(.adaptive(minimum: 100), spacing: 12)]

            LazyVGrid(columns: columns, spacing: 12) {
                ForEach(badges, id: \.id) { badge in
                    badgeCard(badge)
                }
            }
        }
    }

    private func badgeCard(_ badge: Badge) -> some View {
        VStack(spacing: 8) {
            Image(systemName: badge.icon)
                .font(.title2)
                .foregroundStyle(badge.isEarned
                                 ? AppTheme.accent(for: section)
                                 : Color.gray.opacity(0.3))
                .frame(width: 50, height: 50)
                .background(
                    Circle()
                        .fill(badge.isEarned
                              ? AppTheme.accent(for: section).opacity(0.15)
                              : Color.gray.opacity(0.05))
                )

            Text(badge.name)
                .font(.caption2.weight(.semibold))
                .foregroundStyle(badge.isEarned
                                 ? AppTheme.textPrimary(for: section)
                                 : AppTheme.textSecondary(for: section))
                .multilineTextAlignment(.center)
                .lineLimit(2)

            if !badge.isEarned {
                Text(badge.requirement.progressDescription)
                    .font(.caption2)
                    .foregroundStyle(AppTheme.textSecondary(for: section).opacity(0.6))
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                .fill(Color.gray.opacity(0.04))
        )
        .opacity(badge.isEarned ? 1.0 : 0.6)
    }
}
