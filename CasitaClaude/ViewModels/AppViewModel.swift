import SwiftUI
import SwiftData
import Observation

/// Root ViewModel that manages global app state
@Observable
final class AppViewModel {
    var currentSection: SectionMode = .personal
    var showExpenseSheet: Bool = false
    var feedbackMessage: String?
    var showFeedback: Bool = false

    // MARK: - Section Toggle

    func toggleSection() {
        withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
            currentSection = currentSection == .personal ? .business : .personal
        }
    }

    func switchTo(_ section: SectionMode) {
        withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
            currentSection = section
        }
    }

    // MARK: - Feedback

    func showFeedbackMessage(_ message: String) {
        feedbackMessage = message
        withAnimation(.spring(response: 0.3)) {
            showFeedback = true
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) { [weak self] in
            withAnimation(.easeOut(duration: 0.3)) {
                self?.showFeedback = false
            }
        }
    }
}
