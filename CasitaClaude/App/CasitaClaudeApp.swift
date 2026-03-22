import SwiftUI
import SwiftData

@main
struct CasitaClaudeApp: App {
    @State private var appViewModel = AppViewModel()
    @State private var gamificationVM = GamificationViewModel()

    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            Expense.self,
            Category.self,
            Budget.self,
            Income.self,
            UserProfile.self,
            BrownieProduct.self,
            Sale.self,
            PendingOrder.self,
            RawMaterialExpense.self,
        ])
        let modelConfiguration = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: false
        )
        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(appViewModel)
                .environment(gamificationVM)
                .onAppear {
                    DataSeeder.seedIfNeeded(context: sharedModelContainer.mainContext)
                }
        }
        .modelContainer(sharedModelContainer)
    }
}
