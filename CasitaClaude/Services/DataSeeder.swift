import Foundation
import SwiftData

/// Seeds default data into the database on first launch
struct DataSeeder {

    static func seedIfNeeded(context: ModelContext) {
        seedCategories(context: context)
        seedProfile(context: context)
        seedBrownieProducts(context: context)
    }

    private static func seedCategories(context: ModelContext) {
        let descriptor = FetchDescriptor<Category>()
        let existing = (try? context.fetch(descriptor))?.count ?? 0
        guard existing == 0 else { return }

        for (index, cat) in Category.defaultPersonal.enumerated() {
            let category = Category(
                name: cat.0,
                icon: cat.1,
                colorHex: cat.2,
                section: .personal,
                isDefault: true,
                sortOrder: index
            )
            context.insert(category)
        }

        for (index, cat) in Category.defaultBusiness.enumerated() {
            let category = Category(
                name: cat.0,
                icon: cat.1,
                colorHex: cat.2,
                section: .business,
                isDefault: true,
                sortOrder: index
            )
            context.insert(category)
        }

        try? context.save()
    }

    private static func seedProfile(context: ModelContext) {
        let descriptor = FetchDescriptor<UserProfile>()
        let existing = (try? context.fetch(descriptor))?.count ?? 0
        guard existing == 0 else { return }

        let profile = UserProfile(billingCycleStartDay: 1)
        context.insert(profile)
        try? context.save()
    }

    /// Creates default brownie products (one per flavor) if none exist
    private static func seedBrownieProducts(context: ModelContext) {
        let descriptor = FetchDescriptor<BrownieProduct>()
        let existing = (try? context.fetch(descriptor))?.count ?? 0
        guard existing == 0 else { return }

        for flavor in BrownieFlavor.allCases {
            let product = BrownieProduct(
                flavor: flavor,
                stock: 0,
                costPerUnit: 8.0,
                pricePerUnit: 30.0
            )
            context.insert(product)
        }
        try? context.save()
    }
}
