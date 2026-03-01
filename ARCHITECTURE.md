# CasitaClaude — Arquitectura de la App Financiera iOS

## Visión General

App de gestión financiera personal y de negocios para iOS, construida con SwiftUI + SwiftData.
Dos secciones completamente diferenciadas (Personal / Negocios) con identidad visual propia,
sistema de periodos personalizables, gamificación y tips financieros inteligentes.

---

## Arquitectura: MVVM + Services

```
┌─────────────────────────────────────────────────────┐
│                      Views                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │Dashboard │ │ Expenses │ │ Reports  │  ...        │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘            │
│       │            │            │                   │
│  ┌────▼────────────▼────────────▼──────────────┐    │
│  │              ViewModels (@Observable)        │    │
│  │  AppVM · ExpenseVM · BudgetVM · ReportVM    │    │
│  │  GamificationVM                              │    │
│  └────┬─────────────────────────────────────┬──┘    │
│       │                                     │       │
│  ┌────▼──────────┐              ┌───────────▼──┐    │
│  │   Services    │              │   SwiftData  │    │
│  │  PeriodSvc    │              │  ModelContext │    │
│  │  TipsEngine   │              │              │    │
│  │  DataSeeder   │              │  @Model      │    │
│  └───────────────┘              └──────────────┘    │
└─────────────────────────────────────────────────────┘
```

### ¿Por qué MVVM?
- Separación clara entre lógica de negocio y UI
- ViewModels testables de forma independiente
- `@Observable` (Observation framework) para reactividad eficiente
- Compatible con SwiftData y el enfoque declarativo de SwiftUI

### ¿Por qué SwiftData sobre CoreData?
- API moderna y declarativa con macros `@Model`
- Integración nativa con SwiftUI (`@Query`, `@Environment(\.modelContext)`)
- Menos boilerplate que CoreData
- Soporte automático de migraciones ligeras
- Requiere iOS 17+ (aceptable para app nueva)

---

## Estructura de Directorios

```
CasitaClaude/
├── App/
│   ├── CasitaClaudeApp.swift    # Entry point + ModelContainer
│   └── RootView.swift           # Tab navigation + overlays
├── Models/
│   ├── Expense.swift            # @Model — gasto registrado
│   ├── Category.swift           # @Model — categorías personalizables
│   ├── Budget.swift             # @Model — límites por categoría/global
│   ├── Income.swift             # @Model — ingresos (negocios)
│   ├── UserProfile.swift        # @Model — perfil, XP, badges, ciclo
│   ├── Badge.swift              # Struct — definición de badges
│   └── FinancialTip.swift       # Struct — tips + MonthlyReport
├── ViewModels/
│   ├── AppViewModel.swift       # Estado global, sección activa, feedback
│   ├── ExpenseViewModel.swift   # Flujo 3 pasos, queries, persistencia
│   ├── BudgetViewModel.swift    # CRUD presupuestos, cálculos de progreso
│   ├── ReportViewModel.swift    # Generación de reportes mensuales
│   └── GamificationViewModel.swift  # XP, niveles, badges, rachas
├── Views/
│   ├── Dashboard/
│   │   └── DashboardView.swift  # Resumen principal con cards
│   ├── Expenses/
│   │   ├── AddExpenseView.swift # Flujo 3 pasos (monto → categoría → detalles)
│   │   └── ExpenseListView.swift # Historial agrupado por fecha
│   ├── Budget/
│   │   └── BudgetListView.swift # Barras de progreso, alertas
│   ├── Reports/
│   │   └── MonthlyReportView.swift # Reporte "cierre de temporada"
│   ├── Gamification/
│   │   └── ProfileView.swift    # Nivel, XP, badges, rachas
│   ├── Settings/
│   │   └── SettingsView.swift   # Ciclo financiero, perfil, reset
│   └── Shared/
│       ├── SectionSwitcherView.swift  # Toggle Personal/Negocios
│       ├── FeedbackToastView.swift    # Toast de feedback
│       ├── CardView.swift             # Card, ProgressBar, Currency, Period
│       └── BadgeEarnedOverlay.swift   # Overlays de badge y level up
├── Services/
│   ├── PeriodService.swift      # Cálculo de periodos personalizables
│   ├── TipsEngine.swift         # Motor de tips financieros
│   └── DataSeeder.swift         # Datos iniciales (categorías, perfil)
├── DesignSystem/
│   └── AppTheme.swift           # Paletas, tokens, Color(hex:)
├── Extensions/
│   └── Date+Extensions.swift    # Utilidades de fecha
└── Resources/
```

---

## Modelos de Datos

### Expense
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| amount | Double | Monto del gasto |
| expenseDescription | String | Descripción libre |
| date | Date | Fecha del gasto |
| categoryId | UUID | FK a Category |
| paymentMethod | PaymentMethod | Enum: efectivo, débito, crédito, etc. |
| tags | [String] | Etiquetas opcionales |
| section | String | "personal" o "business" |

### Category
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| name | String | Nombre de la categoría |
| icon | String | SF Symbol name |
| colorHex | String | Color en hexadecimal |
| section | String | Sección a la que pertenece |
| isDefault | Bool | Si es categoría por defecto |

### Budget
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| categoryId | UUID? | nil = presupuesto global |
| amount | Double | Límite de gasto |
| section | String | Sección |

### Income (solo Negocios)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| amount | Double | Monto del ingreso |
| source | String | Fuente del ingreso |
| date | Date | Fecha |

### UserProfile
| Campo | Tipo | Descripción |
|-------|------|-------------|
| billingCycleStartDay | Int | Día de inicio del ciclo (1-28) |
| currentLevel | Int | Nivel actual |
| totalXP | Int | Experiencia acumulada |
| streakDays | Int | Días consecutivos activos |
| earnedBadgeIds | [String] | IDs de badges ganados |

---

## Flujo de Navegación

```
┌──────────────────────────────────────┐
│        Section Switcher              │
│     [Personal]  [Negocios]           │
├──────────────────────────────────────┤
│                                      │
│  TabView                             │
│  ┌────┬────┬────┬────┬────┐          │
│  │Home│List│Lím │Rep │Per │          │
│  └──┬─┴──┬─┴──┬─┴──┬─┴──┬─┘         │
│     │    │    │    │    │            │
│     ▼    ▼    ▼    ▼    ▼            │
│  Dash  Exps  Budg  Rpt  Prof        │
│   │     │     │                │     │
│   │     │     │                │     │
│   ▼     ▼     ▼                ▼     │
│  +Exp  +Exp  +Bdg            Settings│
│  Sheet Sheet Sheet           Sheet   │
└──────────────────────────────────────┘

Flujo de Registro de Gasto (3 pasos):
┌─────────┐    ┌──────────┐    ┌──────────┐
│ Paso 1  │───▶│  Paso 2  │───▶│  Paso 3  │
│ Monto + │    │Categoría │    │ Detalles │
│ Método  │    │          │    │(opcional)│
└─────────┘    └──────────┘    └────┬─────┘
                                    │
                              ┌─────▼─────┐
                              │  Guardar  │
                              │ + XP      │
                              │ + Feedback│
                              │ + Badge?  │
                              └───────────┘
```

---

## Sistema de Periodo Personalizable

El `PeriodService` calcula rangos dinámicos basados en el día de inicio configurado:

- **Ejemplo**: si el usuario elige día 23
  - Periodo actual: 23 Feb – 22 Mar
  - Periodo anterior: 23 Ene – 22 Feb
- Los reportes, gastos y presupuestos se filtran por este rango
- Perfecto para alinear con fechas de corte de tarjeta de crédito

---

## Gamificación

### XP por Acciones
| Acción | XP |
|--------|-----|
| Registrar gasto | +10 |
| Racha diaria | +25 |
| Ver reporte | +15 |
| Respetar presupuesto (mes) | +50 |
| Configurar presupuesto | +20 |

### Niveles
- Nivel = XP acumulado / (nivel × 150)
- Títulos: Principiante → Organizado → Estratega → Experto → Maestro → Leyenda

### Badges
11 badges disponibles con requisitos progresivos:
- Primer Paso, En Racha, Registrador Pro
- Semana Perfecta, Mes Disciplinado
- Presupuesto Cumplido, Control Total
- Organizador, Estratega Financiero
- Diversificador, Analista

---

## Tips Financieros

El `TipsEngine` analiza:
1. **Utilización de presupuesto** — alertas de cercanía o exceso
2. **Comparación periodo-a-periodo** — tendencias de gasto
3. **Análisis por categoría** — picos en categorías específicas
4. **Métricas de negocio** — márgenes operativos (solo Business)

Los tips se muestran en:
- Dashboard (tips del ciclo actual)
- Reporte mensual (recomendaciones de cierre)
- Feedback instantáneo al registrar gastos

---

## Paleta de Colores

### Personal
| Rol | Color | Hex |
|-----|-------|-----|
| Primary | Violeta suave | #6C63FF |
| Secondary | Lavanda | #A78BFA |
| Accent | Menta | #34D399 |
| Background | Ghost white | #F8F7FF |

### Negocios
| Rol | Color | Hex |
|-----|-------|-----|
| Primary | Teal oscuro | #0F766E |
| Secondary | Teal | #14B8A6 |
| Accent | Ámbar/Oro | #F59E0B |
| Background | Teal tint | #F0FDFA |

---

## Componentes Reutilizables

| Componente | Uso |
|------------|-----|
| `CardView` | Contenedor con sombra y corners adaptativo |
| `ProgressBarView` | Barra de progreso con colores semafóricos |
| `CurrencyText` | Formato monetario consistente (es_MX) |
| `PeriodBadgeView` | Badge con rango del ciclo activo |
| `SectionSwitcherView` | Toggle animado Personal/Negocios |
| `FeedbackToastView` | Notificación toast tras acciones |
| `BadgeEarnedOverlay` | Celebración de badge desbloqueado |
| `LevelUpOverlay` | Celebración de nivel alcanzado |
| `FlowLayout` | Layout adaptativo para tags |

---

## Mejoras Propuestas (no implementadas aún)

1. **Widgets de iOS** — Resumen de gasto en el Home Screen
2. **Exportar reportes como PDF/imagen** — para compartir cierres de mes
3. **Gastos recurrentes** — suscripciones y gastos fijos automáticos
4. **iCloud Sync** — sincronización entre dispositivos via CloudKit
5. **Modo oscuro** — variantes de las paletas para dark mode
6. **Búsqueda y filtros avanzados** — por rango, tags, método de pago
7. **Gráficas interactivas** — con Swift Charts para tendencias
8. **Notificaciones locales** — recordatorios diarios para registrar gastos
9. **Registro de ingresos UI** — pantalla dedicada para Business income
10. **Importar CSV/Excel** — para carga masiva de datos existentes
