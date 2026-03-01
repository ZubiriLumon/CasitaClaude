import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultPersonalCategories, defaultBusinessCategories, defaultPersonalIncomeCategories, defaultBusinessIncomeCategories, badgeDefinitions } from '../theme';

const genId = () => crypto.randomUUID();

const useStore = create(
  persist(
    (set, get) => ({
      // --- Section ---
      section: 'personal',
      setSection: (s) => set({ section: s }),
      toggleSection: () => set((st) => ({ section: st.section === 'personal' ? 'business' : 'personal' })),

      // --- Categories ---
      categories: [
        ...defaultPersonalCategories.map((c, i) => ({ ...c, id: genId(), section: 'personal', sortOrder: i })),
        ...defaultBusinessCategories.map((c, i) => ({ ...c, id: genId(), section: 'business', sortOrder: i })),
      ],
      getCategoriesForSection: () => {
        const { categories, section } = get();
        return categories.filter((c) => c.section === section).sort((a, b) => a.sortOrder - b.sortOrder);
      },
      addCategory: (cat) => set((st) => ({ categories: [...st.categories, { ...cat, id: genId() }] })),

      // --- Expenses ---
      expenses: [],
      addExpense: (exp) => {
        const id = genId();
        const expense = { ...exp, id, createdAt: new Date().toISOString() };
        set((st) => ({ expenses: [...st.expenses, expense] }));
        // Award XP
        get().addXP(10);
        get().updateStreak();
        get().checkBadges();
        return expense;
      },
      deleteExpense: (id) => set((st) => ({ expenses: st.expenses.filter((e) => e.id !== id) })),
      getExpensesForPeriod: (start, end, section) => {
        const s = section || get().section;
        return get().expenses.filter((e) => {
          const d = new Date(e.date);
          return e.section === s && d >= start && d <= end;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
      },

      // --- Income Categories ---
      incomeCategories: [
        ...defaultPersonalIncomeCategories.map((c, i) => ({ ...c, id: genId(), section: 'personal', sortOrder: i })),
        ...defaultBusinessIncomeCategories.map((c, i) => ({ ...c, id: genId(), section: 'business', sortOrder: i })),
      ],
      getIncomeCategories: (section) => {
        const s = section || get().section;
        return get().incomeCategories.filter((c) => c.section === s).sort((a, b) => a.sortOrder - b.sortOrder);
      },

      // --- Recurring Incomes ---
      recurringIncomes: [],
      addRecurringIncome: (rec) => {
        const id = genId();
        set((st) => ({ recurringIncomes: [...st.recurringIncomes, { ...rec, id }] }));
      },
      deleteRecurringIncome: (id) => set((st) => ({ recurringIncomes: st.recurringIncomes.filter((r) => r.id !== id) })),
      applyRecurringIncomes: (periodStart, periodEnd) => {
        const st = get();
        const section = st.section;
        const recs = st.recurringIncomes.filter((r) => r.section === section);
        const existing = st.incomes;
        const newIncomes = [];

        for (const rec of recs) {
          // Check if already applied this period
          const alreadyApplied = existing.some(
            (i) => i.recurringId === rec.id && new Date(i.date) >= periodStart && new Date(i.date) <= periodEnd
          );
          if (!alreadyApplied) {
            newIncomes.push({
              id: genId(),
              amount: rec.amount,
              description: rec.description,
              source: rec.source,
              incomeCategoryId: rec.incomeCategoryId,
              section: rec.section,
              date: new Date(periodStart.getTime() + (rec.dayOfMonth - 1) * 86400000).toISOString(),
              recurring: true,
              recurringId: rec.id,
              createdAt: new Date().toISOString(),
            });
          }
        }

        if (newIncomes.length > 0) {
          set((st) => ({ incomes: [...st.incomes, ...newIncomes] }));
        }
      },

      // --- Incomes ---
      incomes: [],
      addIncome: (inc) => {
        const id = genId();
        const income = { ...inc, id, createdAt: new Date().toISOString() };
        set((st) => ({ incomes: [...st.incomes, income] }));
        get().addXP(15);
        get().updateStreak();
        get().checkBadges();
        return income;
      },
      deleteIncome: (id) => set((st) => ({ incomes: st.incomes.filter((i) => i.id !== id) })),
      getIncomesForPeriod: (start, end, section) => {
        const s = section || get().section;
        return get().incomes.filter((i) => {
          const d = new Date(i.date);
          return i.section === s && d >= start && d <= end;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
      },

      // --- Budgets ---
      budgets: [],
      setBudget: (categoryId, amount, section) => {
        const s = section || get().section;
        set((st) => {
          const filtered = st.budgets.filter((b) => !(b.categoryId === categoryId && b.section === s));
          return { budgets: [...filtered, { id: genId(), categoryId, amount, section: s }] };
        });
        get().addXP(20);
      },
      deleteBudget: (id) => set((st) => ({ budgets: st.budgets.filter((b) => b.id !== id) })),
      getGlobalBudget: (section) => {
        const s = section || get().section;
        return get().budgets.find((b) => b.categoryId === null && b.section === s);
      },
      getBudgetsForSection: (section) => {
        const s = section || get().section;
        return get().budgets.filter((b) => b.section === s);
      },

      // --- Profile & Gamification ---
      profile: {
        displayName: '',
        billingCycleStartDay: 1,
        level: 1,
        xp: 0,
        streakDays: 0,
        lastActiveDate: null,
        earnedBadges: [],
        reportsViewed: 0,
        budgetMonthsRespected: 0,
      },
      updateProfile: (updates) => set((st) => ({ profile: { ...st.profile, ...updates } })),

      addXP: (points) => set((st) => {
        let { xp, level } = st.profile;
        xp += points;
        const xpForNext = () => level * 150;
        let accumulated = 0;
        for (let l = 1; l < level; l++) accumulated += l * 150;
        while (xp >= accumulated + xpForNext()) {
          accumulated += xpForNext();
          level += 1;
        }
        return { profile: { ...st.profile, xp, level } };
      }),

      updateStreak: () => set((st) => {
        const today = new Date().toDateString();
        const last = st.profile.lastActiveDate;
        let { streakDays } = st.profile;

        if (last) {
          const lastDate = new Date(last);
          const diff = Math.floor((new Date(today) - new Date(lastDate.toDateString())) / 86400000);
          if (diff === 1) streakDays += 1;
          else if (diff > 1) streakDays = 1;
        } else {
          streakDays = 1;
        }
        return { profile: { ...st.profile, streakDays, lastActiveDate: today } };
      }),

      // --- Feedback ---
      feedback: null,
      showFeedback: (msg) => {
        set({ feedback: msg });
        setTimeout(() => set({ feedback: null }), 3000);
      },

      // --- Recently earned badge ---
      recentBadge: null,
      clearRecentBadge: () => set({ recentBadge: null }),

      // --- Badge checking ---
      checkBadges: () => {
        const st = get();
        const { earnedBadges, level, streakDays, budgetMonthsRespected, reportsViewed } = st.profile;
        const totalExpenses = st.expenses.length;
        const uniqueCategories = new Set(st.expenses.map((e) => e.categoryId)).size;

        for (const badge of badgeDefinitions) {
          if (earnedBadges.includes(badge.id)) continue;

          let earned = false;
          if (badge.type === 'expenses') earned = totalExpenses >= badge.target;
          else if (badge.type === 'streak') earned = streakDays >= badge.target;
          else if (badge.type === 'budget') earned = budgetMonthsRespected >= badge.target;
          else if (badge.type === 'level') earned = level >= badge.target;
          else if (badge.type === 'categories') earned = uniqueCategories >= badge.target;
          else if (badge.type === 'reports') earned = reportsViewed >= badge.target;

          if (earned) {
            set((s) => ({
              profile: {
                ...s.profile,
                earnedBadges: [...s.profile.earnedBadges, badge.id],
              },
              recentBadge: badge,
            }));
            get().addXP(badge.xp);
            setTimeout(() => set({ recentBadge: null }), 4000);
            break;
          }
        }
      },
    }),
    {
      name: 'casita-claude-storage',
    }
  )
);

export default useStore;
