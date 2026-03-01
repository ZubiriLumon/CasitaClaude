import Foundation

/// Manages custom billing cycle periods
struct PeriodService {

    /// Calculate the current period range based on the user's billing cycle start day
    static func currentPeriod(startDay: Int) -> (start: Date, end: Date) {
        let calendar = Calendar.current
        let today = Date()
        let currentDay = calendar.component(.day, from: today)

        var startComponents = calendar.dateComponents([.year, .month], from: today)
        let clampedStartDay = min(startDay, 28) // Clamp to 28 to avoid month-length issues

        if currentDay >= clampedStartDay {
            // Current period started this month
            startComponents.day = clampedStartDay
        } else {
            // Current period started last month
            if let lastMonth = calendar.date(byAdding: .month, value: -1, to: today) {
                startComponents = calendar.dateComponents([.year, .month], from: lastMonth)
                startComponents.day = clampedStartDay
            }
        }

        guard let periodStart = calendar.date(from: startComponents),
              let periodEnd = calendar.date(byAdding: .month, value: 1, to: periodStart) else {
            return (today, today)
        }

        // End date is the day before the next period start
        let adjustedEnd = calendar.date(byAdding: .day, value: -1, to: periodEnd) ?? periodEnd

        return (periodStart, adjustedEnd)
    }

    /// Get the previous period range
    static func previousPeriod(startDay: Int) -> (start: Date, end: Date) {
        let calendar = Calendar.current
        let current = currentPeriod(startDay: startDay)

        guard let prevStart = calendar.date(byAdding: .month, value: -1, to: current.start),
              let prevEnd = calendar.date(byAdding: .day, value: -1, to: current.start) else {
            return current
        }

        return (prevStart, prevEnd)
    }

    /// Format a period range for display (e.g., "23 Feb – 22 Mar")
    static func formatPeriod(_ start: Date, _ end: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "es_MX")
        formatter.dateFormat = "d MMM"
        return "\(formatter.string(from: start)) – \(formatter.string(from: end))"
    }

    /// Days remaining in the current period
    static func daysRemaining(startDay: Int) -> Int {
        let calendar = Calendar.current
        let period = currentPeriod(startDay: startDay)
        let today = calendar.startOfDay(for: Date())
        let end = calendar.startOfDay(for: period.end)
        return max(0, calendar.dateComponents([.day], from: today, to: end).day ?? 0)
    }

    /// Days elapsed in the current period
    static func daysElapsed(startDay: Int) -> Int {
        let calendar = Calendar.current
        let period = currentPeriod(startDay: startDay)
        let today = calendar.startOfDay(for: Date())
        let start = calendar.startOfDay(for: period.start)
        return max(0, calendar.dateComponents([.day], from: start, to: today).day ?? 0)
    }

    /// Total days in the current period
    static func totalDays(startDay: Int) -> Int {
        let calendar = Calendar.current
        let period = currentPeriod(startDay: startDay)
        return calendar.dateComponents([.day], from: period.start, to: period.end).day ?? 30
    }
}
