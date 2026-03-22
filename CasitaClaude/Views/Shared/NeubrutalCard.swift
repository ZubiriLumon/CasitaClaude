import SwiftUI

/// Neubrutalismo-style card with bold border and parallel shadow offset
struct NeubrutalCard<Content: View>: View {
    let content: Content
    var borderColor: Color
    var backgroundColor: Color
    var shadowOffset: CGFloat

    init(
        borderColor: Color = AppTheme.Business.primary,
        backgroundColor: Color = AppTheme.Business.cardBackground,
        shadowOffset: CGFloat = AppTheme.Neubrutalism.shadowOffset,
        @ViewBuilder content: () -> Content
    ) {
        self.content = content()
        self.borderColor = borderColor
        self.backgroundColor = backgroundColor
        self.shadowOffset = shadowOffset
    }

    var body: some View {
        content
            .background(backgroundColor)
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.Neubrutalism.cornerRadius))
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.Neubrutalism.cornerRadius)
                    .stroke(borderColor, lineWidth: AppTheme.Neubrutalism.borderWidth)
            )
            .shadow(
                color: borderColor.opacity(0.25),
                radius: 0,
                x: shadowOffset,
                y: shadowOffset
            )
    }
}

/// Neubrutalismo button style
struct NeubrutalButtonStyle: ButtonStyle {
    var color: Color
    var textColor: Color

    init(color: Color = AppTheme.Business.primary, textColor: Color = .white) {
        self.color = color
        self.textColor = textColor
    }

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(.body, design: .rounded, weight: .bold))
            .foregroundStyle(textColor)
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(color)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(Color.black.opacity(0.2), lineWidth: 2)
            )
            .shadow(
                color: color.opacity(0.3),
                radius: 0,
                x: configuration.isPressed ? 1 : 3,
                y: configuration.isPressed ? 1 : 3
            )
            .offset(
                x: configuration.isPressed ? 2 : 0,
                y: configuration.isPressed ? 2 : 0
            )
            .animation(.spring(duration: 0.15), value: configuration.isPressed)
    }
}
