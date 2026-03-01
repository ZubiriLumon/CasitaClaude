import SwiftUI
import SwiftData

/// Root container with section switcher and tab navigation
struct RootView: View {
    @Environment(AppViewModel.self) private var appVM
    @Environment(GamificationViewModel.self) private var gamificationVM
    @Environment(\.modelContext) private var modelContext
    @Query private var profiles: [UserProfile]

    @State private var selectedTab: Tab = .dashboard

    enum Tab: String, CaseIterable {
        case dashboard = "Inicio"
        case expenses = "Gastos"
        case budget = "Límites"
        case reports = "Reportes"
        case profile = "Perfil"

        var icon: String {
            switch self {
            case .dashboard: return "house.fill"
            case .expenses: return "list.bullet.rectangle.fill"
            case .budget: return "gauge.with.needle.fill"
            case .reports: return "chart.bar.fill"
            case .profile: return "person.crop.circle.fill"
            }
        }
    }

    private var profile: UserProfile {
        profiles.first ?? UserProfile()
    }

    var body: some View {
        ZStack {
            AppTheme.background(for: appVM.currentSection)
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Section Switcher Header
                SectionSwitcherView()

                // Content
                TabView(selection: $selectedTab) {
                    DashboardView(profile: profile)
                        .tag(Tab.dashboard)
                        .tabItem {
                            Label(Tab.dashboard.rawValue, systemImage: Tab.dashboard.icon)
                        }

                    ExpenseListView(profile: profile)
                        .tag(Tab.expenses)
                        .tabItem {
                            Label(Tab.expenses.rawValue, systemImage: Tab.expenses.icon)
                        }

                    BudgetListView(profile: profile)
                        .tag(Tab.budget)
                        .tabItem {
                            Label(Tab.budget.rawValue, systemImage: Tab.budget.icon)
                        }

                    MonthlyReportView(profile: profile)
                        .tag(Tab.reports)
                        .tabItem {
                            Label(Tab.reports.rawValue, systemImage: Tab.reports.icon)
                        }

                    ProfileView(profile: profile)
                        .tag(Tab.profile)
                        .tabItem {
                            Label(Tab.profile.rawValue, systemImage: Tab.profile.icon)
                        }
                }
                .tint(AppTheme.primary(for: appVM.currentSection))
            }

            // Floating feedback toast
            if appVM.showFeedback, let message = appVM.feedbackMessage {
                VStack {
                    FeedbackToastView(message: message, section: appVM.currentSection)
                        .transition(.move(edge: .top).combined(with: .opacity))
                    Spacer()
                }
                .padding(.top, 100)
                .zIndex(100)
            }

            // Badge earned overlay
            if gamificationVM.showBadgeAnimation, let badge = gamificationVM.recentlyEarnedBadge {
                BadgeEarnedOverlay(badge: badge, section: appVM.currentSection)
                    .transition(.scale.combined(with: .opacity))
                    .zIndex(200)
            }

            // Level up overlay
            if gamificationVM.showLevelUpAnimation {
                LevelUpOverlay(level: gamificationVM.newLevel, section: appVM.currentSection)
                    .transition(.scale.combined(with: .opacity))
                    .zIndex(200)
            }
        }
    }
}
