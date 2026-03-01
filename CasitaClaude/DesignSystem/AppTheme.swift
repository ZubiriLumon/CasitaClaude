import SwiftUI

// MARK: - Section Mode

enum SectionMode: String, CaseIterable, Codable {
    case personal
    case business

    var displayName: String {
        switch self {
        case .personal: return "Vida Personal"
        case .business: return "Negocios"
        }
    }

    var icon: String {
        switch self {
        case .personal: return "person.fill"
        case .business: return "briefcase.fill"
        }
    }
}

// MARK: - App Theme

struct AppTheme {

    // MARK: Personal Palette
    struct Personal {
        static let primary = Color(hex: "6C63FF")       // Soft violet
        static let secondary = Color(hex: "A78BFA")     // Light lavender
        static let accent = Color(hex: "34D399")        // Mint green
        static let background = Color(hex: "F8F7FF")    // Ghost white
        static let cardBackground = Color.white
        static let textPrimary = Color(hex: "1E1B4B")   // Deep indigo
        static let textSecondary = Color(hex: "6B7280") // Cool gray
        static let danger = Color(hex: "EF4444")        // Red
        static let warning = Color(hex: "F59E0B")       // Amber
        static let success = Color(hex: "10B981")       // Emerald
        static let gradient = LinearGradient(
            colors: [Color(hex: "6C63FF"), Color(hex: "A78BFA")],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    // MARK: Business Palette
    struct Business {
        static let primary = Color(hex: "0F766E")       // Teal dark
        static let secondary = Color(hex: "14B8A6")     // Teal
        static let accent = Color(hex: "F59E0B")        // Amber gold
        static let background = Color(hex: "F0FDFA")    // Teal tint
        static let cardBackground = Color.white
        static let textPrimary = Color(hex: "134E4A")   // Dark teal
        static let textSecondary = Color(hex: "6B7280") // Cool gray
        static let danger = Color(hex: "DC2626")        // Red
        static let warning = Color(hex: "D97706")       // Dark amber
        static let success = Color(hex: "059669")       // Green
        static let gradient = LinearGradient(
            colors: [Color(hex: "0F766E"), Color(hex: "14B8A6")],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    // MARK: - Dynamic Colors based on section

    static func primary(for mode: SectionMode) -> Color {
        mode == .personal ? Personal.primary : Business.primary
    }

    static func secondary(for mode: SectionMode) -> Color {
        mode == .personal ? Personal.secondary : Business.secondary
    }

    static func accent(for mode: SectionMode) -> Color {
        mode == .personal ? Personal.accent : Business.accent
    }

    static func background(for mode: SectionMode) -> Color {
        mode == .personal ? Personal.background : Business.background
    }

    static func textPrimary(for mode: SectionMode) -> Color {
        mode == .personal ? Personal.textPrimary : Business.textPrimary
    }

    static func textSecondary(for mode: SectionMode) -> Color {
        mode == .personal ? Personal.textSecondary : Business.textSecondary
    }

    static func gradient(for mode: SectionMode) -> LinearGradient {
        mode == .personal ? Personal.gradient : Business.gradient
    }

    static func danger(for mode: SectionMode) -> Color {
        mode == .personal ? Personal.danger : Business.danger
    }

    static func warning(for mode: SectionMode) -> Color {
        mode == .personal ? Personal.warning : Business.warning
    }

    static func success(for mode: SectionMode) -> Color {
        mode == .personal ? Personal.success : Business.success
    }

    // MARK: - Shared Design Tokens

    struct Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
        static let xxl: CGFloat = 48
    }

    struct CornerRadius {
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 16
        static let xl: CGFloat = 24
        static let full: CGFloat = 999
    }

    struct FontSize {
        static let caption: CGFloat = 12
        static let body: CGFloat = 16
        static let title3: CGFloat = 20
        static let title2: CGFloat = 24
        static let title1: CGFloat = 28
        static let largeTitle: CGFloat = 34
    }
}

// MARK: - Color Extension for Hex

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = ((int >> 24) & 0xFF, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
